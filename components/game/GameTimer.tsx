'use client';

import { useGameTimer, formatTime } from '@/hooks/useTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function GameTimer() {
  const { elapsedSeconds, isRunning } = useGameTimer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!isRunning || !mounted) return null;

  const time = formatTime(elapsedSeconds);
  const [minutes, seconds] = time.split(':');
  const digits = [...minutes.split(''), ...seconds.split('')];

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      {/* Vintage Flip Clock */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Wooden frame */}
        <div className="bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-2xl px-4 py-3 shadow-2xl border-2 border-amber-700">
          {/* Inner bezel */}
          <div className="bg-gray-950 rounded-xl px-3 py-2 shadow-inner border border-amber-900/50">
            <div className="flex items-center gap-1.5">
              {/* Minutes digits */}
              {[0, 1].map((i) => (
                <FlipDigit key={`m${i}`} value={digits[i]} />
              ))}

              {/* Colon */}
              <div className="flex flex-col gap-1 px-0.5 pb-1">
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"
                />
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"
                />
              </div>

              {/* Seconds digits */}
              {[2, 3].map((i) => (
                <FlipDigit key={`s${i}`} value={digits[i]} />
              ))}
            </div>

            {/* Label */}
            <div className="text-center mt-1">
              <span className="text-[9px] font-bold tracking-[0.2em] text-amber-600 uppercase">
                Game Time
              </span>
            </div>
          </div>

          {/* Corner screws */}
          {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((pos) => (
            <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full bg-amber-950 border border-amber-700 shadow-inner`} />
          ))}
        </div>

        {/* Subtle glow */}
        <div className="absolute inset-0 bg-amber-500/10 blur-lg rounded-2xl -z-10" />
      </motion.div>
    </div>
  );
}

function FlipDigit({ value }: { value: string }) {
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlipping(true);
      const t = setTimeout(() => {
        setPrev(value);
        setFlipping(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <div className="relative w-8 h-11 perspective-[200px]">
      {/* Card body */}
      <div className={`relative w-full h-full rounded-md overflow-hidden bg-gray-900 border border-gray-700 shadow-lg transition-transform duration-200 ${flipping ? 'scale-y-95' : 'scale-y-100'}`}>
        {/* Top half - darker */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700/50 flex items-end justify-center pb-0.5">
          <span className="font-mono text-2xl font-black text-amber-400 leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            {value}
          </span>
        </div>
        {/* Bottom half - lighter */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-gray-900 to-gray-950 flex items-start justify-center pt-0.5">
          <span className="font-mono text-2xl font-black text-amber-400 leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            {value}
          </span>
        </div>
        {/* Center divider line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-black/80" />
        {/* Glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
