/**
 * 3D Ludo Board
 * 
 * Procedurally generated Ludo board with:
 * - Colored home bases in corners
 * - Cross-shaped track
 * - Home columns for each color
 * - Safe zone star markers
 * - Center home triangle
 */

'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  BOARD_SIZE,
  MAIN_TRACK_GRID_EXPORT,
  HOME_PATHS_GRID_EXPORT,
  YARD_POSITIONS_GRID_EXPORT,
  SAFE_POSITIONS,
  COLOR_HEX,
  COLOR_HEX_LIGHT,
  BOARD_HALF,
} from '@/game-engine/constants';
import { PlayerColor } from '@/game-engine/types';
import { useRef } from 'react';

// ─── Cell Component ──────────────────────────────────────────────────────────

function Cell({
  position,
  color,
  isSafe,
  isHomeCell,
  size = 0.9,
}: {
  position: [number, number, number];
  color: string;
  isSafe?: boolean;
  isHomeCell?: boolean;
  size?: number;
}) {
  return (
    <group position={position}>
      {/* Cell base */}
      <mesh receiveShadow position={[0, 0.025, 0]}>
        <boxGeometry args={[size, 0.05, size]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Safe zone star indicator */}
      {isSafe && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 5]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      )}

      {/* Home column arrow indicator */}
      {isHomeCell && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Home Base (Yard) Component ──────────────────────────────────────────────

function HomeBase({
  color,
  playerColor,
  position,
}: {
  color: string;
  playerColor: PlayerColor;
  position: [number, number, number];
}) {
  const yardPositions = YARD_POSITIONS_GRID_EXPORT[playerColor];

  return (
    <group position={position}>
      {/* Base platform */}
      <mesh receiveShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[5.8, 0.03, 5.8]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.15}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Inner yard area */}
      <mesh receiveShadow position={[0, 0.035, 0]}>
        <boxGeometry args={[3.5, 0.04, 3.5]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Yard slots (where tokens start) */}
      {yardPositions.map((pos, i) => {
        const x = pos[1] - BOARD_HALF - position[0];
        const z = pos[0] - BOARD_HALF - position[2];
        return (
          <mesh key={i} position={[x, 0.065, z]}>
            <cylinderGeometry args={[0.35, 0.35, 0.03, 16]} />
            <meshStandardMaterial
              color={color}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Center Home Area ────────────────────────────────────────────────────────

function CenterHome() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
    }
  });

  const colors: PlayerColor[] = ['red', 'green', 'blue', 'yellow'];
  const rotations = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

  return (
    <group position={[0, 0.05, 0]}>
      {/* Base */}
      <mesh receiveShadow>
        <boxGeometry args={[2.8, 0.06, 2.8]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Colored triangles pointing to center */}
      {colors.map((color, i) => (
        <mesh
          key={color}
          position={[
            Math.sin(rotations[i]) * 0.7,
            0.08,
            Math.cos(rotations[i]) * 0.7,
          ]}
          rotation={[-Math.PI / 2, 0, rotations[i]]}
        >
          <coneGeometry args={[0.5, 1, 3]} />
          <meshStandardMaterial
            color={COLOR_HEX[color]}
            emissive={COLOR_HEX[color]}
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.3}
            flatShading
          />
        </mesh>
      ))}

      {/* Rotating gem in center */}
      <mesh ref={ref} position={[0, 0.3, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

// ─── Main Board Component ────────────────────────────────────────────────────

export function Board3D() {
  // Pre-compute which positions are safe
  const safeSet = useMemo(() => new Set(SAFE_POSITIONS), []);

  // Main track cells
  const trackCells = useMemo(
    () =>
      MAIN_TRACK_GRID_EXPORT.map((pos, index) => {
        const x = pos[1] - BOARD_HALF;
        const z = pos[0] - BOARD_HALF;
        const isSafe = safeSet.has(index);

        // Determine cell color - starting positions get player color
        let cellColor = '#F5F5DC'; // Default beige
        if (index === 0) cellColor = COLOR_HEX_LIGHT.red;
        else if (index === 13) cellColor = COLOR_HEX_LIGHT.green;
        else if (index === 26) cellColor = COLOR_HEX_LIGHT.blue;
        else if (index === 39) cellColor = COLOR_HEX_LIGHT.yellow;
        else if (isSafe) cellColor = '#FFFACD'; // Light yellow for safe

        return (
          <Cell
            key={`track-${index}`}
            position={[x, 0, z]}
            color={cellColor}
            isSafe={isSafe}
          />
        );
      }),
    [safeSet]
  );

  // Home path cells
  const homePaths = useMemo(
    () =>
      (['red', 'green', 'blue', 'yellow'] as PlayerColor[]).flatMap((color) =>
        HOME_PATHS_GRID_EXPORT[color].map((pos, index) => {
          const x = pos[1] - BOARD_HALF;
          const z = pos[0] - BOARD_HALF;
          return (
            <Cell
              key={`home-${color}-${index}`}
              position={[x, 0, z]}
              color={COLOR_HEX_LIGHT[color]}
              isHomeCell
            />
          );
        })
      ),
    []
  );

  return (
    <group>
      {/* Board base plate */}
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[BOARD_SIZE + 0.5, 0.1, BOARD_SIZE + 0.5]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Board surface */}
      <mesh receiveShadow position={[0, 0.005, 0]}>
        <boxGeometry args={[BOARD_SIZE + 0.2, 0.01, BOARD_SIZE + 0.2]} />
        <meshStandardMaterial
          color="#FFF8E7"
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Border frame */}
      {[
        { pos: [0, 0.05, -(BOARD_SIZE + 0.3) / 2] as [number, number, number], size: [BOARD_SIZE + 0.6, 0.15, 0.2] as [number, number, number] },
        { pos: [0, 0.05, (BOARD_SIZE + 0.3) / 2] as [number, number, number], size: [BOARD_SIZE + 0.6, 0.15, 0.2] as [number, number, number] },
        { pos: [-(BOARD_SIZE + 0.3) / 2, 0.05, 0] as [number, number, number], size: [0.2, 0.15, BOARD_SIZE + 0.2] as [number, number, number] },
        { pos: [(BOARD_SIZE + 0.3) / 2, 0.05, 0] as [number, number, number], size: [0.2, 0.15, BOARD_SIZE + 0.2] as [number, number, number] },
      ].map((border, i) => (
        <mesh key={`border-${i}`} position={border.pos} castShadow>
          <boxGeometry args={border.size} />
          <meshStandardMaterial
            color="#5D3A1A"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Home bases (yards) in corners */}
      <HomeBase color={COLOR_HEX.red} playerColor="red" position={[-4, 0, -4]} />
      <HomeBase color={COLOR_HEX.green} playerColor="green" position={[4, 0, -4]} />
      <HomeBase color={COLOR_HEX.blue} playerColor="blue" position={[4, 0, 4]} />
      <HomeBase color={COLOR_HEX.yellow} playerColor="yellow" position={[-4, 0, 4]} />

      {/* Main track cells */}
      {trackCells}

      {/* Home path cells */}
      {homePaths}

      {/* Center home area */}
      <CenterHome />
    </group>
  );
}
