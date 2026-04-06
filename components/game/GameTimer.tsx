'use client';

import { useGameTimer, formatTime } from '@/hooks/useTimer';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

export function GameTimer() {
  const { elapsedSeconds, isRunning } = useGameTimer();

  if (!isRunning) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 dark:border-gray-700 shadow-lg z-30"
    >
      <div className="flex items-center gap-2">
        <ClockIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
          {formatTime(elapsedSeconds)}
        </span>
      </div>
    </motion.div>
  );
}
