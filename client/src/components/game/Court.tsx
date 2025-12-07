import * as THREE from "three";

const COURT_WIDTH = 20;
const COURT_DEPTH = 14;
const WALL_HEIGHT = 1;
const WALL_THICKNESS = 0.5;

export function Court() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[COURT_WIDTH, COURT_DEPTH]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      <mesh position={[0, WALL_HEIGHT / 2, -COURT_DEPTH / 2 - WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[COURT_WIDTH + WALL_THICKNESS * 2, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      
      <mesh position={[0, WALL_HEIGHT / 2, COURT_DEPTH / 2 + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[COURT_WIDTH + WALL_THICKNESS * 2, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      
      <CenterLine />
    </group>
  );
}

function CenterLine() {
  const segments = 7;
  const segmentLength = COURT_DEPTH / (segments * 2 - 1);
  
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh 
          key={i} 
          position={[0, 0.01, -COURT_DEPTH / 2 + segmentLength / 2 + i * segmentLength * 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.1, segmentLength * 0.8]} />
          <meshBasicMaterial color="#4a4a6a" />
        </mesh>
      ))}
    </group>
  );
}

export { COURT_WIDTH, COURT_DEPTH };
