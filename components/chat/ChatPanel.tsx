'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, ChatMessage } from '@/hooks/useChat';
import { useGameStore } from '@/hooks/useGameState';
import { XMarkIcon, PaperAirplaneIcon, MicrophoneIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { COLOR_HEX } from '@/game-engine/constants';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export function ChatPanel() {
  const { isChatOpen, messages, toggleChat, sendMessage, editMessage, deleteMessage, addReaction } = useChatStore();
  const { playerId, playerName, gameState, roomId } = useGameStore();
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !playerId || !playerName) return;

    if (editingId) {
      editMessage(editingId, inputText.trim());
      setEditingId(null);
    } else {
      const myPlayer = gameState?.players.find(p => p.id === playerId);
      const message: ChatMessage = {
        id: `${Date.now()}-${playerId}`,
        playerId,
        playerName,
        playerColor: myPlayer ? COLOR_HEX[myPlayer.color] : '#888',
        message: inputText.trim(),
        timestamp: Date.now(),
        reactions: [],
      };
      sendMessage(message, roomId || '');
    }
    setInputText('');
  };

  const handleEdit = (msg: ChatMessage) => {
    if (msg.playerId !== playerId) return;
    setInputText(msg.message || '');
    setEditingId(msg.id);
  };

  const handleDelete = (msgId: string) => {
    deleteMessage(msgId);
    // TODO: Broadcast via Pusher
  };

  const handleReaction = (msgId: string, emoji: string) => {
    if (!playerId) return;
    addReaction(msgId, emoji, playerId);
    // TODO: Broadcast via Pusher
  };

  if (!isChatOpen) return null;

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Chat</h3>
        <button
          onClick={toggleChat}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.playerId === playerId ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span style={{ color: msg.playerColor }}>{msg.playerName}</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.playerId === playerId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {msg.message && <p className="text-sm">{msg.message}</p>}
              {msg.emoji && <span className="text-3xl">{msg.emoji}</span>}
              {msg.edited && <span className="text-xs opacity-70 ml-2">(edited)</span>}
            </div>

            {/* Reactions */}
            {msg.reactions.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {msg.reactions.map((reaction, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleReaction(msg.id, reaction.emoji)}
                    className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs flex items-center gap-1 hover:scale-110 transition-transform"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-gray-600 dark:text-gray-400">{reaction.playerIds.length}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            {msg.playerId === playerId && msg.message && (
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => handleEdit(msg)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Add Reaction */}
            <div className="flex gap-1">
              {EMOJI_REACTIONS.slice(0, 4).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(msg.id, emoji)}
                  className="text-sm hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {editingId && (
          <div className="mb-2 text-xs text-blue-500 flex items-center justify-between">
            <span>Editing message...</span>
            <button onClick={() => { setEditingId(null); setInputText(''); }}>Cancel</button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaceSmileIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {showEmojiPicker && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg grid grid-cols-8 gap-2">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  if (!playerId || !playerName) return;
                  const myPlayer = gameState?.players.find(p => p.id === playerId);
                  sendMessage({
                    id: `${Date.now()}-${playerId}`,
                    playerId,
                    playerName,
                    playerColor: myPlayer ? COLOR_HEX[myPlayer.color] : '#888',
                    emoji,
                    timestamp: Date.now(),
                    reactions: [],
                  }, roomId || '');
                  setShowEmojiPicker(false);
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
