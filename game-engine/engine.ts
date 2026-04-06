/**
 * Ludo Game — Core Game Engine
 * 
 * Server-authoritative game logic. All game rules are enforced here.
 * The client only sends intents (roll dice, move token), and the server
 * validates and applies them.
 */

import {
  GameState,
  GamePhase,
  Player,
  PlayerColor,
  Token,
  Move,
} from './types';
import {
  START_POSITIONS,
  HOME_ENTRY_POSITIONS,
  SAFE_POSITIONS,
  MAIN_TRACK_LENGTH,
  FINISHED_POSITION,
  TOKENS_PER_PLAYER,
  TWO_PLAYER_COLORS,
  FOUR_PLAYER_COLORS,
  pathToGlobal,
} from './constants';
import { rollDice } from './dice';

// ─── Create Initial Game State ───────────────────────────────────────────────

/** Create initial tokens for a player */
function createTokens(color: PlayerColor): Token[] {
  return Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: `${color}-${i}`,
    color,
    index: i,
    pathPosition: -1, // In yard
    globalPosition: -1,
    isInYard: true,
    isFinished: false,
    isOnHomePath: false,
  }));
}

/** Create a new player */
export function createPlayer(
  id: string,
  name: string,
  color: PlayerColor,
  isHost: boolean
): Player {
  return {
    id,
    name,
    color,
    tokens: createTokens(color),
    isHost,
    connected: true,
    finishedTokens: 0,
    rank: 0,
  };
}

/** Create initial game state for a room */
export function createGameState(
  roomId: string,
  mode: '2-player' | '4-player'
): GameState {
  return {
    roomId,
    players: [],
    currentTurn: mode === '2-player' ? TWO_PLAYER_COLORS[0] : FOUR_PLAYER_COLORS[0],
    diceValue: null,
    phase: 'waiting',
    consecutiveSixes: 0,
    rankings: [],
    moveSequence: 0,
    mode,
    lastActionTimestamp: Date.now(),
    validMoves: [],
  };
}

// ─── Dice Rolling ────────────────────────────────────────────────────────────

/**
 * Process a dice roll for the current player.
 * Returns the updated game state with dice value and valid moves.
 */
export function processDiceRoll(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');
  if (player.color !== state.currentTurn) throw new Error('Not your turn');
  if (state.phase !== 'rolling') throw new Error('Cannot roll now');

  const diceValue = rollDice();
  const newState = { ...state };
  newState.diceValue = diceValue;
  newState.moveSequence++;
  newState.lastActionTimestamp = Date.now();

  // Check for three consecutive 6s — lose turn
  if (diceValue === 6) {
    newState.consecutiveSixes++;
    if (newState.consecutiveSixes >= 3) {
      // Three 6s in a row: skip turn, move to next player
      newState.consecutiveSixes = 0;
      newState.diceValue = null;
      newState.currentTurn = getNextTurnColor(newState);
      newState.phase = 'rolling';
      newState.validMoves = [];
      return newState;
    }
  } else {
    newState.consecutiveSixes = 0;
  }

  // Calculate valid moves
  const validMoves = getValidMoves(newState, player, diceValue);
  newState.validMoves = validMoves.map(t => t.id);

  if (validMoves.length === 0) {
    // No valid moves — pass turn
    if (diceValue !== 6) {
      newState.currentTurn = getNextTurnColor(newState);
      newState.consecutiveSixes = 0;
    }
    newState.phase = 'rolling';
    newState.diceValue = null;
  } else if (validMoves.length === 1) {
    // Only one valid move — auto-execute it
    return executeMove(newState, validMoves[0].id, playerId);
  } else {
    // Multiple valid moves — player must choose
    newState.phase = 'moving';
  }

  return newState;
}

// ─── Move Computation ────────────────────────────────────────────────────────

/**
 * Get all tokens that can legally move with the given dice value.
 */
