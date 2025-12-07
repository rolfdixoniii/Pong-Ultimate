import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls, PerformanceMonitor } from "@react-three/drei";
import "@fontsource/inter";
import { GameScene } from "./components/game/GameScene";
import { GameHUD } from "./components/game/GameHUD";
import { SoundManager } from "./components/game/SoundManager";
import { TouchControls } from "./components/game/TouchControls";

const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
];

function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    setShowCanvas(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {showCanvas && (
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={{
              position: [0, 15, 18],
              fov: 50,
              near: 0.1,
              far: 100
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
            
            <color attach="background" args={["#0a0a0f"]} />
            
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 20, 5]} 
              intensity={1.2} 
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-far={50}
              shadow-camera-left={-15}
              shadow-camera-right={15}
              shadow-camera-top={15}
              shadow-camera-bottom={-15}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.6} color="#4fc3f7" />
            <pointLight position={[10, 10, -10]} intensity={0.6} color="#ef5350" />
            
            <fog attach="fog" args={["#0a0a0f", 30, 60]} />
            
            <Suspense fallback={null}>
              <GameScene />
            </Suspense>
          </Canvas>
          
          <GameHUD />
          <TouchControls />
          <SoundManager />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
