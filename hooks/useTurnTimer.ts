'use client';

import { create } from 'zustand';

interface TurnTimerStore {
  timeLeft: number;
  isActive: boolean;
  missedTurns: Map<string, number>;
  
  startTurnTimer: (playerId: string) => void;
  stopTurnTimer: () => void;
  tick: () => void;
  incrementMissedTurn: (playerId: string) => void;
  resetMissedTurns: (playerId: string) => void;
  getMissedTurns: (playerId: string) => number;
}

const TURN_TIME_LIMIT = 15; // seconds
const MAX_MISSED_TURNS = 5;

export const useTurnTimerStore = create<TurnTimerStore>((set, get) => ({
  timeLeft: TURN_TIME_LIMIT,
  isActive: false,
  missedTurns: new Map(),

  startTurnTimer: (playerId: string) => {
    set({ timeLeft: TURN_TIME_LIMIT, isActive: true });
  },

  stopTurnTimer: () => set({ isActive: false, timeLeft: TURN_TIME_LIMIT }),

  tick: () => set((state) => {
    if (!state.isActive) return state;
    const newTime = Math.max(0, state.timeLeft - 1);
    return { timeLeft: newTime };
  }),

  incrementMissedTurn: (playerId: string) => set((state) => {
    const newMap = new Map(state.missedTurns);
    newMap.set(playerId, (newMap.get(playerId) || 0) + 1);
    return { missedTurns: newMap };
  }),

  resetMissedTurns: (playerId: string) => set((state) => {
    const newMap = new Map(state.missedTurns);
    newMap.delete(playerId);
    return { missedTurns: newMap };
  }),

  getMissedTurns: (playerId: string) => {
    return get().missedTurns.get(playerId) || 0;
  },
}));

export { TURN_TIME_LIMIT, MAX_MISSED_TURNS };
