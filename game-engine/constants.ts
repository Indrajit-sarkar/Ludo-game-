/**
 * Ludo Game — Board Constants
 * 
 * The Ludo board is a 15x15 grid. Each player has:
 * - A yard (base) in one corner
 * - A starting position on the main track
 * - A home column leading to the center
 * 
 * The main track has 52 positions (0-51), numbered clockwise.
 * Each player's path is relative to their starting position.
 * 
 * Board coordinate system for 3D rendering:
 * - Center of board = (0, 0, 0)
 * - Board spans from (-7, 0, -7) to (7, 0, 7)  
 * - Each cell is 1 unit
 */

import { PlayerColor, BoardPosition } from './types';

// ─── Board Dimensions ────────────────────────────────────────────────────────
export const BOARD_SIZE = 15;
export const CELL_SIZE = 1;
export const BOARD_HALF = (BOARD_SIZE - 1) / 2; // 7

// ─── Player Config ───────────────────────────────────────────────────────────
export const TOKENS_PER_PLAYER = 4;
export const MAIN_TRACK_LENGTH = 52;
export const HOME_PATH_LENGTH = 6;   // 6 cells in home column
export const TOTAL_PATH_LENGTH = 57;  // 52 main + 5 home column cells (position 57 = finished)
export const FINISHED_POSITION = 57;

// ─── Starting positions on the main track (global indices 0-51) ──────────────
// Each player enters the main track at these global positions
export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  blue: 26,
  yellow: 39,
};

// ─── Entry point to home path (last position on main track before home) ──────
// When a token passes this global position, it enters the home column
export const HOME_ENTRY_POSITIONS: Record<PlayerColor, number> = {
  red: 50,
  green: 11,
  blue: 24,
  yellow: 37,
};

// ─── Safe zone global positions ──────────────────────────────────────────────
// Tokens on safe zones cannot be captured
// Includes each player's start position + 4 star positions
export const SAFE_POSITIONS: number[] = [
  0, 8, 13, 21, 26, 34, 39, 47, // start + star positions
];

// ─── Player Colors Hex Values ────────────────────────────────────────────────
export const COLOR_HEX: Record<PlayerColor, string> = {
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',
  yellow: '#EAB308',
};

export const COLOR_HEX_LIGHT: Record<PlayerColor, string> = {
  red: '#FCA5A5',
  green: '#86EFAC',
  blue: '#93C5FD',
  yellow: '#FDE047',
};

export const COLOR_HEX_DARK: Record<PlayerColor, string> = {
  red: '#991B1B',
  green: '#166534',
  blue: '#1E3A8A',
  yellow: '#854D0E',
};

// ─── 2-Player Mode: Use Red and Blue (opposite corners) ─────────────────────
export const TWO_PLAYER_COLORS: PlayerColor[] = ['red', 'blue'];
export const FOUR_PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'blue', 'yellow'];

// ─── Main Track — 52 positions as (row, col) on a 15x15 grid ────────────────
// Numbered 0-51 clockwise starting from Red's entry point
// These are grid coordinates where (0,0) is top-left of the 15x15 grid
const MAIN_TRACK_GRID: [number, number][] = [
  // Red's start → going right along top of left arm
  [6, 1],  // 0 - Red start (safe)
  [6, 2],  // 1
  [6, 3],  // 2
  [6, 4],  // 3
  [6, 5],  // 4
  // Going up along left side of top arm
  [5, 6],  // 5
  [4, 6],  // 6
  [3, 6],  // 7
  [2, 6],  // 8 (safe - star)
  [1, 6],  // 9
  [0, 6],  // 10
  // Going right along top edge
  [0, 7],  // 11
  [0, 8],  // 12
  // Green start → going down along right side of top arm
  [1, 8],  // 13 - Green start (safe)
  [2, 8],  // 14
  [3, 8],  // 15
  [4, 8],  // 16
  [5, 8],  // 17
  // Going right along top of right arm
  [6, 9],  // 18
  [6, 10], // 19
  [6, 11], // 20
  [6, 12], // 21 (safe - star)
  [6, 13], // 22
  [6, 14], // 23
  // Going down along right edge
  [7, 14], // 24
  [8, 14], // 25
  // Blue start → going left along bottom of right arm
  [8, 13], // 26 - Blue start (safe)
  [8, 12], // 27
  [8, 11], // 28
  [8, 10], // 29
  [8, 9],  // 30
  // Going down along right side of bottom arm
  [9, 8],  // 31
  [10, 8], // 32
  [11, 8], // 33
  [12, 8], // 34 (safe - star)
  [13, 8], // 35
  [14, 8], // 36
  // Going left along bottom edge
  [14, 7], // 37
  [14, 6], // 38
  // Yellow start → going up along left side of bottom arm
  [13, 6], // 39 - Yellow start (safe)
  [12, 6], // 40
  [11, 6], // 41
  [10, 6], // 42
  [9, 6],  // 43
  // Going left along bottom of left arm
  [8, 5],  // 44
  [8, 4],  // 45
  [8, 3],  // 46
  [8, 2],  // 47 (safe - star)
  [8, 1],  // 48
  [8, 0],  // 49
  // Going up along left edge
  [7, 0],  // 50
  [6, 0],  // 51
];

