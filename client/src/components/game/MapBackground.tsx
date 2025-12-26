import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MapStyle, GameMap } from "@/lib/stores/useSkins";

interface MapBackgroundProps {
    mapId: MapStyle;
    mapData: GameMap;
}

// ============================================
// BEACH TENNIS - Beautiful Layered Beach Scene
// ============================================
function BeachBackground() {
    const cloudsRef = useRef<THREE.Group>(null);
    const waveRefs = useRef<THREE.Mesh[]>([]);

    const cloudData = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            x: -50 + i * 25,
            y: 6 + (i % 2) * 3,
            z: -42 - i * 2,
            scaleX: 3 + Math.random() * 2,
            scaleY: 0.8 + Math.random() * 0.4,
            speed: 0.015 + Math.random() * 0.01
        }));
    }, []);

    useFrame(({ clock }) => {
        const time = clock.elapsedTime;

        // Gentle cloud drift
        if (cloudsRef.current) {
            cloudsRef.current.children.forEach((cloud, i) => {
                const data = cloudData[i];
                if (!data) return;
                cloud.position.x = ((data.x + time * data.speed * 8) % 120) - 60;
            });
        }

        // Animate wave layers with offset phases
        waveRefs.current.forEach((wave, i) => {
            if (wave) {
                wave.position.y = -6.5 - i * 0.8 + Math.sin(time * (1.2 - i * 0.2) + i * 0.5) * 0.12;
            }
        });
    });

    return (
        <group position={[0, 0, -5]}>
            {/* ===== FULL COVERAGE BASE - eliminates any gaps ===== */}
            <mesh position={[0, 0, -60]}>
                <planeGeometry args={[300, 200]} />
                <meshBasicMaterial color="#1565c0" />
            </mesh>

            {/* ===== SKY GRADIENT LAYERS ===== */}
            {/* Deep sky - top */}
            <mesh position={[0, 25, -58]}>
                <planeGeometry args={[300, 60]} />
                <meshBasicMaterial color="#1e88e5" />
            </mesh>

            {/* Mid sky */}
            <mesh position={[0, 5, -57]}>
                <planeGeometry args={[300, 40]} />
                <meshBasicMaterial color="#42a5f5" />
            </mesh>

            {/* Light sky */}
            <mesh position={[0, -8, -56]}>
                <planeGeometry args={[300, 30]} />
                <meshBasicMaterial color="#64b5f6" />
            </mesh>

            {/* Warm horizon glow */}
            <mesh position={[0, -18, -55]}>
                <planeGeometry args={[300, 25]} />
                <meshBasicMaterial color="#90caf9" />
            </mesh>

            {/* Golden horizon line */}
            <mesh position={[0, -28, -54]}>
                <planeGeometry args={[300, 20]} />
                <meshBasicMaterial color="#b3e5fc" />
            </mesh>


            {/* ===== SUN WITH SOFT GLOW ===== */}
            {/* Outer glow - very soft */}
            <mesh position={[30, 8, -50]}>
                <circleGeometry args={[18, 64]} />
                <meshBasicMaterial color="#fff8e1" transparent opacity={0.15} />
            </mesh>
            {/* Mid glow */}
            <mesh position={[30, 8, -49]}>
                <circleGeometry args={[12, 64]} />
                <meshBasicMaterial color="#ffecb3" transparent opacity={0.25} />
            </mesh>
            {/* Inner glow */}
            <mesh position={[30, 8, -48]}>
                <circleGeometry args={[8, 64]} />
                <meshBasicMaterial color="#ffe082" transparent opacity={0.4} />
            </mesh>
            {/* Bright core */}
            <mesh position={[30, 8, -47]}>
                <circleGeometry args={[5, 64]} />
                <meshBasicMaterial color="#ffd54f" transparent opacity={0.7} toneMapped={false} />
            </mesh>
            {/* Sun center */}
            <mesh position={[30, 8, -46]}>
                <circleGeometry args={[3.5, 64]} />
                <meshBasicMaterial color="#ffca28" toneMapped={false} />
            </mesh>

            {/* ===== MINIMAL ELEGANT CLOUDS ===== */}
            <group ref={cloudsRef}>
                {cloudData.map((cloud, i) => (
                    <mesh key={i} position={[cloud.x, cloud.y, cloud.z]} scale={[cloud.scaleX, cloud.scaleY, 1]}>
                        <planeGeometry args={[5, 2]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.7 - i * 0.08}
                        />
                    </mesh>
                ))}
            </group>

            {/* ===== OCEAN WITH DEPTH LAYERS ===== */}
            {/* Deep ocean - horizon */}
            <mesh position={[0, -5, -52]}>
                <planeGeometry args={[300, 15]} />
                <meshBasicMaterial color="#0277bd" />
            </mesh>

            {/* Mid ocean */}
            <mesh position={[0, -8, -48]}>
                <planeGeometry args={[300, 12]} />
                <meshBasicMaterial color="#0288d1" />
            </mesh>

            {/* Surface ocean - bright blue */}
            <mesh position={[0, -10, -42]}>
                <planeGeometry args={[300, 15]} />
                <meshBasicMaterial color="#03a9f4" />
            </mesh>

            {/* Shallow water near shore */}
            <mesh position={[0, -12, -35]}>
                <planeGeometry args={[300, 12]} />
                <meshBasicMaterial color="#29b6f6" />
            </mesh>

            {/* Animated wave foam lines */}
            {[0, 1, 2].map((i) => (
                <mesh
                    key={`wave-${i}`}
                    ref={(el) => { if (el) waveRefs.current[i] = el; }}
                    position={[0, -13 - i * 0.4, -28 + i * 2]}
                >
                    <planeGeometry args={[300, 1.2 - i * 0.2]} />
                    <meshBasicMaterial
                        color={i === 0 ? "#ffffff" : i === 1 ? "#e1f5fe" : "#b3e5fc"}
                        transparent
                        opacity={0.95 - i * 0.15}
                    />
                </mesh>
            ))}

            {/* ===== BEACH WITH GRADIENT ===== */}
            {/* Wet sand near water */}
            <mesh position={[0, -12, -25]} rotation={[-Math.PI / 2.4, 0, 0]}>
                <planeGeometry args={[300, 25]} />
                <meshBasicMaterial color="#d7ccc8" />
            </mesh>

            {/* Main sand */}
            <mesh position={[0, -15, -18]} rotation={[-Math.PI / 2.3, 0, 0]}>
                <planeGeometry args={[300, 35]} />
                <meshBasicMaterial color="#ffe0b2" />
            </mesh>

            {/* Warm sand - near foreground */}
            <mesh position={[0, -18, -10]} rotation={[-Math.PI / 2.2, 0, 0]}>
                <planeGeometry args={[300, 30]} />
                <meshBasicMaterial color="#ffcc80" />
            </mesh>

            {/* ===== PALM TREE SILHOUETTES ===== */}
            {/* Left palm - elegant silhouette */}
            <group position={[-42, -3, -32]}>
                <mesh rotation={[0, 0, 0.12]}>
                    <cylinderGeometry args={[0.2, 0.4, 10, 6]} />
                    <meshBasicMaterial color="#5d4037" />
                </mesh>
                {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                    <mesh key={j} position={[0, 5, 0]} rotation={[0.4, j * 0.9, 0.7 + (j % 2) * 0.2]}>
                        <planeGeometry args={[0.6, 5]} />
                        <meshBasicMaterial color="#2e7d32" side={THREE.DoubleSide} transparent opacity={0.9} />
                    </mesh>
                ))}
            </group>

            {/* Right palm - slightly different */}
            <group position={[45, -4, -34]}>
                <mesh rotation={[0, 0, -0.08]}>
                    <cylinderGeometry args={[0.18, 0.35, 9, 6]} />
                    <meshBasicMaterial color="#4e342e" />
                </mesh>
                {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                    <mesh key={j} position={[0, 4.5, 0]} rotation={[0.35, j * 0.9, 0.65 + (j % 2) * 0.25]}>
                        <planeGeometry args={[0.55, 4.5]} />
                        <meshBasicMaterial color="#388e3c" side={THREE.DoubleSide} transparent opacity={0.9} />
                    </mesh>
                ))}
            </group>

            {/* Distant palm silhouette for depth */}
            <group position={[-55, -5, -40]} scale={0.6}>
                <mesh rotation={[0, 0, 0.05]}>
                    <cylinderGeometry args={[0.2, 0.4, 10, 6]} />
                    <meshBasicMaterial color="#37474f" transparent opacity={0.5} />
                </mesh>
                {[0, 1, 2, 3, 4, 5].map((j) => (
                    <mesh key={j} position={[0, 5, 0]} rotation={[0.4, j * 1.05, 0.7]}>
                        <planeGeometry args={[0.6, 5]} />
                        <meshBasicMaterial color="#455a64" side={THREE.DoubleSide} transparent opacity={0.4} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}


// ============================================
// MIDNIGHT - Enhanced Floating Orbs
// ============================================
function OrbFieldBackground() {
    const orbsRef = useRef<THREE.Group>(null);

    const orbCount = 35;
    const orbData = useMemo(() => {
        return Array.from({ length: orbCount }, (_, i) => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                -8 - Math.random() * 25,
                (Math.random() - 0.5) * 40 - 18
            ),
            scale: 0.4 + Math.random() * 1.0,
            speed: 0.2 + Math.random() * 0.4,
            phase: Math.random() * Math.PI * 2,
            // More vibrant color palette
            color: i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#6366f1" : "#8b5cf6"
        }));
    }, []);

    useFrame(({ clock }) => {
        if (!orbsRef.current) return;
        const time = clock.elapsedTime;

        orbsRef.current.children.forEach((orb, i) => {
            const data = orbData[i];
            if (!data) return;
            // Smoother, more ethereal floating motion
            orb.position.y = data.position.y + Math.sin(time * data.speed + data.phase) * 2;
            orb.position.x = data.position.x + Math.sin(time * data.speed * 0.7 + data.phase) * 1.2;
            orb.position.z = data.position.z + Math.cos(time * data.speed * 0.5 + data.phase) * 0.8;
        });
    });

    return (
        <group ref={orbsRef} position={[0, 0, -10]}>
            {/* Dark backdrop */}
            <mesh position={[0, -15, -35]}>
                <planeGeometry args={[120, 60]} />
                <meshBasicMaterial color="#0a0015" transparent opacity={0.8} />
            </mesh>

            {orbData.map((orb, i) => (
                <mesh key={i} position={orb.position.toArray()} scale={orb.scale}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial
                        color={orb.color}
                        emissive={orb.color}
                        emissiveIntensity={1.2}
                        transparent
                        opacity={0.7}
                        toneMapped={false}
                    />
                </mesh>
            ))}

            {/* Add subtle particle dust */}
            {Array.from({ length: 40 }, (_, i) => (
                <mesh
                    key={`dust-${i}`}
                    position={[
                        (Math.random() - 0.5) * 60,
                        -5 - Math.random() * 20,
                        (Math.random() - 0.5) * 35 - 15
                    ]}
                >
                    <sphereGeometry args={[0.03 + Math.random() * 0.05, 6, 6]} />
                    <meshBasicMaterial color="#c4b5fd" transparent opacity={0.4} />
                </mesh>
            ))}
        </group>
    );
}

