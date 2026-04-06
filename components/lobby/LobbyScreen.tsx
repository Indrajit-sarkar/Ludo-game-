/**
 * Lobby Screen - Redesigned
 * 
 * Modern landing page with color selection
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/hooks/useGameState';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SoundToggle } from '@/components/ui/SoundToggle';
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900">
      {/* Theme and Sound Toggles */}
      <div className="fixed top-6 right-6 flex gap-3 z-50">
        <SoundToggle />
        <ThemeToggle />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 opacity-30">
        <div className="w-24 h-24 rounded-full bg-purple-600 blur-xl animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-30">
        <div className="w-32 h-32 rounded-full bg-amber-600 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Main Card */}
        <div className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 sm:p-10">
          
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50 border-4 border-indigo-400/30">
                <span className="text-4xl">🎲</span>
              </div>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl font-black mb-2">
              <span className="text-white">LUDO </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                ARENA
              </span>
            </h1>
            <p className="text-gray-400 text-sm">
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
                className="space-y-6"
              >
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name..."
                      maxLength={20}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Game Mode */}
                <div className="space-y-2">
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Game Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['2-player', '4-player'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`relative py-4 px-4 rounded-xl font-semibold transition-all ${
                          mode === m
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border-2 border-indigo-400'
                            : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">{m === '2-player' ? '👥' : '👥👥'}</span>
                          <span className="text-sm">{m === '2-player' ? '2 Players' : '4 Players'}</span>
                          <span className="text-xs opacity-60">{m === '2-player' ? 'Fast-paced' : 'Free for All'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Choose Your Color (Optional)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                        className={`relative h-16 rounded-xl transition-all ${
                          selectedColor === color
                            ? 'ring-4 ring-white scale-105 shadow-lg'
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: COLOR_HEX[color] }}
                      >
                        {selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl text-white drop-shadow-lg">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {selectedColor ? `You selected ${selectedColor}` : 'Random color will be assigned if not selected'}
                  </p>
                </div>

                {/* Create Game Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all border border-gray-700 hover:border-gray-600"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🔗</span>
                    Join with Code
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={20}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Room Code Input */}
                <div className="space-y-2">
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-center text-2xl font-mono font-bold tracking-[0.5em] uppercase"
                  />
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Choose Your Color (Optional)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                        className={`relative h-16 rounded-xl transition-all ${
                          selectedColor === color
                            ? 'ring-4 ring-white scale-105 shadow-lg'
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: COLOR_HEX[color] }}
                      >
                        {selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl text-white drop-shadow-lg">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Join Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
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
                className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Built with Next.js, Three.js & Pusher
          </p>
        </div>
      </motion.div>
    </div>
  );
}
