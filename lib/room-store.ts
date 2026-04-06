/**
 * Room Store — In-Memory Server-Side State
 * 
 * Stores game room states in a Map for quick access.
 * 
 * ⚠️ PRODUCTION NOTE:
 * This in-memory store works for development and single-instance deployments.
 * For production on Vercel (which uses ephemeral serverless functions),
 * replace this with Vercel KV, Upstash Redis, or a database.
 * 
 * The API is designed so you only need to swap the implementation
 * of these functions — no other code changes needed.
 */

import { Room, GameState } from '@/game-engine/types';
import { createGameState } from '@/game-engine/engine';

// In-memory room storage
const rooms = new Map<string, Room>();

// Auto-cleanup: remove rooms older than 2 hours
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;

function cleanupOldRooms() {
  const now = Date.now();
  for (const [id, room] of rooms.entries()) {
    if (now - room.createdAt > ROOM_TTL_MS) {
      rooms.delete(id);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldRooms, 10 * 60 * 1000);
}

/**
 * Generate a unique 6-character room code.
 * Uses uppercase letters and numbers for readability.
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous: I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  // Ensure uniqueness
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

/**
 * Create a new room.
 */
export function createRoom(mode: '2-player' | '4-player'): Room {
  cleanupOldRooms();
  
  const id = generateRoomCode();
  const room: Room = {
    id,
    state: createGameState(id, mode),
    createdAt: Date.now(),
    maxPlayers: mode === '2-player' ? 2 : 4,
  };

  rooms.set(id, room);
  return room;
}

/**
 * Get a room by ID.
 */
export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId.toUpperCase());
}

/**
 * Update a room's game state.
 */
export function updateRoomState(roomId: string, state: GameState): void {
  const room = rooms.get(roomId.toUpperCase());
  if (room) {
    room.state = state;
  }
}

/**
 * Delete a room.
 */
export function deleteRoom(roomId: string): void {
  rooms.delete(roomId.toUpperCase());
}

/**
 * Check if a room exists.
 */
export function roomExists(roomId: string): boolean {
  return rooms.has(roomId.toUpperCase());
}

/**
 * Get count of active rooms (for monitoring).
 */
export function getActiveRoomCount(): number {
  return rooms.size;
}
