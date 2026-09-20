import React, { useMemo } from 'react';
import { Chapter, LifeReceipt } from '@/types';
import { TYPE_COLORS, parseTimestamp } from '@/lib/utils';

interface TimelineBarProps {
  receipts: LifeReceipt[];
  chapters: Chapter[];
  dateRange: [string, string];
  selectedRange: [string, string];
  onRangeChange: (range: [string, string]) => void;
}

export default function TimelineBar({ receipts, chapters, dateRange, selectedRange, onRangeChange }: TimelineBarProps) {
  
  // Calculate months and density
  const densityMap = useMemo(() => {
    // simplified implementation for density strip
    const start = parseTimestamp(dateRange[0])?.getTime() || 0;
    const end = parseTimestamp(dateRange[1])?.getTime() || Date.now();
    const duration = end - start;
    
    const buckets = new Array(100).fill(null).map(() => ({ count: 0, dominantType: 'note' as any }));
    
    receipts.forEach(r => {
      const t = parseTimestamp(r.timestamp)?.getTime();
      if (!t) return;
      const pct = (t - start) / duration;
      const bucketIdx = Math.max(0, Math.min(99, Math.floor(pct * 100)));
      buckets[bucketIdx].count++;
      // simplified dominant type logic
      if(r.type === 'music') buckets[bucketIdx].dominantType = 'music';
      else if(r.type === 'expense') buckets[bucketIdx].dominantType = 'expense';
      else if(r.type === 'transaction') buckets[bucketIdx].dominantType = 'transaction';
    });
    
    return buckets;
  }, [receipts, dateRange]);

  return (
    <div className="w-full h-24 bg-parchment-100 border-t border-ink-300 flex flex-col relative px-4 py-2" role="group" aria-label="Timeline scrubber">
      
      {/* Chapter Markers & The Convergence */}
      <div className="h-6 relative w-full text-xs font-mono text-ink-500 mb-1">
        {chapters.map((ch, i) => {
          // simplified position
          const pct = Math.random() * 100; // in a real app, calculate from dateRange
          return (
            <div key={ch.id} className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${pct}%` }}>
              <div className="w-px h-2 bg-ink-300"></div>
              <span>{i + 1}</span>
            </div>
          );
        })}
        {/* The Convergence */}
        <div className="absolute top-0 left-1/3 transform -translate-x-1/2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
          THE CONVERGENCE (2015-2018)
        </div>
      </div>

      {/* Density Strip */}
      <div className="flex-1 relative w-full flex items-end opacity-70">
        {densityMap.map((bucket, i) => (
          <div 
            key={i} 
            className="flex-1 ml-px" 
            style={{ 
              height: `${Math.max(10, Math.min(100, (bucket.count / 500) * 100))}%`, 
              backgroundColor: TYPE_COLORS[bucket.dominantType] || '#D5D0C8' 
            }}
          />
        ))}
      </div>

      {/* Range handles (mock UI for now) */}
      <div className="absolute top-8 bottom-4 left-[10%] right-[20%] border-x-2 border-ink-900 pointer-events-none" />

      {/* Year labels */}
      <div className="h-6 flex justify-between items-center text-xs font-mono text-ink-500 mt-1">
        <span>2013</span>
        <span>2018</span>
        <span>2024</span>
      </div>
    </div>
  );
}
