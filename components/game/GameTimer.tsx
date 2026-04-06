'use client';

import { useGameTimer, formatTime } from '@/hooks/useTimer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function GameTimer() {
  const { elapsedSeconds, isRunning } = useGameTimer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isRunning || !mounted) return null;

  const time = formatTime(elapsedSeconds);
  const [minutes, seconds] = time.split(':');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-32 left-1/2 -translate-x-1/2 z-30"
    >
      {/* Retro Clock Container */}
      <div className="relative">
        {/* Clock Body */}
        <div className="relative bg-gradient-to-b from-amber-900 to-amber-950 rounded-3xl p-6 shadow-2xl border-4 border-amber-800">
          {/* Clock Face */}
          <div className="relative bg-black rounded-2xl p-4 shadow-inner">
            {/* Digital Display */}
            <div className="flex items-center justify-center gap-2">
              {/* Minutes */}
              <div className="flex gap-1">
                {minutes.split('').map((digit, i) => (
                  <div
                    key={`min-${i}`}
                    className="relative w-10 h-14 bg-gray-900 rounded-lg border-2 border-amber-700/50 shadow-inner overflow-hidden"
                  >
                    {/* LED Segments Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-black" />
                    
                    {/* Digit */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-4xl font-bold text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                        {digit}
                      </span>
                    </div>
                    
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* Colon Separator */}
              <div className="flex flex-col gap-2 px-1">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
              </div>

              {/* Seconds */}
              <div className="flex gap-1">
                {seconds.split('').map((digit, i) => (
                  <div
                    key={`sec-${i}`}
                    className="relative w-10 h-14 bg-gray-900 rounded-lg border-2 border-amber-700/50 shadow-inner overflow-hidden"
                  >
                    {/* LED Segments Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-black" />
                    
                    {/* Digit */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-4xl font-bold text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                        {digit}
                      </span>
                    </div>
                    
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Label */}
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Game Time
              </span>
            </div>
          </div>

          {/* Decorative Screws */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-amber-950 border border-amber-700 shadow-inner" />
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-950 border border-amber-700 shadow-inner" />
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-amber-950 border border-amber-700 shadow-inner" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-amber-950 border border-amber-700 shadow-inner" />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-3xl -z-10" />
      </div>
    </motion.div>
  );
}
