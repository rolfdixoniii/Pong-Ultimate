import { useRef, useCallback, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Court, COURT_WIDTH, COURT_DEPTH } from "./Court";
import { usePong } from "@/lib/stores/usePong";
import { useAudio } from "@/lib/stores/useAudio";
import { useTouchControls } from "@/lib/stores/useTouchControls";
import { useSkins } from "@/lib/stores/useSkins";

const PADDLE_WIDTH = 0.5;
const PADDLE_HEIGHT = 1;
const PADDLE_DEPTH = 2.5;
const BALL_RADIUS = 0.3;
const CURVE_STRENGTH = 0.003;
const CURVE_DECAY = 0.98;

const ballPositionRef = { current: new THREE.Vector3(0, BALL_RADIUS, 0) };
const ballVelocityRef = { current: new THREE.Vector3(0, 0, 0) };

function PlayerPaddle({ paddleRef, onVelocityUpdate }: { 
  paddleRef: React.RefObject<THREE.Mesh>;
  onVelocityUpdate: (velocity: number) => void;
}) {
  const [, getKeys] = useKeyboardControls();
  const { isMovingUp, isMovingDown } = useTouchControls();
  const hasSpeedBoost = usePong(state => state.hasEffect("speedBoost", "player"));
  const hasBigPaddle = usePong(state => state.hasEffect("bigPaddle", "player"));
  const hitFlash = usePong(state => state.hitFlash);
  const { playerSkin, paddleSkins } = useSkins();
  const skinData = paddleSkins[playerSkin];
  
  const baseSpeed = 0.35;
  const speed = hasSpeedBoost ? baseSpeed * 1.8 : baseSpeed;
  const paddleScale = hasBigPaddle ? 1.5 : 1;
  const maxZ = COURT_DEPTH / 2 - (PADDLE_DEPTH * paddleScale) / 2 - 0.5;
  const lastZRef = useRef(0);
  
  const isFlashing = hitFlash?.paddle === "player";
  const paddleColor = isFlashing ? "#ffffff" : skinData?.color || "#4fc3f7";
  const emissiveColor = isFlashing ? "#ffffff" : skinData?.emissiveColor || "#4fc3f7";
  
  useFrame(() => {
    if (!paddleRef.current) return;
    const { forward, backward } = getKeys();
    const prevZ = paddleRef.current.position.z;
    
    const moveUp = forward || isMovingUp;
    const moveDown = backward || isMovingDown;
    
    if (moveUp) {
      paddleRef.current.position.z = Math.max(paddleRef.current.position.z - speed, -maxZ);
    }
    if (moveDown) {
      paddleRef.current.position.z = Math.min(paddleRef.current.position.z + speed, maxZ);
    }
    
    paddleRef.current.scale.z = paddleScale;
    
    const velocityZ = paddleRef.current.position.z - prevZ;
    onVelocityUpdate(velocityZ);
    lastZRef.current = paddleRef.current.position.z;
  });
  
  return (
    <mesh ref={paddleRef} position={[-COURT_WIDTH / 2 + 1, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
      <meshStandardMaterial 
        color={paddleColor} 
        emissive={emissiveColor} 
        emissiveIntensity={isFlashing ? 1 : 0.3} 
      />
    </mesh>
  );
}

function AIPaddle({ paddleRef, onVelocityUpdate }: { 
  paddleRef: React.RefObject<THREE.Mesh>; 
  onVelocityUpdate: (velocity: number) => void;
}) {
  const difficulty = usePong(state => state.difficulty);
  const hasBigPaddle = usePong(state => state.hasEffect("bigPaddle", "ai"));
  const hasSpeedBoost = usePong(state => state.hasEffect("speedBoost", "ai"));
  const hitFlash = usePong(state => state.hitFlash);
  const { aiSkin, paddleSkins } = useSkins();
  const skinData = paddleSkins[aiSkin];
  
  const speedMultiplier = hasSpeedBoost ? 1.5 : 1;
  const paddleScale = hasBigPaddle ? 1.5 : 1;
  const maxZ = COURT_DEPTH / 2 - (PADDLE_DEPTH * paddleScale) / 2 - 0.5;
  const reactionTimerRef = useRef(0);
  const targetZRef = useRef(0);
  
  const isFlashing = hitFlash?.paddle === "ai";
  const paddleColor = isFlashing ? "#ffffff" : skinData?.color || "#ef5350";
  const emissiveColor = isFlashing ? "#ffffff" : skinData?.emissiveColor || "#ef5350";
  
  useFrame((_, delta) => {
    if (!paddleRef.current) return;
    const prevZ = paddleRef.current.position.z;
    
    reactionTimerRef.current += delta;
    
    if (reactionTimerRef.current >= difficulty.aiReactionDelay) {
      reactionTimerRef.current = 0;
      
      const ballPosition = ballPositionRef.current;
      const ballVelocity = ballVelocityRef.current;
      
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
      const aiSpeed = difficulty.aiSpeed * speedMultiplier;
      const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed);
      paddleRef.current.position.z = THREE.MathUtils.clamp(
        currentZ + moveAmount,
        -maxZ,
        maxZ
      );
    }
    
    paddleRef.current.scale.z = paddleScale;
    
    const velocityZ = paddleRef.current.position.z - prevZ;
    onVelocityUpdate(velocityZ);
  });
  
  return (
    <mesh ref={paddleRef} position={[COURT_WIDTH / 2 - 1, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
      <meshStandardMaterial 
        color={paddleColor} 
        emissive={emissiveColor} 
        emissiveIntensity={isFlashing ? 1 : 0.3} 
      />
    </mesh>
  );
}

function CoinOrb({ coin }: { coin: { id: string; position: { x: number; z: number } } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta * 4;
    meshRef.current.position.y = 0.6 + Math.sin(timeRef.current) * 0.25;
    meshRef.current.rotation.y += delta * 3;
    meshRef.current.rotation.z += delta * 1.5;
  });
  
  return (
    <mesh ref={meshRef} position={[coin.position.x, 0.6, coin.position.z]}>
      <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
      <meshStandardMaterial 
        color="#ffd700" 
        emissive="#ffeb3b" 
        emissiveIntensity={1}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function PowerUpOrb({ powerUp }: { powerUp: { id: string; type: string; position: { x: number; z: number } } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);
  
  const color = useMemo(() => {
    switch (powerUp.type) {
      case "bigPaddle": return "#00ff88";
      case "slowBall": return "#ff8800";
      case "speedBoost": return "#ff00ff";
      default: return "#ffffff";
    }
  }, [powerUp.type]);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta * 3;
    meshRef.current.position.y = 0.5 + Math.sin(timeRef.current) * 0.2;
    meshRef.current.rotation.y += delta * 2;
  });
  
  return (
    <mesh ref={meshRef} position={[powerUp.position.x, 0.5, powerUp.position.z]}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function Ball({ playerPaddleRef, aiPaddleRef, playerPaddleVelocity, aiPaddleVelocity }: {
  playerPaddleRef: React.RefObject<THREE.Mesh>;
  aiPaddleRef: React.RefObject<THREE.Mesh>;
  playerPaddleVelocity: number;
  aiPaddleVelocity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const curveRef = useRef(0);
  const phase = usePong(state => state.phase);
  const difficulty = usePong(state => state.difficulty);
  const playerScored = usePong(state => state.playerScored);
  const aiScored = usePong(state => state.aiScored);
  const incrementCombo = usePong(state => state.incrementCombo);
  const resetCombo = usePong(state => state.resetCombo);
  const triggerScreenShake = usePong(state => state.triggerScreenShake);
  const triggerHitFlash = usePong(state => state.triggerHitFlash);
  const spawnPowerUp = usePong(state => state.spawnPowerUp);
  const powerUps = usePong(state => state.powerUps);
  const collectPowerUp = usePong(state => state.collectPowerUp);
  const updateEffects = usePong(state => state.updateEffects);
  const hasSlowBall = usePong(state => state.hasEffect("slowBall", "player"));
  const spawnCoin = usePong(state => state.spawnCoin);
  const coins = usePong(state => state.coins);
  const collectCoin = usePong(state => state.collectCoin);
  const { playHit } = useAudio();
  const scoredRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const rallyCountRef = useRef(0);
  const lastSpawnRallyRef = useRef(0);
  
  const initializeBall = useCallback((direction: number = 1) => {
    const angleRange = (Math.PI / 3) * difficulty.angleMultiplier;
    const angle = (Math.random() - 0.5) * angleRange;
    velocityRef.current.set(
      difficulty.ballInitialSpeed * direction * Math.cos(angle),
      0,
      difficulty.ballInitialSpeed * Math.sin(angle)
    );
    curveRef.current = 0;
    rallyCountRef.current = 0;
    resetCombo();
  }, [difficulty, resetCombo]);
  
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
    
    updateEffects(Date.now());
    
    const ball = meshRef.current;
    const velocity = velocityRef.current;
    
    const speedMultiplier = hasSlowBall ? 0.85 : 1;
    
    velocity.z += curveRef.current;
    curveRef.current *= CURVE_DECAY;
    
    const scaledVelocity = velocity.clone().multiplyScalar(speedMultiplier);
    ball.position.add(scaledVelocity);
    
    ballPositionRef.current.copy(ball.position);
    ballVelocityRef.current.copy(velocity);
    
    const maxZ = COURT_DEPTH / 2 - BALL_RADIUS;
    if (ball.position.z > maxZ || ball.position.z < -maxZ) {
      velocity.z *= -1;
      curveRef.current *= -1;
      ball.position.z = THREE.MathUtils.clamp(ball.position.z, -maxZ, maxZ);
      playHit();
      triggerScreenShake(0.1);
    }
    
    for (const powerUp of powerUps) {
      const dx = ball.position.x - powerUp.position.x;
      const dz = ball.position.z - powerUp.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < 0.8) {
        const collector = velocity.x < 0 ? "player" : "ai";
        collectPowerUp(powerUp.id, collector);
        triggerScreenShake(0.2);
      }
    }
    
    const playerPaddleX = -COURT_WIDTH / 2 + 1;
    const aiPaddleX = COURT_WIDTH / 2 - 1;
    
    const playerHasBigPaddle = usePong.getState().hasEffect("bigPaddle", "player");
    const aiHasBigPaddle = usePong.getState().hasEffect("bigPaddle", "ai");
    
    if (playerPaddleRef.current) {
      const paddle = playerPaddleRef.current;
      const paddleDepth = PADDLE_DEPTH * (playerHasBigPaddle ? 1.5 : 1);
      
      if (
        ball.position.x - BALL_RADIUS < playerPaddleX + PADDLE_WIDTH / 2 &&
        ball.position.x + BALL_RADIUS > playerPaddleX - PADDLE_WIDTH / 2 &&
        ball.position.z > paddle.position.z - paddleDepth / 2 - BALL_RADIUS &&
        ball.position.z < paddle.position.z + paddleDepth / 2 + BALL_RADIUS
      ) {
        velocity.x = Math.abs(velocity.x);
        const hitOffset = (ball.position.z - paddle.position.z) / (paddleDepth / 2);
        velocity.z += hitOffset * 0.05 * difficulty.angleMultiplier;
        
        curveRef.current = playerPaddleVelocity * CURVE_STRENGTH * 10;
        
        const currentSpeed = velocity.length();
        const newSpeed = Math.min(currentSpeed + difficulty.ballSpeedIncrement, difficulty.ballMaxSpeed);
        velocity.normalize().multiplyScalar(newSpeed);
        
        ball.position.x = playerPaddleX + PADDLE_WIDTH / 2 + BALL_RADIUS;
        playHit();
        
        incrementCombo("player");
        triggerHitFlash("player");
        triggerScreenShake(0.15);
        
        rallyCountRef.current++;
        if (rallyCountRef.current - lastSpawnRallyRef.current >= 3 && Math.random() < 0.4) {
          spawnPowerUp();
          lastSpawnRallyRef.current = rallyCountRef.current;
        }
        if (Math.random() < 0.15) spawnCoin();
      }
    }
    
    if (aiPaddleRef.current) {
      const paddle = aiPaddleRef.current;
      const paddleDepth = PADDLE_DEPTH * (aiHasBigPaddle ? 1.5 : 1);
      
      if (
        ball.position.x + BALL_RADIUS > aiPaddleX - PADDLE_WIDTH / 2 &&
        ball.position.x - BALL_RADIUS < aiPaddleX + PADDLE_WIDTH / 2 &&
        ball.position.z > paddle.position.z - paddleDepth / 2 - BALL_RADIUS &&
        ball.position.z < paddle.position.z + paddleDepth / 2 + BALL_RADIUS
      ) {
        velocity.x = -Math.abs(velocity.x);
        const hitOffset = (ball.position.z - paddle.position.z) / (paddleDepth / 2);
        velocity.z += hitOffset * 0.05 * difficulty.angleMultiplier;
        
        curveRef.current = aiPaddleVelocity * CURVE_STRENGTH * 10;
        
        const currentSpeed = velocity.length();
        const newSpeed = Math.min(currentSpeed + difficulty.ballSpeedIncrement, difficulty.ballMaxSpeed);
        velocity.normalize().multiplyScalar(newSpeed);
        
        ball.position.x = aiPaddleX - PADDLE_WIDTH / 2 - BALL_RADIUS;
        playHit();
        
        incrementCombo("ai");
        triggerHitFlash("ai");
        triggerScreenShake(0.1);
        
        rallyCountRef.current++;
      }
    }
    
    coins.forEach(coin => {
      const dx = ball.position.x - coin.position.x;
      const dz = ball.position.z - coin.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < BALL_RADIUS + 0.25) {
        collectCoin(coin.id);
      }
    });
    
    if (ball.position.x < -COURT_WIDTH / 2 - 1 && !scoredRef.current) {
      scoredRef.current = true;
      aiScored();
      triggerScreenShake(0.4);
      resetCombo();
      timeoutRef.current = window.setTimeout(() => resetBall(-1), 500);
    } else if (ball.position.x > COURT_WIDTH / 2 + 1 && !scoredRef.current) {
      scoredRef.current = true;
      playerScored();
      triggerScreenShake(0.4);
      resetCombo();
      timeoutRef.current = window.setTimeout(() => resetBall(1), 500);
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, BALL_RADIUS, 0]} castShadow>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.8} 
        />
      </mesh>
  );
}

