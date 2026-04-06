'use client';

import { motion } from 'framer-motion';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useChatStore } from '@/hooks/useChat';

export function ChatButton() {
  const { toggleChat, unreadCount } = useChatStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleChat}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-colors"
    >
      <ChatBubbleLeftIcon className="w-6 h-6" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.div>
      )}
    </motion.button>
  );
}
