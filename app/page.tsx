/**
 * Landing Page
 * 
 * The home page of Ludo Arena where players can create or join a game.
 */

import { LobbyScreen } from '@/components/lobby/LobbyScreen';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-black dark:to-gray-950 light:from-blue-50 light:via-purple-50 light:to-pink-50 transition-colors duration-300">
      <LobbyScreen />
    </main>
  );
}
