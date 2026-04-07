/**
 * Game Board — Main Game UI Container
 * 
 * Combines the 3D scene with game UI overlays:
 * - Player panels
 * - Turn indicator
 * - Dice button
 * - Game status
 * - Chat system
 * - Timers
 * - Theme toggle
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';
import { useTimerStore } from '@/hooks/useTimer';
import { useTurnTimerStore, TURN_TIME_LIMIT, MAX_MISSED_TURNS } from '@/hooks/useTurnTimer';
import { PlayerPanel } from './PlayerPanel';
import { TurnIndicator } from './TurnIndicator';
import { Scoreboard } from './Scoreboard';
import { GameTimer } from './GameTimer';
import { TurnTimer } from './TurnTimer';
import { DiceButton } from '../ui/DiceButton';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SoundToggle } from '../ui/SoundToggle';
import { ChatButton } from '../chat/ChatButton';
import { ChatPanel } from '../chat/ChatPanel';
import { MessageNotification } from '../chat/MessageNotification';
import { COLOR_HEX } from '@/game-engine/constants';

// Dynamic import for Three.js scene (no SSR)
const Scene = dynamic(
  () => import('../three/Scene').then(mod => ({ default: mod.Scene })),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-gray-500 dark:text-white/50 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-gray-300 dark:border-white/20 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
        <p>Loading 3D board...</p>
      </div>
    </div>
  )}
);

export function GameBoard() {
  const router = useRouter();
  const gameState = useGameStore(s => s.gameState);
  const isMyTurn = useGameStore(s => s.isMyTurn);
  const myColor = useGameStore(s => s.myColor);
  const playerId = useGameStore(s => s.playerId);
  const isDiceRolling = useGameStore(s => s.isDiceRolling);
  const rollDice = useGameStore(s => s.rollDice);
  const error = useGameStore(s => s.error);
  const setError = useGameStore(s => s.setError);
  const lastDiceValue = useGameStore(s => s.lastDiceValue);
  const setLastDiceValue = useGameStore(s => s.setLastDiceValue);
  const { playSound } = useSound();

  // Clear lastDiceValue after 2s when turn changes
  useEffect(() => {
    const timer = setTimeout(() => setLastDiceValue(null), 2000);
    return () => clearTimeout(timer);
  }, [gameState?.currentTurn, setLastDiceValue]);
  
  const { startTimer, stopTimer, elapsedSeconds } = useTimerStore();
  const { startTurnTimer, stopTurnTimer, tick, timeLeft, incrementMissedTurn, getMissedTurns } = useTurnTimerStore();
  
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [rematchRequests, setRematchRequests] = useState<Set<string>>(new Set());

  // Start game timer when game starts
  useEffect(() => {
    if (gameState?.phase === 'rolling' || gameState?.phase === 'moving') {
      startTimer();
    } else if (gameState?.phase === 'finished') {
      stopTimer();
      setShowScoreboard(true);
    }
  }, [gameState?.phase, startTimer, stopTimer]);

  // Turn timer logic
  useEffect(() => {
    if (isMyTurn && gameState?.phase === 'rolling') {
      startTurnTimer(playerId || '');
    } else {
      stopTurnTimer();
    }
  }, [isMyTurn, gameState?.phase, playerId, startTurnTimer, stopTurnTimer]);

  // Tick turn timer
  useEffect(() => {
    if (!isMyTurn) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isMyTurn, tick]);

  // Handle turn timeout
  useEffect(() => {
    if (timeLeft === 0 && isMyTurn && playerId) {
      incrementMissedTurn(playerId);
      const missedCount = getMissedTurns(playerId);
      
      if (missedCount >= MAX_MISSED_TURNS) {
        // TODO: Disqualify player via API
        console.log('Player disqualified for missing too many turns');
      } else {
        // TODO: Skip turn via API
        console.log('Turn skipped due to timeout');
      }
    }
  }, [timeLeft, isMyTurn, playerId, incrementMissedTurn, getMissedTurns]);

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

  const handleRematch = () => {
    if (!playerId) return;
    setRematchRequests(prev => new Set(prev).add(playerId));
    // TODO: Broadcast rematch request via Pusher
    
    // Check if all players agreed
    const allPlayers = gameState?.players.length || 0;
    if (rematchRequests.size + 1 >= allPlayers) {
      // TODO: Start new game via API
      router.push('/');
    }
  };

  const handleExit = () => {
    router.push('/');
  };

  if (!gameState) return null;

  const currentPlayerColor = gameState.currentTurn;
  const canRoll = isMyTurn && gameState.phase === 'rolling' && !isDiceRolling;
  const mustSelectToken = isMyTurn && gameState.phase === 'moving';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Theme and Sound Toggles */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <SoundToggle />
        <ThemeToggle />
      </div>

      <TurnTimer />
      <ChatButton />
      <ChatPanel />
      <MessageNotification />

      {/* Background gradient based on current turn */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${COLOR_HEX[currentPlayerColor]}20 0%, transparent 70%)`,
        }}
      />

      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Top Center: Turn Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-30">
          <TurnIndicator />
        </div>

        {/* Below Turn Indicator: Flip Clock */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
          <GameTimer />
        </div>

        {/* Player Panels - Desktop: sides */}
        <div className="hidden md:block">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto z-20">
            {gameState.players.slice(0, 2).map(player => (
              <PlayerPanel key={player.id} player={player} isCurrentTurn={player.color === currentPlayerColor} />
            ))}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto z-20">
            {gameState.players.slice(2).map(player => (
              <PlayerPanel key={player.id} player={player} isCurrentTurn={player.color === currentPlayerColor} />
            ))}
          </div>
        </div>

        {/* Mobile: Player Panels at top */}
        <div className="md:hidden absolute top-20 left-0 right-0 flex justify-center gap-2 px-2 pointer-events-auto z-20">
          {gameState.players.map(player => (
            <PlayerPanel key={player.id} player={player} isCurrentTurn={player.color === currentPlayerColor} compact />
          ))}
        </div>

        {/* Bottom Center: Dice & Actions */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto z-30">
          <AnimatePresence>
            {mustSelectToken && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-5 py-2.5 rounded-2xl backdrop-blur-md bg-white/90 dark:bg-white/10 border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white text-sm font-semibold shadow-xl"
              >
                🎯 Click a glowing token to move it! (Rolled: {gameState.diceValue})
              </motion.div>
            )}
          </AnimatePresence>

          <DiceButton
            onRoll={handleRollDice}
            canRoll={canRoll}
            isRolling={isDiceRolling}
            diceValue={gameState.diceValue ?? lastDiceValue}
            playerColor={myColor || 'red'}
          />

          {!isMyTurn && gameState.phase !== 'finished' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 dark:text-white/50 text-xs font-medium"
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
              className="absolute bottom-4 right-4 p-4 rounded-xl backdrop-blur-md bg-red-500/20 border border-red-500/30 text-red-300 text-sm max-w-xs pointer-events-auto z-50"
            >
              <div className="flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Scoreboard
          show={showScoreboard}
          onRematch={handleRematch}
          onExit={handleExit}
          gameDuration={elapsedSeconds}
        />
      </div>
    </div>
  );
}
