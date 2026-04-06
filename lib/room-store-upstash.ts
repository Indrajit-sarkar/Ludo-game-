/**
 * Room Store — Upstash Redis Implementation
 * 
 * Persistent storage for game rooms using Upstash Redis.
 * Alternative to Vercel KV.
 */

import { Redis } from '@upstash/redis';
import { Room, GameState } from '@/game-engine/types';
import { createGameState } from '@/game-engine/engine';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ROOM_TTL = 2 * 60 * 60; // 2 hours in seconds

/**
 * Generate a unique 6-character room code.
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
}

/**
 * Create a new room.
 */
export async function createRoom(mode: '2-player' | '4-player'): Promise<Room> {
  const id = generateRoomCode();
  
  // Check if room already exists (collision check)
  const exists = await redis.exists(`room:${id}`);
  if (exists) {
    // Retry with a new code
    return createRoom(mode);
  }
  
  const room: Room = {
    id,
    state: createGameState(id, mode),
    createdAt: Date.now(),
    maxPlayers: mode === '2-player' ? 2 : 4,
  };

  // Store in Redis with TTL
  await redis.set(`room:${id}`, JSON.stringify(room), { ex: ROOM_TTL });
  
  return room;
}

/**
 * Get a room by ID.
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  try {
    const data = await redis.get<string>(`room:${roomId.toUpperCase()}`);
    if (!data) return null;
    
    // Parse the stored JSON
    const room = typeof data === 'string' ? JSON.parse(data) : data;
    return room as Room;
  } catch (error) {
    console.error('Error getting room:', error);
    return null;
  }
}

/**
 * Update a room's game state.
 */
export async function updateRoomState(roomId: string, state: GameState): Promise<void> {
  try {
    const room = await getRoom(roomId);
    if (!room) {
      console.warn(`Room ${roomId} not found for update`);
      return;
    }
    
    room.state = state;
    
    // Update with same TTL
    await redis.set(`room:${roomId.toUpperCase()}`, JSON.stringify(room), { ex: ROOM_TTL });
  } catch (error) {
    console.error('Error updating room state:', error);
  }
}

/**
 * Delete a room.
 */
export async function deleteRoom(roomId: string): Promise<void> {
  try {
    await redis.del(`room:${roomId.toUpperCase()}`);
  } catch (error) {
    console.error('Error deleting room:', error);
  }
}

/**
 * Check if a room exists.
 */
export async function roomExists(roomId: string): Promise<boolean> {
  try {
    const exists = await redis.exists(`room:${roomId.toUpperCase()}`);
    return exists === 1;
  } catch (error) {
    console.error('Error checking room existence:', error);
    return false;
  }
}

/**
 * Get count of active rooms (for monitoring).
 */
export async function getActiveRoomCount(): Promise<number> {
  try {
    // Scan for all room keys
    const keys = await redis.keys('room:*');
    return keys.length;
  } catch (error) {
    console.error('Error getting room count:', error);
    return 0;
  }
}
