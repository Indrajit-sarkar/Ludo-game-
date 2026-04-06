/**
 * API Route: Move Token
 * POST /api/game/move
 * 
 * Validates and executes a token move.
 * Handles captures, home entry, and turn progression.
 */

import { NextResponse } from 'next/server';
import { getRoom, updateRoomState } from '@/lib/room-store-upstash';
import { executeMove } from '@/game-engine/engine';
import { validateMove } from '@/game-engine/validation';
import { broadcastGameState } from '@/lib/pusher-server';
import { MoveTokenRequest } from '@/game-engine/types';

export async function POST(request: Request) {
  try {
    const body: MoveTokenRequest = await request.json();
    const { roomId, playerId, tokenId } = body;

    if (!roomId || !playerId || !tokenId) {
      return NextResponse.json(
        { error: 'Room ID, player ID, and token ID are required' },
        { status: 400 }
      );
    }

    const room = await getRoom(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Validate the move
    const validation = validateMove(room.state, playerId, tokenId);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Execute the move
    const updatedState = executeMove(room.state, tokenId, playerId);
    await updateRoomState(roomId, updatedState);

    // Determine the event type
    const eventType = updatedState.phase === 'finished' ? 'game-over' : 'token-moved';

    // Broadcast to all clients
    await broadcastGameState(roomId, eventType, updatedState, {
      playerId,
      tokenId,
    });

    return NextResponse.json({
      success: true,
      state: updatedState,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to move token';
    console.error('Error moving token:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
