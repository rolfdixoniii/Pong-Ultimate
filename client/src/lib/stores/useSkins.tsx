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
  coinCost: number;
  levelRequired: number;
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
  coinCost: number;
  levelRequired: number;
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
  unlockSkin: (skin: PaddleSkinStyle, playerLevel: number, playerCoins: number) => { success: boolean; reason: string; cost?: number };
  selectMap: (map: MapStyle) => void;
  unlockMap: (map: MapStyle, playerLevel: number, playerCoins: number) => { success: boolean; reason: string; cost?: number };
  canUnlockSkin: (skin: PaddleSkinStyle, playerLevel: number, playerCoins: number) => { canUnlock: boolean; reason: string };
  canUnlockMap: (map: MapStyle, playerLevel: number, playerCoins: number) => { canUnlock: boolean; reason: string };
}

const DEFAULT_SKINS: Record<PaddleSkinStyle, PaddleSkin> = {
  default: {
    id: "default",
    name: "Default",
    description: "Classic cyan paddle",
    unlocked: true,
    color: "#06b6d4",
    emissiveColor: "#06b6d4",
    coinCost: 0,
    levelRequired: 1,
  },
  neon: {
    id: "neon",
    name: "Neon",
    description: "Vibrant purple glow",
    unlocked: false,
    color: "#a855f7",
    emissiveColor: "#d946ef",
    coinCost: 50,
    levelRequired: 2,
  },
  chrome: {
    id: "chrome",
    name: "Chrome",
    description: "Metallic silver shine",
    unlocked: false,
    color: "#e5e7eb",
    emissiveColor: "#f3f4f6",
    coinCost: 100,
    levelRequired: 4,
  },
  fire: {
    id: "fire",
    name: "Fire",
    description: "Burning orange flame",
    unlocked: false,
    color: "#ea580c",
    emissiveColor: "#f97316",
    coinCost: 150,
    levelRequired: 6,
  },
  ice: {
    id: "ice",
    name: "Ice",
    description: "Frozen blue crystal",
    unlocked: false,
    color: "#0284c7",
    emissiveColor: "#06b6d4",
    coinCost: 200,
    levelRequired: 8,
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
    coinCost: 0,
    levelRequired: 1,
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
    coinCost: 75,
    levelRequired: 3,
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
    coinCost: 125,
    levelRequired: 5,
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
    coinCost: 175,
    levelRequired: 7,
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
    coinCost: 250,
    levelRequired: 10,
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
    
    unlockSkin: (skin: PaddleSkinStyle, playerLevel: number, playerCoins: number) => {
      const { unlockedSkins, paddleSkins } = get();
      if (unlockedSkins.includes(skin)) {
        return { success: false, reason: "Already unlocked" };
      }
      const skinData = paddleSkins[skin];
      if (playerLevel < skinData.levelRequired) {
        return { success: false, reason: `Requires Level ${skinData.levelRequired}` };
      }
      if (playerCoins < skinData.coinCost) {
        return { success: false, reason: `Need ${skinData.coinCost} coins` };
      }
      set({ unlockedSkins: [...unlockedSkins, skin] });
      return { success: true, reason: "", cost: skinData.coinCost };
    },
    
    canUnlockSkin: (skin: PaddleSkinStyle, playerLevel: number, playerCoins: number) => {
      const { unlockedSkins, paddleSkins } = get();
      if (unlockedSkins.includes(skin)) {
        return { canUnlock: false, reason: "Already unlocked" };
      }
      const skinData = paddleSkins[skin];
      if (playerLevel < skinData.levelRequired) {
        return { canUnlock: false, reason: `Requires Level ${skinData.levelRequired}` };
      }
      if (playerCoins < skinData.coinCost) {
        return { canUnlock: false, reason: `Need ${skinData.coinCost} coins` };
      }
      return { canUnlock: true, reason: "" };
    },

    selectMap: (map: MapStyle) => {
      const { unlockedMaps } = get();
      if (unlockedMaps.includes(map)) {
        set({ selectedMap: map });
      }
    },

    unlockMap: (map: MapStyle, playerLevel: number, playerCoins: number) => {
      const { unlockedMaps, gameMaps } = get();
      if (unlockedMaps.includes(map)) {
        return { success: false, reason: "Already unlocked" };
      }
      const mapData = gameMaps[map];
      if (playerLevel < mapData.levelRequired) {
        return { success: false, reason: `Requires Level ${mapData.levelRequired}` };
      }
      if (playerCoins < mapData.coinCost) {
        return { success: false, reason: `Need ${mapData.coinCost} coins` };
      }
      set({ unlockedMaps: [...unlockedMaps, map] });
      return { success: true, reason: "", cost: mapData.coinCost };
    },
    
    canUnlockMap: (map: MapStyle, playerLevel: number, playerCoins: number) => {
      const { unlockedMaps, gameMaps } = get();
      if (unlockedMaps.includes(map)) {
        return { canUnlock: false, reason: "Already unlocked" };
      }
      const mapData = gameMaps[map];
      if (playerLevel < mapData.levelRequired) {
        return { canUnlock: false, reason: `Requires Level ${mapData.levelRequired}` };
      }
      if (playerCoins < mapData.coinCost) {
        return { canUnlock: false, reason: `Need ${mapData.coinCost} coins` };
      }
      return { canUnlock: true, reason: "" };
    },
  }))
);
