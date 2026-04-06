/**
 * Player Panel
 * 
 * Shows a player's info, token status, and active turn indicator.
 */

'use client';

import { motion } from 'framer-motion';
import { Player } from '@/game-engine/types';
import { COLOR_HEX } from '@/game-engine/constants';
import { getColorEmoji } from '@/lib/utils';

interface PlayerPanelProps {
  player: Player;
  isCurrentTurn: boolean;
  compact?: boolean;
}

export function PlayerPanel({ player, isCurrentTurn, compact = false }: PlayerPanelProps) {
  const color = COLOR_HEX[player.color];
  const tokensInYard = player.tokens.filter(t => t.isInYard).length;
  const tokensOnBoard = player.tokens.filter(t => !t.isInYard && !t.isFinished).length;
  const tokensFinished = player.finishedTokens;

  if (compact) {
    return (
      <motion.div
        animate={{
          borderColor: isCurrentTurn ? color : 'rgba(255,255,255,0.1)',
          scale: isCurrentTurn ? 1.05 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="backdrop-blur-md bg-black/40 dark:bg-black/40 light:bg-white/80 rounded-xl border-2 p-2 flex flex-col items-center gap-1 min-w-[70px]"
        style={{ boxShadow: isCurrentTurn ? `0 0 15px ${color}40` : 'none' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: color + '40', color }}
        >
          {player.name[0].toUpperCase()}
        </div>
        <p className="text-white dark:text-white light:text-gray-900 text-[10px] font-semibold truncate max-w-full px-1">
          {player.name}
        </p>
        <div className="flex gap-0.5">
          {player.tokens.map(token => (
            <div
              key={token.id}
              className="w-3 h-3 rounded-full border"
              style={{
                borderColor: color,
                backgroundColor: token.isFinished ? color : token.isInYard ? 'transparent' : color + '60',
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{
        borderColor: isCurrentTurn ? color : 'rgba(255,255,255,0.1)',
        scale: isCurrentTurn ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-44 backdrop-blur-md bg-black/40 dark:bg-black/40 light:bg-white/80 rounded-2xl border-2 p-3 space-y-2"
      style={{ boxShadow: isCurrentTurn ? `0 0 20px ${color}40` : 'none' }}
    >
      {/* Player Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: color + '40', color }}
        >
          {player.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white dark:text-white light:text-gray-900 text-sm font-semibold truncate">{player.name}</p>
          <p className="text-xs" style={{ color: color }}>
            {getColorEmoji(player.color)} {player.color}
          </p>
        </div>
        {isCurrentTurn && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Token Status */}
      <div className="flex items-center gap-1.5 text-xs text-white/50 dark:text-white/50 light:text-gray-600">
        <span title="In yard">🏠 {tokensInYard}</span>
        <span className="text-white/20 dark:text-white/20 light:text-gray-400">•</span>
        <span title="On board">🎯 {tokensOnBoard}</span>
        <span className="text-white/20 dark:text-white/20 light:text-gray-400">•</span>
        <span title="Finished">🏆 {tokensFinished}</span>
      </div>

      {/* Token Dots */}
      <div className="flex gap-1.5">
        {player.tokens.map(token => (
          <div
            key={token.id}
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px]"
            style={{
              borderColor: color,
              backgroundColor: token.isFinished
                ? color
                : token.isInYard
                ? 'transparent'
                : color + '60',
            }}
          >
            {token.isFinished ? '✓' : token.isInYard ? '' : '●'}
          </div>
        ))}
      </div>

      {/* Rank badge */}
      {player.rank > 0 && (
        <div className="text-center">
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-bold">
            {player.rank === 1 ? '🥇 1st' : player.rank === 2 ? '🥈 2nd' : player.rank === 3 ? '🥉 3rd' : `${player.rank}th`}
          </span>
        </div>
      )}

      {/* Disconnected indicator */}
      {!player.connected && (
        <div className="text-center">
          <span className="text-xs text-red-400">⚡ Disconnected</span>
        </div>
      )}
    </motion.div>
  );
}
