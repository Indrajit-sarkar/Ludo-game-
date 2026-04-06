/**
 * Game Board — Main Game UI Container
 * 
 * Combines the 3D scene with game UI overlays:
 * - Player panels
 * - Turn indicator
 * - Dice button
 * - Game status
 */

'use client';

import { useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';
import { PlayerPanel } from './PlayerPanel';
import { TurnIndicator } from './TurnIndicator';
import { WinnerPopup } from './WinnerPopup';
import { DiceButton } from '../ui/DiceButton';
import { COLOR_HEX } from '@/game-engine/constants';

// Dynamic import for Three.js scene (no SSR)
const Scene = dynamic(
  () => import('../three/Scene').then(mod => ({ default: mod.Scene })),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/50 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        <p>Loading 3D board...</p>
      </div>
    </div>
  )}
);

export function GameBoard() {
  const gameState = useGameStore(s => s.gameState);
  const isMyTurn = useGameStore(s => s.isMyTurn);
  const myColor = useGameStore(s => s.myColor);
  const isDiceRolling = useGameStore(s => s.isDiceRolling);
  const rollDice = useGameStore(s => s.rollDice);
  const error = useGameStore(s => s.error);
  const setError = useGameStore(s => s.setError);
  const { playSound } = useSound();

  // Sound effects
  useEffect(() => {
    if (isMyTurn && gameState?.phase === 'rolling') {
      playSound('turn');
    }
  }, [isMyTurn, gameState?.phase, playSound]);

  const handleRollDice = useCallback(() => {
    playSound('dice');
    rollDice();
  }, [playSound, rollDice]);

  if (!gameState) return null;

  const currentPlayerColor = gameState.currentTurn;
  const canRoll = isMyTurn && gameState.phase === 'rolling' && !isDiceRolling;
  const mustSelectToken = isMyTurn && gameState.phase === 'moving';

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background gradient based on current turn */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${COLOR_HEX[currentPlayerColor]}15 0%, #0a0a1a 70%)`,
        }}
      />

      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top: Turn Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
          <TurnIndicator />
        </div>

        {/* Left: Player Panels */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2 pointer-events-auto">
          {gameState.players.slice(0, 2).map(player => (
            <PlayerPanel key={player.id} player={player} isCurrentTurn={player.color === currentPlayerColor} />
          ))}
        </div>

        {/* Right: Player Panels */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2 pointer-events-auto">
          {gameState.players.slice(2).map(player => (
            <PlayerPanel key={player.id} player={player} isCurrentTurn={player.color === currentPlayerColor} />
          ))}
        </div>

        {/* Bottom Center: Dice & Actions */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-auto">
          {/* Token selection prompt */}
          <AnimatePresence>
            {mustSelectToken && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-6 py-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white text-sm font-medium"
              >
                🎯 Click a glowing token to move it! (Rolled: {gameState.diceValue})
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dice Button */}
          <DiceButton
            onRoll={handleRollDice}
            canRoll={canRoll}
            isRolling={isDiceRolling}
            diceValue={gameState.diceValue}
            playerColor={myColor || 'red'}
          />

          {/* Status text */}
          {!isMyTurn && gameState.phase !== 'finished' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/40 text-sm"
            >
              Waiting for {gameState.currentTurn} player&apos;s turn...
            </motion.p>
          )}
        </div>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-4 right-4 p-4 rounded-xl backdrop-blur-md bg-red-500/20 border border-red-500/30 text-red-300 text-sm max-w-xs pointer-events-auto"
            >
              <div className="flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner Popup */}
        <WinnerPopup />
      </div>
    </div>
  );
}
