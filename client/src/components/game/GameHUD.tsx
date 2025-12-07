import { usePong } from "@/lib/stores/usePong";
import { useAudio } from "@/lib/stores/useAudio";

export function GameHUD() {
  const { phase, playerScore, aiScore, winner, round, startGame, startNextRound, resetGame, pauseGame, resumeGame } = usePong();
  const { isMuted, toggleMute } = useAudio();
  
  const getDifficultyLabel = (round: number) => {
    if (round === 1) return "Easy";
    if (round === 2) return "Medium";
    if (round === 3) return "Hard";
    if (round === 4) return "Expert";
    if (round === 5) return "Master";
    return "Legendary";
  };
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {phase === "playing" && (
        <>
          <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="text-xs md:text-sm text-yellow-400 mb-1 md:mb-2 font-semibold">
              ROUND {round} - {getDifficultyLabel(round)}
            </div>
            <div className="flex items-center gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-xs md:text-sm text-cyan-400 mb-0.5 md:mb-1">PLAYER</div>
                <div className="text-3xl md:text-6xl font-bold text-cyan-400">{playerScore}</div>
              </div>
              <div className="text-2xl md:text-4xl text-gray-500">-</div>
              <div className="text-center">
                <div className="text-xs md:text-sm text-red-400 mb-0.5 md:mb-1">AI</div>
                <div className="text-3xl md:text-6xl font-bold text-red-400">{aiScore}</div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-28 md:bottom-8 left-1/2 -translate-x-1/2 text-center hidden md:block">
            <div className="text-gray-400 text-sm">
              W / Arrow Up - Move Up | S / Arrow Down - Move Down
            </div>
          </div>
          
          <button 
            onClick={pauseGame}
            className="absolute top-4 md:top-8 right-4 md:right-8 px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-sm md:text-base rounded pointer-events-auto"
          >
            Pause
          </button>
        </>
      )}
      
      {phase === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">PAUSED</h2>
            <div className="text-yellow-400 text-sm md:text-base mb-6 md:mb-8">Round {round} - {getDifficultyLabel(round)}</div>
            <div className="flex gap-3 md:gap-4 justify-center">
              <button 
                onClick={resumeGame}
                className="px-6 md:px-8 py-3 bg-green-600 hover:bg-green-500 active:bg-green-400 text-white text-lg md:text-xl rounded-lg"
              >
                Resume
              </button>
              <button 
                onClick={resetGame}
                className="px-6 md:px-8 py-3 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-lg md:text-xl rounded-lg"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {phase === "menu" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black pointer-events-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 md:mb-4">3D PONG</h1>
            <p className="text-base md:text-xl text-gray-400 mb-8 md:mb-12">Classic arcade game reimagined</p>
            
            <button 
              onClick={startGame}
              className="px-8 md:px-12 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 text-white text-xl md:text-2xl font-bold rounded-lg transition-colors"
            >
              START GAME
            </button>
            
            <div className="mt-6 md:mt-8 text-gray-500 text-sm md:text-base">
              <p className="hidden md:block">Use W/S or Arrow Keys to move your paddle</p>
              <p className="md:hidden">Touch buttons to move your paddle</p>
              <p>First to 5 points wins!</p>
              <p className="mt-2 text-yellow-500">Win rounds to face harder AI opponents!</p>
            </div>
          </div>
        </div>
      )}
      
      {phase === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto px-4">
          <div className="text-center">
            <div className="text-yellow-400 text-sm md:text-lg mb-1 md:mb-2">Round {round} - {getDifficultyLabel(round)}</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4" style={{ color: winner === "player" ? "#4fc3f7" : "#ef5350" }}>
              {winner === "player" ? "YOU WIN!" : "AI WINS!"}
            </h2>
            <div className="text-xl md:text-2xl text-white mb-6 md:mb-8">
              Final Score: {playerScore} - {aiScore}
            </div>
            
            {winner === "player" ? (
              <div className="flex flex-col gap-3 md:gap-4 items-center">
                <button 
                  onClick={startNextRound}
                  className="px-8 md:px-12 py-3 md:py-4 bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-white text-xl md:text-2xl font-bold rounded-lg transition-colors"
                >
                  NEXT ROUND
                </button>
                <p className="text-yellow-400 text-xs md:text-sm">
                  Round {round + 1} - {getDifficultyLabel(round + 1)} difficulty awaits!
                </p>
                <button 
                  onClick={resetGame}
                  className="px-6 md:px-8 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-base md:text-lg rounded-lg transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:gap-4 items-center">
                <button 
                  onClick={startGame}
                  className="px-8 md:px-12 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 text-white text-xl md:text-2xl font-bold rounded-lg transition-colors"
                >
                  TRY AGAIN
                </button>
                <p className="text-gray-400 text-xs md:text-sm">
                  Restart from Round 1
                </p>
                <button 
                  onClick={resetGame}
                  className="px-6 md:px-8 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-base md:text-lg rounded-lg transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <button 
        onClick={toggleMute}
        className="absolute bottom-4 md:bottom-8 right-4 md:right-8 px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-sm md:text-base rounded pointer-events-auto z-40"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
