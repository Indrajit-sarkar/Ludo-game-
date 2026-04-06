'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTurnTimerStore, TURN_TIME_LIMIT } from '@/hooks/useTurnTimer';
import { useGameStore } from '@/hooks/useGameState';

export function TurnTimer() {
  const { timeLeft, isActive } = useTurnTimerStore();
  const { isMyTurn } = useGameStore();

  const percentage = (timeLeft / TURN_TIME_LIMIT) * 100;
  const isWarning = timeLeft <= 5;

  if (!isActive || !isMyTurn) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-30"
    >
      <div className="relative w-20 h-20">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-300 dark:text-gray-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - percentage / 100)}`}
            className={`transition-colors ${
              isWarning ? 'text-red-500' : 'text-blue-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            animate={{ scale: isWarning ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: isWarning ? Infinity : 0, duration: 0.5 }}
            className={`text-2xl font-bold ${
              isWarning ? 'text-red-500' : 'text-gray-900 dark:text-white'
            }`}
          >
            {timeLeft}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
