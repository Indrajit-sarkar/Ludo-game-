/**
 * 3D Animated Dice
 * 
 * A 3D dice that spins during roll animation and settles
 * to show the rolled value. Uses dot patterns on each face.
 */

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLOR_HEX } from '@/game-engine/constants';
import { PlayerColor } from '@/game-engine/types';

// ─── Dice face rotations to show each value ──────────────────────────────────
// Euler angles that orient the dice to show a specific face on top
const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  2: [-Math.PI / 2, 0, 0],
  3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2],
  5: [Math.PI / 2, 0, 0],
  6: [Math.PI, 0, 0],
};

// ─── Generate dot texture for a face ─────────────────────────────────────────
function createDotTexture(value: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // White face
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Rounded corners border
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  // Dot positions for each value
  const dotRadius = 10;
  ctx.fillStyle = '#1a1a2e';

  const positions: Record<number, [number, number][]> = {
    1: [[64, 64]],
    2: [[32, 32], [96, 96]],
    3: [[32, 32], [64, 64], [96, 96]],
    4: [[32, 32], [96, 32], [32, 96], [96, 96]],
    5: [[32, 32], [96, 32], [64, 64], [32, 96], [96, 96]],
    6: [[32, 28], [96, 28], [32, 64], [96, 64], [32, 100], [96, 100]],
  };

  (positions[value] || []).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Dice Component ──────────────────────────────────────────────────────────

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  position: [number, number, number];
  color: PlayerColor;
}

export function Dice3D({ value, isRolling, position, color }: Dice3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rollSpeedRef = useRef({ x: 0, y: 0, z: 0 });
  const targetRotation = useRef(new THREE.Euler(...FACE_ROTATIONS[value || 1]));

  // Create face textures
  const materials = useMemo(() => {
    // Only create textures on client
    if (typeof document === 'undefined') {
      return Array(6).fill(null).map(() =>
        new THREE.MeshStandardMaterial({ color: '#FFFFFF' })
      );
    }

    // Standard die layout: 1 front, 6 back, 2 top, 5 bottom, 3 right, 4 left
    // Three.js box face order: +x, -x, +y, -y, +z, -z
    const faceValues = [3, 4, 1, 6, 2, 5];
    return faceValues.map((val) => {
      const tex = createDotTexture(val);
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.3,
        metalness: 0.1,
      });
    });
  }, []);

  // Update target rotation when value changes
  useMemo(() => {
    targetRotation.current = new THREE.Euler(...FACE_ROTATIONS[value || 1]);
  }, [value]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (isRolling) {
      // Spin fast during roll
      rollSpeedRef.current = {
        x: 8 + Math.sin(Date.now() * 0.01) * 3,
        y: 10 + Math.cos(Date.now() * 0.013) * 4,
        z: 6 + Math.sin(Date.now() * 0.017) * 2,
      };

      meshRef.current.rotation.x += rollSpeedRef.current.x * delta;
      meshRef.current.rotation.y += rollSpeedRef.current.y * delta;
      meshRef.current.rotation.z += rollSpeedRef.current.z * delta;

      // Bounce animation
      meshRef.current.position.y = position[1] + Math.abs(Math.sin(Date.now() * 0.008)) * 0.5;
    } else {
      // Settle to show the correct face
      const euler = meshRef.current.rotation;
      euler.x += (targetRotation.current.x - euler.x) * delta * 8;
      euler.y += (targetRotation.current.y - euler.y) * delta * 8;
      euler.z += (targetRotation.current.z - euler.z) * delta * 8;

      // Settle position
      meshRef.current.position.y += (position[1] - meshRef.current.position.y) * delta * 5;
    }
  });

  const glowColor = COLOR_HEX[color];

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Dice mesh */}
      <mesh
        ref={meshRef}
        castShadow
        material={materials}
      >
        <boxGeometry args={[0.7, 0.7, 0.7]} />
      </mesh>

      {/* Glow under dice */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isRolling ? 0.4 : 0.15}
        />
      </mesh>
    </group>
  );
}