function getValidMoves(state: GameState, player: Player, diceValue: number): Token[] {
  return player.tokens.filter(token => {
    if (token.isFinished) return false;

    // Token in yard — can only come out with a 6
    if (token.isInYard) {
      return diceValue === 6;
    }

    // Token on the board — check if move is valid
    const newPosition = token.pathPosition + diceValue;

    // Cannot overshoot home (position 57 is finish, need exact roll)
    if (newPosition > FINISHED_POSITION) return false;

    // Check if landing on own token (blocking)
    if (newPosition < MAIN_TRACK_LENGTH) {
      const globalPos = pathToGlobal(player.color, newPosition);
      const hasOwnToken = player.tokens.some(
        t => !t.isInYard && !t.isFinished && t.id !== token.id &&
             t.pathPosition < MAIN_TRACK_LENGTH &&
             pathToGlobal(player.color, t.pathPosition) === globalPos
      );
      if (hasOwnToken) return false;
    }

    return true;
  });
}

// ─── Move Execution ──────────────────────────────────────────────────────────

/**
 * Execute a token move. Validates and applies the move, handling captures,
 * home entry, and turn progression.
 */
export function executeMove(
  state: GameState,
  tokenId: string,
  playerId: string
): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const player = newState.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');
  if (player.color !== newState.currentTurn) throw new Error('Not your turn');
  
  const token = player.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  const diceValue = newState.diceValue;
  if (diceValue === null) throw new Error('No dice value');

  let captured = false;
  let capturedTokenId: string | undefined;

  if (token.isInYard) {
    // Moving out of yard — place on starting position
    if (diceValue !== 6) throw new Error('Need 6 to leave yard');
    token.pathPosition = 0;
    token.isInYard = false;
    token.globalPosition = START_POSITIONS[player.color];

    // Check for capture at start position
    const captureResult = checkAndExecuteCapture(newState, player, token);
    captured = captureResult.captured;
    capturedTokenId = captureResult.capturedTokenId;
  } else {
    // Moving along the track
    const newPosition = token.pathPosition + diceValue;

    if (newPosition > FINISHED_POSITION) {
      throw new Error('Cannot overshoot home');
    }

    token.pathPosition = newPosition;

    if (newPosition === FINISHED_POSITION) {
      // Token has reached home!
      token.isFinished = true;
      token.isOnHomePath = false;
      player.finishedTokens++;

      // Check if player has won (all 4 tokens home)
      if (player.finishedTokens === TOKENS_PER_PLAYER) {
        const currentRank = newState.rankings.length + 1;
        player.rank = currentRank;
        newState.rankings.push(player.id);

        // Check if game is over
        const activePlayers = newState.players.filter(p => p.rank === 0);
        if (activePlayers.length <= 1) {
          // Game over — assign remaining ranks
          activePlayers.forEach(p => {
            p.rank = newState.rankings.length + 1;
            newState.rankings.push(p.id);
          });
          newState.phase = 'finished';
          return newState;
        }
      }
    } else if (newPosition >= MAIN_TRACK_LENGTH) {
      // On home path
      token.isOnHomePath = true;
      token.globalPosition = -1;
    } else {
      // On main track
      token.globalPosition = pathToGlobal(player.color, newPosition);
      token.isOnHomePath = false;

      // Check for capture
      const captureResult = checkAndExecuteCapture(newState, player, token);
      captured = captureResult.captured;
      capturedTokenId = captureResult.capturedTokenId;
    }
  }

  newState.moveSequence++;
  newState.lastActionTimestamp = Date.now();

  // Determine next turn
  const getsExtraTurn = diceValue === 6 || captured;
  
  if (getsExtraTurn && player.rank === 0) {
    // Same player rolls again
    newState.phase = 'rolling';
  } else {
    // Next player's turn
    newState.currentTurn = getNextTurnColor(newState);
    newState.phase = 'rolling';
    newState.consecutiveSixes = 0;
  }

  newState.diceValue = null;
  newState.validMoves = [];

  return newState;
}

