import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { SkinPowerType } from "./useSkins";

export type GamePhase = "menu" | "playing" | "paused" | "gameOver";
export type MenuState = "main" | "skins" | "settings" | "maps" | "achievements";
export type GameMode = "singlePlayer" | "twoPlayer";

export type PowerUpType = "bigPaddle" | "slowBall" | "multiball" | "speedBoost" | "shield";

export interface ActiveSkinPower {
  target: "player" | "ai";
  type: SkinPowerType;
  expiresAt: number;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: { x: number; z: number };
  active: boolean;
}

export interface Coin {
  id: string;
  position: { x: number; z: number };
  active: boolean;
}

export interface ActiveEffect {
  type: PowerUpType;
  expiresAt: number;
  target: "player" | "ai";
}

export interface DifficultySettings {
  aiSpeed: number;
  aiReactionDelay: number;
  aiPrediction: number;
  ballInitialSpeed: number;
  ballMaxSpeed: number;
  ballSpeedIncrement: number;
  angleMultiplier: number;
}

const BASE_DIFFICULTY: DifficultySettings = {
  aiSpeed: 0.25,
  aiReactionDelay: 0.08,
  aiPrediction: 0.3,
  ballInitialSpeed: 0.25, // Reduced from 0.3
  ballMaxSpeed: 0.5,    // Reduced from 0.6
  ballSpeedIncrement: 0.015, // Reduced from 0.03
  angleMultiplier: 1,
};

function getDifficultyForRound(round: number, aiDifficulty: "easy" | "normal" | "hard" = "normal"): DifficultySettings {
  const scaleFactor = Math.min(round - 1, 8);

  const difficultyMultipliers = {
    easy: { speed: 0.8, delay: 1.5, prediction: 0.5 },
    normal: { speed: 1.0, delay: 1.0, prediction: 1.0 },
    hard: { speed: 1.2, delay: 0.7, prediction: 1.5 },
  };

  const multiplier = difficultyMultipliers[aiDifficulty];

  return {
    aiSpeed: (BASE_DIFFICULTY.aiSpeed + scaleFactor * 0.012) * multiplier.speed,
    aiReactionDelay: Math.max((BASE_DIFFICULTY.aiReactionDelay - scaleFactor * 0.02) * multiplier.delay, 0.02),
    aiPrediction: Math.min(scaleFactor * 0.12 * multiplier.prediction, 0.8),
    ballInitialSpeed: BASE_DIFFICULTY.ballInitialSpeed + scaleFactor * 0.01,
    ballMaxSpeed: BASE_DIFFICULTY.ballMaxSpeed + scaleFactor * 0.025,
    ballSpeedIncrement: BASE_DIFFICULTY.ballSpeedIncrement + scaleFactor * 0.002,
    angleMultiplier: BASE_DIFFICULTY.angleMultiplier + scaleFactor * 0.1,
  };
}

interface PongState {
  phase: GamePhase;
  menuState: MenuState;
  gameMode: GameMode;
  playerScore: number;
  aiScore: number;
  winningScore: number;
  winner: "player" | "ai" | null;
  round: number;
  difficulty: DifficultySettings;

  combo: number;
  maxCombo: number;
  lastHitBy: "player" | "ai" | null;

  powerUps: PowerUp[];
  activeEffects: ActiveEffect[];
  coins: Coin[];
  coinsCollected: number;

  screenShake: number;
  hitFlash: { paddle: "player" | "ai"; time: number } | null;

  playerShield: boolean;
  aiShield: boolean;
  playerShieldExpiry: number;
  aiShieldExpiry: number;
  multiballs: { id: string; velocity: { x: number; z: number } }[];

  playerPowerHits: number;
  aiPowerHits: number;
  activeSkinPower: ActiveSkinPower | null;
  predictionLine: { start: { x: number; z: number }; end: { x: number; z: number } } | null;
  electricTrailPos: { x: number; z: number } | null;
  powerTriggersThisGame: number;

  setMenuState: (state: MenuState) => void;
  consumeShield: (target: "player" | "ai") => boolean;
  addMultiball: () => void;
  removeMultiball: (id: string) => void;
  clearMultiballs: () => void;
  startGame: (aiDifficulty: "easy" | "normal" | "hard", gameMode?: GameMode) => void;
  startNextRound: (aiDifficulty: "easy" | "normal" | "hard") => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  playerScored: () => void;
  aiScored: () => void;

  incrementCombo: (hitBy: "player" | "ai") => void;
  resetCombo: () => void;

