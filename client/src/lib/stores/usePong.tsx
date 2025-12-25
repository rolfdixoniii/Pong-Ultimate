import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { SkinPowerType } from "./useSkins";

export type GamePhase = "menu" | "playing" | "paused" | "gameOver";
export type MenuState = "main" | "skins" | "settings" | "maps" | "achievements";

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
  ballInitialSpeed: 0.3,
  ballMaxSpeed: 0.6,
  ballSpeedIncrement: 0.03,
  angleMultiplier: 1,
};

function getDifficultyForRound(round: number): DifficultySettings {
  const scaleFactor = Math.min(round - 1, 5);
  
  return {
    aiSpeed: BASE_DIFFICULTY.aiSpeed + scaleFactor * 0.015,
    aiReactionDelay: Math.max(BASE_DIFFICULTY.aiReactionDelay - scaleFactor * 0.025, 0.02),
    aiPrediction: Math.min(scaleFactor * 0.15, 0.6),
    ballInitialSpeed: BASE_DIFFICULTY.ballInitialSpeed + scaleFactor * 0.015,
    ballMaxSpeed: BASE_DIFFICULTY.ballMaxSpeed + scaleFactor * 0.04,
    ballSpeedIncrement: BASE_DIFFICULTY.ballSpeedIncrement + scaleFactor * 0.003,
    angleMultiplier: BASE_DIFFICULTY.angleMultiplier + scaleFactor * 0.15,
  };
}

interface PongState {
  phase: GamePhase;
  menuState: MenuState;
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
  startGame: () => void;
  startNextRound: () => void;
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
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    menuState: "main",
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
    multiballs: [],
    
    playerPowerHits: 0,
    aiPowerHits: 0,
    activeSkinPower: null,
    predictionLine: null,
    electricTrailPos: null,
    powerTriggersThisGame: 0,
    
    setMenuState: (menuState: MenuState) => set({ menuState }),
    
    consumeShield: (target) => {
      const shield = target === "player" ? get().playerShield : get().aiShield;
      if (shield) {
        if (target === "player") {
          set({ playerShield: false });
        } else {
          set({ aiShield: false });
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
    
    removeMultiball: (id) => {
      const { multiballs } = get();
      set({ multiballs: multiballs.filter(m => m.id !== id) });
    },
    
    clearMultiballs: () => {
      set({ multiballs: [] });
    },
    
    startGame: () => {
      const difficulty = getDifficultyForRound(1);
      set({ 
        phase: "playing", 
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
        multiballs: [],
        playerPowerHits: 0,
        aiPowerHits: 0,
        activeSkinPower: null,
        predictionLine: null,
        electricTrailPos: null,
        powerTriggersThisGame: 0,
      });
    },
    
    startNextRound: () => {
      const nextRound = get().round + 1;
      const difficulty = getDifficultyForRound(nextRound);
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
        multiballs: [],
        playerPowerHits: 0,
        aiPowerHits: 0,
        activeSkinPower: null,
        predictionLine: null,
        electricTrailPos: null,
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
    
    incrementCombo: (hitBy) => {
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
    
    collectPowerUp: (id, collector) => {
      const { powerUps, activeEffects, addMultiball } = get();
      const powerUp = powerUps.find(p => p.id === id);
      if (!powerUp) return;
      
      set({ powerUps: powerUps.filter(p => p.id !== id) });
      
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
    
    removePowerUp: (id) => {
      const { powerUps } = get();
      set({ powerUps: powerUps.filter(p => p.id !== id) });
    },
    
    updateEffects: (currentTime) => {
      const { activeEffects } = get();
      const stillActive = activeEffects.filter(e => e.expiresAt > currentTime);
      if (stillActive.length !== activeEffects.length) {
        set({ activeEffects: stillActive });
      }
    },
    
    hasEffect: (type, target) => {
      const { activeEffects } = get();
      return activeEffects.some(e => e.type === type && e.target === target);
    },
    
    triggerScreenShake: (intensity) => {
      set({ screenShake: intensity });
      setTimeout(() => set({ screenShake: 0 }), 100);
    },
    
    triggerHitFlash: (paddle) => {
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

    collectCoin: (id) => {
      const { coins, coinsCollected } = get();
      const coin = coins.find(c => c.id === id);
      if (!coin) return;
      
      set({
        coins: coins.filter(c => c.id !== id),
        coinsCollected: coinsCollected + 1
      });
    },

    removeCoin: (id) => {
      const { coins } = get();
      set({ coins: coins.filter(c => c.id !== id) });
    },

    addCoins: (amount) => {
      const { coinsCollected } = get();
      set({ coinsCollected: coinsCollected + amount });
    },
    
    incrementPowerHits: (target) => {
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
    
    triggerSkinPower: (target, type, duration) => {
      const expiresAt = duration > 0 ? Date.now() + duration : 0;
      const { powerTriggersThisGame } = get();
      
      if (type === "second_chance") {
        if (target === "player") {
          set({ playerShield: true, playerPowerHits: 0, powerTriggersThisGame: powerTriggersThisGame + 1 });
        } else {
          set({ aiShield: true, aiPowerHits: 0, powerTriggersThisGame: powerTriggersThisGame + 1 });
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
    
    updateSkinPowers: (currentTime) => {
      const { activeSkinPower } = get();
      if (activeSkinPower && activeSkinPower.expiresAt > 0 && currentTime >= activeSkinPower.expiresAt) {
        set({ 
          activeSkinPower: null,
          predictionLine: null,
          electricTrailPos: null,
        });
      }
    },
    
    setPredictionLine: (line) => {
      set({ predictionLine: line });
    },
    
    setElectricTrailPos: (pos) => {
      set({ electricTrailPos: pos });
    },
  }))
);
