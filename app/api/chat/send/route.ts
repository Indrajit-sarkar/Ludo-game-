/**
 * API Route: Send Chat Message
 * POST /api/chat/send
 * 
 * Broadcasts a chat message to all players in a room.
 */

import { NextResponse } from 'next/server';
import { broadcastGameState } from '@/lib/pusher-server';

interface SendMessageRequest {
  roomId: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  message?: string;
  emoji?: string;
}

export async function POST(request: Request) {
  try {
    const body: SendMessageRequest = await request.json();
    const { roomId, playerId, playerName, playerColor, message, emoji } = body;

    // Validation
    if (!roomId || !playerId || !playerName || !playerColor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!message && !emoji) {
      return NextResponse.json(
        { error: 'Message or emoji required' },
        { status: 400 }
      );
    }

    // Create chat message object
    const chatMessage = {
      id: `${Date.now()}-${playerId}`,
      playerId,
      playerName,
      playerColor,
      message: message || undefined,
      emoji: emoji || undefined,
      timestamp: Date.now(),
      reactions: [],
      edited: false,
    };

    // Broadcast to all clients in the room via Pusher
    await broadcastGameState(roomId, 'chat-message', null, chatMessage);

    return NextResponse.json({ 
      success: true, 
      message: chatMessage 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
