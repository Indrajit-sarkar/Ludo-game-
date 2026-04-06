/**
 * Landing Page
 * 
 * The home page of Ludo Arena where players can create or join a game.
 */

import { LobbyScreen } from '@/components/lobby/LobbyScreen';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-colors duration-300">
      <LobbyScreen />
    </main>
  );
}
