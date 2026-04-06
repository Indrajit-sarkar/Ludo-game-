/**
 * Pusher Real-Time Hook
 * 
 * Manages Pusher connection and channel subscriptions.
 * Listens for server events and updates the game store.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getPusherClient, disconnectPusher } from '@/lib/pusher-client';
import { useGameStore } from './useGameState';
import type PusherClient from 'pusher-js';
import type { Channel } from 'pusher-js';

export function usePusher(roomId: string | null) {
  const updateGameState = useGameStore(s => s.updateGameState);
  const channelRef = useRef<Channel | null>(null);
  const pusherRef = useRef<PusherClient | null>(null);

  const subscribe = useCallback(() => {
    if (!roomId) return;

    const pusher = getPusherClient();
    if (!pusher) {
      console.warn('Pusher client not available — running in offline mode');
      return;
    }

    pusherRef.current = pusher;

    // Subscribe to the room's presence channel
    const channelName = `presence-room-${roomId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // ─── Event Handlers ────────────────────────────────

    channel.bind('player-joined', (data: { state: unknown }) => {
      if (data.state) {
        updateGameState(data.state as ReturnType<typeof useGameStore.getState>['gameState'] & object);
      }
    });

    channel.bind('game-started', (data: { state: unknown }) => {
      if (data.state) {
        updateGameState(data.state as ReturnType<typeof useGameStore.getState>['gameState'] & object);
      }
    });

    channel.bind('dice-rolled', (data: { state: unknown }) => {
      if (data.state) {
        updateGameState(data.state as ReturnType<typeof useGameStore.getState>['gameState'] & object);
      }
    });

    channel.bind('token-moved', (data: { state: unknown }) => {
      if (data.state) {
        updateGameState(data.state as ReturnType<typeof useGameStore.getState>['gameState'] & object);
      }
    });

    channel.bind('game-over', (data: { state: unknown }) => {
      if (data.state) {
        updateGameState(data.state as ReturnType<typeof useGameStore.getState>['gameState'] & object);
      }
    });

    channel.bind('player-left', (data: { state: unknown }) => {
      if (data.state) {
        updateGameState(data.state as ReturnType<typeof useGameStore.getState>['gameState'] & object);
      }
    });

    // Presence events
    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Connected to room ${roomId}`);
    });

    channel.bind('pusher:subscription_error', (error: unknown) => {
      console.error('Pusher subscription error:', error);
    });
  }, [roomId, updateGameState]);

  useEffect(() => {
    subscribe();

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        if (pusherRef.current) {
          pusherRef.current.unsubscribe(`presence-room-${roomId}`);
        }
        channelRef.current = null;
      }
    };
  }, [subscribe, roomId]);

  return {
    disconnect: () => {
      disconnectPusher();
    },
  };
}
