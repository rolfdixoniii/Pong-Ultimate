import { create } from "zustand";

interface TouchControlsState {
  isMovingUp: boolean;
  isMovingDown: boolean;
  setMovingUp: (moving: boolean) => void;
  setMovingDown: (moving: boolean) => void;
}

export const useTouchControls = create<TouchControlsState>((set) => ({
  isMovingUp: false,
  isMovingDown: false,
  setMovingUp: (moving) => set({ isMovingUp: moving }),
  setMovingDown: (moving) => set({ isMovingDown: moving }),
}));
