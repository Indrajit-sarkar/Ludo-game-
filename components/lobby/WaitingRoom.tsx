/**
 * Waiting Room
 * 
 * Displayed after room creation / joining, before game starts.
 * Shows connected players, room code, share link, and start button.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameState';
import { COLOR_HEX } from '@/game-engine/constants';
import { getColorEmoji, formatColor, getRoomUrl, copyToClipboard } from '@/lib/utils';

export function WaitingRoom() {
  const gameState = useGameStore(s => s.gameState);
  const isHost = useGameStore(s => s.isHost);
  const startGame = useGameStore(s => s.startGame);
  const roomId = useGameStore(s => s.roomId);
  const error = useGameStore(s => s.error);
  const isLoading = useGameStore(s => s.isLoading);

  const [copied, setCopied] = useState(false);

  if (!gameState || !roomId) return null;

  const requiredPlayers = gameState.mode === '2-player' ? 2 : 4;
  const currentPlayers = gameState.players.length;
  const canStart = isHost && currentPlayers >= requiredPlayers;

  const handleCopyCode = async () => {
    const success = await copyToClipboard(roomId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const url = getRoomUrl(roomId);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Waiting Room</h2>
            <p className="text-white/50 text-sm">
              {currentPlayers}/{requiredPlayers} players • {gameState.mode.replace('-', ' ')}
            </p>
          </div>

          {/* Room Code */}
          <div className="bg-white/5 rounded-2xl p-4 text-center space-y-3 border border-white/10">
            <p className="text-white/50 text-xs uppercase tracking-wider">Room Code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-mono font-bold text-white tracking-[0.4em]">
                {roomId}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {copied ? '✅' : '📋'}
              </motion.button>
            </div>
            <button
              onClick={handleCopyLink}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
            >
              📎 Copy invite link
            </button>
          </div>

          {/* Players List */}
          <div className="space-y-3">
            <p className="text-white/50 text-sm font-medium">Players</p>
            <div className="space-y-2">
              {gameState.players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: COLOR_HEX[player.color] + '30', color: COLOR_HEX[player.color] }}
                  >
                    {player.name[0].toUpperCase()}
                  </div>

                  {/* Name & Color */}
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {player.name}
                      {player.isHost && (
                        <span className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">
                          👑 Host
                        </span>
                      )}
                    </p>
                    <p className="text-white/40 text-xs">
                      {getColorEmoji(player.color)} {formatColor(player.color)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs">Ready</span>
                  </div>
                </motion.div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: requiredPlayers - currentPlayers }).map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-white/20 text-lg">?</span>
                  </div>
                  <p className="text-white/30 text-sm">Waiting for player...</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Start Button (host only) */}
          {isHost && (
            <motion.button
              whileHover={{ scale: canStart ? 1.02 : 1 }}
              whileTap={{ scale: canStart ? 0.98 : 1 }}
              onClick={startGame}
              disabled={!canStart || isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                canStart
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Starting...
                </span>
              ) : canStart ? (
                '🚀 Start Game!'
              ) : (
                `Waiting for ${requiredPlayers - currentPlayers} more player${requiredPlayers - currentPlayers > 1 ? 's' : ''}...`
              )}
            </motion.button>
          )}

          {!isHost && (
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <p className="text-white/50 text-sm">Waiting for host to start the game...</p>
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
