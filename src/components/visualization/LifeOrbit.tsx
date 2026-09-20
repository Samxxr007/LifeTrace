import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { Chapter, LifeReceipt, DataSource } from '@/types';
import { TYPE_COLORS, formatCount, formatDateRange } from '@/lib/utils';
import { Rotate3d, ArrowUpDown } from 'lucide-react';

interface LifeOrbitProps {
  chapters: Chapter[];
  receipts: LifeReceipt[];
  onNodeSelect: (chapter: Chapter | null) => void;
  selectedChapterId: string | null;
  filterSource: DataSource | null;
}

const DOMAIN_CENTERS = {
  music: new THREE.Vector3(-3.8, 2.0, 0),
  expense: new THREE.Vector3(-3.2, -2.4, 0),
  transaction: new THREE.Vector3(4.0, 0.0, 0),
  synthetic: new THREE.Vector3(0.0, 3.4, 0),
  core: new THREE.Vector3(0, 0, 0),
};

// Orbital Rings component — renders delicate concentric astronomical tracks with domain labels
const OrbitalRings = () => {
  const ringObjects = useMemo(() => {
    return [
      { radius: 3.0, color: '#C4622D', opacity: 0.25 }, // Music track
      { radius: 4.2, color: '#7B4B94', opacity: 0.35 }, // Synthetic scenarios track
      { radius: 5.0, color: '#8B6914', opacity: 0.4 },  // The Convergence track
      { radius: 7.0, color: '#2B4B6F', opacity: 0.25 }, // Transactions track
    ].map((ring) => {
      const points = [];
      const segments = 80;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * ring.radius, Math.sin(theta) * ring.radius, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: ring.color, transparent: true, opacity: ring.opacity });
      return new THREE.LineLoop(geometry, material);
    });
  }, []);

  return (
    <group rotation={[-Math.PI / 8, 0, 0]}>
      {ringObjects.map((obj, idx) => (
        <primitive key={idx} object={obj} />
      ))}
    </group>
  );
};

// Constellation Lines connecting domains to central Life Core
const ConstellationLines = () => {
  const lineObjects = useMemo(() => {
    return [
      [DOMAIN_CENTERS.core, DOMAIN_CENTERS.music],
      [DOMAIN_CENTERS.core, DOMAIN_CENTERS.expense],
      [DOMAIN_CENTERS.core, DOMAIN_CENTERS.transaction],
      [DOMAIN_CENTERS.core, DOMAIN_CENTERS.synthetic],
      [DOMAIN_CENTERS.music, DOMAIN_CENTERS.expense], // Convergence bridge
    ].map(([start, end]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineBasicMaterial({ color: '#D5D0C8', transparent: true, opacity: 0.35 });
      return new THREE.Line(geometry, material);
    });
  }, []);

  return (
    <group>
      {lineObjects.map((obj, idx) => (
        <primitive key={idx} object={obj} />
      ))}
    </group>
  );
};

// Ambient moment particles orbiting the core
const AmbientMoments = ({ count = 48 }: { count?: number }) => {
  const particles = useMemo(() => {
    const arr = [];
    const colors = ['#C4622D', '#3D5A47', '#2B4B6F', '#8B6914', '#7B4B94'];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3);
      const radius = 2.0 + (i % 5) * 1.0;
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
          <meshBasicMaterial color={p.color} transparent opacity={0.6} />
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

  const size = Math.max(0.28, Math.min(0.6, (chapter.stats.totalReceipts / 2000) * 0.45 + 0.28));
  const scale = isSelected ? 1.35 : 1;

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.02;
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
          <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.65} />
        </mesh>
      )}
    </group>
  );
};

