import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { Chapter, LifeReceipt, DataSource } from '@/types';
import { TYPE_COLORS, formatCount, formatDateRange } from '@/lib/utils';

interface LifeOrbitProps {
  chapters: Chapter[];
  receipts: LifeReceipt[];
  onNodeSelect: (chapter: Chapter | null) => void;
  selectedChapterId: string | null;
  filterSource: DataSource | null;
}

const DOMAIN_CENTERS = {
  music: new THREE.Vector3(-3.5, 1.8, 0),
  expense: new THREE.Vector3(-3.0, -2.2, 0),
  transaction: new THREE.Vector3(3.8, 0.2, 0),
  core: new THREE.Vector3(0, 0, 0),
};

// Orbital Rings component — renders delicate concentric astronomical tracks
const OrbitalRings = () => {
  const rings = useMemo(() => [3.2, 4.8, 6.8], []);

  return (
    <group rotation={[-Math.PI / 6, 0, 0]}>
      {rings.map((radius, idx) => {
        const points = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <lineLoop key={idx} geometry={geometry}>
            <lineBasicMaterial attach="material" color="#C8C2B5" transparent opacity={0.35} />
          </lineLoop>
        );
      })}
    </group>
  );
};

// Ambient moment particles orbiting the core
const AmbientMoments = ({ count = 40 }: { count?: number }) => {
  const particles = useMemo(() => {
    const arr = [];
    const colors = ['#C4622D', '#3D5A47', '#2B4B6F', '#8B6914'];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3);
      const radius = 2.2 + (i % 5) * 0.9;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.7;
      const z = Math.sin(i * 1.5) * 1.2;
      const color = colors[i % colors.length];
      arr.push({ position: new THREE.Vector3(x, y, z), color });
    }
    return arr;
  }, [count]);

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
};

