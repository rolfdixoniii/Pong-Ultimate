import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { COURT_DEPTH } from "./Court";

export const PADDLE_WIDTH = 0.5;
export const PADDLE_HEIGHT = 1;
export const PADDLE_DEPTH = 2.5;

interface PaddleProps {
  position: [number, number, number];
  color: string;
  isPlayer?: boolean;
  ballPosition?: THREE.Vector3;
}

export function Paddle({ position, color, isPlayer = false, ballPosition }: PaddleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [, getKeys] = useKeyboardControls();
  
  const speed = 0.15;
  const aiSpeed = 0.08;
  const maxZ = COURT_DEPTH / 2 - PADDLE_DEPTH / 2 - 0.5;
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    if (isPlayer) {
      const { forward, backward } = getKeys();
      
      if (forward) {
        meshRef.current.position.z = Math.max(meshRef.current.position.z - speed, -maxZ);
      }
      if (backward) {
        meshRef.current.position.z = Math.min(meshRef.current.position.z + speed, maxZ);
      }
    } else if (ballPosition) {
      const targetZ = ballPosition.z;
      const currentZ = meshRef.current.position.z;
      const diff = targetZ - currentZ;
      
      if (Math.abs(diff) > 0.1) {
        const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed);
        meshRef.current.position.z = THREE.MathUtils.clamp(
          currentZ + moveAmount,
          -maxZ,
          maxZ
        );
      }
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
}
