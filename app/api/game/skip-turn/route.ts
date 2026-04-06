/**
 * API Route: Skip Turn
 * POST /api/game/skip-turn
 * 
 * Skips the current player's turn (used for timeout/AFK).
 */

import { NextResponse } from 'next/server';
import { getRoom, updateRoomState } from '@/lib/room-store-upstash';
import { broadcastGameState } from '@/lib/pusher-server';
import { PlayerColor } from '@/game-engine/types';

interface SkipTurnRequest {
  roomId: string;
  playerId: string;
}

/**
 * Move to the next player's turn
 */
function nextTurn(currentTurn: PlayerColor, players: any[]): PlayerColor {
  const colors: PlayerColor[] = ['red', 'green', 'blue', 'yellow'];
  const activePlayers = players.filter(p => !p.disqualified);
  const activeColors = activePlayers.map(p => p.color);
  
  const currentIndex = activeColors.indexOf(currentTurn);
  const nextIndex = (currentIndex + 1) % activeColors.length;
  
  return activeColors[nextIndex];
}

export async function POST(request: Request) {
  try {
    const body: SkipTurnRequest = await request.json();
    const { roomId, playerId } = body;

    if (!roomId || !playerId) {
      return NextResponse.json(
        { error: 'Room ID and player ID are required' },
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

    // Verify it's the current player's turn
    const currentPlayer = room.state.players.find(
      p => p.color === room.state.currentTurn
    );
    
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return NextResponse.json(
        { error: 'Not your turn' },
        { status: 400 }
      );
    }

    // Move to next turn
    const updatedState = {
      ...room.state,
      currentTurn: nextTurn(room.state.currentTurn, room.state.players),
      phase: 'rolling' as const,
      diceValue: null,
      consecutiveSixes: 0,
      validMoves: [],
      lastActionTimestamp: Date.now(),
    };

    await updateRoomState(roomId, updatedState);

    // Broadcast turn skip
    await broadcastGameState(roomId, 'turn-skipped', updatedState, {
      skippedPlayerId: playerId,
      skippedPlayerName: currentPlayer.name,
    });

    return NextResponse.json({ 
      success: true,
      state: updatedState 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to skip turn';
    console.error('Error skipping turn:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