const NodeSphere = ({
  chapter,
  position,
  isSelected,
  onClick,
  onHover,
}: {
  chapter: Chapter;
  position: THREE.Vector3;
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = TYPE_COLORS[chapter.dominantType] || '#1A1814';

  const size = Math.max(0.28, Math.min(0.65, (chapter.stats.totalReceipts / 2000) * 0.5 + 0.28));
  const scale = isSelected ? 1.35 : 1;

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(false);
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Halo ring around selected node */}
      {isSelected && (
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 1.55, 32]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

const LifeOrbitScene = ({ chapters, selectedChapterId, onNodeSelect, filterSource }: LifeOrbitProps) => {
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);

  const visibleChapters = useMemo(() => {
    if (!filterSource) return chapters;
    return chapters.filter((c) => c.dominantSource === filterSource);
  }, [chapters, filterSource]);

  // Position nodes with stable celestial coordinates
  const nodes = useMemo(() => {
    return visibleChapters.map((chapter, i) => {
      let center = DOMAIN_CENTERS.core;
      if (chapter.dominantType === 'music') center = DOMAIN_CENTERS.music;
      else if (chapter.dominantType === 'expense') center = DOMAIN_CENTERS.expense;
      else if (chapter.dominantType === 'transaction') center = DOMAIN_CENTERS.transaction;

      const isConvergence =
        chapter.dateRange[0].includes('2015') ||
        chapter.dateRange[0].includes('2016') ||
        chapter.dateRange[0].includes('2017') ||
        chapter.dateRange[0].includes('2018');

      const seedZ = Math.sin(i * 311.7) * 1.2;
      let pos = new THREE.Vector3();

      if (isConvergence && (chapter.dominantType === 'music' || chapter.dominantType === 'expense')) {
        const angle = (i * Math.PI * 2) / Math.max(6, visibleChapters.length);
        const radius = 1.6;
        pos.set(-3.2 + Math.cos(angle) * radius, 0 + Math.sin(angle) * radius, seedZ * 0.4);
      } else {
        const angle = (i * Math.PI * 2) / Math.max(1, visibleChapters.length);
        const radius = 2.4 + (i % 3) * 0.5;
        pos.set(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius, center.z + seedZ);
      }

      return { chapter, position: pos };
    });
  }, [visibleChapters]);

  return (
    <>
      <ambientLight intensity={0.9} color="#FFFFFF" />
      <directionalLight position={[6, 8, 6]} intensity={1.1} color="#FFF8EE" />
      <directionalLight position={[-6, -6, -4]} intensity={0.4} color="#DCE5EF" />

      {/* Orbital Tracks */}
      <OrbitalRings />

      {/* Ambient revolving moment dots */}
      <AmbientMoments count={48} />

      {/* Central Life Core with atmospheric outer ring */}
      <group position={[0, 0, 0]}>
        <Sphere args={[1.0, 32, 32]}>
          <meshStandardMaterial color="#1A1814" roughness={0.6} metalness={0.2} />
        </Sphere>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[1.3, 1.42, 48]} />
          <meshBasicMaterial color="#8A8480" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Chapter Spheres */}
      {nodes.map(({ chapter, position }) => (
        <NodeSphere
          key={chapter.id}
          chapter={chapter}
          position={position}
          isSelected={selectedChapterId === chapter.id}
          onClick={() => onNodeSelect(chapter)}
          onHover={(hovered) => setHoveredChapter(hovered ? chapter : null)}
        />
      ))}

      {/* Connection lines for selected node */}
      {selectedChapterId && (
        <group>
          {nodes
            .find((n) => n.chapter.id === selectedChapterId)
            ?.chapter.connections.slice(0, 8)
            .map((conn) => {
              const targetNode = nodes.find((n) => n.chapter.id === conn.targetId);
              if (!targetNode) return null;
              const sourcePos = nodes.find((n) => n.chapter.id === selectedChapterId)!.position;
              const points = [sourcePos, targetNode.position];
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              return (
                <line key={conn.id}>
                  <bufferGeometry attach="geometry" {...geometry} />
                  <lineBasicMaterial attach="material" color="#8B6914" linewidth={1} transparent opacity={0.7} />
                </line>
              );
            })}
        </group>
      )}

      {/* Tooltip HTML */}
      {hoveredChapter && (
        <Html
          position={nodes.find((n) => n.chapter.id === hoveredChapter.id)?.position || new THREE.Vector3()}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-parchment-50 border border-ink-300 p-2.5 shadow-md rounded min-w-[180px] font-body text-ink-900 pointer-events-none mb-8">
            <h4 className="font-display font-bold text-sm leading-tight mb-0.5">{hoveredChapter.title}</h4>
            <p className="font-mono text-[10px] text-ink-500 uppercase mb-1.5">
              {formatDateRange(hoveredChapter.dateRange[0], hoveredChapter.dateRange[1])}
            </p>
            <div className="flex justify-between items-center text-xs border-t border-ink-200 pt-1">
              <span className="font-mono text-ink-500 text-[11px]">
                {formatCount(hoveredChapter.stats.totalReceipts)} recs
              </span>
              <span
                className="font-medium text-[11px] truncate max-w-[90px]"
                style={{ color: TYPE_COLORS[hoveredChapter.dominantType] }}
              >
                {hoveredChapter.dominantCategory || hoveredChapter.stats.topArtist || hoveredChapter.dominantType}
              </span>
            </div>
          </div>
        </Html>
      )}
    </>
  );
};

export default function LifeOrbit(props: LifeOrbitProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="w-full h-full bg-parchment-100 relative" role="img" aria-label="3D Visualization of Life Data Chapters">
      <Canvas
        frameloop="demand"
        camera={{
          position: isMobile ? [0, 0.5, 20] : [0, 0, 16],
          fov: isMobile ? 52 : 45,
        }}
      >
        <OrbitControls
          enablePan={false}
          enableZoom={false} // Disable zoom on canvas so touch pinch/scroll doesn't trap mobile users
          enableRotate={true}
          rotateSpeed={0.8}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
        <LifeOrbitScene {...props} />
      </Canvas>
    </div>
  );
}
