import { useRef, useCallback, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Court, COURT_WIDTH, COURT_DEPTH } from "./Court";
import { usePong } from "@/lib/stores/usePong";
import { useAudio } from "@/lib/stores/useAudio";
import { useTouchControls } from "@/lib/stores/useTouchControls";
import { useSkins } from "@/lib/stores/useSkins";
import { useGameSpeed } from "@/lib/stores/useGameSpeed";

const PADDLE_WIDTH = 0.5;
const PADDLE_HEIGHT = 1;
const PADDLE_DEPTH = 2.5;
const BALL_RADIUS = 0.3;
const CURVE_STRENGTH = 0.008;
const CURVE_DECAY = 0.98;
const TRAIL_LENGTH = 12;

const ballPositionRef = { current: new THREE.Vector3(0, BALL_RADIUS, 0) };
const ballVelocityRef = { current: new THREE.Vector3(0, 0, 0) };
const trailPositions: THREE.Vector3[] = Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector3(0, BALL_RADIUS, 0));

function PlayerPaddle({ paddleRef, onVelocityUpdate }: {
  paddleRef: React.RefObject<THREE.Mesh>;
  onVelocityUpdate: (velocity: number) => void;
}) {
  const [, getKeys] = useKeyboardControls();
  const { isMovingUp, isMovingDown } = useTouchControls();
  const hasSpeedBoost = usePong((state: any) => state.hasEffect("speedBoost", "player"));
  const hasBigPaddle = usePong((state: any) => state.hasEffect("bigPaddle", "player"));
  const hitFlash = usePong((state: any) => state.hitFlash);
  const { playerSkin, paddleSkins } = useSkins();
  const skinData = paddleSkins[playerSkin];
  const gameSpeedMultiplier = useGameSpeed((state: any) => state.speedMultiplier);

  const baseSpeed = 0.35;
  const speed = (hasSpeedBoost ? baseSpeed * 1.8 : baseSpeed) * gameSpeedMultiplier;
  const paddleScale = hasBigPaddle ? 1.5 : 1;
  const maxZ = COURT_DEPTH / 2 - (PADDLE_DEPTH * paddleScale) / 2 - 0.5;
  const lastZRef = useRef(0);

  const isFlashing = hitFlash?.paddle === "player";
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const paddleColor = isFlashing ? "#ffffff" : skinData?.color || "#4fc3f7";
  const emissiveColor = isFlashing ? "#ffffff" : skinData?.emissiveColor || "#4fc3f7";

  useFrame(({ clock }: any, delta: number) => {
    if (!paddleRef.current) return;
    const { forward, backward } = getKeys();
    const prevZ = paddleRef.current.position.z;

    const moveUp = forward || isMovingUp;
    const moveDown = backward || isMovingDown;

    const frameScale = delta * 60;

    if (moveUp) {
      paddleRef.current.position.z = Math.max(paddleRef.current.position.z - speed * frameScale, -maxZ);
    }
    if (moveDown) {
      paddleRef.current.position.z = Math.min(paddleRef.current.position.z + speed * frameScale, maxZ);
    }

    paddleRef.current.scale.z = paddleScale;

    const velocityZ = (paddleRef.current.position.z - prevZ);
    onVelocityUpdate(velocityZ);
    lastZRef.current = paddleRef.current.position.z;

    const pulse = Math.sin(clock.elapsedTime * 3) * 0.15 + 0.35;
    if (materialRef.current && !isFlashing) {
      materialRef.current.emissiveIntensity = pulse;
    }
    if (lightRef.current) {
      lightRef.current.intensity = pulse * 2;
    }
  });

  return (
    <group>
      <mesh ref={paddleRef} position={[-COURT_WIDTH / 2 + 1, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
        <meshStandardMaterial
          ref={materialRef}
          color={paddleColor}
          emissive={emissiveColor}
          emissiveIntensity={isFlashing ? 1 : 0.35}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[-COURT_WIDTH / 2 + 1.5, 1, 0]}
        color={skinData?.emissiveColor || "#4fc3f7"}
        intensity={0.7}
        distance={4}
      />
    </group>
  );
}

function AIPaddle({ paddleRef, onVelocityUpdate }: {
  paddleRef: React.RefObject<THREE.Mesh>;
  onVelocityUpdate: (velocity: number) => void;
}) {
  const difficulty = usePong((state: any) => state.difficulty);
  const hasBigPaddle = usePong((state: any) => state.hasEffect("bigPaddle", "ai"));
  const hasSpeedBoost = usePong((state: any) => state.hasEffect("speedBoost", "ai"));
  const hitFlash = usePong((state: any) => state.hitFlash);
  const { aiSkin, paddleSkins } = useSkins();
  const skinData = paddleSkins[aiSkin];
  const gameSpeedMultiplier = useGameSpeed((state: any) => state.speedMultiplier);

  const speedMultiplier = (hasSpeedBoost ? 1.5 : 1) * gameSpeedMultiplier;
  const paddleScale = hasBigPaddle ? 1.5 : 1;
  const maxZ = COURT_DEPTH / 2 - (PADDLE_DEPTH * paddleScale) / 2 - 0.5;
  const reactionTimerRef = useRef(0);
  const targetZRef = useRef(0);

  const isFlashing = hitFlash?.paddle === "ai";
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const paddleColor = isFlashing ? "#ffffff" : skinData?.color || "#ef5350";
  const emissiveColor = isFlashing ? "#ffffff" : skinData?.emissiveColor || "#ef5350";

  useFrame(({ clock }: any, delta: number) => {
    const pulse = Math.sin(clock.elapsedTime * 3) * 0.15 + 0.35;
    if (materialRef.current && !isFlashing) {
      materialRef.current.emissiveIntensity = pulse;
    }
    if (lightRef.current) {
      lightRef.current.intensity = pulse * 2;
    }
    if (!paddleRef.current) return;
    const prevZ = paddleRef.current.position.z;

    reactionTimerRef.current += delta;

    const frameScale = delta * 60;

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
      const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed * frameScale);
      paddleRef.current.position.z = THREE.MathUtils.clamp(
        currentZ + moveAmount,
        -maxZ,
        maxZ
      );
    }

    paddleRef.current.scale.z = paddleScale;

    const velocityZ = (paddleRef.current.position.z - prevZ);
    onVelocityUpdate(velocityZ);
  });

  return (
    <group>
      <mesh ref={paddleRef} position={[COURT_WIDTH / 2 - 1, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
        <meshStandardMaterial
          ref={materialRef}
          color={paddleColor}
          emissive={emissiveColor}
          emissiveIntensity={isFlashing ? 1 : 0.35}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[COURT_WIDTH / 2 - 1.5, 1, 0]}
        color={skinData?.emissiveColor || "#ef5350"}
        intensity={0.7}
        distance={4}
      />
    </group>
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
      case "multiball": return "#00ffff";
      case "shield": return "#ffff00";
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

function Shield({ side }: { side: "player" | "ai" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const x = side === "player" ? -COURT_WIDTH / 2 : COURT_WIDTH / 2;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.opacity = 0.4 + Math.sin(clock.elapsedTime * 5) * 0.2;
    material.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 5) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[x, 0.5, 0]}>
      <boxGeometry args={[0.15, 1.5, COURT_DEPTH - 1]} />
      <meshStandardMaterial
        color={side === "player" ? "#00ffff" : "#ff6666"}
        emissive={side === "player" ? "#00ffff" : "#ff6666"}
        emissiveIntensity={0.8}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

function Multiball({ id, velocity, playerPaddleRef, aiPaddleRef }: {
  id: string;
  velocity: { x: number; z: number };
  playerPaddleRef: React.RefObject<THREE.Mesh>;
  aiPaddleRef: React.RefObject<THREE.Mesh>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3(velocity.x, 0, velocity.z));
  const removeMultiball = usePong((state: any) => state.removeMultiball);
  const playerScored = usePong((state: any) => state.playerScored);
  const aiScored = usePong((state: any) => state.aiScored);
  const consumeShield = usePong((state: any) => state.consumeShield);
  const triggerScreenShake = usePong((state: any) => state.triggerScreenShake);
  const { playHit } = useAudio();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(0, BALL_RADIUS, (Math.random() - 0.5) * 4);
    }
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const ball = meshRef.current;
    const velocity = velocityRef.current;
    const SUB_STEPS = 3;
    const frameScale = (delta * 60) / SUB_STEPS;

    for (let s = 0; s < SUB_STEPS; s++) {
      ball.position.add(velocity.clone().multiplyScalar(frameScale));

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
          ball.position.z < paddle.position.z + PADDLE_DEPTH / 2 + BALL_RADIUS &&
          velocity.x < 0
        ) {
          velocity.x = Math.abs(velocity.x);
          const hitOffset = (ball.position.z - paddle.position.z) / (PADDLE_DEPTH / 2);
          velocity.z += hitOffset * 0.05;
          playHit();
          break;
        }
      }

      if (aiPaddleRef.current) {
        const paddle = aiPaddleRef.current;
        if (
          ball.position.x + BALL_RADIUS > aiPaddleX - PADDLE_WIDTH / 2 &&
          ball.position.x - BALL_RADIUS < aiPaddleX + PADDLE_WIDTH / 2 &&
          ball.position.z > paddle.position.z - PADDLE_DEPTH / 2 - BALL_RADIUS &&
          ball.position.z < paddle.position.z + PADDLE_DEPTH / 2 + BALL_RADIUS &&
          velocity.x > 0
        ) {
          velocity.x = -Math.abs(velocity.x);
          const hitOffset = (ball.position.z - paddle.position.z) / (PADDLE_DEPTH / 2);
          velocity.z += hitOffset * 0.05;
          playHit();
          break;
        }
      }
    }

    if (ball.position.x < -COURT_WIDTH / 2 - 1) {
      if (!consumeShield("player")) {
        aiScored();
        triggerScreenShake(0.3);
      }
      removeMultiball(id);
    } else if (ball.position.x > COURT_WIDTH / 2 + 1) {
      if (!consumeShield("ai")) {
        playerScored();
        triggerScreenShake(0.3);
      }
      removeMultiball(id);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, BALL_RADIUS, 0]} castShadow>
      <sphereGeometry args={[BALL_RADIUS * 0.8, 16, 16]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={0.6}
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
  const phase = usePong((state: any) => state.phase);
  const difficulty = usePong((state: any) => state.difficulty);
  const playerScored = usePong((state: any) => state.playerScored);
  const aiScored = usePong((state: any) => state.aiScored);
  const incrementCombo = usePong((state: any) => state.incrementCombo);
  const resetCombo = usePong((state: any) => state.resetCombo);
  const triggerScreenShake = usePong((state: any) => state.triggerScreenShake);
  const triggerHitFlash = usePong((state: any) => state.triggerHitFlash);
  const spawnPowerUp = usePong((state: any) => state.spawnPowerUp);
  const powerUps = usePong((state: any) => state.powerUps);
  const collectPowerUp = usePong((state: any) => state.collectPowerUp);
  const updateEffects = usePong((state: any) => state.updateEffects);
  const hasSlowBall = usePong((state: any) => state.hasEffect("slowBall", "player"));
  const spawnCoin = usePong((state: any) => state.spawnCoin);
  const coins = usePong((state: any) => state.coins);
  const collectCoin = usePong((state: any) => state.collectCoin);
  const consumeShield = usePong((state: any) => state.consumeShield);
  const clearMultiballs = usePong((state: any) => state.clearMultiballs);
  const incrementPowerHits = usePong((state: any) => state.incrementPowerHits);
  const triggerSkinPower = usePong((state: any) => state.triggerSkinPower);
  const activeSkinPower = usePong((state: any) => state.activeSkinPower);
  const setPredictionLine = usePong((state: any) => state.setPredictionLine);
  const updateSkinPowers = usePong((state: any) => state.updateSkinPowers);
  const { getPlayerPower, getAIPower } = useSkins();
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

  const gameSpeedMultiplier = useGameSpeed((state: any) => state.speedMultiplier);

  useFrame((_, delta) => {
    if (!meshRef.current || phase !== "playing" || scoredRef.current) return;

    updateEffects(Date.now());
    updateSkinPowers(Date.now());

    if (activeSkinPower?.type === "frozen_vision" && activeSkinPower.target === "player") {
      const ball = meshRef.current;
      const vel = velocityRef.current;
      const endX = vel.x > 0 ? COURT_WIDTH / 2 : -COURT_WIDTH / 2;
      const timeToEnd = Math.abs((endX - ball.position.x) / vel.x);
      let predictedZ = ball.position.z + vel.z * timeToEnd;
      predictedZ = Math.max(-COURT_DEPTH / 2, Math.min(COURT_DEPTH / 2, predictedZ));
      setPredictionLine({
        start: { x: ball.position.x, z: ball.position.z },
        end: { x: endX, z: predictedZ }
      });
    }

    const ball = meshRef.current;
    const velocity = velocityRef.current;

    const SUB_STEPS = 5;
    const speedMultiplier = (hasSlowBall ? 0.85 : 1) * gameSpeedMultiplier;
    const frameScale = (delta * 60) / SUB_STEPS;

    // Movement and Collision with sub-stepping
    for (let s = 0; s < SUB_STEPS; s++) {
      velocity.z += (curveRef.current * frameScale);
      const stepVelocity = velocity.clone().multiplyScalar(speedMultiplier * frameScale);
      ball.position.add(stepVelocity);

      ballPositionRef.current.copy(ball.position);
      ballVelocityRef.current.copy(velocity);

      // Wall Collisions
      const maxZ = COURT_DEPTH / 2 - BALL_RADIUS;
      if (ball.position.z > maxZ || ball.position.z < -maxZ) {
        velocity.z *= -1;
        curveRef.current *= -1;
        ball.position.z = THREE.MathUtils.clamp(ball.position.z, -maxZ, maxZ);
        playHit();
        triggerScreenShake(0.1);
      }

      // Power up collection
      for (const powerUp of powerUps) {
        const dx = ball.position.x - powerUp.position.x;
        const dz = ball.position.z - powerUp.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.8) {
          const lastHitter = usePong.getState().lastHitBy;
          const collector = lastHitter || "player";
          collectPowerUp(powerUp.id, collector);
          triggerScreenShake(0.2);
        }
      }

      // Paddle Collisions
      const playerPaddleX = -COURT_WIDTH / 2 + 1;
      const aiPaddleX = COURT_WIDTH / 2 - 1;
      const playerHasBigPaddle = usePong.getState().hasEffect("bigPaddle", "player");
      const aiHasBigPaddle = usePong.getState().hasEffect("bigPaddle", "ai");

      // Player Paddle
      if (playerPaddleRef.current) {
        const paddle = playerPaddleRef.current;
        const paddleDepth = PADDLE_DEPTH * (playerHasBigPaddle ? 1.5 : 1);

        if (
          ball.position.x - BALL_RADIUS < playerPaddleX + PADDLE_WIDTH / 2 &&
          ball.position.x + BALL_RADIUS > playerPaddleX - PADDLE_WIDTH / 2 &&
          ball.position.z > paddle.position.z - paddleDepth / 2 - BALL_RADIUS &&
          ball.position.z < paddle.position.z + paddleDepth / 2 + BALL_RADIUS &&
          velocity.x < 0
        ) {
          velocity.x = Math.abs(velocity.x);
          const hitOffset = (ball.position.z - paddle.position.z) / (paddleDepth / 2);
          velocity.z += hitOffset * 0.05 * difficulty.angleMultiplier;
          curveRef.current = (playerPaddleVelocity / frameScale) * CURVE_STRENGTH * 10;

          const currentSpeed = velocity.length();
          const newSpeed = Math.min(currentSpeed + difficulty.ballSpeedIncrement, difficulty.ballMaxSpeed);
          velocity.normalize().multiplyScalar(newSpeed);

          ball.position.x = playerPaddleX + PADDLE_WIDTH / 2 + BALL_RADIUS;
          playHit();
          incrementCombo("player");
          triggerHitFlash("player");
          triggerScreenShake(0.15);

          const playerPower = getPlayerPower();
          if (playerPower) {
            const newHits = incrementPowerHits("player");
            if (newHits >= playerPower.hitsRequired) {
              triggerSkinPower("player", playerPower.powerType, playerPower.duration);
            }
            if (playerPower.powerType === "power_shot") velocity.multiplyScalar(2);
            if (playerPower.powerType === "inferno_curve") curveRef.current = (Math.random() > 0.5 ? 1 : -1) * 0.15;
          }

          rallyCountRef.current++;
          if (rallyCountRef.current - lastSpawnRallyRef.current >= 3 && Math.random() < 0.4) {
            spawnPowerUp();
            lastSpawnRallyRef.current = rallyCountRef.current;
          }
          if (Math.random() < 0.15) spawnCoin();
          break;
        }
      }

      // AI Paddle
      if (aiPaddleRef.current) {
        const paddle = aiPaddleRef.current;
        const paddleDepth = PADDLE_DEPTH * (aiHasBigPaddle ? 1.5 : 1);

        if (
          ball.position.x + BALL_RADIUS > aiPaddleX - PADDLE_WIDTH / 2 &&
          ball.position.x - BALL_RADIUS < aiPaddleX + PADDLE_WIDTH / 2 &&
          ball.position.z > paddle.position.z - paddleDepth / 2 - BALL_RADIUS &&
          ball.position.z < paddle.position.z + paddleDepth / 2 + BALL_RADIUS &&
          velocity.x > 0
        ) {
          velocity.x = -Math.abs(velocity.x);
          const hitOffset = (ball.position.z - paddle.position.z) / (paddleDepth / 2);
          velocity.z += hitOffset * 0.05 * difficulty.angleMultiplier;
          curveRef.current = (aiPaddleVelocity / frameScale) * CURVE_STRENGTH * 10;

          const currentSpeed = velocity.length();
          const newSpeed = Math.min(currentSpeed + difficulty.ballSpeedIncrement, difficulty.ballMaxSpeed);
          velocity.normalize().multiplyScalar(newSpeed);

          ball.position.x = aiPaddleX - PADDLE_WIDTH / 2 - BALL_RADIUS;
          playHit();
          incrementCombo("ai");
          triggerHitFlash("ai");
          triggerScreenShake(0.1);

          const aiPower = getAIPower();
          if (aiPower) {
            const newHits = incrementPowerHits("ai");
            if (newHits >= aiPower.hitsRequired) {
              triggerSkinPower("ai", aiPower.powerType, aiPower.duration);
            }
            if (aiPower.powerType === "power_shot") velocity.multiplyScalar(2);
            if (aiPower.powerType === "inferno_curve") curveRef.current = (Math.random() > 0.5 ? 1 : -1) * 0.15;
          }

          rallyCountRef.current++;
          break;
        }
      }
    }

    curveRef.current *= Math.pow(CURVE_DECAY, frameScale);

    // Coin collection
    coins.forEach(coin => {
      const dx = ball.position.x - coin.position.x;
      const dz = ball.position.z - coin.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < BALL_RADIUS + 0.25) collectCoin(coin.id);
    });

    // Scoring
    if (ball.position.x < -COURT_WIDTH / 2 - 1 && !scoredRef.current) {
      if (consumeShield("player")) {
        ball.position.x = -COURT_WIDTH / 2;
        velocity.x = Math.abs(velocity.x);
        triggerScreenShake(0.3);
        playHit();
      } else {
        scoredRef.current = true;
        aiScored();
        triggerScreenShake(0.4);
        resetCombo();
        clearMultiballs();
        timeoutRef.current = window.setTimeout(() => resetBall(-1), 500);
      }
    } else if (ball.position.x > COURT_WIDTH / 2 + 1 && !scoredRef.current) {
      if (consumeShield("ai")) {
        ball.position.x = COURT_WIDTH / 2;
        velocity.x = -Math.abs(velocity.x);
        triggerScreenShake(0.3);
        playHit();
      } else {
        scoredRef.current = true;
        playerScored();
        triggerScreenShake(0.4);
        resetCombo();
        clearMultiballs();
        timeoutRef.current = window.setTimeout(() => resetBall(1), 500);
      }
    }
  });

  useFrame(() => {
    for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
      trailPositions[i].copy(trailPositions[i - 1]);
    }
    if (meshRef.current) {
      trailPositions[0].copy(meshRef.current.position);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, BALL_RADIUS, 0]} castShadow>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
        />
      </mesh>
      <BallTrail />
    </group>
  );
}

