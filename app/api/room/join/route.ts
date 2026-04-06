/**
 * API Route: Join Room
 * POST /api/room/join
 * 
 * Adds a player to an existing room.
 */

import { NextResponse } from 'next/server';
import { getRoom, updateRoomState } from '@/lib/room-store-upstash';
import { addPlayer } from '@/game-engine/engine';
import { broadcastGameState } from '@/lib/pusher-server';
import { generatePlayerId } from '@/lib/utils';
import { JoinRoomRequest, JoinRoomResponse } from '@/game-engine/types';

export async function POST(request: Request) {
  try {
    const body: JoinRoomRequest = await request.json();
    const { roomId, playerName } = body;

    if (!roomId || !playerName?.trim()) {
      return NextResponse.json(
        { error: 'Room ID and player name are required' },
        { status: 400 }
      );
    }

    // Normalize room ID to uppercase
    const normalizedRoomId = roomId.trim().toUpperCase();

    const room = await getRoom(normalizedRoomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found. Check the code and try again.' },
        { status: 404 }
      );
    }

    if (room.state.phase !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    const maxPlayers = room.state.mode === '2-player' ? 2 : 4;
    if (room.state.players.length >= maxPlayers) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      );
    }

    const playerId = generatePlayerId();

    // Add the player
    const updatedState = addPlayer(room.state, playerId, playerName.trim(), false);
    await updateRoomState(normalizedRoomId, updatedState);

    // Broadcast to all clients in the room
    await broadcastGameState(normalizedRoomId, 'player-joined', updatedState, {
      playerName: playerName.trim(),
      playerId,
    });

    const response: JoinRoomResponse = {
      playerId,
      state: updatedState,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join room';
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
