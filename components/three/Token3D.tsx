/**
 * 3D Token Component
 * 
 * Animated game piece that moves smoothly between positions.
 * Features:
 * - Smooth interpolated movement
 * - Glow effect for active player's tokens
 * - Hover interaction for selectable tokens
 * - Stacking when multiple tokens share a cell
 */

'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  COLOR_HEX,
  getToken3DPosition,
} from '@/game-engine/constants';
import { PlayerColor, Token } from '@/game-engine/types';
import { useGameStore } from '@/hooks/useGameState';

interface Token3DProps {
  token: Token;
  isSelectable: boolean;
  isActive: boolean;
  stackOffset: number;
  onSelect: (tokenId: string) => void;
}

function Token3DPiece({ token, isSelectable, isActive, stackOffset, onSelect }: Token3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Get target 3D position
  const targetPos = useMemo(
    () => getToken3DPosition(token.color, token.pathPosition, token.index),
    [token.color, token.pathPosition, token.index]
  );

  // Current animated position
  const currentPos = useRef(new THREE.Vector3(targetPos.x, targetPos.y + stackOffset * 0.4, targetPos.z));
  const targetVec = useMemo(
    () => new THREE.Vector3(targetPos.x, targetPos.y + stackOffset * 0.4, targetPos.z),
    [targetPos, stackOffset]
  );

  // Color values
  const colorHex = COLOR_HEX[token.color];

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth position interpolation
    currentPos.current.lerp(targetVec, Math.min(1, delta * 5));
    meshRef.current.position.copy(currentPos.current);

    // Bounce animation for selectable tokens
    if (isSelectable) {
      meshRef.current.position.y += Math.sin(Date.now() * 0.005) * 0.1 + 0.15;
    }

    // Glow pulse for active player
    if (glowRef.current && isActive) {
      const scale = 1.2 + Math.sin(Date.now() * 0.003) * 0.15;
      glowRef.current.scale.setScalar(scale);
    }

    // Hover scale
    if (meshRef.current) {
      const targetScale = hovered && isSelectable ? 1.15 : 1;
      const s = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(s + (targetScale - s) * delta * 10);
    }
  });

  return (
    <group
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        if (isSelectable) onSelect(token.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (isSelectable) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Token base (cylinder) */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.3, 16]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Token body (tapered cone) */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.12, 0.25, 0.35, 16]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={0.25}
          metalness={0.5}
        />
      </mesh>

      {/* Token top (sphere) */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={0.2}
          metalness={0.6}
          emissive={isSelectable ? colorHex : '#000000'}
          emissiveIntensity={isSelectable ? 0.4 : 0}
        />
      </mesh>

      {/* Glow ring for active player */}
      {isActive && (
        <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.42, 32]} />
          <meshBasicMaterial
            color={colorHex}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Finished indicator */}
      {token.isFinished && (
        <mesh position={[0, 0.9, 0]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Tokens Manager ──────────────────────────────────────────────────────────
// Renders all tokens with proper stacking

export function TokensManager() {
  const gameState = useGameStore(s => s.gameState);
  const myColor = useGameStore(s => s.myColor);
  const isMyTurn = useGameStore(s => s.isMyTurn);
  const moveToken = useGameStore(s => s.moveToken);

  if (!gameState) return null;

  // Calculate stack offsets for tokens sharing the same position
  const positionCounts: Record<string, number> = {};

  const allTokens = gameState.players.flatMap(player =>
    player.tokens.map(token => {
      const posKey = `${token.color}-${token.pathPosition}`;
      const stackIndex = positionCounts[posKey] || 0;
      positionCounts[posKey] = stackIndex + 1;

      const isSelectable =
        isMyTurn &&
        token.color === myColor &&
        gameState.phase === 'moving' &&
        gameState.validMoves.includes(token.id);

      const isActive = token.color === gameState.currentTurn;

      return {
        token,
        isSelectable,
        isActive,
        stackOffset: stackIndex,
      };
    })
  );

  return (
    <group>
      {allTokens.map(({ token, isSelectable, isActive, stackOffset }) => (
        <Token3DPiece
          key={token.id}
          token={token}
          isSelectable={isSelectable}
          isActive={isActive}
          stackOffset={stackOffset}
          onSelect={(tokenId) => moveToken(tokenId)}
        />
      ))}
    </group>
  );
}
