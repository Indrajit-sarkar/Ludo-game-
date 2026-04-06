'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, ChatMessage } from '@/hooks/useChat';
import { useSound } from '@/hooks/useSound';

export function MessageNotification() {
  const messages = useChatStore(s => s.messages);
  const isChatOpen = useChatStore(s => s.isChatOpen);
  const { playNotification } = useSound();
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (lastMessage && !isChatOpen) {
      playNotification();
    }
  }, [lastMessage, isChatOpen, playNotification]);

  if (isChatOpen || !lastMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={lastMessage.id}
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="fixed top-6 right-6 max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 z-50 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: lastMessage.playerColor }}
          >
            {lastMessage.playerName[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              {lastMessage.playerName}
            </p>
            {lastMessage.message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {lastMessage.message}
              </p>
            )}
            {lastMessage.emoji && (
              <span className="text-2xl">{lastMessage.emoji}</span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
