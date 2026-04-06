/**
 * Zustand Game State Store
 * 
 * Central state management for the Ludo game client.
 * The server is the source of truth — this store is updated
 * whenever the server broadcasts a new state.
 */

'use client';

import { create } from 'zustand';
import { GameState, PlayerColor } from '@/game-engine/types';

interface GameStore {
  // ─── Connection State ──────────────────────────────
  roomId: string | null;
  playerId: string | null;
  playerName: string | null;

  // ─── Game State (from server) ──────────────────────
  gameState: GameState | null;

  // ─── Derived State ─────────────────────────────────
  isMyTurn: boolean;
  myColor: PlayerColor | null;
  isHost: boolean;

  // ─── UI State ──────────────────────────────────────
  isDiceRolling: boolean;
  selectedTokenId: string | null;
  lastDiceValue: number | null;
  showWinnerPopup: boolean;
  error: string | null;
  isLoading: boolean;

  // ─── Actions ───────────────────────────────────────
  setConnection: (roomId: string, playerId: string, playerName: string) => void;
  updateGameState: (state: GameState) => void;
  setDiceRolling: (rolling: boolean) => void;
  setSelectedToken: (tokenId: string | null) => void;
  setLastDiceValue: (value: number | null) => void;
  setShowWinnerPopup: (show: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;

  // ─── API Actions ───────────────────────────────────
  rollDice: () => Promise<void>;
  moveToken: (tokenId: string) => Promise<void>;
  startGame: () => Promise<void>;
}

const initialState = {
  roomId: null,
  playerId: null,
  playerName: null,
  gameState: null,
  isMyTurn: false,
  myColor: null,
  isHost: false,
  isDiceRolling: false,
  selectedTokenId: null,
  lastDiceValue: null,
  showWinnerPopup: false,
  error: null,
  isLoading: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setConnection: (roomId, playerId, playerName) => {
    set({ roomId, playerId, playerName });
  },

  updateGameState: (state: GameState) => {
    const { playerId } = get();
    const myPlayer = state.players.find(p => p.id === playerId);
    
    set({
      gameState: state,
      isMyTurn: myPlayer ? myPlayer.color === state.currentTurn : false,
      myColor: myPlayer?.color || null,
      isHost: myPlayer?.isHost || false,
      showWinnerPopup: state.phase === 'finished',
    });
  },

  setDiceRolling: (rolling) => set({ isDiceRolling: rolling }),
  setSelectedToken: (tokenId) => set({ selectedTokenId: tokenId }),
  setLastDiceValue: (value) => set({ lastDiceValue: value }),
  setShowWinnerPopup: (show) => set({ showWinnerPopup: show }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  reset: () => set(initialState),

  rollDice: async () => {
    const { roomId, playerId, isMyTurn, isDiceRolling } = get();
    if (!roomId || !playerId || !isMyTurn || isDiceRolling) return;

    set({ isDiceRolling: true, error: null, lastDiceValue: null });

    try {
      const res = await fetch('/api/game/roll-dice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to roll dice');
      }

      // Update state from server response
      set({ lastDiceValue: data.diceValue });
      get().updateGameState(data.state);

      // Keep rolling animation for a moment
      setTimeout(() => {
        set({ isDiceRolling: false });
      }, 800);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to roll dice';
      set({ error: message, isDiceRolling: false });
    }
  },

  moveToken: async (tokenId: string) => {
    const { roomId, playerId, isMyTurn } = get();
    if (!roomId || !playerId || !isMyTurn) return;

    set({ isLoading: true, error: null, selectedTokenId: tokenId });

    try {
      const res = await fetch('/api/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, tokenId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to move token');
      }

      get().updateGameState(data.state);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move token';
      set({ error: message });
    } finally {
      set({ isLoading: false, selectedTokenId: null });
    }
  },

  startGame: async () => {
    const { roomId, playerId, isHost } = get();
    if (!roomId || !playerId || !isHost) return;

    set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/room/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start game');
      }

      get().updateGameState(data.state);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start game';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