const trailGeometries = Array.from({ length: TRAIL_LENGTH }, (_, i) =>
  new THREE.SphereGeometry(BALL_RADIUS * (1 - i / TRAIL_LENGTH) * 0.7, 6, 6)
);

function BallTrail() {
  const trailMeshes = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    for (let i = 0; i < trailMeshes.current.length; i++) {
      const mesh = trailMeshes.current[i];
      if (mesh && trailPositions[i]) {
        mesh.position.copy(trailPositions[i]);
      }
    }
  });

  return (
    <>
      {trailGeometries.map((geo, i) => {
        const opacity = 0.5 * (1 - i / TRAIL_LENGTH);
        return (
          <mesh
            key={i}
            ref={(el: THREE.Mesh | null) => { if (el) trailMeshes.current[i] = el; }}
            position={[0, BALL_RADIUS, 0]}
            geometry={geo}
          >
            <meshBasicMaterial
              color="#88ccff"
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </>
  );
}

function PredictionLine() {
  const predictionLine = usePong(state => state.predictionLine);

  if (!predictionLine) return null;

  const startVec = new THREE.Vector3(predictionLine.start.x, 0.3, predictionLine.start.z);
  const endVec = new THREE.Vector3(predictionLine.end.x, 0.3, predictionLine.end.z);
  const midpoint = startVec.clone().add(endVec).multiplyScalar(0.5);
  const length = startVec.distanceTo(endVec);
  const angle = Math.atan2(endVec.z - startVec.z, endVec.x - startVec.x);

  return (
    <mesh position={[midpoint.x, midpoint.y, midpoint.z]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, 0.08, 0.08]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function SmoothCamera() {
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }: any, delta: number) => {
    const ballPos = ballPositionRef.current;
    const targetX = ballPos.x * 0.15;
    const targetZ = ballPos.z * 0.08;

    cameraTarget.current.lerp(
      new THREE.Vector3(targetX, 0, targetZ),
      1 - Math.pow(0.02, delta)
    );

    camera.position.x = cameraTarget.current.x;
    camera.lookAt(cameraTarget.current.x, 0, cameraTarget.current.z);
  });

  return null;
}

export function GameScene() {
  const playerPaddleRef = useRef<THREE.Mesh>(null);
  const aiPaddleRef = useRef<THREE.Mesh>(null);
  const playerPaddleVelocityRef = useRef(0);
  const aiPaddleVelocityRef = useRef(0);
  const phase = usePong((state: any) => state.phase);
  const powerUps = usePong((state: any) => state.powerUps);
  const coins = usePong((state: any) => state.coins);
  const screenShake = usePong((state: any) => state.screenShake);
  const playerShield = usePong((state: any) => state.playerShield);
  const aiShield = usePong((state: any) => state.aiShield);
  const multiballs = usePong((state: any) => state.multiballs);
  const predictionLine = usePong((state: any) => state.predictionLine);
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
      <SmoothCamera />
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

      {playerShield && <Shield side="player" />}
      {aiShield && <Shield side="ai" />}

      {predictionLine && <PredictionLine />}

      {multiballs.map(mb => (
        <Multiball
          key={mb.id}
          id={mb.id}
          velocity={mb.velocity}
          playerPaddleRef={playerPaddleRef}
          aiPaddleRef={aiPaddleRef}
        />
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
