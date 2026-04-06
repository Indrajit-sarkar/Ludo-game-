'use client';

import { motion } from 'framer-motion';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useSound } from '@/hooks/useSound';

export function SoundToggle() {
  const { toggleSound, isEnabled } = useSound();
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMuted(!isEnabled());
  }, [isEnabled]);

  if (!mounted) return null;

  const handleToggle = () => {
    const newState = toggleSound();
    setIsMuted(!newState);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className="w-14 h-14 bg-white dark:bg-gray-800 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-gray-300 dark:border-gray-700 shadow-xl transition-all hover:shadow-2xl"
      aria-label="Toggle sound"
    >
      {isMuted ? (
        <SpeakerXMarkIcon className="w-7 h-7 text-red-500" />
      ) : (
        <SpeakerWaveIcon className="w-7 h-7 text-green-500" />
      )}
    </motion.button>
  );
}
