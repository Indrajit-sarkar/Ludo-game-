/**
 * API Route: Start Game
 * POST /api/room/start
 * 
 * Host starts the game once enough players have joined.
 */

import { NextResponse } from 'next/server';
import { getRoom, updateRoomState } from '@/lib/room-store-upstash';
import { startGame } from '@/game-engine/engine';
import { validateStart } from '@/game-engine/validation';
import { broadcastGameState } from '@/lib/pusher-server';

export async function POST(request: Request) {
  try {
    const { roomId, playerId } = await request.json();

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

    // Validate the start request
    const validation = validateStart(room.state, playerId);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Start the game
    const updatedState = startGame(room.state);
    updateRoomState(roomId, updatedState);

    // Broadcast game start to all clients
    await broadcastGameState(roomId, 'game-started', updatedState);

    return NextResponse.json({ success: true, state: updatedState });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start game';
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
