/**
 * Turn Indicator
 * 
 * Shows whose turn it is with a colored banner at the top.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameState';
import { COLOR_HEX } from '@/game-engine/constants';
import { getColorEmoji, formatColor } from '@/lib/utils';

export function TurnIndicator() {
  const gameState = useGameStore(s => s.gameState);
  const isMyTurn = useGameStore(s => s.isMyTurn);

  if (!gameState || gameState.phase === 'finished') return null;

  const color = gameState.currentTurn;
  const currentPlayer = gameState.players.find(p => p.color === color);
  const hex = COLOR_HEX[color];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={color}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="backdrop-blur-md rounded-2xl border px-6 py-3 flex items-center gap-3"
        style={{
          backgroundColor: hex + '20',
          borderColor: hex + '40',
          boxShadow: `0 0 30px ${hex}20`,
        }}
      >
        <span className="text-lg">{getColorEmoji(color)}</span>
        <div className="text-sm">
          <span className="font-bold text-white">
            {isMyTurn ? 'Your turn!' : `${currentPlayer?.name || formatColor(color)}'s turn`}
          </span>
          <span className="text-white/40 ml-2">
            {gameState.phase === 'rolling' ? '• Roll the dice' : '• Select a token'}
          </span>
        </div>
        {isMyTurn && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-lg"
          >
            ⬅️
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
