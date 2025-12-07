import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import { GameScene } from "./components/game/GameScene";
import { GameHUD } from "./components/game/GameHUD";
import { SoundManager } from "./components/game/SoundManager";

const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
];

function App() {
  const [showCanvas, setShowCanvas] = useState(false);

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
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            <color attach="background" args={["#0a0a0f"]} />
            
            <ambientLight intensity={0.3} />
            <directionalLight 
              position={[10, 20, 5]} 
              intensity={1} 
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color="#4fc3f7" />
            <pointLight position={[10, 10, -10]} intensity={0.5} color="#ef5350" />
            
            <Suspense fallback={null}>
              <GameScene />
            </Suspense>
          </Canvas>
          
          <GameHUD />
          <SoundManager />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
