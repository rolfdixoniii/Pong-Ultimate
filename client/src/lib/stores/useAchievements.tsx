import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AchievementId =
  | "first_victory"
  | "winning_streak_3"
  | "winning_streak_5"
  | "winning_streak_10"
  | "combo_5"
  | "combo_10"
  | "combo_15"
  | "untouchable"
  | "comeback_kid"
  | "rising_star_5"
  | "rising_star_10"
  | "rising_star_15"
  | "coin_collector_100"
  | "coin_collector_500"
  | "coin_collector_1000"
  | "fashionista"
  | "world_traveler"
  | "awakened_first"
  | "awakened_master"
  | "power_first_trigger"
  | "power_multiple_triggers"
  | "second_chance_used"
  | "shield_hero"
  | "multiball_madness"
  | "speed_demon"
  | "big_paddle_energy"
  | "curve_master"
  | "quick_reflexes"
  | "round_champion_5"
  | "round_champion_10";

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  category: "gameplay" | "progression" | "powerup" | "skill";
  maxProgress: number;
  xpReward: number;
  coinReward: number;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_victory: {
    id: "first_victory",
    name: "First Victory",
    description: "Win your first round",
    icon: "🏆",
    category: "gameplay",
    maxProgress: 1,
    xpReward: 50,
    coinReward: 10,
  },
  winning_streak_3: {
    id: "winning_streak_3",
    name: "Hot Streak",
    description: "Win 3 rounds in a row",
    icon: "🔥",
    category: "gameplay",
    maxProgress: 3,
    xpReward: 100,
    coinReward: 25,
  },
  winning_streak_5: {
    id: "winning_streak_5",
    name: "On Fire",
    description: "Win 5 rounds in a row",
    icon: "🔥",
    category: "gameplay",
    maxProgress: 5,
    xpReward: 200,
    coinReward: 50,
  },
  winning_streak_10: {
    id: "winning_streak_10",
    name: "Unstoppable",
    description: "Win 10 rounds in a row",
    icon: "💎",
    category: "gameplay",
    maxProgress: 10,
    xpReward: 500,
    coinReward: 100,
  },
  combo_5: {
    id: "combo_5",
    name: "Combo Starter",
    description: "Achieve a 5x combo",
    icon: "⚡",
    category: "gameplay",
    maxProgress: 1,
    xpReward: 75,
    coinReward: 15,
  },
  combo_10: {
    id: "combo_10",
    name: "Combo Master",
    description: "Achieve a 10x combo",
    icon: "⚡",
    category: "gameplay",
    maxProgress: 1,
    xpReward: 150,
    coinReward: 30,
  },
  combo_15: {
    id: "combo_15",
    name: "Combo Legend",
    description: "Achieve a 15x combo",
    icon: "👑",
    category: "gameplay",
    maxProgress: 1,
    xpReward: 300,
    coinReward: 60,
  },
  untouchable: {
    id: "untouchable",
    name: "Untouchable",
    description: "Win a round without the AI scoring",
    icon: "🛡️",
    category: "skill",
    maxProgress: 1,
    xpReward: 200,
    coinReward: 40,
  },
  comeback_kid: {
    id: "comeback_kid",
    name: "Comeback Kid",
    description: "Win after being down 4-0",
    icon: "💪",
    category: "skill",
    maxProgress: 1,
    xpReward: 250,
    coinReward: 50,
  },
  rising_star_5: {
    id: "rising_star_5",
    name: "Rising Star",
    description: "Reach Level 5",
    icon: "⭐",
    category: "progression",
    maxProgress: 5,
    xpReward: 100,
    coinReward: 25,
  },
  rising_star_10: {
    id: "rising_star_10",
    name: "Shining Star",
    description: "Reach Level 10",
    icon: "🌟",
    category: "progression",
    maxProgress: 10,
    xpReward: 250,
    coinReward: 50,
  },
  rising_star_15: {
    id: "rising_star_15",
    name: "Superstar",
    description: "Reach Level 15",
    icon: "✨",
    category: "progression",
    maxProgress: 15,
    xpReward: 500,
    coinReward: 100,
  },
  coin_collector_100: {
    id: "coin_collector_100",
    name: "Coin Collector",
    description: "Earn 100 total coins",
    icon: "💰",
    category: "progression",
    maxProgress: 100,
    xpReward: 50,
    coinReward: 10,
  },
  coin_collector_500: {
    id: "coin_collector_500",
    name: "Treasure Hunter",
    description: "Earn 500 total coins",
    icon: "💰",
    category: "progression",
    maxProgress: 500,
    xpReward: 150,
    coinReward: 30,
  },
  coin_collector_1000: {
    id: "coin_collector_1000",
    name: "Rich Player",
    description: "Earn 1000 total coins",
    icon: "💎",
    category: "progression",
    maxProgress: 1000,
    xpReward: 300,
    coinReward: 50,
  },
  fashionista: {
    id: "fashionista",
    name: "Fashionista",
    description: "Unlock all paddle skins",
    icon: "🎨",
    category: "progression",
    maxProgress: 5,
    xpReward: 300,
    coinReward: 50,
  },
  world_traveler: {
    id: "world_traveler",
    name: "World Traveler",
    description: "Unlock all maps",
    icon: "🌍",
    category: "progression",
    maxProgress: 5,
    xpReward: 300,
    coinReward: 50,
  },
  awakened_first: {
    id: "awakened_first",
    name: "Awakened Spirit",
    description: "Unlock your first awakened paddle skin",
    icon: "✨",
    category: "progression",
    maxProgress: 1,
    xpReward: 200,
    coinReward: 40,
  },
  awakened_master: {
    id: "awakened_master",
    name: "Master of the Awakened",
    description: "Unlock all awakened paddle skins",
    icon: "💫",
    category: "progression",
    maxProgress: 5,
    xpReward: 500,
    coinReward: 100,
  },
  power_first_trigger: {
    id: "power_first_trigger",
    name: "Power Activated",
    description: "Trigger your first awakened skin power",
    icon: "⚡",
    category: "powerup",
    maxProgress: 1,
    xpReward: 150,
    coinReward: 30,
  },
  power_multiple_triggers: {
    id: "power_multiple_triggers",
    name: "Power Surge",
    description: "Trigger 10 awakened skin powers in a single game",
    icon: "🔥",
    category: "powerup",
    maxProgress: 10,
    xpReward: 300,
    coinReward: 50,
  },
  second_chance_used: {
    id: "second_chance_used",
    name: "Second Chance",
    description: "Block a goal using the Second Chance awakened power",
    icon: "🛡️",
    category: "powerup",
    maxProgress: 1,
    xpReward: 100,
    coinReward: 20,
  },
  shield_hero: {
    id: "shield_hero",
    name: "Shield Hero",
    description: "Block 10 goals with shields",
    icon: "🛡️",
    category: "powerup",
    maxProgress: 10,
    xpReward: 150,
    coinReward: 30,
  },
  multiball_madness: {
    id: "multiball_madness",
    name: "Multiball Madness",
    description: "Score with a multiball",
    icon: "🎱",
    category: "powerup",
    maxProgress: 1,
    xpReward: 100,
    coinReward: 20,
  },
  speed_demon: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Win a round while speed boosted",
    icon: "💨",
    category: "powerup",
    maxProgress: 1,
    xpReward: 100,
    coinReward: 20,
  },
  big_paddle_energy: {
    id: "big_paddle_energy",
    name: "Big Paddle Energy",
    description: "Score 5 times with big paddle active",
    icon: "📏",
    category: "powerup",
    maxProgress: 5,
    xpReward: 100,
    coinReward: 20,
  },
  curve_master: {
    id: "curve_master",
    name: "Curve Master",
    description: "Score with a curved ball",
    icon: "🌀",
    category: "skill",
    maxProgress: 1,
    xpReward: 75,
    coinReward: 15,
  },
  quick_reflexes: {
    id: "quick_reflexes",
    name: "Quick Reflexes",
    description: "Win a round in under 60 seconds",
    icon: "⏱️",
    category: "skill",
    maxProgress: 1,
    xpReward: 150,
    coinReward: 30,
  },
  round_champion_5: {
    id: "round_champion_5",
    name: "Round Champion",
    description: "Reach Round 5",
    icon: "🏅",
    category: "skill",
    maxProgress: 5,
    xpReward: 200,
    coinReward: 40,
  },
  round_champion_10: {
    id: "round_champion_10",
    name: "Legendary Champion",
    description: "Reach Round 10",
    icon: "👑",
    category: "skill",
    maxProgress: 10,
    xpReward: 500,
    coinReward: 100,
  },
};

