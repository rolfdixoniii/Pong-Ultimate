import { useEffect, useState } from "react";
import { useAchievements, Achievement } from "@/lib/stores/useAchievements";

export function AchievementToast() {
  const { popNotification } = useAchievements();
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkNotifications = () => {
      if (!currentAchievement) {
        const notification = popNotification();
        if (notification) {
          setCurrentAchievement(notification.achievement);
          setIsVisible(true);
          
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              setCurrentAchievement(null);
            }, 300);
          }, 4000);
        }
      }
    };

    const interval = setInterval(checkNotifications, 100);
    return () => clearInterval(interval);
  }, [currentAchievement, popNotification]);

  if (!currentAchievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 pointer-events-none ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-1">
        <div className="bg-gray-900 rounded-md p-4 flex items-center gap-4">
          <div className="text-4xl animate-bounce">
            {currentAchievement.icon}
          </div>
          
          <div>
            <div className="text-yellow-400 text-xs font-bold uppercase tracking-wide">
              Achievement Unlocked!
            </div>
            <div className="text-white font-bold text-lg">
              {currentAchievement.name}
            </div>
            <div className="text-gray-400 text-sm">
              {currentAchievement.description}
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              Claim your rewards in Achievements menu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
