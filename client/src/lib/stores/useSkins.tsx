import { create } from "zustand";
import { subscribeWithSelector, persist } from "zustand/middleware";

export type SkinType = "player" | "ai";
export type PaddleSkinStyle = "default" | "neon" | "chrome" | "fire" | "ice";
export type AwakenedSkinStyle = "awakened_default" | "awakened_neon" | "awakened_chrome" | "awakened_fire" | "awakened_ice";
export type AllSkinStyles = PaddleSkinStyle | AwakenedSkinStyle;
export type MapStyle = "neon" | "midnight" | "sunset" | "ocean" | "forest";

export type SkinPowerType = "second_chance" | "electric_trail" | "power_shot" | "inferno_curve" | "frozen_vision";

export interface PaddleSkin {
  id: AllSkinStyles;
  name: string;
  description: string;
  unlocked: boolean;
  color: string;
  emissiveColor: string;
  coinCost: number;
  levelRequired: number;
  isAwakened?: boolean;
  baseSkin?: PaddleSkinStyle;
  powerType?: SkinPowerType;
  powerHitsRequired?: number;
  powerDuration?: number;
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
  playerSkin: AllSkinStyles;
  aiSkin: AllSkinStyles;
  selectedMap: MapStyle;
  unlockedSkins: AllSkinStyles[];
  unlockedMaps: MapStyle[];
  paddleSkins: Record<AllSkinStyles, PaddleSkin>;
  gameMaps: Record<MapStyle, GameMap>;

  purchaseSkin: (skin: AllSkinStyles, playerLevel: number, spendCoins: (amount: number) => boolean) => { success: boolean; reason: string };
  selectMap: (map: MapStyle) => void;
  purchaseMap: (map: MapStyle, playerLevel: number, spendCoins: (amount: number) => boolean) => { success: boolean; reason: string };
  canUnlockSkin: (skin: AllSkinStyles, playerLevel: number, playerCoins: number) => { canUnlock: boolean; reason: string };
  canUnlockMap: (map: MapStyle, playerLevel: number, playerCoins: number) => { canUnlock: boolean; reason: string };
  getPlayerPower: () => { powerType: SkinPowerType; hitsRequired: number; duration: number } | null;
  getAIPower: () => { powerType: SkinPowerType; hitsRequired: number; duration: number } | null;
}

