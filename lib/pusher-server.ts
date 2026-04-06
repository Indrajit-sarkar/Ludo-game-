/**
 * Pusher Server Instance — Singleton
 * Used in API routes to trigger events to connected clients.
 */

import Pusher from 'pusher';

let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherInstance) {
    // Validate environment variables
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!appId || !key || !secret || !cluster) {
      console.warn('⚠️ Pusher credentials not configured. Using mock mode.');
      console.warn('Missing:', { appId: !!appId, key: !!key, secret: !!secret, cluster: !!cluster });
      // Return a mock pusher that doesn't actually send events
      // This allows local development without Pusher
      return {
        trigger: async () => ({}),
        authorizeChannel: () => ({ auth: 'mock:auth', channel_data: '{}' }),
      } as unknown as Pusher;
    }

    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return pusherInstance;
}

/**
 * Broadcast game state update to all clients in a room.
 */
export async function broadcastGameState(
  roomId: string,
  eventType: string,
  state: unknown,
  extra?: Record<string, unknown>
) {
  const pusher = getPusherServer();
  try {
    await pusher.trigger(`presence-room-${roomId}`, eventType, {
      type: eventType,
      state,
      extra,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to broadcast:', error);
  }
}