const LifeOrbitScene = ({
  chapters,
  selectedChapterId,
  onNodeSelect,
  filterSource,
}: LifeOrbitProps) => {
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);
  const sceneGroupRef = useRef<THREE.Group>(null);

  // Gentle, continuous celestial rotation
  useFrame((_, delta) => {
    if (sceneGroupRef.current) {
      sceneGroupRef.current.rotation.y += delta * 0.04;
    }
  });

  const visibleChapters = useMemo(() => {
    if (!filterSource) return chapters;
    if (filterSource === 'synthetic') {
      return chapters.filter(
        (c) => c.dominantSource === 'synthetic' || c.receipts.some((r) => r.source === 'synthetic')
      );
    }
    return chapters.filter((c) => c.dominantSource === filterSource);
  }, [chapters, filterSource]);

  // Position nodes with stable celestial coordinates
  const nodes = useMemo(() => {
    return visibleChapters.map((chapter, i) => {
      let center = DOMAIN_CENTERS.core;
      if (
        chapter.dominantSource === 'synthetic' ||
        chapter.dominantType === 'place' ||
        chapter.dominantType === 'event' ||
        chapter.receipts.some((r) => r.source === 'synthetic')
      ) {
        center = DOMAIN_CENTERS.synthetic;
      } else if (chapter.dominantType === 'music') {
        center = DOMAIN_CENTERS.music;
      } else if (chapter.dominantType === 'expense') {
        center = DOMAIN_CENTERS.expense;
      } else if (chapter.dominantType === 'transaction') {
        center = DOMAIN_CENTERS.transaction;
      }

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
        pos.set(-3.4 + Math.cos(angle) * radius, 0 + Math.sin(angle) * radius, seedZ * 0.4);
      } else {
        const angle = (i * Math.PI * 2) / Math.max(1, visibleChapters.length);
        const radius = 2.4 + (i % 3) * 0.5;
        pos.set(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius, center.z + seedZ);
      }

      return { chapter, position: pos };
    });
  }, [visibleChapters]);

  return (
    <group ref={sceneGroupRef}>
      <ambientLight intensity={0.9} color="#FFFFFF" />
      <directionalLight position={[6, 8, 6]} intensity={1.1} color="#FFF8EE" />
      <directionalLight position={[-6, -6, -4]} intensity={0.4} color="#DCE5EF" />

      {/* Orbital Tracks */}
      <OrbitalRings />

      {/* Constellation lines */}
      <ConstellationLines />

      {/* Ambient revolving moment dots */}
      <AmbientMoments count={48} />

      {/* Central Life Core with atmospheric outer ring */}
      <group position={[0, 0, 0]}>
        <Sphere args={[1.0, 32, 32]}>
          <meshStandardMaterial color="#1A1814" roughness={0.6} metalness={0.2} />
        </Sphere>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[1.3, 1.42, 48]} />
          <meshBasicMaterial color="#8A8480" side={THREE.DoubleSide} transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Domain Planets — celestial bodies anchoring each major life domain */}
      {/* Music Domain Planet */}
      <group position={DOMAIN_CENTERS.music}>
        <Sphere args={[0.65, 32, 32]}>
          <meshStandardMaterial color="#C4622D" roughness={0.4} metalness={0.1} />
        </Sphere>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[0.85, 0.96, 40]} />
          <meshBasicMaterial color="#C4622D" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Household / Expense Domain Planet */}
      <group position={DOMAIN_CENTERS.expense}>
        <Sphere args={[0.6, 32, 32]}>
          <meshStandardMaterial color="#3D5A47" roughness={0.4} metalness={0.1} />
        </Sphere>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <ringGeometry args={[0.78, 0.88, 40]} />
          <meshBasicMaterial color="#3D5A47" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Transactions Domain Planet */}
      <group position={DOMAIN_CENTERS.transaction}>
        <Sphere args={[0.65, 32, 32]}>
          <meshStandardMaterial color="#2B4B6F" roughness={0.4} metalness={0.1} />
        </Sphere>
        <mesh rotation={[-Math.PI / 4, 0, 0]}>
          <ringGeometry args={[0.85, 0.96, 40]} />
          <meshBasicMaterial color="#2B4B6F" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Cafes, Movies & Experiences Domain Planet */}
      <group position={DOMAIN_CENTERS.synthetic}>
        <Sphere args={[0.75, 32, 32]}>
          <meshStandardMaterial color="#7B4B94" roughness={0.35} metalness={0.15} />
        </Sphere>
        {/* Inner bright ring */}
        <mesh rotation={[Math.PI / 5, Math.PI / 6, 0]}>
          <ringGeometry args={[0.95, 1.1, 48]} />
          <meshBasicMaterial color="#9B6BB4" side={THREE.DoubleSide} transparent opacity={0.65} />
        </mesh>
        {/* Outer atmospheric ring */}
        <mesh rotation={[Math.PI / 5, Math.PI / 6, 0]}>
          <ringGeometry args={[1.2, 1.28, 48]} />
          <meshBasicMaterial color="#C4A5DC" side={THREE.DoubleSide} transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Domain Markers (Clean HTML badges that never clip) */}
      <Html position={[-3.8, 3.2, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-burnt-100/90 border border-burnt-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-burnt-700 uppercase tracking-widest whitespace-nowrap shadow-xs">
          ✦ Music Domain
        </div>
      </Html>
      <Html position={[-3.2, -3.4, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-forest-100/90 border border-forest-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-forest-700 uppercase tracking-widest whitespace-nowrap shadow-xs">
          ✦ Household Domain
        </div>
      </Html>
      <Html position={[4.0, 1.4, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-navy-100/90 border border-navy-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-navy-700 uppercase tracking-widest whitespace-nowrap shadow-xs">
          ✦ Transactions Domain
        </div>
      </Html>
      <Html position={[0.0, 4.6, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-purple-100/90 border border-purple-500/40 px-2.5 py-0.5 rounded text-[10px] font-mono text-purple-800 uppercase tracking-widest whitespace-nowrap shadow-xs">
          ✦ Cafes, Movies & Experiences Domain
        </div>
      </Html>

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
    </group>
  );
};

export default function LifeOrbit(props: LifeOrbitProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileInteractive, setMobileInteractive] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="w-full h-full bg-parchment-100 relative" role="img" aria-label="3D Visualization of Life Data Chapters">
      {/* Mobile Mode Switcher: ensures single-finger scroll works effortlessly over canvas by default */}
      {isMobile && (
        <div className="absolute bottom-3 right-3 z-20">
          <button
            onClick={() => setMobileInteractive(!mobileInteractive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider shadow-sm transition-all border ${
              mobileInteractive
                ? 'bg-ink-900 text-parchment-100 border-ink-900'
                : 'bg-parchment-50/90 text-ink-700 border-ink-300 backdrop-blur-sm'
            }`}
            aria-pressed={mobileInteractive}
          >
            {mobileInteractive ? (
              <>
                <ArrowUpDown size={13} />
                <span>Scroll Mode</span>
              </>
            ) : (
              <>
                <Rotate3d size={13} />
                <span>Rotate 3D</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Canvas container: on mobile, pointer-events-none when in scroll mode so vertical touch scrolls the page cleanly */}
      <div className={`w-full h-full ${isMobile && !mobileInteractive ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        <Canvas
          frameloop="demand"
          camera={{
            position: isMobile ? [0, 0.5, 20] : [0, 0, 16],
            fov: isMobile ? 52 : 45,
          }}
        >
          <OrbitControls
            enablePan={!isMobile}
            enableZoom={!isMobile} // Disable zoom on mobile so pinch gestures don't trap the user
            enableRotate={!isMobile || mobileInteractive} // Mobile rotation only active when explicitly enabled
            rotateSpeed={0.8}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
          <LifeOrbitScene {...props} />
        </Canvas>
      </div>
    </div>
  );
}
