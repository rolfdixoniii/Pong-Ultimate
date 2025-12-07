import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COURT_WIDTH, COURT_DEPTH } from "./Court";
import { PADDLE_WIDTH, PADDLE_DEPTH } from "./Paddle";
import { usePong } from "@/lib/stores/usePong";
import { useAudio } from "@/lib/stores/useAudio";

interface BallProps {
  playerPaddleRef: React.RefObject<THREE.Mesh>;
  aiPaddleRef: React.RefObject<THREE.Mesh>;
  onPositionUpdate: (position: THREE.Vector3) => void;
}

const BALL_RADIUS = 0.3;
const INITIAL_SPEED = 0.12;
const MAX_SPEED = 0.25;
const SPEED_INCREMENT = 0.01;

export function Ball({ playerPaddleRef, aiPaddleRef, onPositionUpdate }: BallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3(INITIAL_SPEED, 0, 0));
  const { phase, playerScored, aiScored } = usePong();
  const { playHit } = useAudio();
  
  const resetBall = useCallback((direction: number = 1) => {
    if (!meshRef.current) return;
    meshRef.current.position.set(0, BALL_RADIUS, 0);
    const angle = (Math.random() - 0.5) * Math.PI / 3;
    velocityRef.current.set(
      INITIAL_SPEED * direction * Math.cos(angle),
      0,
      INITIAL_SPEED * Math.sin(angle)
    );
  }, []);
  
  useEffect(() => {
    if (phase === "playing") {
      resetBall(Math.random() > 0.5 ? 1 : -1);
    }
  }, [phase, resetBall]);
  
  useFrame(() => {
    if (!meshRef.current || phase !== "playing") return;
    
    const ball = meshRef.current;
    const velocity = velocityRef.current;
    
    ball.position.add(velocity);
    onPositionUpdate(ball.position.clone());
    
    const maxZ = COURT_DEPTH / 2 - BALL_RADIUS;
    if (ball.position.z > maxZ || ball.position.z < -maxZ) {
      velocity.z *= -1;
      ball.position.z = THREE.MathUtils.clamp(ball.position.z, -maxZ, maxZ);
      playHit();
    }
    
    const playerPaddleX = -COURT_WIDTH / 2 + 1;
    const aiPaddleX = COURT_WIDTH / 2 - 1;
    
    if (playerPaddleRef.current) {
      const paddle = playerPaddleRef.current;
      if (
        ball.position.x - BALL_RADIUS < playerPaddleX + PADDLE_WIDTH / 2 &&
        ball.position.x + BALL_RADIUS > playerPaddleX - PADDLE_WIDTH / 2 &&
        ball.position.z > paddle.position.z - PADDLE_DEPTH / 2 - BALL_RADIUS &&
        ball.position.z < paddle.position.z + PADDLE_DEPTH / 2 + BALL_RADIUS
      ) {
        velocity.x = Math.abs(velocity.x);
        const hitOffset = (ball.position.z - paddle.position.z) / (PADDLE_DEPTH / 2);
        velocity.z += hitOffset * 0.05;
        
        const currentSpeed = velocity.length();
        const newSpeed = Math.min(currentSpeed + SPEED_INCREMENT, MAX_SPEED);
        velocity.normalize().multiplyScalar(newSpeed);
        
        ball.position.x = playerPaddleX + PADDLE_WIDTH / 2 + BALL_RADIUS;
        playHit();
      }
    }
    
    if (aiPaddleRef.current) {
      const paddle = aiPaddleRef.current;
      if (
        ball.position.x + BALL_RADIUS > aiPaddleX - PADDLE_WIDTH / 2 &&
        ball.position.x - BALL_RADIUS < aiPaddleX + PADDLE_WIDTH / 2 &&
        ball.position.z > paddle.position.z - PADDLE_DEPTH / 2 - BALL_RADIUS &&
        ball.position.z < paddle.position.z + PADDLE_DEPTH / 2 + BALL_RADIUS
      ) {
        velocity.x = -Math.abs(velocity.x);
        const hitOffset = (ball.position.z - paddle.position.z) / (PADDLE_DEPTH / 2);
        velocity.z += hitOffset * 0.05;
        
        const currentSpeed = velocity.length();
        const newSpeed = Math.min(currentSpeed + SPEED_INCREMENT, MAX_SPEED);
        velocity.normalize().multiplyScalar(newSpeed);
        
        ball.position.x = aiPaddleX - PADDLE_WIDTH / 2 - BALL_RADIUS;
        playHit();
      }
    }
    
    if (ball.position.x < -COURT_WIDTH / 2 - 1) {
      aiScored();
      setTimeout(() => resetBall(-1), 500);
    } else if (ball.position.x > COURT_WIDTH / 2 + 1) {
      playerScored();
      setTimeout(() => resetBall(1), 500);
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, BALL_RADIUS, 0]} castShadow>
      <sphereGeometry args={[BALL_RADIUS, 16, 16]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff" 
        emissiveIntensity={0.5} 
      />
    </mesh>
  );
}
