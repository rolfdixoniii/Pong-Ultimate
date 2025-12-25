import { useAchievements, ACHIEVEMENTS, Achievement, AchievementId } from "@/lib/stores/useAchievements";

interface AchievementsMenuProps {
  onBack: () => void;
}

export function AchievementsMenu({ onBack }: AchievementsMenuProps) {
  const { progress, getUnlockedCount, getTotalCount, getCompletionPercentage } = useAchievements();
  
  const categories: { id: Achievement["category"]; label: string; color: string }[] = [
    { id: "gameplay", label: "Gameplay", color: "cyan" },
    { id: "progression", label: "Progression", color: "yellow" },
    { id: "powerup", label: "Power-ups", color: "green" },
    { id: "skill", label: "Skill", color: "purple" },
  ];

  const getAchievementsByCategory = (category: Achievement["category"]) => {
    return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
  };

  const completionPercent = getCompletionPercentage();

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="self-start mb-4 px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <span className="text-xl">&larr;</span> Back to Menu
      </button>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">ACHIEVEMENTS</h2>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-gray-400">
          {getUnlockedCount()} / {getTotalCount()} Unlocked
        </div>
        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="text-cyan-400 font-bold">{completionPercent}%</div>
      </div>

      <div className="w-full space-y-8">
        {categories.map(category => {
          const achievements = getAchievementsByCategory(category.id);
          const unlockedInCategory = achievements.filter(a => progress[a.id]?.unlocked).length;
          
          return (
            <div key={category.id} className="w-full">
              <div className="flex items-center gap-3 mb-4">
                <h3 className={`text-xl font-bold text-${category.color}-400`}>
                  {category.label}
                </h3>
                <span className="text-gray-500 text-sm">
                  ({unlockedInCategory}/{achievements.length})
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.map(achievement => {
                  const achievementProgress = progress[achievement.id];
                  const isUnlocked = achievementProgress?.unlocked;
                  const currentProgress = achievementProgress?.progress || 0;
                  const progressPercent = Math.min((currentProgress / achievement.maxProgress) * 100, 100);
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isUnlocked 
                          ? 'bg-gray-800/80 border-cyan-500/50' 
                          : 'bg-gray-900/60 border-gray-700/50 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                              {achievement.name}
                            </h4>
                            {isUnlocked && (
                              <span className="text-green-400 text-xs">Unlocked!</span>
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-2">
                            {achievement.description}
                          </p>
                          
                          {!isUnlocked && achievement.maxProgress > 1 && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-cyan-500 transition-all duration-300"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {currentProgress}/{achievement.maxProgress}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex gap-3 mt-2 text-xs">
                            <span className="text-cyan-400">+{achievement.xpReward} XP</span>
                            <span className="text-yellow-400">+{achievement.coinReward} Coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