const DEFAULT_SKINS: Record<AllSkinStyles, PaddleSkin> = {
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
  awakened_default: {
    id: "awakened_default",
    name: "Awakened Default",
    description: "Second Chance: Auto-shield every 8 hits",
    unlocked: false,
    color: "#22d3ee",
    emissiveColor: "#67e8f9",
    coinCost: 100,
    levelRequired: 3,
    isAwakened: true,
    baseSkin: "default",
    powerType: "second_chance",
    powerHitsRequired: 8,
    powerDuration: 0,
  },
  awakened_neon: {
    id: "awakened_neon",
    name: "Awakened Neon",
    description: "Electric Trail: Afterimage deflects ball every 7 hits",
    unlocked: false,
    color: "#c084fc",
    emissiveColor: "#e879f9",
    coinCost: 150,
    levelRequired: 5,
    isAwakened: true,
    baseSkin: "neon",
    powerType: "electric_trail",
    powerHitsRequired: 7,
    powerDuration: 3000,
  },
  awakened_chrome: {
    id: "awakened_chrome",
    name: "Awakened Chrome",
    description: "Power Shot: 2x ball speed every 6 hits",
    unlocked: false,
    color: "#f9fafb",
    emissiveColor: "#ffffff",
    coinCost: 200,
    levelRequired: 7,
    isAwakened: true,
    baseSkin: "chrome",
    powerType: "power_shot",
    powerHitsRequired: 6,
    powerDuration: 0,
  },
  awakened_fire: {
    id: "awakened_fire",
    name: "Awakened Fire",
    description: "Inferno Curve: Extreme ball curve every 5 hits",
    unlocked: false,
    color: "#fb923c",
    emissiveColor: "#fdba74",
    coinCost: 300,
    levelRequired: 9,
    isAwakened: true,
    baseSkin: "fire",
    powerType: "inferno_curve",
    powerHitsRequired: 5,
    powerDuration: 3000,
  },
  awakened_ice: {
    id: "awakened_ice",
    name: "Awakened Ice",
    description: "Frozen Vision: See ball trajectory every 5 hits",
    unlocked: false,
    color: "#38bdf8",
    emissiveColor: "#7dd3fc",
    coinCost: 400,
    levelRequired: 12,
    isAwakened: true,
    baseSkin: "ice",
    powerType: "frozen_vision",
    powerHitsRequired: 5,
    powerDuration: 5000,
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
  subscribeWithSelector(
    persist(
      (set, get) => ({
        playerSkin: "default",
        aiSkin: "default",
        selectedMap: "neon",
        unlockedSkins: ["default"],
        unlockedMaps: ["neon"],
        paddleSkins: DEFAULT_SKINS,
        gameMaps: DEFAULT_MAPS,

        selectPlayerSkin: (skin: AllSkinStyles) => {
          const { unlockedSkins } = get();
          if (unlockedSkins.includes(skin)) {
            set({ playerSkin: skin });
          }
        },

        selectAISkin: (skin: AllSkinStyles) => {
          const { unlockedSkins } = get();
          if (unlockedSkins.includes(skin)) {
            set({ aiSkin: skin });
          }
        },

        purchaseSkin: (skin: AllSkinStyles, playerLevel: number, spendCoins: (amount: number) => boolean) => {
          const { unlockedSkins, paddleSkins } = get();
          if (unlockedSkins.includes(skin)) {
            return { success: false, reason: "Already unlocked" };
          }
          const skinData = paddleSkins[skin];
          if (playerLevel < skinData.levelRequired) {
            return { success: false, reason: `Requires Level ${skinData.levelRequired}` };
          }

          if (spendCoins(skinData.coinCost)) {
            set({ unlockedSkins: [...unlockedSkins, skin] });
            return { success: true, reason: "" };
          }

          return { success: false, reason: `Need ${skinData.coinCost} coins` };
        },

        canUnlockSkin: (skin: AllSkinStyles, playerLevel: number, playerCoins: number) => {
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

        purchaseMap: (map: MapStyle, playerLevel: number, spendCoins: (amount: number) => boolean) => {
          const { unlockedMaps, gameMaps } = get();
          if (unlockedMaps.includes(map)) {
            return { success: false, reason: "Already unlocked" };
          }
          const mapData = gameMaps[map];
          if (playerLevel < mapData.levelRequired) {
            return { success: false, reason: `Requires Level ${mapData.levelRequired}` };
          }

          if (spendCoins(mapData.coinCost)) {
            set({ unlockedMaps: [...unlockedMaps, map] });
            return { success: true, reason: "" };
          }

          return { success: false, reason: `Need ${mapData.coinCost} coins` };
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

        getPlayerPower: () => {
          const { playerSkin, paddleSkins } = get();
          const skin = paddleSkins[playerSkin];
          if (skin.isAwakened && skin.powerType && skin.powerHitsRequired) {
            return {
              powerType: skin.powerType,
              hitsRequired: skin.powerHitsRequired,
              duration: skin.powerDuration || 0,
            };
          }
          return null;
        },

        getAIPower: () => {
          const { aiSkin, paddleSkins } = get();
          const skin = paddleSkins[aiSkin];
          if (skin.isAwakened && skin.powerType && skin.powerHitsRequired) {
            return {
              powerType: skin.powerType,
              hitsRequired: skin.powerHitsRequired,
              duration: skin.powerDuration || 0,
            };
          }
          return null;
        },
      }),
      {
        name: "pong-skins",
      }
    )
  )
);
