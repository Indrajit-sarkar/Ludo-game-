/**
 * Lobby Screen - Compact design matching reference
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/hooks/useGameState';
import { PlayerColor } from '@/game-engine/types';
import { COLOR_HEX } from '@/game-engine/constants';

const COLORS: PlayerColor[] = ['red', 'green', 'blue', 'yellow'];

export function LobbyScreen() {
  const router = useRouter();
  const setConnection = useGameStore(s => s.setConnection);

  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'2-player' | '4-player'>('2-player');
  const [selectedColor, setSelectedColor] = useState<PlayerColor | null>(null);
  const [view, setView] = useState<'main' | 'join'>('main');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ludo-theme');
      const isLight = savedTheme === 'light' || document.documentElement.classList.contains('light');
      setIsDark(!isLight);
      if (isLight) {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('light')) {
      html.classList.remove('light');
      localStorage.setItem('ludo-theme', 'dark');
      setIsDark(true);
    } else {
      html.classList.add('light');
      localStorage.setItem('ludo-theme', 'light');
      setIsDark(false);
    }
  };

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerName: playerName.trim(), 
          mode,
          preferredColor: selectedColor 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      setConnection(data.roomId, data.playerId, playerName.trim());
      router.push(`/room/${data.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter the room code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomCode.trim().toUpperCase(),
          playerName: playerName.trim(),
          preferredColor: selectedColor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join room');
      }

      setConnection(roomCode.trim().toUpperCase(), data.playerId, playerName.trim());
      router.push(`/room/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/bg-dark.jpg)' }}
        />
        <div className={`absolute inset-0 ${isDark ? 'bg-black/50' : 'bg-purple-400/30'}`} />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className={`w-12 h-12 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl transition-all ${
            isDark 
              ? 'bg-gray-800/80 border border-gray-700' 
              : 'bg-white/80 border border-gray-300'
          }`}
          aria-label="Toggle theme"
        >
          <span className="text-xl">{isDark ? '🌙' : '☀️'}</span>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Compact Card */}
        <div className={`backdrop-blur-2xl rounded-3xl shadow-2xl border p-8 transition-all ${
          isDark 
            ? 'bg-gray-900/90 border-gray-700/50' 
            : 'bg-white/95 border-gray-200/50'
        }`}>
          
          {/* Logo & Title - Dice above title */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="inline-block mb-3"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span className="text-3xl">🎲</span>
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-black mb-1">
              <span className={isDark ? 'text-white' : 'text-gray-900'}>LUDO </span>
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                ARENA
              </span>
            </h1>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              The classic board game, reimagined in 3D
            </p>
          </div>

          <AnimatePresence mode="wait">
            {view === 'main' ? (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Name Input */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name..."
                      maxLength={20}
                      className={`w-full px-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 ${
                        isDark 
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Game Mode */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Game Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['2-player', '4-player'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`relative py-4 px-3 rounded-xl font-semibold text-sm transition-all ${
                          mode === m
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                            : isDark
                            ? 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-2xl">{m === '2-player' ? '👥' : '👥👥'}</span>
                          <span className="text-sm">{m === '2-player' ? '2 Players' : '4 Players'}</span>
                          <span className="text-[10px] opacity-70">{m === '2-player' ? 'Classic Duel' : 'Free for All'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Dropdown */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Choose Color (Optional)
                  </label>
                  <select
                    value={selectedColor || ''}
                    onChange={(e) => setSelectedColor(e.target.value as PlayerColor || null)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Random Color</option>
                    {COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Create Game Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>➕</span>
                      Create Game
                    </span>
                  )}
                </motion.button>

                {/* Join with Code */}
                <button
                  onClick={() => setView('join')}
                  className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all border ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex items-center gap-2 font-semibold">
                      <span>🔗</span>
                      Join with Code
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Enter a room code to join a game
                    </span>
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Name Input */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={20}
                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 ${
                      isDark
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Room Code Input */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-center text-2xl font-mono font-bold tracking-[0.5em] uppercase ${
                      isDark
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Color Dropdown */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Choose Color (Optional)
                  </label>
                  <select
                    value={selectedColor || ''}
                    onChange={(e) => setSelectedColor(e.target.value as PlayerColor || null)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Random Color</option>
                    {COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Join Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>🚀</span>
                      Join Game
                    </span>
                  )}
                </motion.button>

                {/* Back Button */}
                <button
                  onClick={() => { setView('main'); setError(null); }}
                  className={`w-full py-2.5 transition-colors text-sm ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ← Back to menu
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs text-center"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className={`text-center text-[10px] mt-4 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            Built with Next.js, Three.js & Pusher
          </p>
        </div>
      </motion.div>
    </div>
  );
}
