/**
 * Winner Popup
 * 
 * Displayed when the game ends showing rankings
 * with celebration animations.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameState';
import { COLOR_HEX } from '@/game-engine/constants';
import { getColorEmoji } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSound } from '@/hooks/useSound';

export function WinnerPopup() {
  const gameState = useGameStore(s => s.gameState);
  const showWinnerPopup = useGameStore(s => s.showWinnerPopup);
  const setShowWinnerPopup = useGameStore(s => s.setShowWinnerPopup);
  const reset = useGameStore(s => s.reset);
  const router = useRouter();
  const { playSound } = useSound();

  useEffect(() => {
    if (showWinnerPopup) {
      playSound('win');
    }
  }, [showWinnerPopup, playSound]);

  if (!gameState || !showWinnerPopup) return null;

  // Build rankings
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (a.rank === 0) return 1;
    if (b.rank === 0) return -1;
    return a.rank - b.rank;
  });

  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣'];
  const rankLabels = ['1st Place', '2nd Place', '3rd Place', '4th Place'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
      >
        {/* Confetti particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0,
            }}
            animate={{
              x: (Math.random() - 0.5) * 800,
              y: (Math.random() - 0.5) * 600,
              opacity: 0,
              scale: Math.random() * 2 + 1,
              rotate: Math.random() * 720,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: ['#EF4444', '#22C55E', '#3B82F6', '#EAB308', '#FFD700'][i % 5],
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 space-y-6"
        >
          {/* Trophy */}
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            className="text-center"
          >
            <span className="text-7xl">🏆</span>
          </motion.div>

          <h2 className="text-3xl font-black text-center bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Game Over!
          </h2>

          {/* Rankings */}
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => {
              const color = COLOR_HEX[player.color];
              const isWinner = index === 0;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.15 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isWinner
                      ? 'bg-yellow-400/10 border-yellow-400/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className="text-2xl">{rankEmojis[index]}</span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: color + '40', color }}
                  >
                    {player.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{player.name}</p>
                    <p className="text-white/40 text-xs">
                      {getColorEmoji(player.color)} {rankLabels[index]}
                    </p>
                  </div>
                  {isWinner && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-2xl"
                    >
                      👑
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                reset();
                router.push('/');
              }}
              className="flex-1 py-3 rounded-xl font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              🏠 Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShowWinnerPopup(false);
              }}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg"
            >
              👀 View Board
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
