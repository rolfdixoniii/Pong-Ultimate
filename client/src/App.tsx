import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import "@fontsource/inter";
import { GameScene } from "./components/game/GameScene";
import { GameHUD } from "./components/game/GameHUD";
import { SoundManager } from "./components/game/SoundManager";
import { TouchControls } from "./components/game/TouchControls";

const controls = [
  // Player 1 controls (W/S)
  { name: "p1Forward", keys: ["KeyW"] },
  { name: "p1Backward", keys: ["KeyS"] },
  // Player 2 controls (Arrow keys)
  { name: "p2Forward", keys: ["ArrowUp"] },
  { name: "p2Backward", keys: ["ArrowDown"] },
];

function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [dpr, setDpr] = useState(2);

  useEffect(() => {
    setShowCanvas(true);
  }, []);

  // Prevent arrow keys from scrolling the page during gameplay
  useEffect(() => {
    const preventScroll = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventScroll, { passive: false });
    return () => window.removeEventListener('keydown', preventScroll);
  }, []);

  return (
    <div style={{ width: '100vw', minHeight: '100vh', position: 'relative', overflow: 'auto' }}>
      {showCanvas && (
        <KeyboardControls map={controls}>
          <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <Canvas
              camera={{
                position: [0, 15, 18],
                fov: 50,
                near: 0.1,
                far: 150
              }}
              dpr={dpr}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
              }}
              performance={{ min: 0.5 }}
            >
              <PerformanceMonitor
                onIncline={() => setDpr(Math.min(dpr + 0.25, 2))}
                onDecline={() => setDpr(Math.max(dpr - 0.25, 1))}
              />

              <color attach="background" args={["#050508"]} />

              <ambientLight intensity={0.5} />
              <directionalLight
                position={[10, 20, 5]}
                intensity={1.3}
              />
              <pointLight position={[-10, 10, -10]} intensity={0.6} color="#4fc3f7" />
              <pointLight position={[10, 10, -10]} intensity={0.6} color="#ef5350" />

              <fog attach="fog" args={["#050508", 40, 80]} />

              <Suspense fallback={null}>
                <GameScene />
                <EffectComposer>
                  <Bloom
                    intensity={0.4}
                    luminanceThreshold={0.6}
                    luminanceSmoothing={0.9}
                    mipmapBlur
                  />
                  <Vignette darkness={0.3} offset={0.3} />
                </EffectComposer>
              </Suspense>
            </Canvas>

            <GameHUD />
            <TouchControls />
            <SoundManager />
          </div>
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
