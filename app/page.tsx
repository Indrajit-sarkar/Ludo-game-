/**
 * Landing Page
 * 
 * The home page of Ludo Arena where players can create or join a game.
 */

import { LobbyScreen } from '@/components/lobby/LobbyScreen';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-noise">
      <LobbyScreen />
    </main>
  );
}
