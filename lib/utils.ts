/**
 * Utility functions used throughout the application.
 */

/**
 * Generate a unique player ID.
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format a player color for display.
 */
export function formatColor(color: string): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

/**
 * Get an emoji for a player color.
 */
export function getColorEmoji(color: string): string {
  const emojis: Record<string, string> = {
    red: '🔴',
    green: '🟢',
    blue: '🔵',
    yellow: '🟡',
  };
  return emojis[color] || '⚪';
}

/**
 * Delay utility for animations.
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Create the room join URL.
 */
export function getRoomUrl(roomId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/room/${roomId}`;
  }
  return `/room/${roomId}`;
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
