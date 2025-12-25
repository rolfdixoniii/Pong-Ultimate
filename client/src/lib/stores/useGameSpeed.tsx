import { create } from "zustand";

export type GameSpeed = "slow" | "medium" | "fast" | "superfast";

interface GameSpeedState {
  gameSpeed: GameSpeed;
  speedMultiplier: number;

  setGameSpeed: (speed: GameSpeed) => void;
  getSpeedMultiplier: () => number;
}

const SPEED_MULTIPLIERS: Record<GameSpeed, number> = {
  slow: 0.7,
  medium: 1,
  fast: 1.3,
  superfast: 1.6,
};

export const useGameSpeed = create<GameSpeedState>((set: any, get: any) => ({
  gameSpeed: "medium",
  speedMultiplier: 1,

  setGameSpeed: (speed: GameSpeed) => {
    set({
      gameSpeed: speed,
      speedMultiplier: SPEED_MULTIPLIERS[speed],
    });
  },

  getSpeedMultiplier: () => {
    const state = get();
    return SPEED_MULTIPLIERS[state.gameSpeed];
  },
}));
