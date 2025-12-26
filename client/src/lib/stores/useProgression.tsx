import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  highestRound: number;
  maxCombo: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalPointsScored: number;
  totalRoundsWon: number;
  totalPowerUpsCollected: number;
}

interface ProgressionState {
  xp: number;
  level: number;
  coins: number;
  username: string;
  usernameColor: string;
  aiDifficulty: "easy" | "normal" | "hard";
  stats: PlayerStats;

  pendingRewards: {
    xp: number;
    coins: number;
    levelUp: boolean;
    newLevel: number;
  } | null;

  getXpForLevel: (level: number) => number;
  getXpProgress: () => { current: number; required: number; percentage: number };

  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setUsername: (name: string) => void;
  setUsernameColor: (color: string) => void;
  setAIDifficulty: (difficulty: "easy" | "normal" | "hard") => void;

  recordRoundWin: (round: number, combo: number, pointsScored: number) => void;
  recordRoundLoss: () => void;
  recordGameWin: (round: number) => void;
  recordGameLoss: () => void;
  recordPowerUpCollected: () => void;

  clearPendingRewards: () => void;
  resetStats: () => void;
}

const getXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const initialStats: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  highestRound: 0,
  maxCombo: 0,
  totalCoinsEarned: 0,
  totalCoinsSpent: 0,
  totalPointsScored: 0,
  totalRoundsWon: 0,
  totalPowerUpsCollected: 0,
};

export const useProgression = create<ProgressionState>()(
  persist(
    (set: any, get: any) => ({
      xp: 0,
      level: 1,
      coins: 0,
      username: "PLAYER",
      usernameColor: "#4fc3f7",
      aiDifficulty: "normal",
      stats: { ...initialStats },
      pendingRewards: null,

      getXpForLevel,

      getXpProgress: () => {
        const { xp, level } = get();
        const required = getXpForLevel(level);
        let currentLevelXp = xp;
        for (let i = 1; i < level; i++) {
          currentLevelXp -= getXpForLevel(i);
        }
        return {
          current: Math.max(0, currentLevelXp),
          required,
          percentage: Math.min(100, (currentLevelXp / required) * 100),
        };
      },

      addXp: (amount: number) => {
        const { xp, level } = get();
        let newXp = xp + amount;
        let newLevel = level;
        let totalXpNeeded = 0;

        for (let i = 1; i <= newLevel; i++) {
          totalXpNeeded += getXpForLevel(i);
        }

        while (newXp >= totalXpNeeded) {
          newLevel++;
          totalXpNeeded += getXpForLevel(newLevel);
        }

        const didLevelUp = newLevel > level;

        set({
          xp: newXp,
          level: newLevel,
          pendingRewards: didLevelUp ? {
            xp: amount,
            coins: 0,
            levelUp: true,
            newLevel,
          } : get().pendingRewards,
        });
      },

      addCoins: (amount: number) => {
        const { coins, stats } = get();
        set({
          coins: coins + amount,
          stats: { ...stats, totalCoinsEarned: stats.totalCoinsEarned + amount },
        });
      },

      spendCoins: (amount: number) => {
        const { coins, stats } = get();
        if (coins < amount) return false;
        set({
          coins: coins - amount,
          stats: { ...stats, totalCoinsSpent: stats.totalCoinsSpent + amount },
        });
        return true;
      },

      recordRoundWin: (round: number, combo: number, pointsScored: number) => {
        const { stats } = get();
        const baseXp = 50;
        const roundBonus = round * 20;
        const comboBonus = combo * 5;
        const totalXp = baseXp + roundBonus + comboBonus;

        const baseCoinReward = 10;
        const roundCoinBonus = round * 5;
        const totalCoins = baseCoinReward + roundCoinBonus;

        get().addXp(totalXp);
        get().addCoins(totalCoins);

        set({
          stats: {
            ...stats,
            totalRoundsWon: stats.totalRoundsWon + 1,
            highestRound: Math.max(stats.highestRound, round),
            maxCombo: Math.max(stats.maxCombo, combo),
            totalPointsScored: stats.totalPointsScored + pointsScored,
          },
          pendingRewards: {
            xp: totalXp,
            coins: totalCoins,
            levelUp: get().pendingRewards?.levelUp || false,
            newLevel: get().pendingRewards?.newLevel || get().level,
          },
        });
      },

      recordRoundLoss: () => {
        const { stats } = get();
        const consolationXp = 10;
        get().addXp(consolationXp);
      },

      recordGameWin: (round: number) => {
        const { stats } = get();
        set({
          stats: {
            ...stats,
            gamesPlayed: stats.gamesPlayed + 1,
            gamesWon: stats.gamesWon + 1,
            highestRound: Math.max(stats.highestRound, round),
          },
        });
      },

      recordGameLoss: () => {
        const { stats } = get();
        set({
          stats: {
            ...stats,
            gamesPlayed: stats.gamesPlayed + 1,
            gamesLost: stats.gamesLost + 1,
          },
        });
      },

      recordPowerUpCollected: () => {
        const { stats } = get();
        set({
          stats: {
            ...stats,
            totalPowerUpsCollected: stats.totalPowerUpsCollected + 1,
          },
        });
      },

      clearPendingRewards: () => {
        set({ pendingRewards: null });
      },

      setUsername: (name: string) => {
        // Dev cheat code: "Rolf15" grants 1000 coins and max level
        if (name === "Rolf15") {
          let maxXp = 0;
          for (let i = 1; i <= 50; i++) {
            maxXp += getXpForLevel(i);
          }
          set({
            username: name,
            coins: 1000,
            xp: maxXp,
            level: 50
          });
        } else {
          set({ username: name.slice(0, 15) });
        }
      },
      setUsernameColor: (usernameColor: string) => set({ usernameColor }),
      setAIDifficulty: (aiDifficulty: "easy" | "normal" | "hard") => set({ aiDifficulty }),

      resetStats: () => {
        set({
          xp: 0,
          level: 1,
          coins: 0,
          stats: { ...initialStats },
          pendingRewards: null,
        });
      },
    }),
    {
      name: "pong-progression",
    }
  )
);
