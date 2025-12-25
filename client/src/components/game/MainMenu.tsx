import { usePong } from "@/lib/stores/usePong";
import { useSkins } from "@/lib/stores/useSkins";
import { useAudio } from "@/lib/stores/useAudio";
import { useProgression } from "@/lib/stores/useProgression";
import { useAchievements } from "@/lib/stores/useAchievements";
import { useGameSpeed } from "@/lib/stores/useGameSpeed";
import { AchievementsMenu } from "./AchievementsMenu";

export function MainMenu() {
  const { startGame, resetGame } = usePong();
  const { playerSkin, aiSkin, unlockedSkins, paddleSkins, selectPlayerSkin, selectAISkin, unlockSkin, selectedMap, unlockedMaps, gameMaps, selectMap, unlockMap, canUnlockSkin, canUnlockMap } = useSkins();
  const { isMuted, toggleMute } = useAudio();
  const menuState = usePong(state => state.menuState);
  const setMenuState = usePong(state => state.setMenuState);
  const { level, coins, stats, spendCoins, getXpProgress } = useProgression();
  const xpProgress = getXpProgress();
  const gameSpeed = useGameSpeed(state => state.gameSpeed);
  const setGameSpeed = useGameSpeed(state => state.setGameSpeed);
  
  if (menuState === "main") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black pointer-events-auto px-4">
        <div className="absolute top-4 md:top-8 left-4 md:left-8 bg-gray-800/80 rounded-lg p-3 md:p-4 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-yellow-400 font-bold text-lg md:text-xl">LVL {level}</div>
            <div className="text-yellow-500 font-semibold">💰 {coins}</div>
          </div>
          <div className="w-32 md:w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${xpProgress.percentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {xpProgress.current} / {xpProgress.required} XP
          </div>
        </div>
        
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 md:mb-4 animate-pulse-subtle">3D PONG</h1>
          <p className="text-base md:text-xl text-gray-400 mb-8 md:mb-12">Classic arcade game reimagined</p>
          
          <div className="flex flex-col gap-3 md:gap-4">
            <button 
              onClick={startGame}
              className="px-8 md:px-12 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 text-white text-xl md:text-2xl font-bold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
            >
              START GAME
            </button>
            
            <button 
              onClick={() => setMenuState("skins")}
              className="px-8 md:px-12 py-3 md:py-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-400 text-white text-lg md:text-xl font-bold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
            >
              SKINS & MAPS
            </button>
            
            <button 
              onClick={() => setMenuState("achievements")}
              className="px-8 md:px-12 py-3 md:py-4 bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-white text-lg md:text-xl font-bold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30"
            >
              ACHIEVEMENTS
            </button>
            
            <button 
              onClick={() => setMenuState("settings")}
              className="px-8 md:px-12 py-3 md:py-4 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-lg md:text-xl font-bold rounded-lg transition-all duration-200 hover:scale-105"
            >
              SETTINGS
            </button>
          </div>
          
          <div className="mt-6 md:mt-8 text-gray-500 text-sm md:text-base">
            <p className="hidden md:block">Use W/S or Arrow Keys to move your paddle</p>
            <p className="md:hidden">Touch buttons to move your paddle</p>
            <p>First to 5 points wins!</p>
            <p className="mt-2 text-yellow-500">Win rounds to earn XP and coins!</p>
            <p className="mt-1 text-green-400 text-xs md:text-sm">Level up to unlock new skins and maps!</p>
          </div>
        </div>
        
        <div className="absolute top-4 md:top-8 right-4 md:right-8 bg-gray-800/80 rounded-lg p-3 md:p-4 text-right text-xs md:text-sm animate-fadeIn">
          <div className="text-gray-400">Games: {stats.gamesPlayed}</div>
          <div className="text-green-400">Wins: {stats.gamesWon}</div>
          <div className="text-cyan-400">Best Combo: {stats.maxCombo}x</div>
        </div>
        
        <button 
          onClick={toggleMute}
          className="absolute bottom-4 md:bottom-8 right-4 md:right-8 px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-sm md:text-base rounded pointer-events-auto z-40"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>
    );
  }
  
  if (menuState === "skins") {
    const allSkins = Object.values(paddleSkins);
    
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black pointer-events-auto px-4">
        <button 
          onClick={() => setMenuState("main")}
          className="absolute top-4 md:top-8 left-4 md:left-8 px-4 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-sm md:text-base font-bold rounded-lg transition-colors"
        >
          ← BACK
        </button>
        
        <div className="text-center mb-6 mt-16 md:mt-0">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-1">SKINS & MAPS</h1>
          <p className="text-gray-400 text-sm md:text-base">Customize your game experience</p>
        </div>
        
        <div className="flex gap-4 mb-6 flex-wrap justify-center">
          <button
            onClick={() => {}}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 text-white font-bold rounded transition-colors"
          >
            PADDLE SKINS
          </button>
          <button
            onClick={() => setMenuState("maps")}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-400 text-white font-bold rounded transition-colors"
          >
            MAPS
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl overflow-y-auto max-h-[50vh]">
          {allSkins.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isPlayerSelected = playerSkin === skin.id;
            const isAISelected = aiSkin === skin.id;
            
            return (
              <div 
                key={skin.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isUnlocked 
                    ? 'border-cyan-500 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-600 bg-gray-900 opacity-50'
                }`}
              >
                <h3 className="text-lg md:text-xl font-bold text-white">{skin.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{skin.description}</p>
                
                <div 
                  className="w-full h-12 rounded mb-3 border border-gray-600"
                  style={{ 
                    backgroundColor: skin.color,
                    boxShadow: `0 0 10px ${skin.emissiveColor}` 
                  }}
                />
                
                {!isUnlocked && (() => {
                  const unlockCheck = canUnlockSkin(skin.id, level, coins);
                  return (
                    <div className="flex flex-col items-center">
                      <p className="text-yellow-400 text-sm font-semibold mb-1">🔒 LOCKED</p>
                      <p className="text-gray-400 text-xs">Lvl {skin.levelRequired} | 💰 {skin.coinCost}</p>
                      {!unlockCheck.canUnlock && unlockCheck.reason !== "Already unlocked" && (
                        <p className="text-red-400 text-xs mb-2">{unlockCheck.reason}</p>
                      )}
                      <button
                        onClick={() => {
                          const result = unlockSkin(skin.id, level, coins);
                          if (result.success && result.cost) {
                            spendCoins(result.cost);
                          }
                        }}
                        disabled={!unlockCheck.canUnlock}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors mt-2 ${
                          unlockCheck.canUnlock
                            ? 'bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        UNLOCK
                      </button>
                    </div>
                  );
                })()}
                
                {isUnlocked && (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => selectPlayerSkin(skin.id)}
                      className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                        isPlayerSelected
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {isPlayerSelected ? '✓ Player' : 'Player'}
                    </button>
                    <button
                      onClick={() => selectAISkin(skin.id)}
                      className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                        isAISelected
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {isAISelected ? '✓ AI' : 'AI'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (menuState === "maps") {
    const allMaps = Object.values(gameMaps);
    
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black pointer-events-auto px-4">
        <button 
          onClick={() => setMenuState("skins")}
          className="absolute top-4 md:top-8 left-4 md:left-8 px-4 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-sm md:text-base font-bold rounded-lg transition-colors"
        >
          ← BACK
        </button>
        
        <div className="text-center mb-6 mt-16 md:mt-0">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-1">GAME MAPS</h1>
          <p className="text-gray-400 text-sm md:text-base">Unlock maps by winning rounds! ({unlockedMaps.length}/{allMaps.length})</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl overflow-y-auto max-h-[50vh]">
          {allMaps.map((map) => {
            const isUnlocked = unlockedMaps.includes(map.id);
            const isSelected = selectedMap === map.id;
            
            return (
              <div 
                key={map.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isUnlocked 
                    ? 'border-orange-500 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-600 bg-gray-900 opacity-50'
                }`}
              >
                <h3 className="text-lg md:text-xl font-bold text-white">{map.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{map.description}</p>
                
                <div className="flex gap-2 mb-3">
                  <div 
                    className="flex-1 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: map.floorColor }}
                    title="Floor Color"
                  />
                  <div 
                    className="flex-1 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: map.wallColor }}
                    title="Wall Color"
                  />
                  <div 
                    className="flex-1 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: map.accentColor }}
                    title="Accent Color"
                  />
                </div>
                
                {!isUnlocked && (() => {
                  const unlockCheck = canUnlockMap(map.id, level, coins);
                  return (
                    <div className="flex flex-col items-center">
                      <p className="text-yellow-400 text-sm font-semibold mb-1">🔒 LOCKED</p>
                      <p className="text-gray-400 text-xs">Lvl {map.levelRequired} | 💰 {map.coinCost}</p>
                      {!unlockCheck.canUnlock && unlockCheck.reason !== "Already unlocked" && (
                        <p className="text-red-400 text-xs mb-2">{unlockCheck.reason}</p>
                      )}
                      <button
                        onClick={() => {
                          const result = unlockMap(map.id, level, coins);
                          if (result.success && result.cost) {
                            spendCoins(result.cost);
                          }
                        }}
                        disabled={!unlockCheck.canUnlock}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors mt-2 ${
                          unlockCheck.canUnlock
                            ? 'bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        UNLOCK
                      </button>
                    </div>
                  );
                })()}
                
                {isUnlocked && (
                  <button
                    onClick={() => selectMap(map.id)}
                    className={`w-full px-4 py-2 rounded text-sm font-bold transition-colors ${
                      isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {isSelected ? '✓ SELECTED' : 'SELECT'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  if (menuState === "settings") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black pointer-events-auto px-4">
        <button 
          onClick={() => setMenuState("main")}
          className="absolute top-4 md:top-8 left-4 md:left-8 px-4 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-sm md:text-base font-bold rounded-lg transition-colors"
        >
          ← BACK
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">SETTINGS</h1>
          
          <div className="bg-gray-800 p-6 md:p-8 rounded-lg max-w-lg mb-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-white text-lg">Sound</span>
                <button 
                  onClick={toggleMute}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-bold rounded transition-colors"
                >
                  {isMuted ? "OFF" : "ON"}
                </button>
              </div>
            </div>
            
            <div>
              <div className="text-white text-lg mb-3 font-semibold">Game Speed</div>
              <div className="grid grid-cols-4 gap-2">
                {(["slow", "medium", "fast", "superfast"] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setGameSpeed(speed)}
                    className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
                      gameSpeed === speed
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-gray-400 text-sm text-left">
              <p className="font-semibold text-white mb-2">Game Info:</p>
              <p>• Win 5 points to win a round</p>
              <p>• Win multiple rounds to face tougher AI</p>
              <p>• Collect power-ups for advantages</p>
              <p>• Build combos for higher scores</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (menuState === "achievements") {
    return (
      <div className="absolute inset-0 overflow-auto bg-gradient-to-b from-gray-900 to-black pointer-events-auto px-4 py-8">
        <AchievementsMenu onBack={() => setMenuState("main")} />
      </div>
    );
  }
  
  return null;
}
