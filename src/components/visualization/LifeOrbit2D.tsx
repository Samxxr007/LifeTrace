import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Chapter, LifeReceipt, DataSource } from '@/types';
import { TYPE_COLORS, formatCount, formatDateRange } from '@/lib/utils';

interface LifeOrbit2DProps {
  chapters: Chapter[];
  receipts: LifeReceipt[];
  onNodeSelect: (chapter: Chapter | null) => void;
  selectedChapterId: string | null;
  filterSource: DataSource | null;
}

export default function LifeOrbit2D({ chapters, selectedChapterId, onNodeSelect, filterSource }: LifeOrbit2DProps) {
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);

  const visibleChapters = useMemo(() => {
    if (!filterSource) return chapters;
    if (filterSource === 'synthetic') {
      return chapters.filter(c => c.dominantSource === 'synthetic' || c.receipts.some(r => r.source === 'synthetic'));
    }
    return chapters.filter(c => c.dominantSource === filterSource);
  }, [chapters, filterSource]);

  // Simplified layout for 2D
  const nodes = useMemo(() => {
    const width = 800;
    const height = 600;
    
    return visibleChapters.map((chapter, i) => {
      let cx = width / 2;
      let cy = height / 2;
      
      if (
        chapter.dominantSource === 'synthetic' ||
        chapter.dominantType === 'place' ||
        chapter.dominantType === 'event' ||
        chapter.receipts.some(r => r.source === 'synthetic')
      ) {
        cx = width * 0.5; cy = height * 0.18;
      } else if (chapter.dominantType === 'music') {
        cx = width * 0.25; cy = height * 0.35;
      } else if (chapter.dominantType === 'expense') {
        cx = width * 0.25; cy = height * 0.7;
      } else if (chapter.dominantType === 'transaction') {
        cx = width * 0.75; cy = height * 0.5;
      }

      const isConvergence = chapter.dateRange[0].includes('2015') || chapter.dateRange[0].includes('2016') || chapter.dateRange[0].includes('2017') || chapter.dateRange[0].includes('2018');
      
      if (isConvergence && (chapter.dominantType === 'music' || chapter.dominantType === 'expense')) {
        cx = width * 0.35;
        cy = height * 0.5;
      }

      // Add scatter
      cx += (Math.random() - 0.5) * 150;
      cy += (Math.random() - 0.5) * 150;

      const r = Math.max(8, Math.min(30, (chapter.stats.totalReceipts / 5000) * 30 + 8));

      return { chapter, cx, cy, r };
    });
  }, [visibleChapters]);

  const selectedNode = nodes.find(n => n.chapter.id === selectedChapterId);

  return (
    <div className="w-full h-full bg-parchment-100 relative overflow-hidden" role="img" aria-label="2D Visualization of Life Data Chapters">
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {/* Domain Planets & Labels */}
        {!filterSource && (
          <g textAnchor="middle">
            {/* Music Planet */}
            <circle cx="200" cy="140" r="24" fill="none" stroke="#C4622D" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="200" cy="140" r="16" fill="#C4622D" opacity="0.85" />
            <text x="200" y="95" className="text-ink-700 font-display text-sm font-semibold opacity-70">Music</text>

            {/* Expenses Planet */}
            <circle cx="200" cy="510" r="24" fill="none" stroke="#3D5A47" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="200" cy="510" r="16" fill="#3D5A47" opacity="0.85" />
            <text x="200" y="555" className="text-ink-700 font-display text-sm font-semibold opacity-70">Expenses</text>

            {/* Transactions Planet */}
            <circle cx="600" cy="300" r="24" fill="none" stroke="#2B4B6F" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="600" cy="300" r="16" fill="#2B4B6F" opacity="0.85" />
            <text x="600" y="260" className="text-ink-700 font-display text-sm font-semibold opacity-70">Transactions</text>

            {/* Cafes & Experiences Planet */}
            <circle cx="400" cy="110" r="32" fill="none" stroke="#7B4B94" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <circle cx="400" cy="110" r="20" fill="#7B4B94" opacity="0.9" />
            <text x="400" y="65" className="text-purple-900 font-display text-sm font-semibold opacity-85">Cafes, Movies & Experiences</text>
          </g>
        )}

        {/* Edges for selected node */}
        {selectedNode && selectedNode.chapter.connections.map(conn => {
          const targetNode = nodes.find(n => n.chapter.id === conn.targetId);
          if (!targetNode) return null;
          return (
            <line
              key={conn.id}
              x1={selectedNode.cx}
              y1={selectedNode.cy}
              x2={targetNode.cx}
              y2={targetNode.cy}
              stroke="#D5D0C8"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(({ chapter, cx, cy, r }) => (
          <motion.circle
            key={chapter.id}
            cx={cx}
            cy={cy}
            r={selectedChapterId === chapter.id ? r * 1.3 : r}
            fill={TYPE_COLORS[chapter.dominantType] || '#1A1814'}
            className="cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ink-900"
            onClick={() => onNodeSelect(chapter)}
            onMouseEnter={() => setHoveredChapter(chapter)}
            onMouseLeave={() => setHoveredChapter(null)}
            onKeyDown={(e) => { if(e.key === 'Enter') onNodeSelect(chapter); }}
            tabIndex={0}
            aria-label={`${chapter.title}, ${chapter.stats.totalReceipts} records`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </svg>

      {/* HTML Tooltip */}
      {hoveredChapter && (
        <div 
          className="absolute bg-parchment-50 border border-ink-300 p-3 shadow-md rounded-md min-w-[200px] font-body text-ink-900 pointer-events-none z-10"
          style={{ 
            left: (nodes.find(n => n.chapter.id === hoveredChapter.id)?.cx || 0) + 'px', 
            top: ((nodes.find(n => n.chapter.id === hoveredChapter.id)?.cy || 0) - 20) + 'px',
            transform: 'translate(-50%, -100%)'
          }}
        >
          <h4 className="font-display font-bold text-lg leading-tight mb-1">{hoveredChapter.title}</h4>
          <p className="text-label text-ink-700 uppercase mb-2">{formatDateRange(hoveredChapter.dateRange[0], hoveredChapter.dateRange[1])}</p>
          <div className="flex justify-between items-center text-sm border-t border-ink-300 pt-2">
            <span className="font-mono text-ink-500">{formatCount(hoveredChapter.stats.totalReceipts)} recs</span>
            <span className="font-medium truncate max-w-[100px]" style={{ color: TYPE_COLORS[hoveredChapter.dominantType] }}>
              {hoveredChapter.dominantCategory || hoveredChapter.stats.topArtist || hoveredChapter.dominantType}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
