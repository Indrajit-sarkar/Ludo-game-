'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

interface TimerStore {
  startTime: number | null;
  elapsedSeconds: number;
  isRunning: boolean;
  
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  startTime: null,
  elapsedSeconds: 0,
  isRunning: false,

  startTimer: () => set({ startTime: Date.now(), isRunning: true }),
  
  stopTimer: () => set({ isRunning: false }),
  
  resetTimer: () => set({ startTime: null, elapsedSeconds: 0, isRunning: false }),
  
  tick: () => set((state) => {
    if (!state.isRunning || !state.startTime) return state;
    return { elapsedSeconds: Math.floor((Date.now() - state.startTime) / 1000) };
  }),
}));

export function useGameTimer() {
  const { isRunning, tick } = useTimerStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  return useTimerStore();
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