// ─── Capture Logic ───────────────────────────────────────────────────────────

/**
 * Check if the moved token captures an opponent's token.
 * Returns capture info. If captured, the opponent's token is sent back to yard.
 */
function checkAndExecuteCapture(
  state: GameState,
  movingPlayer: Player,
  movedToken: Token
): { captured: boolean; capturedTokenId?: string } {
  const globalPos = pathToGlobal(movingPlayer.color, movedToken.pathPosition);

  // Cannot capture on safe positions
  if (SAFE_POSITIONS.includes(globalPos)) {
    return { captured: false };
  }

  // Check all opponent tokens
  for (const opponent of state.players) {
    if (opponent.color === movingPlayer.color) continue;

    for (const oppToken of opponent.tokens) {
      if (oppToken.isInYard || oppToken.isFinished || oppToken.isOnHomePath) continue;

      const oppGlobalPos = pathToGlobal(opponent.color, oppToken.pathPosition);
      if (oppGlobalPos === globalPos) {
        // Capture! Send opponent token back to yard
        oppToken.pathPosition = -1;
        oppToken.isInYard = true;
        oppToken.globalPosition = -1;
        oppToken.isOnHomePath = false;
        return { captured: true, capturedTokenId: oppToken.id };
      }
    }
  }

  return { captured: false };
}

// ─── Turn Management ─────────────────────────────────────────────────────────

/**
 * Get the next player's color (skipping finished players).
 */
function getNextTurnColor(state: GameState): PlayerColor {
  const colors = state.mode === '2-player' ? TWO_PLAYER_COLORS : FOUR_PLAYER_COLORS;
  const activeColors = colors.filter(c => {
    const player = state.players.find(p => p.color === c);
    return player && player.rank === 0;
  });

  if (activeColors.length === 0) return state.currentTurn;

  const currentIndex = activeColors.indexOf(state.currentTurn);
  const nextIndex = (currentIndex + 1) % activeColors.length;
  return activeColors[nextIndex];
}

/**
 * Start the game — transition from waiting to rolling.
 */
export function startGame(state: GameState): GameState {
  if (state.phase !== 'waiting') throw new Error('Game already started');
  
  const requiredPlayers = state.mode === '2-player' ? 2 : 4;
  if (state.players.length < requiredPlayers) {
    throw new Error(`Need ${requiredPlayers} players to start`);
  }

  return {
    ...state,
    phase: 'rolling',
    currentTurn: state.players[0].color,
    lastActionTimestamp: Date.now(),
  };
}

/**
 * Add a player to the game.
 */
export function addPlayer(
  state: GameState,
  playerId: string,
  playerName: string,
  isHost: boolean
): GameState {
  const maxPlayers = state.mode === '2-player' ? 2 : 4;
  if (state.players.length >= maxPlayers) throw new Error('Room is full');
  if (state.phase !== 'waiting') throw new Error('Game already started');

  const availableColors = (state.mode === '2-player' ? TWO_PLAYER_COLORS : FOUR_PLAYER_COLORS)
    .filter(c => !state.players.some(p => p.color === c));

  if (availableColors.length === 0) throw new Error('No colors available');

  const color = availableColors[0];
  const player = createPlayer(playerId, playerName, color, isHost);

  return {
    ...state,
    players: [...state.players, player],
  };
}

/**
 * Remove a player from the game (disconnect).
 */
export function removePlayer(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const playerInState = newState.players.find(p => p.id === playerId)!;
  playerInState.connected = false;

  // If it was this player's turn, skip to next
  if (newState.currentTurn === playerInState.color && newState.phase !== 'waiting' && newState.phase !== 'finished') {
    newState.currentTurn = getNextTurnColor(newState);
    newState.phase = 'rolling';
    newState.diceValue = null;
    newState.validMoves = [];
  }

  return newState;
}
