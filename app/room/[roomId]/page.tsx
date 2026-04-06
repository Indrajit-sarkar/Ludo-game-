/**
 * Game Room Page
 * 
 * Dynamic route for each game room. Handles:
 * - Joining via URL (auto-join with room code)
 * - Waiting room display
 * - Active game board
 */

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameState';
import { usePusher } from '@/hooks/usePusher';
import { WaitingRoom } from '@/components/lobby/WaitingRoom';
import { GameBoard } from '@/components/game/GameBoard';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const storeRoomId = useGameStore(s => s.roomId);
  const playerId = useGameStore(s => s.playerId);
  const gameState = useGameStore(s => s.gameState);
  const updateGameState = useGameStore(s => s.updateGameState);
  const setConnection = useGameStore(s => s.setConnection);

  const [isJoining, setIsJoining] = useState(false);
  const [needsJoin, setNeedsJoin] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Subscribe to Pusher events for this room
  usePusher(roomId);

  // Poll for room state updates every 3 seconds as fallback
  useEffect(() => {
    if (!roomId || !playerId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/room/state?roomId=${roomId}`);
        const data = await res.json();
        if (data.state) {
          updateGameState(data.state);
        }
      } catch (err) {
        console.error('Failed to poll room state:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [roomId, playerId, updateGameState]);

  // Check if player is already connected to this room
  useEffect(() => {
    if (storeRoomId === roomId && playerId) {
      // Already connected — fetch latest state
      fetch(`/api/room/state?roomId=${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.state) {
            updateGameState(data.state);
          }
        })
        .catch(console.error);
    } else {
      // Not connected — show join dialog
      setNeedsJoin(true);
    }
  }, [roomId, storeRoomId, playerId, updateGameState]);

  // Handle joining via the URL
  const handleJoin = async () => {
    if (!joinName.trim()) {
      setJoinError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomId,
          playerName: joinName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join');
      }

      setConnection(roomId, data.playerId, joinName.trim());
      updateGameState(data.state);
      setNeedsJoin(false);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setIsJoining(false);
    }
  };

  // ─── Join Dialog (for players accessing via URL) ───────────────────────────

  if (needsJoin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-noise">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl">🎲</span>
              <h2 className="text-2xl font-bold text-white">Join Game</h2>
              <p className="text-white/50 text-sm">
                Room: <span className="font-mono font-bold text-white">{roomId}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Your Name</label>
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg disabled:opacity-50"
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Joining...
                </span>
              ) : (
                '🚀 Join Game'
              )}
            </motion.button>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 text-white/50 hover:text-white/80 transition-colors text-sm"
            >
              ← Back to home
            </button>

            {joinError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center"
              >
                {joinError}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/50">Loading game...</p>
        </motion.div>
      </div>
    );
  }

  // ─── Game Phases ───────────────────────────────────────────────────────────

  if (gameState.phase === 'waiting') {
    return <WaitingRoom />;
  }

  return <GameBoard />;
}
