'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  message?: string;
  emoji?: string;
  timestamp: number;
  reactions: { emoji: string; playerIds: string[] }[];
  edited?: boolean;
}

interface ChatStore {
  messages: ChatMessage[];
  unreadCount: number;
  isChatOpen: boolean;

  // addMessage: adds locally only (no broadcast) — used by Pusher handler
  addMessage: (message: ChatMessage) => void;
  // sendMessage: adds locally + broadcasts via API
  sendMessage: (message: ChatMessage, roomId: string) => void;
  editMessage: (messageId: string, newText: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string, playerId: string) => void;
  removeReaction: (messageId: string, emoji: string, playerId: string) => void;
  toggleChat: () => void;
  markAsRead: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  unreadCount: 0,
  isChatOpen: false,

  // Local-only add — called by Pusher handler for incoming messages
  addMessage: (message) => set((state) => {
    // Deduplicate by id
    if (state.messages.some(m => m.id === message.id)) return state;
    return {
      messages: [...state.messages, message],
      unreadCount: state.isChatOpen ? 0 : state.unreadCount + 1,
    };
  }),

  // Send + broadcast — called when current player sends a message
  sendMessage: (message, roomId) => {
    // Add locally first
    useChatStore.getState().addMessage(message);

    // Broadcast to other players
    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, ...message }),
    }).catch((err) => console.error('Failed to broadcast message:', err));
  },

  editMessage: (messageId, newText) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === messageId ? { ...msg, message: newText, edited: true } : msg
    ),
  })),

  deleteMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(msg => msg.id !== messageId),
  })),

  addReaction: (messageId, emoji, playerId) => set((state) => ({
    messages: state.messages.map(msg => {
      if (msg.id !== messageId) return msg;
      const existing = msg.reactions.find(r => r.emoji === emoji);
      if (existing) {
        if (!existing.playerIds.includes(playerId)) {
          return { ...msg, reactions: msg.reactions.map(r => r.emoji === emoji ? { ...r, playerIds: [...r.playerIds, playerId] } : r) };
        }
        return msg;
      }
      return { ...msg, reactions: [...msg.reactions, { emoji, playerIds: [playerId] }] };
    }),
  })),

  removeReaction: (messageId, emoji, playerId) => set((state) => ({
    messages: state.messages.map(msg => {
      if (msg.id !== messageId) return msg;
      return {
        ...msg,
        reactions: msg.reactions
          .map(r => ({ ...r, playerIds: r.playerIds.filter(id => id !== playerId) }))
          .filter(r => r.playerIds.length > 0),
      };
    }),
  })),

  toggleChat: () => set((state) => ({
    isChatOpen: !state.isChatOpen,
    unreadCount: !state.isChatOpen ? 0 : state.unreadCount,
  })),

  markAsRead: () => set({ unreadCount: 0 }),
  clearMessages: () => set({ messages: [], unreadCount: 0 }),
}));