// ============================================
// SUNSET PARADISE - Enhanced Mountain Silhouettes
// ============================================
function MountainBackground() {
    const createMountainGeometry = (peaks: number, height: number, width: number, seed: number) => {
        const shape = new THREE.Shape();
        const segments = peaks * 2 + 1;
        const segmentWidth = width / segments;

        // Use seed for consistent shapes
        const pseudoRandom = (n: number) => {
            const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
            return x - Math.floor(x);
        };

        shape.moveTo(-width / 2, 0);

        for (let i = 0; i < peaks; i++) {
            const baseX = -width / 2 + (i * 2 + 1) * segmentWidth;
            const peakX = baseX + segmentWidth / 2;
            const peakHeight = height * (0.5 + pseudoRandom(i) * 0.5);

            shape.lineTo(baseX, 0);
            shape.lineTo(peakX, peakHeight);
            shape.lineTo(baseX + segmentWidth, 0);
        }

        shape.lineTo(width / 2, 0);
        shape.lineTo(-width / 2, 0);

        return new THREE.ShapeGeometry(shape);
    };

    const mountainLayers = useMemo(() => [
        { peaks: 10, height: 15, width: 100, z: -40, y: -10, color: "#1a0520", opacity: 1, seed: 1 },
        { peaks: 8, height: 12, width: 90, z: -35, y: -8, color: "#2d1040", opacity: 0.95, seed: 2 },
        { peaks: 6, height: 10, width: 80, z: -30, y: -6, color: "#4a1a60", opacity: 0.9, seed: 3 },
        { peaks: 5, height: 8, width: 70, z: -25, y: -5, color: "#6b2580", opacity: 0.85, seed: 4 },
    ], []);

    return (
        <group position={[0, 0, 0]}>
            {/* Orange/gold gradient sky backdrop */}
            <mesh position={[0, -5, -45]} rotation={[0, 0, 0]}>
                <planeGeometry args={[150, 60]} />
                <meshBasicMaterial color="#ff7033" transparent opacity={0.4} />
            </mesh>

            {/* Outer sun glow */}
            <mesh position={[20, 0, -42]}>
                <circleGeometry args={[12, 48]} />
                <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} toneMapped={false} />
            </mesh>

            {/* Middle sun glow */}
            <mesh position={[20, 0, -41]}>
                <circleGeometry args={[8, 48]} />
                <meshBasicMaterial color="#ffcc33" transparent opacity={0.5} toneMapped={false} />
            </mesh>

            {/* Inner sun core */}
            <mesh position={[20, 0, -40]}>
                <circleGeometry args={[5, 48]} />
                <meshBasicMaterial color="#ffee88" transparent opacity={0.8} toneMapped={false} />
            </mesh>

            {/* Mountain layers - back to front */}
            {mountainLayers.map((layer, i) => (
                <mesh
                    key={i}
                    position={[0, layer.y, layer.z]}
                    geometry={createMountainGeometry(layer.peaks, layer.height, layer.width, layer.seed)}
                >
                    <meshBasicMaterial
                        color={layer.color}
                        transparent
                        opacity={layer.opacity}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ============================================
// OCEAN BLUE - Enhanced Underwater Scene
// ============================================
function UnderwaterBackground() {
    const bubblesRef = useRef<THREE.InstancedMesh>(null);

    const bubbleCount = 80;
    const bubbleData = useMemo(() => {
        const data = [];
        for (let i = 0; i < bubbleCount; i++) {
            data.push({
                x: (Math.random() - 0.5) * 60,
                y: -35 + Math.random() * 25,
                z: (Math.random() - 0.5) * 40 - 18,
                speed: 0.8 + Math.random() * 2,
                scale: 0.08 + Math.random() * 0.2,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 1.5 + Math.random() * 2
            });
        }
        return data;
    }, []);

    useFrame(({ clock }) => {
        if (!bubblesRef.current) return;
        const time = clock.elapsedTime;

        const tempMatrix = new THREE.Matrix4();
        const tempPosition = new THREE.Vector3();
        const tempQuaternion = new THREE.Quaternion();
        const tempScale = new THREE.Vector3();

        for (let i = 0; i < bubbleCount; i++) {
            const bubble = bubbleData[i];
            let y = bubble.y + (time * bubble.speed) % 35;
            if (y > 0) y = -35;

            const wobbleX = Math.sin(time * bubble.wobbleSpeed + bubble.wobblePhase) * 0.5;
            const wobbleZ = Math.cos(time * bubble.wobbleSpeed * 0.7 + bubble.wobblePhase) * 0.3;

            tempPosition.set(bubble.x + wobbleX, y, bubble.z + wobbleZ);
            tempScale.setScalar(bubble.scale);
            tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
            bubblesRef.current.setMatrixAt(i, tempMatrix);
        }
        bubblesRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group position={[0, 0, -10]}>
            {/* Deep ocean gradient background */}
            <mesh position={[0, -15, -40]}>
                <planeGeometry args={[120, 60]} />
                <meshBasicMaterial color="#001525" transparent opacity={0.9} />
            </mesh>

            {/* Mid-depth water */}
            <mesh position={[0, -10, -35]}>
                <planeGeometry args={[120, 50]} />
                <meshBasicMaterial color="#003355" transparent opacity={0.5} />
            </mesh>

            {/* Bubbles with glow effect */}
            <instancedMesh ref={bubblesRef} args={[undefined, undefined, bubbleCount]}>
                <sphereGeometry args={[1, 12, 12]} />
                <meshStandardMaterial
                    color="#66ddff"
                    emissive="#00aaff"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.6}
                    toneMapped={false}
                />
            </instancedMesh>

            {/* Enhanced light rays from surface */}
            {[...Array(7)].map((_, i) => (
                <mesh
                    key={i}
                    position={[-30 + i * 10, -10, -28]}
                    rotation={[0.1, 0, -0.25 + i * 0.08]}
                >
                    <planeGeometry args={[1.5, 35]} />
                    <meshBasicMaterial
                        color="#aaeeff"
                        transparent
                        opacity={0.06 + (i % 2) * 0.03}
                        side={THREE.DoubleSide}
                        toneMapped={false}
                    />
                </mesh>
            ))}

            {/* Caustic light pattern hint */}
            {Array.from({ length: 20 }, (_, i) => (
                <mesh
                    key={`caustic-${i}`}
                    position={[
                        (Math.random() - 0.5) * 50,
                        -3 - Math.random() * 5,
                        -20 - Math.random() * 10
                    ]}
                    rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
                >
                    <circleGeometry args={[0.5 + Math.random() * 1, 6]} />
                    <meshBasicMaterial color="#88ddff" transparent opacity={0.08} />
                </mesh>
            ))}
        </group>
    );
}

// ============================================
// FOREST GREEN - Enhanced Nature Scene
// ============================================
function ForestBackground() {
    const leavesRef = useRef<THREE.Group>(null);
    const firefliesRef = useRef<THREE.InstancedMesh>(null);

    const leafCount = 45;
    const fireflyCount = 30;

    const leafData = useMemo(() => {
        return Array.from({ length: leafCount }, (_, i) => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                -3 - Math.random() * 28,
                (Math.random() - 0.5) * 35 - 18
            ),
            rotation: Math.random() * Math.PI * 2,
            speed: 0.15 + Math.random() * 0.35,
            swayPhase: Math.random() * Math.PI * 2,
            fallSpeed: 0.08 + Math.random() * 0.15,
            size: 0.3 + Math.random() * 0.4,
            // More varied green palette
            colorIndex: i % 5
        }));
    }, []);

    const fireflyData = useMemo(() => {
        return Array.from({ length: fireflyCount }, () => ({
            x: (Math.random() - 0.5) * 50,
            y: -6 - Math.random() * 18,
            z: (Math.random() - 0.5) * 30 - 12,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.8,
            blinkSpeed: 2 + Math.random() * 3
        }));
    }, []);

    const leafColors = ["#1a5c1a", "#228B22", "#2db82d", "#50c878", "#90EE90"];

    useFrame(({ clock }) => {
        const time = clock.elapsedTime;

        // Animate leaves
        if (leavesRef.current) {
            leavesRef.current.children.forEach((leaf, i) => {
                const data = leafData[i];
                if (!data) return;
                leaf.rotation.z = data.rotation + Math.sin(time * data.speed + data.swayPhase) * 0.6;
                leaf.rotation.x = Math.sin(time * data.speed * 0.8 + data.swayPhase * 0.5) * 0.4;

                let y = data.position.y - (time * data.fallSpeed) % 35;
                if (y < -32) y = -3;
                leaf.position.y = y;
                leaf.position.x = data.position.x + Math.sin(time * 0.4 + data.swayPhase) * 2.5;
            });
        }

        // Animate fireflies with realistic blinking
        if (firefliesRef.current) {
            const tempMatrix = new THREE.Matrix4();
            const tempPosition = new THREE.Vector3();
            const tempQuaternion = new THREE.Quaternion();
            const tempScale = new THREE.Vector3();

            for (let i = 0; i < fireflyCount; i++) {
                const ff = fireflyData[i];
                // More organic blink pattern
                const blink = Math.max(0, Math.sin(time * ff.blinkSpeed + ff.phase));
                const glow = 0.03 + blink * 0.08;

                tempPosition.set(
                    ff.x + Math.sin(time * ff.speed + ff.phase) * 2.5,
                    ff.y + Math.sin(time * ff.speed * 0.6 + ff.phase * 1.3) * 2,
                    ff.z + Math.cos(time * ff.speed * 0.4 + ff.phase) * 1.5
                );
                tempScale.setScalar(glow);
                tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
                firefliesRef.current.setMatrixAt(i, tempMatrix);
            }
            firefliesRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <group position={[0, 0, -10]}>
            {/* Dark forest backdrop */}
            <mesh position={[0, -12, -40]}>
                <planeGeometry args={[120, 50]} />
                <meshBasicMaterial color="#051505" transparent opacity={0.9} />
            </mesh>

            {/* Subtle tree silhouettes */}
            {Array.from({ length: 8 }, (_, i) => (
                <mesh
                    key={`tree-${i}`}
                    position={[-35 + i * 10, -10, -35 + (i % 2) * 5]}
                >
                    <coneGeometry args={[3, 12 + Math.random() * 5, 4]} />
                    <meshBasicMaterial color="#0a200a" transparent opacity={0.7} />
                </mesh>
            ))}

            {/* Leaves */}
            <group ref={leavesRef}>
                {leafData.map((leaf, i) => (
                    <mesh
                        key={i}
                        position={leaf.position.toArray()}
                        rotation={[0, 0, leaf.rotation]}
                        scale={leaf.size}
                    >
                        <planeGeometry args={[1, 1.5]} />
                        <meshBasicMaterial
                            color={leafColors[leaf.colorIndex]}
                            transparent
                            opacity={0.75}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>

            {/* Fireflies with bright glow */}
            <instancedMesh ref={firefliesRef} args={[undefined, undefined, fireflyCount]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </instancedMesh>

            {/* Ground fog effect */}
            <mesh position={[0, -25, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 40]} />
                <meshBasicMaterial color="#1a3a1a" transparent opacity={0.4} />
            </mesh>
        </group>
    );
}

// ============================================
// MAIN EXPORT
// ============================================
export function MapBackground({ mapId }: MapBackgroundProps) {
    switch (mapId) {
        case "neon":
            return <BeachBackground />;
        case "midnight":
            return <OrbFieldBackground />;
        case "sunset":
            return <MountainBackground />;
        case "ocean":
            return <UnderwaterBackground />;
        case "forest":
            return <ForestBackground />;
        default:
            return <BeachBackground />;
    }
}
