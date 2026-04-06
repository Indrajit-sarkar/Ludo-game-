/**
 * API Route: Get Room State
 * GET /api/room/state?roomId=XXXXXX
 * 
 * Returns the current state of a room.
 */

import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/room-store-upstash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Normalize room ID to uppercase
    const normalizedRoomId = roomId.trim().toUpperCase();

    const room = await getRoom(normalizedRoomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ state: room.state });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room state' },
      { status: 500 }
    );
  }
}