function CameraShake() {
  const screenShake = usePong(state => state.screenShake);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!groupRef.current) return;
    if (screenShake > 0) {
      groupRef.current.position.x = (Math.random() - 0.5) * screenShake * 2;
      groupRef.current.position.y = (Math.random() - 0.5) * screenShake * 2;
    } else {
      groupRef.current.position.x = 0;
      groupRef.current.position.y = 0;
    }
  });
  
  return <group ref={groupRef} />;
}

export function GameScene() {
  const playerPaddleRef = useRef<THREE.Mesh>(null);
  const aiPaddleRef = useRef<THREE.Mesh>(null);
  const playerPaddleVelocityRef = useRef(0);
  const aiPaddleVelocityRef = useRef(0);
  const phase = usePong(state => state.phase);
  const powerUps = usePong(state => state.powerUps);
  const coins = usePong(state => state.coins);
  const screenShake = usePong(state => state.screenShake);
  const groupRef = useRef<THREE.Group>(null);
  const { selectedMap, gameMaps } = useSkins();
  const currentMap = gameMaps[selectedMap];
  
  const handlePlayerVelocityUpdate = useCallback((velocity: number) => {
    playerPaddleVelocityRef.current = velocity;
  }, []);
  
  const handleAiVelocityUpdate = useCallback((velocity: number) => {
    aiPaddleVelocityRef.current = velocity;
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    if (screenShake > 0) {
      groupRef.current.position.x = (Math.random() - 0.5) * screenShake * 2;
      groupRef.current.position.y = (Math.random() - 0.5) * screenShake;
    } else {
      groupRef.current.position.x = 0;
      groupRef.current.position.y = 0;
    }
  });
  
  return (
    <group ref={groupRef}>
      <Court map={currentMap} />
      <PlayerPaddle 
        paddleRef={playerPaddleRef} 
        onVelocityUpdate={handlePlayerVelocityUpdate}
      />
      <AIPaddle 
        paddleRef={aiPaddleRef} 
        onVelocityUpdate={handleAiVelocityUpdate}
      />
      
      {powerUps.map(powerUp => (
        <PowerUpOrb key={powerUp.id} powerUp={powerUp} />
      ))}
      
      {coins.map(coin => (
        <CoinOrb key={coin.id} coin={coin} />
      ))}
      
      {phase === "playing" && (
        <Ball 
          playerPaddleRef={playerPaddleRef}
          aiPaddleRef={aiPaddleRef}
          playerPaddleVelocity={playerPaddleVelocityRef.current}
          aiPaddleVelocity={aiPaddleVelocityRef.current}
        />
      )}
    </group>
  );
}
