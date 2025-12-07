import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Court, COURT_WIDTH, COURT_DEPTH } from "./Court";
import { usePong } from "@/lib/stores/usePong";
import { useAudio } from "@/lib/stores/useAudio";

const PADDLE_WIDTH = 0.5;
const PADDLE_HEIGHT = 1;
const PADDLE_DEPTH = 2.5;
const BALL_RADIUS = 0.3;
const INITIAL_SPEED = 0.12;
const MAX_SPEED = 0.25;
const SPEED_INCREMENT = 0.01;

function PlayerPaddle({ paddleRef }: { paddleRef: React.RefObject<THREE.Mesh> }) {
  const [, getKeys] = useKeyboardControls();
  const speed = 0.15;
  const maxZ = COURT_DEPTH / 2 - PADDLE_DEPTH / 2 - 0.5;
  
  useFrame(() => {
    if (!paddleRef.current) return;
    const { forward, backward } = getKeys();
    
    if (forward) {
      paddleRef.current.position.z = Math.max(paddleRef.current.position.z - speed, -maxZ);
    }
    if (backward) {
      paddleRef.current.position.z = Math.min(paddleRef.current.position.z + speed, maxZ);
    }
  });
  
  return (
    <mesh ref={paddleRef} position={[-COURT_WIDTH / 2 + 1, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
      <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.2} />
    </mesh>
  );
}

function AIPaddle({ paddleRef, ballPosition }: { paddleRef: React.RefObject<THREE.Mesh>; ballPosition: THREE.Vector3 }) {
  const aiSpeed = 0.08;
  const maxZ = COURT_DEPTH / 2 - PADDLE_DEPTH / 2 - 0.5;
  
  useFrame(() => {
    if (!paddleRef.current) return;
    
    const targetZ = ballPosition.z;
    const currentZ = paddleRef.current.position.z;
    const diff = targetZ - currentZ;
    
    if (Math.abs(diff) > 0.1) {
      const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed);
      paddleRef.current.position.z = THREE.MathUtils.clamp(
        currentZ + moveAmount,
        -maxZ,
        maxZ
      );
    }
  });
  
  return (
    <mesh ref={paddleRef} position={[COURT_WIDTH / 2 - 1, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
      <meshStandardMaterial color="#ef5350" emissive="#ef5350" emissiveIntensity={0.2} />
    </mesh>
  );
}

function Ball({ playerPaddleRef, aiPaddleRef, onPositionUpdate }: {
  playerPaddleRef: React.RefObject<THREE.Mesh>;
  aiPaddleRef: React.RefObject<THREE.Mesh>;
  onPositionUpdate: (pos: THREE.Vector3) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const { phase, playerScored, aiScored } = usePong();
  const { playHit } = useAudio();
  const scoredRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    scoredRef.current = false;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() - 0.5) * Math.PI / 3;
    velocityRef.current.set(
      INITIAL_SPEED * direction * Math.cos(angle),
      0,
      INITIAL_SPEED * Math.sin(angle)
    );
    
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const resetBall = useCallback((direction: number = 1) => {
    if (!meshRef.current) return;
    meshRef.current.position.set(0, BALL_RADIUS, 0);
    const angle = (Math.random() - 0.5) * Math.PI / 3;
    velocityRef.current.set(
      INITIAL_SPEED * direction * Math.cos(angle),
      0,
      INITIAL_SPEED * Math.sin(angle)
    );
    scoredRef.current = false;
  }, []);
  
  useFrame(() => {
    if (!meshRef.current || phase !== "playing" || scoredRef.current) return;
    
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
    
    if (ball.position.x < -COURT_WIDTH / 2 - 1 && !scoredRef.current) {
      scoredRef.current = true;
      aiScored();
      timeoutRef.current = window.setTimeout(() => resetBall(-1), 500);
    } else if (ball.position.x > COURT_WIDTH / 2 + 1 && !scoredRef.current) {
      scoredRef.current = true;
      playerScored();
      timeoutRef.current = window.setTimeout(() => resetBall(1), 500);
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

export function GameScene() {
  const playerPaddleRef = useRef<THREE.Mesh>(null);
  const aiPaddleRef = useRef<THREE.Mesh>(null);
  const [ballPosition, setBallPosition] = useState(new THREE.Vector3(0, 0.3, 0));
  const { phase } = usePong();
  
  const handleBallPositionUpdate = useCallback((pos: THREE.Vector3) => {
    setBallPosition(pos);
  }, []);
  
  return (
    <group>
      <Court />
      <PlayerPaddle paddleRef={playerPaddleRef} />
      <AIPaddle paddleRef={aiPaddleRef} ballPosition={ballPosition} />
      
      {phase === "playing" && (
        <Ball 
          playerPaddleRef={playerPaddleRef}
          aiPaddleRef={aiPaddleRef}
          onPositionUpdate={handleBallPositionUpdate}
        />
      )}
    </group>
  );
}
