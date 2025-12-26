import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MapStyle, GameMap } from "@/lib/stores/useSkins";

interface MapBackgroundProps {
    mapId: MapStyle;
    mapData: GameMap;
}

// ============================================
// NEON NIGHT - Starfield + Grid
// ============================================
function StarfieldBackground() {
    const starsRef = useRef<THREE.InstancedMesh>(null);
    const gridRef = useRef<THREE.Mesh>(null);

    const starCount = 150;
    const starData = useMemo(() => {
        const positions: THREE.Matrix4[] = [];
        const speeds: number[] = [];
        const phases: number[] = [];

        for (let i = 0; i < starCount; i++) {
            const matrix = new THREE.Matrix4();
            const x = (Math.random() - 0.5) * 60;
            const y = -8 - Math.random() * 25;
            const z = (Math.random() - 0.5) * 40 - 15;
            const scale = 0.03 + Math.random() * 0.06;

            matrix.compose(
                new THREE.Vector3(x, y, z),
                new THREE.Quaternion(),
                new THREE.Vector3(scale, scale, scale)
            );
            positions.push(matrix);
            speeds.push(0.5 + Math.random() * 2);
            phases.push(Math.random() * Math.PI * 2);
        }
        return { positions, speeds, phases };
    }, []);

    useFrame(({ clock }) => {
        if (!starsRef.current) return;

        const time = clock.elapsedTime;
        for (let i = 0; i < starCount; i++) {
            const twinkle = 0.3 + Math.sin(time * starData.speeds[i] + starData.phases[i]) * 0.7;
            starsRef.current.setColorAt(i, new THREE.Color().setHSL(0.55, 0.1, twinkle));
        }
        if (starsRef.current.instanceColor) {
            starsRef.current.instanceColor.needsUpdate = true;
        }

        if (gridRef.current) {
            const material = gridRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = 0.08 + Math.sin(time * 0.5) * 0.04;
        }
    });

    return (
        <group position={[0, 0, -20]}>
            {/* Stars */}
            <instancedMesh ref={starsRef} args={[undefined, undefined, starCount]}>
                <sphereGeometry args={[1, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
            </instancedMesh>

            {/* Neon Grid Floor */}
            <mesh ref={gridRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -15, -10]}>
                <planeGeometry args={[80, 60, 20, 15]} />
                <meshBasicMaterial
                    color="#00ffff"
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </mesh>

            {/* Second grid for depth */}
            <mesh rotation={[-Math.PI / 2.8, 0, 0]} position={[0, -25, -20]}>
                <planeGeometry args={[100, 80, 25, 20]} />
                <meshBasicMaterial
                    color="#ff00ff"
                    wireframe
                    transparent
                    opacity={0.05}
                />
            </mesh>
        </group>
    );
}

// ============================================
// MIDNIGHT - Floating Glowing Orbs
// ============================================
function OrbFieldBackground() {
    const orbsRef = useRef<THREE.Group>(null);

    const orbCount = 25;
    const orbData = useMemo(() => {
        return Array.from({ length: orbCount }, () => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                -10 - Math.random() * 20,
                (Math.random() - 0.5) * 30 - 15
            ),
            scale: 0.3 + Math.random() * 0.8,
            speed: 0.3 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? "#9b59b6" : "#3498db"
        }));
    }, []);

    useFrame(({ clock }) => {
        if (!orbsRef.current) return;
        const time = clock.elapsedTime;

        orbsRef.current.children.forEach((orb, i) => {
            const data = orbData[i];
            orb.position.y = data.position.y + Math.sin(time * data.speed + data.phase) * 1.5;
            orb.position.x = data.position.x + Math.sin(time * data.speed * 0.5 + data.phase) * 0.8;
        });
    });

    return (
        <group ref={orbsRef} position={[0, 0, -10]}>
            {orbData.map((orb, i) => (
                <mesh key={i} position={orb.position.toArray()} scale={orb.scale}>
                    <sphereGeometry args={[1, 12, 12]} />
                    <meshStandardMaterial
                        color={orb.color}
                        emissive={orb.color}
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ============================================
// SUNSET PARADISE - Mountain Silhouettes
// ============================================
function MountainBackground() {
    const createMountainGeometry = (peaks: number, height: number, width: number) => {
        const shape = new THREE.Shape();
        const segments = peaks * 2 + 1;
        const segmentWidth = width / segments;

        shape.moveTo(-width / 2, 0);

        for (let i = 0; i < peaks; i++) {
            const baseX = -width / 2 + (i * 2 + 1) * segmentWidth;
            const peakX = baseX + segmentWidth / 2;
            const peakHeight = height * (0.6 + Math.random() * 0.4);

            shape.lineTo(baseX, 0);
            shape.lineTo(peakX, peakHeight);
            shape.lineTo(baseX + segmentWidth, 0);
        }

        shape.lineTo(width / 2, 0);
        shape.lineTo(-width / 2, 0);

        return new THREE.ShapeGeometry(shape);
    };

    const mountainLayers = useMemo(() => [
        { peaks: 8, height: 12, width: 80, z: -35, y: -12, color: "#1a0a20", opacity: 1 },
        { peaks: 6, height: 10, width: 70, z: -30, y: -10, color: "#2d1b3d", opacity: 0.9 },
        { peaks: 5, height: 8, width: 60, z: -25, y: -8, color: "#4a2c5a", opacity: 0.8 },
    ], []);

    return (
        <group position={[0, 0, 0]}>
            {/* Gradient sky backdrop */}
            <mesh position={[0, -15, -40]} rotation={[0, 0, 0]}>
                <planeGeometry args={[120, 50]} />
                <meshBasicMaterial color="#ff6b35" transparent opacity={0.3} />
            </mesh>

            {/* Sun glow */}
            <mesh position={[15, -5, -38]}>
                <circleGeometry args={[8, 32]} />
                <meshBasicMaterial color="#ffcc00" transparent opacity={0.4} />
            </mesh>
            <mesh position={[15, -5, -37]}>
                <circleGeometry args={[5, 32]} />
                <meshBasicMaterial color="#ff8800" transparent opacity={0.6} />
            </mesh>

            {/* Mountain layers */}
            {mountainLayers.map((layer, i) => (
                <mesh
                    key={i}
                    position={[0, layer.y, layer.z]}
                    geometry={createMountainGeometry(layer.peaks, layer.height, layer.width)}
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
// OCEAN BLUE - Underwater Bubbles + Light Rays
// ============================================
function UnderwaterBackground() {
    const bubblesRef = useRef<THREE.InstancedMesh>(null);

    const bubbleCount = 60;
    const bubbleData = useMemo(() => {
        const data = [];
        for (let i = 0; i < bubbleCount; i++) {
            data.push({
                x: (Math.random() - 0.5) * 50,
                y: -30 + Math.random() * 20,
                z: (Math.random() - 0.5) * 30 - 15,
                speed: 0.5 + Math.random() * 1.5,
                scale: 0.1 + Math.random() * 0.25,
                wobblePhase: Math.random() * Math.PI * 2
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
            let y = bubble.y + (time * bubble.speed) % 25;
            if (y > -5) y = -30;

            const wobbleX = Math.sin(time * 2 + bubble.wobblePhase) * 0.3;

            tempPosition.set(bubble.x + wobbleX, y, bubble.z);
            tempScale.setScalar(bubble.scale);
            tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
            bubblesRef.current.setMatrixAt(i, tempMatrix);
        }
        bubblesRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group position={[0, 0, -10]}>
            {/* Bubbles */}
            <instancedMesh ref={bubblesRef} args={[undefined, undefined, bubbleCount]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial
                    color="#88ddff"
                    emissive="#00aaff"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.5}
                />
            </instancedMesh>

            {/* Light rays */}
            {[...Array(5)].map((_, i) => (
                <mesh
                    key={i}
                    position={[-20 + i * 10, -15, -25]}
                    rotation={[0, 0, -0.3 + i * 0.15]}
                >
                    <planeGeometry args={[2, 30]} />
                    <meshBasicMaterial
                        color="#aaeeff"
                        transparent
                        opacity={0.08}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Deep water gradient */}
            <mesh position={[0, -20, -30]}>
                <planeGeometry args={[100, 40]} />
                <meshBasicMaterial color="#001830" transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

// ============================================
// FOREST GREEN - Floating Leaves + Fireflies
// ============================================
function ForestBackground() {
    const leavesRef = useRef<THREE.Group>(null);
    const firefliesRef = useRef<THREE.InstancedMesh>(null);

    const leafCount = 30;
    const fireflyCount = 20;

    const leafData = useMemo(() => {
        return Array.from({ length: leafCount }, () => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                -5 - Math.random() * 25,
                (Math.random() - 0.5) * 30 - 15
            ),
            rotation: Math.random() * Math.PI * 2,
            speed: 0.2 + Math.random() * 0.4,
            swayPhase: Math.random() * Math.PI * 2,
            fallSpeed: 0.1 + Math.random() * 0.2
        }));
    }, []);

    const fireflyData = useMemo(() => {
        return Array.from({ length: fireflyCount }, () => ({
            x: (Math.random() - 0.5) * 40,
            y: -8 - Math.random() * 15,
            z: (Math.random() - 0.5) * 25 - 10,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1
        }));
    }, []);

    useFrame(({ clock }) => {
        const time = clock.elapsedTime;

        // Animate leaves
        if (leavesRef.current) {
            leavesRef.current.children.forEach((leaf, i) => {
                const data = leafData[i];
                leaf.rotation.z = data.rotation + Math.sin(time * data.speed + data.swayPhase) * 0.5;
                leaf.rotation.x = Math.sin(time * data.speed * 0.7) * 0.3;

                let y = data.position.y - (time * data.fallSpeed) % 30;
                if (y < -30) y = -5;
                leaf.position.y = y;
                leaf.position.x = data.position.x + Math.sin(time * 0.5 + data.swayPhase) * 2;
            });
        }

        // Animate fireflies
        if (firefliesRef.current) {
            const tempMatrix = new THREE.Matrix4();
            const tempPosition = new THREE.Vector3();
            const tempQuaternion = new THREE.Quaternion();
            const tempScale = new THREE.Vector3();

            for (let i = 0; i < fireflyCount; i++) {
                const ff = fireflyData[i];
                const glow = 0.05 + Math.sin(time * ff.speed * 3 + ff.phase) * 0.03;

                tempPosition.set(
                    ff.x + Math.sin(time * ff.speed + ff.phase) * 2,
                    ff.y + Math.sin(time * ff.speed * 0.7 + ff.phase) * 1.5,
                    ff.z
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
            {/* Forest backdrop */}
            <mesh position={[0, -15, -35]}>
                <planeGeometry args={[100, 40]} />
                <meshBasicMaterial color="#0a1a0a" transparent opacity={0.8} />
            </mesh>

            {/* Leaves */}
            <group ref={leavesRef}>
                {leafData.map((leaf, i) => (
                    <mesh key={i} position={leaf.position.toArray()} rotation={[0, 0, leaf.rotation]}>
                        <planeGeometry args={[0.4, 0.6]} />
                        <meshBasicMaterial
                            color={i % 3 === 0 ? "#228B22" : i % 3 === 1 ? "#32CD32" : "#90EE90"}
                            transparent
                            opacity={0.7}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>

            {/* Fireflies */}
            <instancedMesh ref={firefliesRef} args={[undefined, undefined, fireflyCount]}>
                <sphereGeometry args={[1, 6, 6]} />
                <meshStandardMaterial
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={2}
                />
            </instancedMesh>
        </group>
    );
}

// ============================================
// MAIN EXPORT
// ============================================
export function MapBackground({ mapId }: MapBackgroundProps) {
    // Initialize star positions on mount
    const initialized = useRef(false);
    const starsRef = useRef<THREE.InstancedMesh>(null);

    useMemo(() => {
        if (mapId === "neon" && starsRef.current && !initialized.current) {
            initialized.current = true;
        }
    }, [mapId]);

    switch (mapId) {
        case "neon":
            return <StarfieldBackground />;
        case "midnight":
            return <OrbFieldBackground />;
        case "sunset":
            return <MountainBackground />;
        case "ocean":
            return <UnderwaterBackground />;
        case "forest":
            return <ForestBackground />;
        default:
            return <StarfieldBackground />;
    }
}
