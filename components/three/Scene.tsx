/**
 * 3D Scene Container
 * 
 * Sets up the React Three Fiber canvas with camera, lighting,
 * and post-processing effects.
 */

'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Board3D } from './Board3D';
import { TokensManager } from './Token3D';
import { Dice3D } from './Dice3D';
import { useGameStore } from '@/hooks/useGameState';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

function SceneContent() {
  const gameState = useGameStore(s => s.gameState);
  const lastDiceValue = useGameStore(s => s.lastDiceValue);
  const isDiceRolling = useGameStore(s => s.isDiceRolling);
  const currentTurn = gameState?.currentTurn || 'red';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#fff5e6" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Contact shadows for depth */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={10}
      />

      {/* The Ludo Board */}
      <Board3D />

      {/* All game tokens */}
      {gameState && gameState.phase !== 'waiting' && <TokensManager />}

      {/* 3D Dice */}
      {gameState && gameState.phase !== 'waiting' && (
        <Dice3D
          value={lastDiceValue || 1}
          isRolling={isDiceRolling}
          position={[0, 1.5, 0]}
          color={currentTurn}
        />
      )}

      {/* Camera Controls — limited rotation for game usability */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
        minDistance={10}
        maxDistance={20}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 14, 10],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
