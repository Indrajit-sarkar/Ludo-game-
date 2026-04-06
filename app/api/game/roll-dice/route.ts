/**
 * API Route: Roll Dice
 * POST /api/game/roll-dice
 * 
 * Server-authoritative dice roll. The client sends the intent to roll,
 * the server generates the value using cryptographic randomness,
 * validates the request, and broadcasts the result.
 */

import { NextResponse } from 'next/server';
import { getRoom, updateRoomState } from '@/lib/room-store';
import { processDiceRoll } from '@/game-engine/engine';
import { validateDiceRoll } from '@/game-engine/validation';
import { broadcastGameState } from '@/lib/pusher-server';
import { RollDiceRequest } from '@/game-engine/types';

export async function POST(request: Request) {
  try {
    const body: RollDiceRequest = await request.json();
    const { roomId, playerId } = body;

    if (!roomId || !playerId) {
      return NextResponse.json(
        { error: 'Room ID and player ID are required' },
        { status: 400 }
      );
    }

    const room = getRoom(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Validate the roll request
    const validation = validateDiceRoll(room.state, playerId);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process the dice roll (server generates the value)
    const updatedState = processDiceRoll(room.state, playerId);
    updateRoomState(roomId, updatedState);

    // Broadcast the result to all clients
    await broadcastGameState(roomId, 'dice-rolled', updatedState, {
      playerId,
      diceValue: updatedState.diceValue,
    });

    return NextResponse.json({
      success: true,
      diceValue: updatedState.diceValue,
      state: updatedState,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to roll dice';
    console.error('Error rolling dice:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
