import { usePong } from "@/lib/stores/usePong";
import { useSkins } from "@/lib/stores/useSkins";
import { useAudio } from "@/lib/stores/useAudio";

export function MainMenu() {
  const { startGame, resetGame } = usePong();
  const { playerSkin, aiSkin, unlockedSkins, paddleSkins, selectPlayerSkin, selectAISkin, unlockSkin, selectedMap, unlockedMaps, gameMaps, selectMap, unlockMap } = useSkins();
  const { isMuted, toggleMute } = useAudio();
  const menuState = usePong(state => state.menuState);
  const setMenuState = usePong(state => state.setMenuState);
  
  if (menuState === "main") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black pointer-events-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 md:mb-4">3D PONG</h1>
          <p className="text-base md:text-xl text-gray-400 mb-8 md:mb-12">Classic arcade game reimagined</p>
          
          <div className="flex flex-col gap-3 md:gap-4">
            <button 
              onClick={startGame}
              className="px-8 md:px-12 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 text-white text-xl md:text-2xl font-bold rounded-lg transition-colors"
            >
              START GAME
            </button>
            
            <button 
              onClick={() => setMenuState("skins")}
              className="px-8 md:px-12 py-3 md:py-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-400 text-white text-lg md:text-xl font-bold rounded-lg transition-colors"
            >
              SKINS & MAPS
            </button>
            
            <button 
              onClick={() => setMenuState("settings")}
              className="px-8 md:px-12 py-3 md:py-4 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-lg md:text-xl font-bold rounded-lg transition-colors"
            >
              SETTINGS
            </button>
          </div>
          
          <div className="mt-6 md:mt-8 text-gray-500 text-sm md:text-base">
            <p className="hidden md:block">Use W/S or Arrow Keys to move your paddle</p>
            <p className="md:hidden">Touch buttons to move your paddle</p>
            <p>First to 5 points wins!</p>
            <p className="mt-2 text-yellow-500">Win rounds to face harder AI opponents!</p>
            <p className="mt-1 text-green-400 text-xs md:text-sm">Collect power-ups for special abilities!</p>
          </div>
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
                
                {!isUnlocked && (
                  <div className="flex flex-col items-center">
                    <p className="text-yellow-400 text-sm font-semibold mb-2">🔒 LOCKED</p>
                    <button
                      onClick={() => unlockSkin(skin.id)}
                      className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-white font-bold rounded transition-colors"
                    >
                      UNLOCK
                    </button>
                  </div>
                )}
                
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
                
                {!isUnlocked && (
                  <div className="flex flex-col items-center">
                    <p className="text-yellow-400 text-sm font-semibold mb-2">🔒 LOCKED</p>
                    <button
                      onClick={() => unlockMap(map.id)}
                      className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-white font-bold rounded transition-colors"
                    >
                      UNLOCK
                    </button>
                  </div>
                )}
                
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
          
          <div className="bg-gray-800 p-6 md:p-8 rounded-lg max-w-md mb-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-lg">Sound</span>
              <button 
                onClick={toggleMute}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-bold rounded transition-colors"
              >
                {isMuted ? "OFF" : "ON"}
              </button>
            </div>
            
            <div className="text-gray-400 text-sm mb-4 text-left">
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
  
  return null;
}