interface AchievementProgress {
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
  rewardsClaimed?: boolean;
}

interface PendingAchievement {
  id: AchievementId;
  achievement: Achievement;
}

interface AchievementsState {
  progress: Record<AchievementId, AchievementProgress>;
  pendingNotifications: PendingAchievement[];
  currentStreak: number;

  updateProgress: (id: AchievementId, amount: number) => void;
  setProgress: (id: AchievementId, value: number) => void;
  checkAndUnlock: (id: AchievementId) => boolean;
  getProgress: (id: AchievementId) => AchievementProgress;
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  getCompletionPercentage: () => number;
  popNotification: () => PendingAchievement | null;
  incrementStreak: () => void;
  resetStreak: () => void;
  getAchievementsByCategory: (category: Achievement["category"]) => Achievement[];
  claimReward: (id: AchievementId) => boolean;
  getUnclaimedCount: () => number;
}

const initializeProgress = (): Record<AchievementId, AchievementProgress> => {
  const progress: Partial<Record<AchievementId, AchievementProgress>> = {};
  for (const id of Object.keys(ACHIEVEMENTS) as AchievementId[]) {
    progress[id] = { progress: 0, unlocked: false };
  }
  return progress as Record<AchievementId, AchievementProgress>;
};

export const useAchievements = create<AchievementsState>()(
  persist(
    (set: any, get: any) => ({
      progress: initializeProgress(),
      pendingNotifications: [],
      currentStreak: 0,

      updateProgress: (id: AchievementId, amount: number) => {
        const achievement = ACHIEVEMENTS[id];
        if (!achievement) return;

        const { progress, setProgress } = get();
        const current = progress[id] || { progress: 0, unlocked: false };

        if (current.unlocked) return;

        return setProgress(id, current.progress + amount);
      },

      setProgress: (id: AchievementId, value: number) => {
        const achievement = ACHIEVEMENTS[id];
        if (!achievement) return false;

        const { progress, pendingNotifications } = get();
        const current = progress[id] || { progress: 0, unlocked: false };

        if (current.unlocked) return false;

        const newProgress = Math.min(value, achievement.maxProgress);

        if (newProgress === current.progress && newProgress < achievement.maxProgress) {
          return false;
        }

        // Update state first
        set({
          progress: {
            ...progress,
            [id]: {
              ...current,
              progress: newProgress,
            },
          },
        });

        // Re-get for consistency
        if (newProgress >= achievement.maxProgress) {
          const updatedProgress = get().progress;
          set({
            progress: {
              ...updatedProgress,
              [id]: {
                ...updatedProgress[id],
                unlocked: true,
                unlockedAt: Date.now(),
              },
            },
            pendingNotifications: [...pendingNotifications, { id, achievement }],
          });
        }
        return true;
      },

      checkAndUnlock: (id: AchievementId) => {
        const { progress, pendingNotifications } = get();
        const current = progress[id] || { progress: 0, unlocked: false };
        const achievement = ACHIEVEMENTS[id];

        if (!achievement || current.unlocked) return false;

        if (current.progress >= achievement.maxProgress) {
          set({
            progress: {
              ...progress,
              [id]: {
                ...current,
                unlocked: true,
                unlockedAt: Date.now(),
              },
            },
            pendingNotifications: [...pendingNotifications, { id, achievement }],
          });
          return true;
        }
        return false;
      },

      getProgress: (id: AchievementId) => {
        return get().progress[id] || { progress: 0, unlocked: false };
      },

      getUnlockedCount: () => {
        const { progress } = get();
        return Object.values(progress).filter((p: any) => p.unlocked).length;
      },

      getTotalCount: () => {
        return Object.keys(ACHIEVEMENTS).length;
      },

      getCompletionPercentage: () => {
        const { getUnlockedCount, getTotalCount } = get();
        return Math.round((getUnlockedCount() / getTotalCount()) * 100);
      },

      popNotification: () => {
        const { pendingNotifications } = get();
        if (pendingNotifications.length === 0) return null;

        const [first, ...rest] = pendingNotifications;
        set({ pendingNotifications: rest });
        return first;
      },

      incrementStreak: () => {
        set((state: any) => ({ currentStreak: state.currentStreak + 1 }));
      },

      resetStreak: () => {
        set({ currentStreak: 0 });
      },

      getAchievementsByCategory: (category: Achievement["category"]) => {
        return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
      },

      claimReward: (id: AchievementId) => {
        const { progress } = get();
        const current = progress[id];

        if (!current || !current.unlocked || current.rewardsClaimed) {
          return false;
        }

        set({
          progress: {
            ...progress,
            [id]: {
              ...current,
              rewardsClaimed: true,
            },
          },
        });
        return true;
      },

      getUnclaimedCount: () => {
        const { progress } = get();
        return Object.values(progress).filter((p: any) => p.unlocked && !p.rewardsClaimed).length;
      },
    }),
    {
      name: "pong-achievements",
      partialize: (state: any) => ({
        progress: state.progress,
        currentStreak: state.currentStreak,
      }),
      merge: (persistedState: any, currentState: any) => {
        const persisted = persistedState as Partial<AchievementsState>;
        const mergedProgress = { ...initializeProgress() };

        if (persisted?.progress) {
          for (const id of Object.keys(persisted.progress) as AchievementId[]) {
            if (mergedProgress[id] && persisted.progress[id]) {
              mergedProgress[id] = persisted.progress[id];
            }
          }
        }

        return {
          ...currentState,
          progress: mergedProgress,
          currentStreak: persisted?.currentStreak ?? 0,
        };
      },
    }
  )
);
