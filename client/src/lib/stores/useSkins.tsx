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
  floorTexture?: string;
  wallTexture?: string;
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
    floorColor: "#2a2a4a",
    wallColor: "#3a3a5a",
    accentColor: "#00ffff",
    centerLineColor: "#00ff88",
    ambientIntensity: 0.8,
    lightColor: "#00ffff",
    lightIntensity: 1.0,
    floorTexture: "/textures/asphalt.png",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Dark and moody court",
    unlocked: false,
    floorColor: "#1a2540",
    wallColor: "#2a3860",
    accentColor: "#bf40ff",
    centerLineColor: "#7c3aed",
    ambientIntensity: 0.7,
    lightColor: "#bf40ff",
    lightIntensity: 0.9,
  },
  sunset: {
    id: "sunset",
    name: "Sunset Paradise",
    description: "Warm tropical court",
    unlocked: false,
    floorColor: "#6b3d1f",
    wallColor: "#8b5a2b",
    accentColor: "#ff6b20",
    centerLineColor: "#ffa500",
    ambientIntensity: 0.9,
    lightColor: "#ff6b20",
    lightIntensity: 1.0,
    floorTexture: "/textures/sand.jpg",
  },
  ocean: {
    id: "ocean",
    name: "Ocean Blue",
    description: "Crystal clear water court",
    unlocked: false,
    floorColor: "#1a5fa0",
    wallColor: "#2b7ac7",
    accentColor: "#00d9ff",
    centerLineColor: "#00ffaa",
    ambientIntensity: 0.85,
    lightColor: "#00d9ff",
    lightIntensity: 0.95,
  },
  forest: {
    id: "forest",
    name: "Forest Green",
    description: "Lush verdant arena",
    unlocked: false,
    floorColor: "#2d5a2d",
    wallColor: "#3d7a3d",
    accentColor: "#39ff14",
    centerLineColor: "#00ff00",
    ambientIntensity: 0.85,
    lightColor: "#39ff14",
    lightIntensity: 0.95,
    floorTexture: "/textures/grass.png",
    wallTexture: "/textures/wood.jpg",
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
