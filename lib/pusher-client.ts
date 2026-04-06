/**
 * Pusher Client Instance
 * Used in React components to subscribe to real-time events.
 */

import PusherClient from 'pusher-js';

let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    console.warn('⚠️ Pusher client credentials not configured');
    return null;
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(key, {
      cluster,
      authEndpoint: '/api/pusher/auth',
      authTransport: 'ajax',
    });
  }

  return pusherClientInstance;
}

/**
 * Disconnect and clean up the Pusher client instance.
 */
export function disconnectPusher() {
  if (pusherClientInstance) {
    pusherClientInstance.disconnect();
    pusherClientInstance = null;
  }
}
