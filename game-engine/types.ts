/**
 * Ludo Game — Core Type Definitions
 * All TypeScript interfaces and types used throughout the game.
 */

// ─── Player Colors ──────────────────────────────────────────────────────────
export type PlayerColor = 'red' | 'green' | 'blue' | 'yellow';

export const PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'blue', 'yellow'];

// ─── Game Phases ─────────────────────────────────────────────────────────────
export type GamePhase =
  | 'waiting'    // Lobby: waiting for players to join
  | 'rolling'    // Active player must roll the dice
  | 'moving'     // Active player must select a token to move
  | 'finished';  // Game over

// ─── Token ───────────────────────────────────────────────────────────────────
export interface Token {
  /** Unique token ID, e.g., "red-0", "blue-3" */
  id: string;
  /** Owner color */
  color: PlayerColor;
  /** Token index within the player's set (0-3) */
  index: number;
  /** 
   * Position on the player's path (0-56).
   * -1 = in yard (base), 0-50 = main track, 51-56 = home column, 57 = finished
   */
  pathPosition: number;
  /** Global board position for rendering (0-51 on main track, or home path index) */
  globalPosition: number;
  /** Whether the token is still in the starting yard */
  isInYard: boolean;
  /** Whether the token has reached home (finished) */
  isFinished: boolean;
  /** Whether the token is on the home stretch (colored column) */
  isOnHomePath: boolean;
}

// ─── Player ──────────────────────────────────────────────────────────────────
export interface Player {
  /** Unique player session ID */
  id: string;
  /** Display name */
  name: string;
  /** Assigned color */
  color: PlayerColor;
  /** Player's four tokens */
  tokens: Token[];
  /** Whether this player is the room host */
  isHost: boolean;
  /** Connection status */
  connected: boolean;
  /** Number of tokens that have finished */
  finishedTokens: number;
  /** Rank when they finish (1st, 2nd, etc.) — 0 if not finished */
  rank: number;
}

// ─── Dice ────────────────────────────────────────────────────────────────────
export interface DiceRoll {
  /** The rolled value (1-6) */
  value: number;
  /** Player who rolled */
  playerId: string;
  /** Timestamp for ordering */
  timestamp: number;
  /** Sequence number for anti-cheat */
  sequence: number;
}

// ─── Move ────────────────────────────────────────────────────────────────────
export interface Move {
  /** Token that was moved */
  tokenId: string;
  /** Player making the move */
  playerId: string;
  /** Starting path position */
  fromPosition: number;
  /** Ending path position */
  toPosition: number;
  /** Whether this move captured an opponent */
  captured: boolean;
  /** ID of the captured token, if any */
  capturedTokenId?: string;
  /** Sequence number for ordering */
  sequence: number;
}

// ─── Game State ──────────────────────────────────────────────────────────────
export interface GameState {
  /** Room identifier */
  roomId: string;
  /** All players in the game */
  players: Player[];
  /** Color of the player whose turn it is */
  currentTurn: PlayerColor;
  /** Current dice value (null if not yet rolled) */
  diceValue: number | null;
  /** Current game phase */
  phase: GamePhase;
  /** Number of consecutive 6s rolled this turn */
  consecutiveSixes: number;
  /** Winner rankings (ordered list of player IDs) */
  rankings: string[];
  /** Move sequence counter for anti-cheat */
  moveSequence: number;
  /** Game mode */
  mode: '2-player' | '4-player';
  /** Timestamp of last action */
  lastActionTimestamp: number;
  /** Valid token IDs that can be moved (populated after dice roll) */
  validMoves: string[];
}

// ─── Room ────────────────────────────────────────────────────────────────────
export interface Room {
  /** 6-character room code */
  id: string;
  /** Game state */
  state: GameState;
  /** Creation timestamp */
  createdAt: number;
  /** Maximum players (2 or 4) */
  maxPlayers: number;
}

// ─── API Request/Response Types ──────────────────────────────────────────────
export interface CreateRoomRequest {
  playerName: string;
  mode: '2-player' | '4-player';
}

export interface CreateRoomResponse {
  roomId: string;
  playerId: string;
}

export interface JoinRoomRequest {
  roomId: string;
  playerName: string;
}

export interface JoinRoomResponse {
  playerId: string;
  state: GameState;
}

export interface RollDiceRequest {
  roomId: string;
  playerId: string;
}

export interface MoveTokenRequest {
  roomId: string;
  playerId: string;
  tokenId: string;
}

// ─── Pusher Event Types ──────────────────────────────────────────────────────
export interface PusherGameEvent {
  type: 'state-update' | 'dice-rolled' | 'token-moved' | 'player-joined' | 'player-left' | 'game-started' | 'game-over';
  state: GameState;
  extra?: Record<string, unknown>;
}

// ─── 3D Coordinate for rendering ─────────────────────────────────────────────
export interface BoardPosition {
  x: number;
  y: number;
  z: number;
}
