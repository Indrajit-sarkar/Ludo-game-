/**
 * Ludo Game — Cryptographically Secure Dice
 * 
 * WHY THIS IS FAIR:
 * ─────────────────
 * 1. We use Node.js `crypto.getRandomValues()` which draws from the OS
 *    cryptographic random number generator (CSPRNG). This is the same
 *    source used for encryption keys and is unpredictable.
 * 
 * 2. We use REJECTION SAMPLING to eliminate modulo bias:
 *    - A random byte (0-255) mod 6 gives values 0-5, but 256 is not
 *      evenly divisible by 6, so values 0-3 would appear ~0.4% more often.
 *    - Instead, we reject any byte >= 252 (the largest multiple of 6 ≤ 256)
 *      and re-sample, ensuring perfect uniformity.
 * 
 * 3. The dice value is ONLY generated server-side. The client sends a
 *    "roll" request and receives the result. There is no client-side
 *    dice generation, making it impossible for players to cheat.
 * 
 * 4. Each roll includes a monotonic sequence number to prevent replay.
 */

import { DiceRoll } from './types';

/**
 * Generate a cryptographically secure random integer from 1 to 6.
 * Uses rejection sampling to ensure perfectly uniform distribution.
 */
export function rollDice(): number {
  // In Node.js environment, use crypto module
  const array = new Uint8Array(1);
  
  // Keep sampling until we get an unbiased value
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Use the Web Crypto API (available in Node 19+ and all modern browsers)
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(array);
    } else {
      // Fallback for older Node.js versions
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('crypto');
      const buf = nodeCrypto.randomBytes(1);
      array[0] = buf[0];
    }
    
    const value = array[0];
    
    // Reject values >= 252 to avoid modulo bias
    // 252 = 6 * 42, so values 0-251 map evenly to 0-5
    if (value < 252) {
      return (value % 6) + 1; // Returns 1-6
    }
    // If >= 252, loop and try again (probability < 1.6%, so this rarely happens)
  }
}

/**
 * Create a full DiceRoll record with metadata for anti-cheat.
 */
export function createDiceRoll(playerId: string, sequence: number): DiceRoll {
  return {
    value: rollDice(),
    playerId,
    timestamp: Date.now(),
    sequence,
  };
}

/**
 * Validate that a dice roll is within valid range.
 * Used as a sanity check on the server side.
 */
export function isValidDiceValue(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}
