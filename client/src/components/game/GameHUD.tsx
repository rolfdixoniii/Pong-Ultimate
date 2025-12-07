import { usePong } from "@/lib/stores/usePong";
import { useAudio } from "@/lib/stores/useAudio";

export function GameHUD() {
  const { phase, playerScore, aiScore, winner, startGame, resetGame, pauseGame, resumeGame } = usePong();
  const { isMuted, toggleMute } = useAudio();
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {phase === "playing" && (
        <>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-cyan-400 mb-1">PLAYER</div>
              <div className="text-6xl font-bold text-cyan-400">{playerScore}</div>
            </div>
            <div className="text-4xl text-gray-500">-</div>
            <div className="text-center">
              <div className="text-sm text-red-400 mb-1">AI</div>
              <div className="text-6xl font-bold text-red-400">{aiScore}</div>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <div className="text-gray-400 text-sm">
              W / Arrow Up - Move Up | S / Arrow Down - Move Down
            </div>
          </div>
          
          <button 
            onClick={pauseGame}
            className="absolute top-8 right-8 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded pointer-events-auto"
          >
            Pause
          </button>
        </>
      )}
      
      {phase === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8">PAUSED</h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={resumeGame}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-xl rounded-lg"
              >
                Resume
              </button>
              <button 
                onClick={resetGame}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white text-xl rounded-lg"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {phase === "menu" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black pointer-events-auto">
          <div className="text-center">
            <h1 className="text-7xl font-bold text-white mb-4">3D PONG</h1>
            <p className="text-xl text-gray-400 mb-12">Classic arcade game reimagined</p>
            
            <button 
              onClick={startGame}
              className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-2xl font-bold rounded-lg transition-colors"
            >
              START GAME
            </button>
            
            <div className="mt-8 text-gray-500">
              <p>Use W/S or Arrow Keys to move your paddle</p>
              <p>First to 5 points wins!</p>
            </div>
          </div>
        </div>
      )}
      
      {phase === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-4" style={{ color: winner === "player" ? "#4fc3f7" : "#ef5350" }}>
              {winner === "player" ? "YOU WIN!" : "AI WINS!"}
            </h2>
            <div className="text-2xl text-white mb-8">
              Final Score: {playerScore} - {aiScore}
            </div>
            <button 
              onClick={resetGame}
              className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-2xl font-bold rounded-lg transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
      
      <button 
        onClick={toggleMute}
        className="absolute bottom-8 right-8 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded pointer-events-auto"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
    </div>
  );
}
