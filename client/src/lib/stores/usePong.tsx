import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "paused" | "gameOver";

interface PongState {
  phase: GamePhase;
  playerScore: number;
  aiScore: number;
  winningScore: number;
  winner: "player" | "ai" | null;
  
  startGame: () => void;
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
    
    startGame: () => {
      set({ 
        phase: "playing", 
        playerScore: 0, 
        aiScore: 0,
        winner: null 
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
        winner: null 
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
