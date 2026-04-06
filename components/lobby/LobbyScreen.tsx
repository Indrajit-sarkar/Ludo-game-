/**
 * Lobby Screen
 * 
 * Landing page with hero section, game mode selection,
 * and options to create or join a game room.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/hooks/useGameState';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SoundToggle } from '@/components/ui/SoundToggle';

export function LobbyScreen() {
  const router = useRouter();
  const setConnection = useGameStore(s => s.setConnection);

  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'2-player' | '4-player'>('2-player');
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
        body: JSON.stringify({ playerName: playerName.trim(), mode }),
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Theme and Sound Toggles */}
      <div className="fixed top-6 right-6 flex gap-3 z-50">
        <SoundToggle />
        <ThemeToggle />
      </div>
      
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-red-500/20 rounded-full blur-3xl -top-32 -left-32 animate-pulse" />
        <div className="absolute w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[300px] h-[300px] bg-green-500/20 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-[320px] h-[320px] bg-yellow-500/20 rounded-full blur-3xl top-20 right-20 animate-pulse" style={{ animationDelay: '0.7s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Main Card */}
        <div className="backdrop-blur-2xl bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 p-8 sm:p-12 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <span className="text-4xl sm:text-5xl">🎲</span>
              <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
                LUDO ARENA
              </h1>
              <span className="text-4xl sm:text-5xl">🎲</span>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg font-medium">
              The classic board game, reimagined in 3D
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-3">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold uppercase tracking-wide">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-6 py-4 text-lg rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-4 focus:ring-yellow-500/20 transition-all"
            />
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
                {/* Mode Selection */}
                <div className="space-y-3">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold uppercase tracking-wide">
                    Game Mode
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['2-player', '4-player'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`relative py-5 px-6 rounded-2xl font-bold text-base transition-all ${
                          mode === m
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl shadow-yellow-500/30 scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">{m === '2-player' ? '👥' : '👥👥'}</span>
                          <span>{m === '2-player' ? '2 Players' : '4 Players'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create Game Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl font-bold text-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Game...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🎮</span>
                      Create Game
                    </span>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                </div>

                {/* Join Game Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('join')}
                  className="w-full py-5 rounded-2xl font-bold text-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🔗</span>
                    Join with Code
                  </span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Room Code Input */}
                <div className="space-y-3">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold uppercase tracking-wide">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="w-full px-6 py-5 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all text-center text-3xl font-mono font-bold tracking-[0.5em] uppercase"
                  />
                </div>

                {/* Join Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🚀</span>
                      Join Game
                    </span>
                  )}
                </motion.button>

                {/* Back Button */}
                <button
                  onClick={() => { setView('main'); setError(null); }}
                  className="w-full py-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-base font-medium"
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
                className="p-4 rounded-2xl bg-red-100 dark:bg-red-500/20 border-2 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-300 text-base font-medium text-center"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6 font-medium">
          Built with Next.js, Three.js & Pusher
        </p>
      </motion.div>
    </div>
  );
}
