/**
 * Ludo Game — Move Validation
 * 
 * Server-side validation to prevent cheating.
 * Every move request is validated before execution.
 */

import { GameState } from './types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a dice roll request is legitimate.
 */
export function validateDiceRoll(
  state: GameState,
  playerId: string
): ValidationResult {
  // Check game is active
  if (state.phase === 'waiting') {
    return { valid: false, error: 'Game has not started yet' };
  }
  if (state.phase === 'finished') {
    return { valid: false, error: 'Game is already over' };
  }
  if (state.phase !== 'rolling') {
    return { valid: false, error: 'Cannot roll dice now — select a token to move' };
  }

  // Check player exists
  const player = state.players.find(p => p.id === playerId);
  if (!player) {
    return { valid: false, error: 'Player not found in this room' };
  }

  // Check it's this player's turn
  if (player.color !== state.currentTurn) {
    return { valid: false, error: 'It is not your turn' };
  }

  // Check player is connected
  if (!player.connected) {
    return { valid: false, error: 'Player is disconnected' };
  }

  // Check player hasn't finished
  if (player.rank > 0) {
    return { valid: false, error: 'Player has already finished' };
  }

  return { valid: true };
}

/**
 * Validate that a move request is legitimate.
 */
export function validateMove(
  state: GameState,
  playerId: string,
  tokenId: string
): ValidationResult {
  // Check game phase
  if (state.phase !== 'moving') {
    return { valid: false, error: 'Cannot move now — roll the dice first' };
  }

  // Check player
  const player = state.players.find(p => p.id === playerId);
  if (!player) {
    return { valid: false, error: 'Player not found' };
  }

  // Check turn
  if (player.color !== state.currentTurn) {
    return { valid: false, error: 'Not your turn' };
  }

  // Check token belongs to player
  const token = player.tokens.find(t => t.id === tokenId);
  if (!token) {
    return { valid: false, error: 'Token does not belong to this player' };
  }

  // Check token is in valid moves list
  if (!state.validMoves.includes(tokenId)) {
    return { valid: false, error: 'This token cannot move with the current dice value' };
  }

  return { valid: true };
}

/**
 * Validate room start request.
 */
export function validateStart(
  state: GameState,
  playerId: string
): ValidationResult {
  if (state.phase !== 'waiting') {
    return { valid: false, error: 'Game has already started' };
  }

  const player = state.players.find(p => p.id === playerId);
  if (!player) {
    return { valid: false, error: 'Player not found' };
  }

  if (!player.isHost) {
    return { valid: false, error: 'Only the host can start the game' };
  }

  const requiredPlayers = state.mode === '2-player' ? 2 : 4;
  if (state.players.length < requiredPlayers) {
    return { valid: false, error: `Need ${requiredPlayers} players to start (currently ${state.players.length})` };
  }

  return { valid: true };
}
