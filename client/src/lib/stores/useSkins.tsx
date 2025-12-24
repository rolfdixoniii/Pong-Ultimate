import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type SkinType = "player" | "ai";
export type PaddleSkinStyle = "default" | "neon" | "chrome" | "fire" | "ice";
export type MapStyle = "neon" | "midnight" | "sunset" | "ocean" | "forest";

export interface PaddleSkin {
  id: PaddleSkinStyle;
  name: string;
  description: string;
  unlocked: boolean;
  color: string;
  emissiveColor: string;
}

export interface GameMap {
  id: MapStyle;
  name: string;
  description: string;
  unlocked: boolean;
  floorColor: string;
  wallColor: string;
  accentColor: string;
  centerLineColor: string;
  ambientIntensity: number;
  lightColor: string;
  lightIntensity: number;
}

interface SkinsState {
  playerSkin: PaddleSkinStyle;
  aiSkin: PaddleSkinStyle;
  selectedMap: MapStyle;
  unlockedSkins: PaddleSkinStyle[];
  unlockedMaps: MapStyle[];
  paddleSkins: Record<PaddleSkinStyle, PaddleSkin>;
  gameMaps: Record<MapStyle, GameMap>;
  
  selectPlayerSkin: (skin: PaddleSkinStyle) => void;
  selectAISkin: (skin: PaddleSkinStyle) => void;
  unlockSkin: (skin: PaddleSkinStyle) => void;
  selectMap: (map: MapStyle) => void;
  unlockMap: (map: MapStyle) => void;
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

const DEFAULT_MAPS: Record<MapStyle, GameMap> = {
  neon: {
    id: "neon",
    name: "Neon Night",
    description: "Cyberpunk neon arena",
    unlocked: true,
    floorColor: "#1a1a2e",
    wallColor: "#16213e",
    accentColor: "#4fc3f7",
    centerLineColor: "#4a4a6a",
    ambientIntensity: 0.5,
    lightColor: "#4fc3f7",
    lightIntensity: 0.6,
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Dark and moody court",
    unlocked: false,
    floorColor: "#0d0d1a",
    wallColor: "#1a1a2e",
    accentColor: "#8b5cf6",
    centerLineColor: "#2a2a4a",
    ambientIntensity: 0.3,
    lightColor: "#8b5cf6",
    lightIntensity: 0.5,
  },
  sunset: {
    id: "sunset",
    name: "Sunset Paradise",
    description: "Warm tropical court",
    unlocked: false,
    floorColor: "#3d2817",
    wallColor: "#5a3a2a",
    accentColor: "#f97316",
    centerLineColor: "#8b5a2b",
    ambientIntensity: 0.7,
    lightColor: "#fb923c",
    lightIntensity: 0.8,
  },
  ocean: {
    id: "ocean",
    name: "Ocean Blue",
    description: "Crystal clear water court",
    unlocked: false,
    floorColor: "#0c4a6e",
    wallColor: "#164e63",
    accentColor: "#06b6d4",
    centerLineColor: "#0d9488",
    ambientIntensity: 0.6,
    lightColor: "#06b6d4",
    lightIntensity: 0.7,
  },
  forest: {
    id: "forest",
    name: "Forest Green",
    description: "Lush verdant arena",
    unlocked: false,
    floorColor: "#1a3a1a",
    wallColor: "#2d5a2d",
    accentColor: "#22c55e",
    centerLineColor: "#3a5a3a",
    ambientIntensity: 0.5,
    lightColor: "#22c55e",
    lightIntensity: 0.6,
  },
};

export const useSkins = create<SkinsState>()(
  subscribeWithSelector((set, get) => ({
    playerSkin: "default",
    aiSkin: "default",
    selectedMap: "neon",
    unlockedSkins: ["default"],
    unlockedMaps: ["neon"],
    paddleSkins: DEFAULT_SKINS,
    gameMaps: DEFAULT_MAPS,
    
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

    selectMap: (map: MapStyle) => {
      const { unlockedMaps } = get();
      if (unlockedMaps.includes(map)) {
        set({ selectedMap: map });
      }
    },

    unlockMap: (map: MapStyle) => {
      const { unlockedMaps } = get();
      if (!unlockedMaps.includes(map)) {
        set({ unlockedMaps: [...unlockedMaps, map] });
      }
    },
  }))
);
