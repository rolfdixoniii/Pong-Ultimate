import { usePong } from "@/lib/stores/usePong";
import { useAudio } from "@/lib/stores/useAudio";
import { useProgression } from "@/lib/stores/useProgression";
import { useAchievements } from "@/lib/stores/useAchievements";
import { useSkins } from "@/lib/stores/useSkins";
import { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";

import { MainMenu } from "./MainMenu";
import { AchievementToast } from "./AchievementToast";

export function GameHUD() {
  const phase = usePong(state => state.phase);
  const playerScore = usePong(state => state.playerScore);
  const aiScore = usePong(state => state.aiScore);
  const winner = usePong(state => state.winner);
  const round = usePong(state => state.round);
  const combo = usePong(state => state.combo);
  const maxCombo = usePong(state => state.maxCombo);
  const activeEffects = usePong(state => state.activeEffects);
  const startGame = usePong(state => state.startGame);
  const startNextRound = usePong(state => state.startNextRound);
  const resetGame = usePong(state => state.resetGame);
  const pauseGame = usePong(state => state.pauseGame);
  const resumeGame = usePong(state => state.resumeGame);
  const menuState = usePong(state => state.menuState);
  const playerShield = usePong(state => state.playerShield);
  const aiShield = usePong(state => state.aiShield);
  const multiballs = usePong(state => state.multiballs);
  const playerPowerHits = usePong(state => state.playerPowerHits);
  const activeSkinPower = usePong(state => state.activeSkinPower);
  const powerTriggersThisGame = usePong(state => state.powerTriggersThisGame);
  const { getPlayerPower, unlockedSkins } = useSkins();
  const { isMuted, toggleMute } = useAudio();
  const { level, pendingRewards, clearPendingRewards, recordRoundWin, recordRoundLoss, recordGameWin, recordGameLoss, getXpProgress, coins, stats } = useProgression();
  const { updateProgress, setProgress, incrementStreak, resetStreak, currentStreak } = useAchievements();
  const xpProgress = getXpProgress();
  const prevPhaseRef = useRef(phase);
  const prevWinnerRef = useRef(winner);
  const wasDown4_0 = useRef(false);

  useEffect(() => {
    if (playerScore === 0 && aiScore === 4) {
      wasDown4_0.current = true;
    }
  }, [playerScore, aiScore]);

  useEffect(() => {
    if (prevPhaseRef.current === "playing" && phase === "gameOver") {
      if (winner === "player") {
        recordRoundWin(round, maxCombo, playerScore);
        recordGameWin(round);

        updateProgress("first_victory", 1);

        const newStreak = currentStreak + 1;
        incrementStreak();
        setProgress("winning_streak_3", newStreak);
        setProgress("winning_streak_5", newStreak);
        setProgress("winning_streak_10", newStreak);

        setProgress("round_champion_5", round);
        setProgress("round_champion_10", round);

        if (maxCombo >= 5) updateProgress("combo_5", 1);
        if (maxCombo >= 10) updateProgress("combo_10", 1);
        if (maxCombo >= 15) updateProgress("combo_15", 1);

        if (aiScore === 0) updateProgress("untouchable", 1);

        if (wasDown4_0.current) {
          updateProgress("comeback_kid", 1);
        }
      } else {
        recordRoundLoss();
        recordGameLoss();
        resetStreak();
      }
      wasDown4_0.current = false;
    }
    prevPhaseRef.current = phase;
    prevWinnerRef.current = winner;
  }, [phase, winner, round, maxCombo, playerScore, aiScore, recordRoundWin, recordRoundLoss, recordGameWin, recordGameLoss, updateProgress, setProgress, incrementStreak, resetStreak]);

  useEffect(() => {
    setProgress("rising_star_5", level);
    setProgress("rising_star_10", level);
    setProgress("rising_star_15", level);

    const awokenedCount = unlockedSkins.filter(s =>
      s.includes("awakened")
    ).length;
    if (awokenedCount > 0) {
      updateProgress("awakened_first", 1);
    }
    setProgress("awakened_master", awokenedCount);
  }, [level, setProgress, unlockedSkins, updateProgress]);

  useEffect(() => {
    setProgress("coin_collector_100", stats.totalCoinsEarned);
    setProgress("coin_collector_500", stats.totalCoinsEarned);
    setProgress("coin_collector_1000", stats.totalCoinsEarned);
  }, [stats.totalCoinsEarned, setProgress]);

  useEffect(() => {
    if (activeSkinPower) {
      updateProgress("power_first_trigger", 1);
      if (activeSkinPower.type === "second_chance") {
        updateProgress("second_chance_used", 1);
      }
    }
  }, [activeSkinPower, updateProgress]);

  useEffect(() => {
    if (powerTriggersThisGame > 0) {
      setProgress("power_multiple_triggers", Math.min(powerTriggersThisGame, 10));
    }
  }, [powerTriggersThisGame, setProgress]);
  const [showFlash, setShowFlash] = useState(false);
  const [flashColor, setFlashColor] = useState("#ffffff");
  const prevPlayerScore = useRef(playerScore);
  const prevAiScore = useRef(aiScore);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (playerScore > prevPlayerScore.current) {
      setFlashColor("#4fc3f7");
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
    }
    prevPlayerScore.current = playerScore;
  }, [playerScore]);

  useEffect(() => {
    if (aiScore > prevAiScore.current) {
      setFlashColor("#ef5350");
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
    }
    prevAiScore.current = aiScore;
  }, [aiScore]);

  useEffect(() => {
    if (winner === "player" && phase === "gameOver") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [winner, phase]);

  const playerEffects = activeEffects.filter(e => e.target === "player");

  const getDifficultyLabel = (round: number) => {
    if (round === 1) return "Easy";
    if (round === 2) return "Medium";
    if (round === 3) return "Hard";
    if (round === 4) return "Expert";
    if (round === 5) return "Master";
    return "Legendary";
  };

  const getEffectLabel = (type: string) => {
    switch (type) {
      case "bigPaddle": return "BIG PADDLE";
      case "slowBall": return "SLOW BALL";
      case "speedBoost": return "SPEED BOOST";
      case "multiball": return "MULTIBALL";
      case "shield": return "SHIELD";
      default: return type.toUpperCase();
    }
  };

  const getEffectColor = (type: string) => {
    switch (type) {
      case "bigPaddle": return "text-green-400";
      case "slowBall": return "text-orange-400";
      case "speedBoost": return "text-pink-400";
      case "multiball": return "text-cyan-400";
      case "shield": return "text-yellow-400";
      default: return "text-white";
    }
  };

  if (phase === "menu") {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-auto overflow-auto z-50" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="min-h-full py-8 px-4">
          <MainMenu />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {showFlash && (
        <div
          className="absolute inset-0 pointer-events-none z-50 animate-pulse"
          style={{
            backgroundColor: flashColor,
            opacity: 0.3,
            animation: "flashFade 0.3s ease-out forwards"
          }}
        />
      )}

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={["#4fc3f7", "#ffeb3b", "#4caf50", "#ff9800", "#e91e63"]}
        />
      )}

      {phase === "playing" && (
        <>
          <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="text-xs md:text-sm text-yellow-400 mb-1 md:mb-2 font-semibold flex items-center gap-3">
              ROUND {round} - {getDifficultyLabel(round)}
              {combo > 2 && (
                <span className="text-yellow-300 animate-pulse">
                  {combo}x RALLY
                </span>
              )}
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
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            {(() => {
              const playerPower = getPlayerPower();
              if (playerPower) {
                const progress = Math.min(playerPowerHits / playerPower.hitsRequired, 1);
                const isActive = activeSkinPower?.target === "player";
                return (
                  <div className="px-2 py-1 bg-black/50 rounded mb-1">
                    <div className="text-xs font-bold text-yellow-400 mb-0.5">
                      {isActive ? `${playerPower.powerType.replace('_', ' ').toUpperCase()} ACTIVE!` : playerPower.powerType.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="w-24 h-2 bg-gray-700 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${isActive ? 'bg-yellow-400 animate-pulse' : 'bg-yellow-600'}`}
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{playerPowerHits}/{playerPower.hitsRequired} hits</div>
                  </div>
                );
              }
              return null;
            })()}
            {playerShield && (
              <div className="text-xs md:text-sm font-bold px-2 py-1 bg-black/50 rounded text-cyan-400 animate-pulse">
                YOUR SHIELD
              </div>
            )}
            {multiballs.length > 0 && (
              <div className="text-xs md:text-sm font-bold px-2 py-1 bg-black/50 rounded text-cyan-300">
                MULTIBALLS: {multiballs.length}
              </div>
            )}
            {playerEffects.map((effect, i) => (
              <div
                key={i}
                className={`text-xs md:text-sm font-bold px-2 py-1 bg-black/50 rounded ${getEffectColor(effect.type)}`}
              >
                {getEffectLabel(effect.type)}
              </div>
            ))}
          </div>

          <div className="absolute top-4 right-16 md:right-24 flex flex-col gap-1">
            {aiShield && (
              <div className="text-xs md:text-sm font-bold px-2 py-1 bg-black/50 rounded text-red-400 animate-pulse">
                AI SHIELD
              </div>
            )}
          </div>

          <div className="absolute bottom-28 md:bottom-8 left-1/2 -translate-x-1/2 text-center hidden md:block">
            <div className="text-gray-400 text-sm">
              W / Arrow Up - Move Up | S / Arrow Down - Move Down
            </div>
            <div className="text-gray-500 text-xs mt-1">
              Collect power-ups by hitting them with the ball!
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

      {phase === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto px-4">
          <div className="text-center">
            <div className="text-yellow-400 text-sm md:text-lg mb-1 md:mb-2">Round {round} - {getDifficultyLabel(round)}</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4" style={{ color: winner === "player" ? "#4fc3f7" : "#ef5350" }}>
              {winner === "player" ? "YOU WIN!" : "AI WINS!"}
            </h2>
            <div className="text-xl md:text-2xl text-white mb-2">
              Final Score: {playerScore} - {aiScore}
            </div>

            {pendingRewards && (
              <div className="bg-gray-800/80 rounded-lg p-4 mb-4 inline-block">
                <div className="text-lg md:text-xl font-bold text-white mb-2">REWARDS</div>
                <div className="flex gap-6 justify-center">
                  <div className="text-center">
                    <div className="text-cyan-400 text-2xl font-bold">+{pendingRewards.xp}</div>
                    <div className="text-gray-400 text-sm">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 text-2xl font-bold">+{pendingRewards.coins}</div>
                    <div className="text-gray-400 text-sm">Coins</div>
                  </div>
                </div>
                {pendingRewards.levelUp && (
                  <div className="mt-3 text-green-400 font-bold animate-pulse">
                    LEVEL UP! Now Level {pendingRewards.newLevel}
                  </div>
                )}
              </div>
            )}

            {maxCombo > 1 && (
              <div className="text-yellow-400 text-sm md:text-base mb-4">
                Best Combo: {maxCombo}x
              </div>
            )}

            {winner === "player" ? (
              <div className="flex flex-col gap-3 md:gap-4 items-center">
                <button
                  onClick={() => { clearPendingRewards(); startNextRound(); }}
                  className="px-8 md:px-12 py-3 md:py-4 bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-white text-xl md:text-2xl font-bold rounded-lg transition-colors"
                >
                  NEXT ROUND
                </button>
                <p className="text-yellow-400 text-xs md:text-sm">
                  Round {round + 1} - {getDifficultyLabel(round + 1)} difficulty awaits!
                </p>
                <button
                  onClick={() => { clearPendingRewards(); resetGame(); }}
                  className="px-6 md:px-8 py-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-base md:text-lg rounded-lg transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:gap-4 items-center">
                <button
                  onClick={() => { clearPendingRewards(); startGame(); }}
                  className="px-8 md:px-12 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 text-white text-xl md:text-2xl font-bold rounded-lg transition-colors"
                >
                  TRY AGAIN
                </button>
                <p className="text-gray-400 text-xs md:text-sm">
                  Restart from Round 1
                </p>
                <button
                  onClick={() => { clearPendingRewards(); resetGame(); }}
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

      <AchievementToast />
    </div>
  );
}