  spawnPowerUp: () => void;
  collectPowerUp: (id: string, collector: "player" | "ai") => void;
  removePowerUp: (id: string) => void;
  updateEffects: (currentTime: number) => void;
  hasEffect: (type: PowerUpType, target: "player" | "ai") => boolean;

  spawnCoin: () => void;
  collectCoin: (id: string) => void;
  removeCoin: (id: string) => void;
  addCoins: (amount: number) => void;

  triggerScreenShake: (intensity: number) => void;
  triggerHitFlash: (paddle: "player" | "ai") => void;
  clearVisualEffects: () => void;

  incrementPowerHits: (target: "player" | "ai") => number;
  triggerSkinPower: (target: "player" | "ai", type: SkinPowerType, duration: number) => void;
  clearSkinPowers: () => void;
  updateSkinPowers: (currentTime: number) => void;
  setPredictionLine: (line: { start: { x: number; z: number }; end: { x: number; z: number } } | null) => void;
  setElectricTrailPos: (pos: { x: number; z: number } | null) => void;
}

const POWER_UP_TYPES: PowerUpType[] = ["bigPaddle", "slowBall", "speedBoost", "multiball", "shield"];

export const usePong = create<PongState>()(
  subscribeWithSelector((set: any, get: any) => ({
    phase: "menu",
    menuState: "main",
    gameMode: "singlePlayer" as GameMode,
    playerScore: 0,
    aiScore: 0,
    winningScore: 5,
    winner: null,
    round: 1,
    difficulty: getDifficultyForRound(1),

    combo: 0,
    maxCombo: 0,
    lastHitBy: null,

    powerUps: [],
    activeEffects: [],
    coins: [],
    coinsCollected: 0,

    screenShake: 0,
    hitFlash: null,

    playerShield: false,
    aiShield: false,
    playerShieldExpiry: 0,
    aiShieldExpiry: 0,
    multiballs: [],

    playerPowerHits: 0,
    aiPowerHits: 0,
    activeSkinPower: null,
    predictionLine: null,
    electricTrailPos: null,
    powerTriggersThisGame: 0,

    setMenuState: (menuState: MenuState) => set({ menuState }),

    consumeShield: (target: "player" | "ai") => {
      const shield = target === "player" ? get().playerShield : get().aiShield;
      if (shield) {
        if (target === "player") {
          set({ playerShield: false, playerShieldExpiry: 0 });
        } else {
          set({ aiShield: false, aiShieldExpiry: 0 });
        }
        return true;
      }
      return false;
    },

    addMultiball: () => {
      const { multiballs } = get();
      if (multiballs.length >= 3) return;
      const count = 2 + Math.floor(Math.random() * 2);
      const newBalls = [];
      for (let i = 0; i < count; i++) {
        const id = `multiball-${Date.now()}-${i}`;
        const angle = (Math.random() - 0.5) * Math.PI * 0.6;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const speed = 0.2 + Math.random() * 0.1;
        newBalls.push({
          id,
          velocity: { x: Math.cos(angle) * speed * direction, z: Math.sin(angle) * speed }
        });
      }
      set({
        multiballs: [...multiballs, ...newBalls].slice(0, 4)
      });
    },

    removeMultiball: (id: string) => {
      const { multiballs } = get();
      set({ multiballs: multiballs.filter((m: { id: string }) => m.id !== id) });
    },

    clearMultiballs: () => {
      set({ multiballs: [] });
    },

    startGame: (aiDifficulty: "easy" | "normal" | "hard" = "normal", gameMode: GameMode = "singlePlayer") => {
      const difficulty = getDifficultyForRound(1, aiDifficulty);
      set({
        phase: "playing",
        gameMode,
        playerScore: 0,
        aiScore: 0,
        winner: null,
        round: 1,
        difficulty,
        combo: 0,
        maxCombo: 0,
        lastHitBy: null,
        powerUps: [],
        activeEffects: [],
        coins: [],
        coinsCollected: 0,
        playerShield: false,
        aiShield: false,
        playerShieldExpiry: 0,
        aiShieldExpiry: 0,
        multiballs: [],
        playerPowerHits: 0,
        aiPowerHits: 0,
        activeSkinPower: null,
        predictionLine: null,
        electricTrailPos: null,
        powerTriggersThisGame: 0,
      });
    },

    startNextRound: (aiDifficulty: "easy" | "normal" | "hard") => {
      const nextRound = get().round + 1;
      const difficulty = getDifficultyForRound(nextRound, aiDifficulty);
      set({
        phase: "playing",
        playerScore: 0,
        aiScore: 0,
        winner: null,
        round: nextRound,
        difficulty,
        combo: 0,
        maxCombo: 0,
        lastHitBy: null,
        powerUps: [],
        activeEffects: [],
        playerShield: false,
        aiShield: false,
        playerShieldExpiry: 0,
        aiShieldExpiry: 0,
        multiballs: [],
        playerPowerHits: 0,
        aiPowerHits: 0,
        activeSkinPower: null,
        predictionLine: null,
      });
    },

    pauseGame: () => {
      const { phase } = get();
      if (phase === "playing") {
        set({ phase: "paused" });
      }
    },

    resumeGame: () => {
      const { phase } = get();
      if (phase === "paused") {
        set({ phase: "playing" });
      }
    },

    resetGame: () => {
      set({
        phase: "menu",
        menuState: "main",
        gameMode: "singlePlayer" as GameMode,
        playerScore: 0,
        aiScore: 0,
        winner: null,
        round: 1,
        difficulty: getDifficultyForRound(1),
        combo: 0,
        maxCombo: 0,
        lastHitBy: null,
        powerUps: [],
        activeEffects: [],
        playerShield: false,
        aiShield: false,
        playerShieldExpiry: 0,
        aiShieldExpiry: 0,
        multiballs: [],
        playerPowerHits: 0,
        aiPowerHits: 0,
        activeSkinPower: null,
        predictionLine: null,
        electricTrailPos: null,
        powerTriggersThisGame: 0,
      });
    },

    playerScored: () => {
      const { playerScore, winningScore } = get();
      const newScore = playerScore + 1;
      if (newScore >= winningScore) {
        set({ playerScore: newScore, phase: "gameOver", winner: "player" });
      } else {
        set({ playerScore: newScore });
      }
    },

    aiScored: () => {
      const { aiScore, winningScore } = get();
      const newScore = aiScore + 1;
      if (newScore >= winningScore) {
        set({ aiScore: newScore, phase: "gameOver", winner: "ai" });
      } else {
        set({ aiScore: newScore });
      }
    },

    incrementCombo: (hitBy: "player" | "ai") => {
      const { combo, maxCombo } = get();
      // Rally combo: increment on every hit (player or AI)
      const newCombo = combo + 1;
      set({
        combo: newCombo,
        lastHitBy: hitBy,
        maxCombo: Math.max(maxCombo, newCombo)
      });
    },

    resetCombo: () => {
      set({ combo: 0, lastHitBy: null });
    },

    spawnPowerUp: () => {
      const { powerUps, phase } = get();
      if (phase !== "playing" || powerUps.length >= 2) return;

      const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
      const id = `powerup-${Date.now()}`;
      const x = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 10;

      set({
        powerUps: [...powerUps, { id, type, position: { x, z }, active: true }]
      });
    },

    collectPowerUp: (id: string, collector: "player" | "ai") => {
      const { powerUps, activeEffects, addMultiball } = get();
      const powerUp = powerUps.find((p: PowerUp) => p.id === id);
      if (!powerUp) return;

      set({ powerUps: powerUps.filter((p: PowerUp) => p.id !== id) });

      if (powerUp.type === "shield") {
        if (collector === "player") {
          set({ playerShield: true });
        } else {
          set({ aiShield: true });
        }
        return;
      }

      if (powerUp.type === "multiball") {
        addMultiball();
        return;
      }

      const duration = powerUp.type === "speedBoost" ? 3000 : 5000;
      const newEffect: ActiveEffect = {
        type: powerUp.type,
        expiresAt: Date.now() + duration,
        target: collector
      };

      set({
        activeEffects: [...activeEffects, newEffect]
      });
    },

    removePowerUp: (id: string) => {
      const { powerUps } = get();
      set({ powerUps: powerUps.filter((p: PowerUp) => p.id !== id) });
    },

    updateEffects: (currentTime: number) => {
      const { activeEffects } = get();
      const stillActive = activeEffects.filter((e: ActiveEffect) => e.expiresAt > currentTime);
      if (stillActive.length !== activeEffects.length) {
        set({ activeEffects: stillActive });
      }
    },

    hasEffect: (type: PowerUpType, target: "player" | "ai") => {
      const { activeEffects } = get();
      return activeEffects.some((e: ActiveEffect) => e.type === type && e.target === target);
    },

    triggerScreenShake: (intensity: number) => {
      set({ screenShake: intensity });
      setTimeout(() => set({ screenShake: 0 }), 100);
    },

    triggerHitFlash: (paddle: "player" | "ai") => {
      set({ hitFlash: { paddle, time: Date.now() } });
      setTimeout(() => set({ hitFlash: null }), 150);
    },

    clearVisualEffects: () => {
      set({ screenShake: 0, hitFlash: null });
    },

    spawnCoin: () => {
      const { coins, phase } = get();
      if (phase !== "playing" || coins.length >= 4) return;

      const id = `coin-${Date.now()}`;
      const x = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 10;

      set({
        coins: [...coins, { id, position: { x, z }, active: true }]
      });
    },

    collectCoin: (id: string) => {
      const { coins, coinsCollected } = get();
      const coin = coins.find((c: Coin) => c.id === id);
      if (!coin) return;

      set({
        coins: coins.filter((c: Coin) => c.id !== id),
        coinsCollected: coinsCollected + 1
      });
    },

    removeCoin: (id: string) => {
      const { coins } = get();
      set({ coins: coins.filter((c: Coin) => c.id !== id) });
    },

    addCoins: (amount: number) => {
      const { coinsCollected } = get();
      set({ coinsCollected: coinsCollected + amount });
    },

    incrementPowerHits: (target: "player" | "ai") => {
      const newCount = target === "player"
        ? get().playerPowerHits + 1
        : get().aiPowerHits + 1;
      if (target === "player") {
        set({ playerPowerHits: newCount });
      } else {
        set({ aiPowerHits: newCount });
      }
      return newCount;
    },

    triggerSkinPower: (target: "player" | "ai", type: SkinPowerType, duration: number) => {
      const expiresAt = duration > 0 ? Date.now() + duration : 0;
      const { powerTriggersThisGame } = get();

      if (type === "second_chance") {
        const shieldDuration = 10000;
        const expiryTime = Date.now() + shieldDuration;
        if (target === "player") {
          set({ playerShield: true, playerShieldExpiry: expiryTime, playerPowerHits: 0, powerTriggersThisGame: powerTriggersThisGame + 1 });
        } else {
          set({ aiShield: true, aiShieldExpiry: expiryTime, aiPowerHits: 0, powerTriggersThisGame: powerTriggersThisGame + 1 });
        }
        return;
      }

      if (type === "power_shot" || type === "inferno_curve") {
        set({
          activeSkinPower: { target, type, expiresAt: duration > 0 ? Date.now() + duration : Date.now() + 500 },
          [target === "player" ? "playerPowerHits" : "aiPowerHits"]: 0,
          powerTriggersThisGame: powerTriggersThisGame + 1
        });
        return;
      }

      if (type === "frozen_vision" || type === "electric_trail") {
        set({
          activeSkinPower: { target, type, expiresAt },
          [target === "player" ? "playerPowerHits" : "aiPowerHits"]: 0,
          powerTriggersThisGame: powerTriggersThisGame + 1
        });
        return;
      }

      if (target === "player") {
        set({ playerPowerHits: 0 });
      } else {
        set({ aiPowerHits: 0 });
      }
    },

    clearSkinPowers: () => {
      set({
        playerPowerHits: 0,
        aiPowerHits: 0,
        activeSkinPower: null,
        predictionLine: null,
        electricTrailPos: null,
      });
    },

    updateSkinPowers: (currentTime: number) => {
      const { activeSkinPower, playerShieldExpiry, aiShieldExpiry } = get();
      const updates: Partial<PongState> = {};

      if (activeSkinPower && activeSkinPower.expiresAt > 0 && currentTime >= activeSkinPower.expiresAt) {
        updates.activeSkinPower = null;
        updates.predictionLine = null;
        updates.electricTrailPos = null;
      }

      if (playerShieldExpiry > 0 && currentTime >= playerShieldExpiry) {
        updates.playerShield = false;
        updates.playerShieldExpiry = 0;
      }

      if (aiShieldExpiry > 0 && currentTime >= aiShieldExpiry) {
        updates.aiShield = false;
        updates.aiShieldExpiry = 0;
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    },

    setPredictionLine: (line: { start: { x: number; z: number }; end: { x: number; z: number } } | null) => {
      set({ predictionLine: line });
    },

    setElectricTrailPos: (pos: { x: number; z: number } | null) => {
      set({ electricTrailPos: pos });
    },
  }))
);
