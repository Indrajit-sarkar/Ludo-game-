/**
 * API Route: Create Room
 * POST /api/room/create
 * 
 * Creates a new game room and adds the host player.
 */

import { NextResponse } from 'next/server';
import { createRoom, updateRoomState } from '@/lib/room-store';
import { addPlayer } from '@/game-engine/engine';
import { broadcastGameState } from '@/lib/pusher-server';
import { generatePlayerId } from '@/lib/utils';
import { CreateRoomRequest, CreateRoomResponse } from '@/game-engine/types';

export async function POST(request: Request) {
  try {
    const body: CreateRoomRequest = await request.json();
    const { playerName, mode } = body;

    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    if (mode !== '2-player' && mode !== '4-player') {
      return NextResponse.json(
        { error: 'Mode must be "2-player" or "4-player"' },
        { status: 400 }
      );
    }

    // Create the room
    const room = createRoom(mode);
    const playerId = generatePlayerId();

    // Add the host player
    const updatedState = addPlayer(room.state, playerId, playerName.trim(), true);
    updateRoomState(room.id, updatedState);

    const response: CreateRoomResponse = {
      roomId: room.id,
      playerId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
