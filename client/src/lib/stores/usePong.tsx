import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "paused" | "gameOver";
export type MenuState = "main" | "skins" | "settings";

export type PowerUpType = "bigPaddle" | "slowBall" | "multiball" | "speedBoost";

export interface PowerUp {
  id: string;
  type: PowerUpType;
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
  
  screenShake: number;
  hitFlash: { paddle: "player" | "ai"; time: number } | null;
  
  setMenuState: (state: MenuState) => void;
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
  
  triggerScreenShake: (intensity: number) => void;
  triggerHitFlash: (paddle: "player" | "ai") => void;
  clearVisualEffects: () => void;
}

const POWER_UP_TYPES: PowerUpType[] = ["bigPaddle", "slowBall", "speedBoost"];

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
    
    screenShake: 0,
    hitFlash: null,
    
    setMenuState: (menuState: MenuState) => set({ menuState }),
    
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
      const { combo, lastHitBy, maxCombo } = get();
      if (hitBy === "player") {
        const newCombo = lastHitBy === "player" ? combo + 1 : 1;
        set({ 
          combo: newCombo, 
          lastHitBy: hitBy,
          maxCombo: Math.max(maxCombo, newCombo)
        });
      } else {
        set({ combo: 0, lastHitBy: hitBy });
      }
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
      const { powerUps, activeEffects } = get();
      const powerUp = powerUps.find(p => p.id === id);
      if (!powerUp) return;
      
      const duration = powerUp.type === "speedBoost" ? 3000 : 5000;
      const newEffect: ActiveEffect = {
        type: powerUp.type,
        expiresAt: Date.now() + duration,
        target: collector
      };
      
      set({
        powerUps: powerUps.filter(p => p.id !== id),
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
  }))
);