// ─── Home paths — 6 positions each, leading to center ────────────────────────
// Each player's home column (only they can enter)
const HOME_PATHS_GRID: Record<PlayerColor, [number, number][]> = {
  red: [
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], // → center
  ],
  green: [
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], // ↓ center
  ],
  blue: [
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8], // ← center
  ],
  yellow: [
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7], // ↑ center
  ],
};

// ─── Yard (base) positions — where tokens start ──────────────────────────────
const YARD_POSITIONS_GRID: Record<PlayerColor, [number, number][]> = {
  red: [
    [2, 2], [2, 4], [4, 2], [4, 4],
  ],
  green: [
    [2, 10], [2, 12], [4, 10], [4, 12],
  ],
  blue: [
    [10, 10], [10, 12], [12, 10], [12, 12],
  ],
  yellow: [
    [10, 2], [10, 4], [12, 2], [12, 4],
  ],
};

// ─── Convert grid coords to 3D world positions ──────────────────────────────
function gridTo3D(row: number, col: number): BoardPosition {
  return {
    x: col - BOARD_HALF,  // center horizontally
    y: 0.05,              // slightly above board surface
    z: row - BOARD_HALF,  // center vertically
  };
}

// ─── Exported 3D position arrays ─────────────────────────────────────────────

/** 3D positions for the 52 main track cells */
export const MAIN_TRACK_3D: BoardPosition[] = MAIN_TRACK_GRID.map(
  ([r, c]) => gridTo3D(r, c)
);

/** 3D positions for each player's home path (6 cells) */
export const HOME_PATHS_3D: Record<PlayerColor, BoardPosition[]> = {
  red: HOME_PATHS_GRID.red.map(([r, c]) => gridTo3D(r, c)),
  green: HOME_PATHS_GRID.green.map(([r, c]) => gridTo3D(r, c)),
  blue: HOME_PATHS_GRID.blue.map(([r, c]) => gridTo3D(r, c)),
  yellow: HOME_PATHS_GRID.yellow.map(([r, c]) => gridTo3D(r, c)),
};

/** 3D positions for each player's 4 yard slots */
export const YARD_POSITIONS_3D: Record<PlayerColor, BoardPosition[]> = {
  red: YARD_POSITIONS_GRID.red.map(([r, c]) => gridTo3D(r, c)),
  green: YARD_POSITIONS_GRID.green.map(([r, c]) => gridTo3D(r, c)),
  blue: YARD_POSITIONS_GRID.blue.map(([r, c]) => gridTo3D(r, c)),
  yellow: YARD_POSITIONS_GRID.yellow.map(([r, c]) => gridTo3D(r, c)),
};

/** Grid coordinates (for 2D reference) */
export const MAIN_TRACK_GRID_EXPORT = MAIN_TRACK_GRID;
export const HOME_PATHS_GRID_EXPORT = HOME_PATHS_GRID;
export const YARD_POSITIONS_GRID_EXPORT = YARD_POSITIONS_GRID;

/**
 * Convert a player-relative path position to a global main track position.
 * Each player's path starts at their START_POSITION and goes clockwise.
 * 
 * @param color - Player color
 * @param pathPosition - Position on the player's path (0-56)
 * @returns Global position on the main track (0-51), or -1 if on home path
 */
export function pathToGlobal(color: PlayerColor, pathPosition: number): number {
  if (pathPosition < 0) return -1; // In yard
  if (pathPosition >= MAIN_TRACK_LENGTH) return -1; // On home path
  const startPos = START_POSITIONS[color];
  return (startPos + pathPosition) % MAIN_TRACK_LENGTH;
}

/**
 * Get the 3D world position for a token based on its state.
 */
export function getToken3DPosition(
  color: PlayerColor,
  pathPosition: number,
  tokenIndex: number
): BoardPosition {
  // In yard
  if (pathPosition < 0) {
    return YARD_POSITIONS_3D[color][tokenIndex];
  }
  
  // Finished (center)
  if (pathPosition >= FINISHED_POSITION) {
    return { x: 0, y: 0.3, z: 0 };
  }
  
  // On home path
  if (pathPosition >= MAIN_TRACK_LENGTH) {
    const homeIndex = pathPosition - MAIN_TRACK_LENGTH;
    if (homeIndex < HOME_PATH_LENGTH) {
      return HOME_PATHS_3D[color][homeIndex];
    }
    return { x: 0, y: 0.3, z: 0 }; // Finished
  }
  
  // On main track
  const globalPos = pathToGlobal(color, pathPosition);
  return MAIN_TRACK_3D[globalPos];
}
