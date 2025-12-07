import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "paused" | "gameOver";

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
  aiSpeed: 0.08,
  aiReactionDelay: 0.15,
  aiPrediction: 0,
  ballInitialSpeed: 0.12,
  ballMaxSpeed: 0.25,
  ballSpeedIncrement: 0.01,
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
  playerScore: number;
  aiScore: number;
  winningScore: number;
  winner: "player" | "ai" | null;
  round: number;
  difficulty: DifficultySettings;
  
  startGame: () => void;
  startNextRound: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  playerScored: () => void;
  aiScored: () => void;
}

export const usePong = create<PongState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    playerScore: 0,
    aiScore: 0,
    winningScore: 5,
    winner: null,
    round: 1,
    difficulty: getDifficultyForRound(1),
    
    startGame: () => {
      const difficulty = getDifficultyForRound(1);
      set({ 
        phase: "playing", 
        playerScore: 0, 
        aiScore: 0,
        winner: null,
        round: 1,
        difficulty,
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
        playerScore: 0, 
        aiScore: 0,
        winner: null,
        round: 1,
        difficulty: getDifficultyForRound(1),
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
  }))
);
