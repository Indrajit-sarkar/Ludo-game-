'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameState';
import { COLOR_HEX } from '@/game-engine/constants';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { formatTime } from '@/hooks/useTimer';

interface ScoreboardProps {
  show: boolean;
  onRematch: () => void;
  onExit: () => void;
  gameDuration: number;
}

export function Scoreboard({ show, onRematch, onExit, gameDuration }: ScoreboardProps) {
  const gameState = useGameStore(s => s.gameState);

  if (!show || !gameState) return null;

  const rankings = [...gameState.players]
    .sort((a, b) => {
      const aFinished = a.tokens.every(t => t.isFinished);
      const bFinished = b.tokens.every(t => t.isFinished);
      if (aFinished && !bFinished) return -1;
      if (!aFinished && bFinished) return 1;
      const aHome = a.finishedTokens;
      const bHome = b.finishedTokens;
      return bHome - aHome;
    });

  const medals = ['🥇', '🥈', '🥉'];
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                className="inline-block mb-4"
              >
                <TrophyIcon className="w-20 h-20 text-yellow-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Game Over!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Duration: {formatTime(gameDuration)}
              </p>
            </div>

            {/* Rankings */}
            <div className="space-y-3 mb-8">
              {rankings.map((player, index) => {
                const isWinner = index === 0;
                const showMedal = index < (gameState.mode === '2-player' ? 1 : 3);

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      isWinner
                        ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-500'
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-900 font-bold text-lg">
                      {showMedal ? (
                        <span className="text-2xl">{medals[index]}</span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">#{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: COLOR_HEX[player.color] }}
                    >
                      {player.name[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {player.finishedTokens}/4 tokens home
                      </p>
                    </div>

                    {/* Badge */}
                    {showMedal && (
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: medalColors[index] }}
                      >
                        {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRematch}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg hover:shadow-xl transition-shadow"
              >
                🔄 Rematch
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExit}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                🏠 Exit
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
