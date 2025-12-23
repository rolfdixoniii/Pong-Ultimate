import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type SkinType = "player" | "ai";
export type PaddleSkinStyle = "default" | "neon" | "chrome" | "fire" | "ice";

export interface PaddleSkin {
  id: PaddleSkinStyle;
  name: string;
  description: string;
  unlocked: boolean;
  color: string;
  emissiveColor: string;
}

interface SkinsState {
  playerSkin: PaddleSkinStyle;
  aiSkin: PaddleSkinStyle;
  unlockedSkins: PaddleSkinStyle[];
  paddleSkins: Record<PaddleSkinStyle, PaddleSkin>;
  
  selectPlayerSkin: (skin: PaddleSkinStyle) => void;
  selectAISkin: (skin: PaddleSkinStyle) => void;
  unlockSkin: (skin: PaddleSkinStyle) => void;
}

const DEFAULT_SKINS: Record<PaddleSkinStyle, PaddleSkin> = {
  default: {
    id: "default",
    name: "Default",
    description: "Classic cyan paddle",
    unlocked: true,
    color: "#06b6d4",
    emissiveColor: "#06b6d4",
  },
  neon: {
    id: "neon",
    name: "Neon",
    description: "Vibrant purple glow",
    unlocked: false,
    color: "#a855f7",
    emissiveColor: "#d946ef",
  },
  chrome: {
    id: "chrome",
    name: "Chrome",
    description: "Metallic silver shine",
    unlocked: false,
    color: "#e5e7eb",
    emissiveColor: "#f3f4f6",
  },
  fire: {
    id: "fire",
    name: "Fire",
    description: "Burning orange flame",
    unlocked: false,
    color: "#ea580c",
    emissiveColor: "#f97316",
  },
  ice: {
    id: "ice",
    name: "Ice",
    description: "Frozen blue crystal",
    unlocked: false,
    color: "#0284c7",
    emissiveColor: "#06b6d4",
  },
};

export const useSkins = create<SkinsState>()(
  subscribeWithSelector((set, get) => ({
    playerSkin: "default",
    aiSkin: "default",
    unlockedSkins: ["default"],
    paddleSkins: DEFAULT_SKINS,
    
    selectPlayerSkin: (skin: PaddleSkinStyle) => {
      const { unlockedSkins } = get();
      if (unlockedSkins.includes(skin)) {
        set({ playerSkin: skin });
      }
    },
    
    selectAISkin: (skin: PaddleSkinStyle) => {
      const { unlockedSkins } = get();
      if (unlockedSkins.includes(skin)) {
        set({ aiSkin: skin });
      }
    },
    
    unlockSkin: (skin: PaddleSkinStyle) => {
      const { unlockedSkins } = get();
      if (!unlockedSkins.includes(skin)) {
        set({ unlockedSkins: [...unlockedSkins, skin] });
      }
    },
  }))
);
