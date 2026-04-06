/**
 * Dice Roll Button
 * 
 * A large, animated button for rolling the dice.
 * Features glow effect, roll animation, and result display.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { COLOR_HEX } from '@/game-engine/constants';
import { PlayerColor } from '@/game-engine/types';

// Dice face patterns using Unicode dots
const DICE_FACES: Record<number, string> = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
};

interface DiceButtonProps {
  onRoll: () => void;
  canRoll: boolean;
  isRolling: boolean;
  diceValue: number | null;
  playerColor: PlayerColor;
}

export function DiceButton({ onRoll, canRoll, isRolling, diceValue, playerColor }: DiceButtonProps) {
  const color = COLOR_HEX[playerColor];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Dice Result Display */}
      <AnimatePresence>
        {diceValue && !isRolling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-5xl mb-1"
          >
            {DICE_FACES[diceValue]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll Button */}
      <motion.button
        whileHover={canRoll ? { scale: 1.08 } : {}}
        whileTap={canRoll ? { scale: 0.92 } : {}}
        onClick={canRoll ? onRoll : undefined}
        disabled={!canRoll}
        className={`relative w-20 h-20 rounded-2xl font-bold text-2xl transition-all ${
          canRoll
            ? 'cursor-pointer'
            : 'cursor-not-allowed opacity-40'
        }`}
        style={{
          background: canRoll
            ? `linear-gradient(135deg, ${color}, ${color}DD)`
            : 'rgba(255,255,255,0.1)',
          boxShadow: canRoll
            ? `0 0 30px ${color}60, 0 4px 20px ${color}40`
            : 'none',
        }}
      >
        {/* Glow ring animation */}
        {canRoll && (
          <motion.div
            animate={{
              boxShadow: [
                `0 0 0 0px ${color}40`,
                `0 0 0 15px ${color}00`,
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-2xl"
          />
        )}

        {/* Dice icon or spinner */}
        {isRolling ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.3, ease: 'linear' }}
            className="inline-block text-3xl"
          >
            🎲
          </motion.span>
        ) : (
          <span className="text-3xl">🎲</span>
        )}
      </motion.button>

      {/* Label */}
      <span className="text-white/40 text-xs font-medium">
        {canRoll ? 'Tap to roll!' : isRolling ? 'Rolling...' : 'Wait...'}
      </span>
    </div>
  );
}
