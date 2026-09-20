import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Chapter, LifeReceipt, DataSource } from '@/types';
import { TYPE_COLORS, formatCount, formatDateRange } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LifeOrbitProps {
  chapters: Chapter[];
  receipts: LifeReceipt[];
  onNodeSelect: (chapter: Chapter | null) => void;
  selectedChapterId: string | null;
  filterSource: DataSource | null;
}

const DOMAIN_CENTERS = {
  music: new THREE.Vector3(-4, 2, 0),
  expense: new THREE.Vector3(-4, -2, 0),
  transaction: new THREE.Vector3(4, 0, 0),
  core: new THREE.Vector3(0, 0, 0)
};

const NodeSphere = ({ 
  chapter, 
  position, 
  isSelected, 
  onClick,
  onHover
}: { 
  chapter: Chapter, 
  position: THREE.Vector3, 
  isSelected: boolean,
  onClick: () => void,
  onHover: (hovered: boolean) => void
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = TYPE_COLORS[chapter.dominantType] || '#1A1814';
  
  // Size based on records (min 0.2, max 0.8)
  const size = Math.max(0.2, Math.min(0.8, (chapter.stats.totalReceipts / 5000) * 0.8 + 0.2));
  const scale = isSelected ? 1.3 : 1;

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.01;
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
        <meshStandardMaterial 
          color={color} 
          roughness={0.7} 
          metalness={0.0}
        />
      </mesh>
    </group>
  );
};

const LifeOrbitScene = ({ chapters, selectedChapterId, onNodeSelect, filterSource }: LifeOrbitProps) => {
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);

  // Filter chapters if needed
  const visibleChapters = useMemo(() => {
    if (!filterSource) return chapters;
    return chapters.filter(c => c.dominantSource === filterSource);
  }, [chapters, filterSource]);

  // Position nodes — deterministic seeded offsets (no Math.random, positions stable across renders)
  const nodes = useMemo(() => {
    return visibleChapters.map((chapter, i) => {
      let center = DOMAIN_CENTERS.core;
      if (chapter.dominantType === 'music') center = DOMAIN_CENTERS.music;
      else if (chapter.dominantType === 'expense') center = DOMAIN_CENTERS.expense;
      else if (chapter.dominantType === 'transaction') center = DOMAIN_CENTERS.transaction;

      const isConvergence = chapter.dateRange[0].includes('2015') || chapter.dateRange[0].includes('2016')
        || chapter.dateRange[0].includes('2017') || chapter.dateRange[0].includes('2018');

      // Deterministic pseudo-random offset from index
      const seedX = Math.sin(i * 127.1) * 0.5;
      const seedZ = Math.sin(i * 311.7) * 1.5;

      let pos = new THREE.Vector3();
      if (isConvergence && (chapter.dominantType === 'music' || chapter.dominantType === 'expense')) {
        const angle = (i * Math.PI * 2) / Math.max(10, visibleChapters.length);
        const radius = 1.5;
        pos.set(
          -4 + Math.cos(angle) * radius,
          0 + Math.sin(angle) * radius,
          seedZ * 0.5
        );
      } else {
        const angle = (i * Math.PI * 2) / Math.max(1, visibleChapters.length);
        const radius = 2.5 + Math.abs(seedX);
        pos.set(
          center.x + Math.cos(angle) * radius,
          center.y + Math.sin(angle) * radius,
          center.z + seedZ
        );
      }

      return { chapter, position: pos };
    });
  }, [visibleChapters]);

  return (
    <>
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFF5E6" />
      
      {/* Core Node */}
      <Sphere args={[1.2, 32, 32]} position={[0,0,0]}>
        <meshStandardMaterial color="#1A1814" roughness={0.7} metalness={0.0} />
      </Sphere>

      {/* Domain Labels */}
      {!filterSource && (
        <>
          <Text position={[-4, 4.5, 0]} fontSize={0.5} color="#4A4640" anchorX="center" anchorY="middle">
            Music
          </Text>
          <Text position={[-4, -4.5, 0]} fontSize={0.5} color="#4A4640" anchorX="center" anchorY="middle">
            Expenses
          </Text>
          <Text position={[4, 2.5, 0]} fontSize={0.5} color="#4A4640" anchorX="center" anchorY="middle">
            Transactions
          </Text>
        </>
      )}

      {/* Chapter Nodes */}
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

      {/* Connections for selected node */}
      {selectedChapterId && nodes.find(n => n.chapter.id === selectedChapterId) && (
        <group>
          {nodes.find(n => n.chapter.id === selectedChapterId)?.chapter.connections.map(conn => {
            const targetNode = nodes.find(n => n.chapter.id === conn.targetId);
            if (!targetNode) return null;
            const sourcePos = nodes.find(n => n.chapter.id === selectedChapterId)!.position;
            const targetPos = targetNode.position;
            const points = [sourcePos, targetPos];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            return (
              <line key={conn.id}>
                <bufferGeometry attach="geometry" {...geometry} />
                <lineBasicMaterial attach="material" color="#D5D0C8" linewidth={1} transparent opacity={0.6} />
              </line>
            );
          })}
        </group>
      )}

      {/* Tooltip HTML */}
      {hoveredChapter && (
        <Html position={nodes.find(n => n.chapter.id === hoveredChapter.id)?.position || new THREE.Vector3()} center style={{ pointerEvents: 'none' }}>
          <div className="bg-parchment-50 border border-ink-300 p-3 shadow-md rounded-md min-w-[200px] font-body text-ink-900 pointer-events-none mb-10">
            <h4 className="font-display font-bold text-lg leading-tight mb-1">{hoveredChapter.title}</h4>
            <p className="text-label text-ink-700 uppercase mb-2">{formatDateRange(hoveredChapter.dateRange[0], hoveredChapter.dateRange[1])}</p>
            <div className="flex justify-between items-center text-sm border-t border-ink-300 pt-2">
              <span className="font-mono text-ink-500">{formatCount(hoveredChapter.stats.totalReceipts)} recs</span>
              <span className="font-medium truncate max-w-[100px]" style={{ color: TYPE_COLORS[hoveredChapter.dominantType] }}>
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
  // Intersection observer logic to only render when in view could be added here
  
  return (
    <div className="w-full h-full bg-parchment-100" role="img" aria-label="3D Visualization of Life Data Chapters">
      <Canvas frameloop="demand" camera={{ position: [0, 0, 15], fov: 45 }}>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <LifeOrbitScene {...props} />
      </Canvas>
    </div>
  );
}
