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
const CURVE_STRENGTH = 0.003;
const CURVE_DECAY = 0.98;

function PlayerPaddle({ paddleRef, onVelocityUpdate }: { 
  paddleRef: React.RefObject<THREE.Mesh>;
  onVelocityUpdate: (velocity: number) => void;
}) {
  const [, getKeys] = useKeyboardControls();
  const speed = 0.15;
  const maxZ = COURT_DEPTH / 2 - PADDLE_DEPTH / 2 - 0.5;
  const lastZRef = useRef(0);
  
  useFrame(() => {
    if (!paddleRef.current) return;
    const { forward, backward } = getKeys();
    const prevZ = paddleRef.current.position.z;
    
    if (forward) {
      paddleRef.current.position.z = Math.max(paddleRef.current.position.z - speed, -maxZ);
    }
    if (backward) {
      paddleRef.current.position.z = Math.min(paddleRef.current.position.z + speed, maxZ);
    }
    
    const velocityZ = paddleRef.current.position.z - prevZ;
    onVelocityUpdate(velocityZ);
    lastZRef.current = paddleRef.current.position.z;
  });
  
  return (
    <mesh ref={paddleRef} position={[-COURT_WIDTH / 2 + 1, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
      <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.2} />
    </mesh>
  );
}

function AIPaddle({ paddleRef, ballPosition, ballVelocity, onVelocityUpdate }: { 
  paddleRef: React.RefObject<THREE.Mesh>; 
  ballPosition: THREE.Vector3;
  ballVelocity: THREE.Vector3;
  onVelocityUpdate: (velocity: number) => void;
}) {
  const { difficulty } = usePong();
  const maxZ = COURT_DEPTH / 2 - PADDLE_DEPTH / 2 - 0.5;
  const reactionTimerRef = useRef(0);
  const targetZRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!paddleRef.current) return;
    const prevZ = paddleRef.current.position.z;
    
    reactionTimerRef.current += delta;
    
    if (reactionTimerRef.current >= difficulty.aiReactionDelay) {
      reactionTimerRef.current = 0;
      
      let predictedZ = ballPosition.z;
      
      if (difficulty.aiPrediction > 0 && ballVelocity.x > 0) {
        const aiPaddleX = COURT_WIDTH / 2 - 1;
        const distanceToAI = aiPaddleX - ballPosition.x;
        const timeToReach = distanceToAI / Math.abs(ballVelocity.x);
        const predictedZOffset = ballVelocity.z * timeToReach * difficulty.aiPrediction;
        predictedZ = ballPosition.z + predictedZOffset;
        
        predictedZ = THREE.MathUtils.clamp(predictedZ, -maxZ, maxZ);
      }
      
      targetZRef.current = predictedZ;
    }
    
    const currentZ = paddleRef.current.position.z;
    const diff = targetZRef.current - currentZ;
    
    if (Math.abs(diff) > 0.1) {
      const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), difficulty.aiSpeed);
      paddleRef.current.position.z = THREE.MathUtils.clamp(
        currentZ + moveAmount,
        -maxZ,
        maxZ
      );
    }
    
    const velocityZ = paddleRef.current.position.z - prevZ;
    onVelocityUpdate(velocityZ);
  });
  
  return (
    <mesh ref={paddleRef} position={[COURT_WIDTH / 2 - 1, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
      <meshStandardMaterial color="#ef5350" emissive="#ef5350" emissiveIntensity={0.2} />
    </mesh>
  );
}

function Ball({ playerPaddleRef, aiPaddleRef, onPositionUpdate, onVelocityUpdate, playerPaddleVelocity, aiPaddleVelocity }: {
  playerPaddleRef: React.RefObject<THREE.Mesh>;
  aiPaddleRef: React.RefObject<THREE.Mesh>;
  onPositionUpdate: (pos: THREE.Vector3) => void;
  onVelocityUpdate: (vel: THREE.Vector3) => void;
  playerPaddleVelocity: number;
  aiPaddleVelocity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const curveRef = useRef(0);
  const { phase, playerScored, aiScored, difficulty } = usePong();
  const { playHit } = useAudio();
  const scoredRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  const initializeBall = useCallback((direction: number = 1) => {
    const angleRange = (Math.PI / 3) * difficulty.angleMultiplier;
    const angle = (Math.random() - 0.5) * angleRange;
    velocityRef.current.set(
      difficulty.ballInitialSpeed * direction * Math.cos(angle),
      0,
      difficulty.ballInitialSpeed * Math.sin(angle)
    );
    curveRef.current = 0;
  }, [difficulty]);
  
  useEffect(() => {
    scoredRef.current = false;
    const direction = Math.random() > 0.5 ? 1 : -1;
    initializeBall(direction);
    
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [initializeBall]);
  
  const resetBall = useCallback((direction: number = 1) => {
    if (!meshRef.current) return;
    meshRef.current.position.set(0, BALL_RADIUS, 0);
    initializeBall(direction);
    scoredRef.current = false;
  }, [initializeBall]);
  
  useFrame(() => {
    if (!meshRef.current || phase !== "playing" || scoredRef.current) return;
    
    const ball = meshRef.current;
    const velocity = velocityRef.current;
    
    velocity.z += curveRef.current;
    curveRef.current *= CURVE_DECAY;
    
    ball.position.add(velocity);
    onPositionUpdate(ball.position.clone());
    onVelocityUpdate(velocity.clone());
    
    const maxZ = COURT_DEPTH / 2 - BALL_RADIUS;
    if (ball.position.z > maxZ || ball.position.z < -maxZ) {
      velocity.z *= -1;
      curveRef.current *= -1;
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
        velocity.z += hitOffset * 0.05 * difficulty.angleMultiplier;
        
        curveRef.current = playerPaddleVelocity * CURVE_STRENGTH * 10;
        
        const currentSpeed = velocity.length();
        const newSpeed = Math.min(currentSpeed + difficulty.ballSpeedIncrement, difficulty.ballMaxSpeed);
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
        velocity.z += hitOffset * 0.05 * difficulty.angleMultiplier;
        
        curveRef.current = aiPaddleVelocity * CURVE_STRENGTH * 10;
        
        const currentSpeed = velocity.length();
        const newSpeed = Math.min(currentSpeed + difficulty.ballSpeedIncrement, difficulty.ballMaxSpeed);
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
  const [ballVelocity, setBallVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [playerPaddleVelocity, setPlayerPaddleVelocity] = useState(0);
  const [aiPaddleVelocity, setAiPaddleVelocity] = useState(0);
  const { phase } = usePong();
  
  const handleBallPositionUpdate = useCallback((pos: THREE.Vector3) => {
    setBallPosition(pos);
  }, []);
  
  const handleBallVelocityUpdate = useCallback((vel: THREE.Vector3) => {
    setBallVelocity(vel);
  }, []);
  
  return (
    <group>
      <Court />
      <PlayerPaddle 
        paddleRef={playerPaddleRef} 
        onVelocityUpdate={setPlayerPaddleVelocity}
      />
      <AIPaddle 
        paddleRef={aiPaddleRef} 
        ballPosition={ballPosition}
        ballVelocity={ballVelocity}
        onVelocityUpdate={setAiPaddleVelocity}
      />
      
      {phase === "playing" && (
        <Ball 
          playerPaddleRef={playerPaddleRef}
          aiPaddleRef={aiPaddleRef}
          onPositionUpdate={handleBallPositionUpdate}
          onVelocityUpdate={handleBallVelocityUpdate}
          playerPaddleVelocity={playerPaddleVelocity}
          aiPaddleVelocity={aiPaddleVelocity}
        />
      )}
    </group>
  );
}
