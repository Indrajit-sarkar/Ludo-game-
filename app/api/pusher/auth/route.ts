/**
 * API Route: Pusher Auth
 * POST /api/pusher/auth
 * 
 * Authenticates clients for Pusher presence channels.
 * Required for presence-* channels which track who's online.
 */

import { NextResponse } from 'next/server';
import { getPusherServer } from '@/lib/pusher-server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'socket_id and channel_name are required' },
        { status: 400 }
      );
    }

    const pusher = getPusherServer();

    // For presence channels, we need to provide user data
    if (channelName.startsWith('presence-')) {
      const presenceData = {
        user_id: socketId, // Use socket ID as user ID for simplicity
        user_info: {
          joinedAt: Date.now(),
        },
      };

      const auth = pusher.authorizeChannel(socketId, channelName, presenceData);
      return NextResponse.json(auth);
    }

    // For private channels
    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 403 }
    );
  }
}
