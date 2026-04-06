/**
 * Sound Effects Hook
 * 
 * Provides simple sound effect playback for game events.
 * Uses the Web Audio API for low-latency playback.
 */

'use client';

import { useCallback, useRef } from 'react';

type SoundType = 'dice' | 'move' | 'capture' | 'home' | 'win' | 'click' | 'turn' | 'notification';

// Frequencies and durations for synthesized sounds
const SOUND_CONFIG: Record<SoundType, { frequencies: number[]; duration: number; type: OscillatorType }> = {
  dice: { frequencies: [200, 300, 250, 350], duration: 0.08, type: 'square' },
  move: { frequencies: [440, 550], duration: 0.1, type: 'sine' },
  capture: { frequencies: [330, 220, 110], duration: 0.15, type: 'sawtooth' },
  home: { frequencies: [523, 659, 784, 1047], duration: 0.2, type: 'sine' },
  win: { frequencies: [523, 659, 784, 880, 1047], duration: 0.25, type: 'sine' },
  click: { frequencies: [800], duration: 0.05, type: 'sine' },
  turn: { frequencies: [440, 520], duration: 0.1, type: 'triangle' },
  notification: { frequencies: [1000, 1200], duration: 0.12, type: 'sine' },
};

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  // Load mute state from localStorage on mount
  useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludo-sound-enabled');
      enabledRef.current = saved === null ? true : saved === 'true';
    }
  }, [])();

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!enabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const config = SOUND_CONFIG[type];
      const now = ctx.currentTime;

      config.frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(freq, now + i * config.duration);
        
        gainNode.gain.setValueAtTime(0.15, now + i * config.duration);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          now + (i + 1) * config.duration
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now + i * config.duration);
        oscillator.stop(now + (i + 1) * config.duration + 0.05);
      });
    } catch (e) {
      // Audio not available, silently fail
      console.warn('Audio not available:', e);
    }
  }, [getAudioContext]);

  const toggleSound = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ludo-sound-enabled', String(enabledRef.current));
    }
    return enabledRef.current;
  }, []);

  const playNotification = useCallback(() => playSound('notification'), [playSound]);

  return { 
    playSound, 
    playNotification,
    toggleSound, 
    isEnabled: () => enabledRef.current 
  };
}
