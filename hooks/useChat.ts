'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  message?: string;
  emoji?: string;
  voiceUrl?: string;
  timestamp: number;
  reactions: { emoji: string; playerIds: string[] }[];
  edited?: boolean;
}

interface ChatStore {
  messages: ChatMessage[];
  unreadCount: number;
  isChatOpen: boolean;
  isRecording: boolean;
  
  addMessage: (message: ChatMessage) => void;
  editMessage: (messageId: string, newText: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string, playerId: string) => void;
  removeReaction: (messageId: string, emoji: string, playerId: string) => void;
  toggleChat: () => void;
  markAsRead: () => void;
  setRecording: (recording: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  unreadCount: 0,
  isChatOpen: false,
  isRecording: false,

  addMessage: (message) => set((state) => {
    // Add message locally
    const newState = {
      messages: [...state.messages, message],
      unreadCount: state.isChatOpen ? 0 : state.unreadCount + 1,
    };
    
    // Broadcast to other players via API
    if (typeof window !== 'undefined') {
      const roomId = (window as any).__GAME_ROOM_ID__;
      if (roomId) {
        fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            ...message,
          }),
        }).catch(error => {
          console.error('Failed to broadcast message:', error);
        });
      }
    }
    
    return newState;
  }),

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
      const existingReaction = msg.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (!existingReaction.playerIds.includes(playerId)) {
          existingReaction.playerIds.push(playerId);
        }
        return { ...msg, reactions: [...msg.reactions] };
      }
      return {
        ...msg,
        reactions: [...msg.reactions, { emoji, playerIds: [playerId] }],
      };
    }),
  })),

  removeReaction: (messageId, emoji, playerId) => set((state) => ({
    messages: state.messages.map(msg => {
      if (msg.id !== messageId) return msg;
      return {
        ...msg,
        reactions: msg.reactions
          .map(r => ({
            ...r,
            playerIds: r.playerIds.filter(id => id !== playerId),
          }))
          .filter(r => r.playerIds.length > 0),
      };
    }),
  })),

  toggleChat: () => set((state) => ({
    isChatOpen: !state.isChatOpen,
    unreadCount: !state.isChatOpen ? 0 : state.unreadCount,
  })),

  markAsRead: () => set({ unreadCount: 0 }),

  setRecording: (recording) => set({ isRecording: recording }),

  clearMessages: () => set({ messages: [], unreadCount: 0 }),
}));
