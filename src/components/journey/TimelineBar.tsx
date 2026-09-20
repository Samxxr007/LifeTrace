import React, { useMemo } from 'react';
import type { Chapter, LifeReceipt } from '@/types';
import { TYPE_COLORS, parseTimestamp, formatDateShort } from '@/lib/utils';
import { QUICK_PERIODS, QuickPeriod } from '@/hooks/useJourney';
import { Sparkles } from 'lucide-react';

interface TimelineBarProps {
  receipts: LifeReceipt[];
  chapters: Chapter[];
  dateRange: [string, string];
  selectedRange: [string, string];
  onRangeChange: (range: [string, string]) => void;
  onChapterSelect?: (chapterId: string) => void;
  selectedChapterId?: string | null;
}

export default function TimelineBar({
  receipts,
  chapters,
  dateRange,
  selectedRange,
  onRangeChange,
  onChapterSelect,
  selectedChapterId,
}: TimelineBarProps) {
  const minTime = useMemo(() => new Date('2013-01-01T00:00:00Z').getTime(), []);
  const maxTime = useMemo(() => new Date('2024-12-31T23:59:59Z').getTime(), []);
  const totalDuration = maxTime - minTime;

  // Real density histogram: 48 quarterly buckets across 2013–2024
  const densityBuckets = useMemo(() => {
    const BUCKETS = 48;
    const buckets = Array.from({ length: BUCKETS }, () => ({
      count: 0,
      dominantType: 'note' as any,
    }));

    receipts.forEach((r) => {
      const t = parseTimestamp(r.timestamp)?.getTime();
      if (!t || t < minTime || t > maxTime) return;
      const idx = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((t - minTime) / totalDuration) * BUCKETS)));
      buckets[idx].count++;
      if (r.type === 'music') buckets[idx].dominantType = 'music';
      else if (r.type === 'expense') buckets[idx].dominantType = 'expense';
      else if (r.type === 'transaction') buckets[idx].dominantType = 'transaction';
    });

    const maxCount = Math.max(1, ...buckets.map((b) => b.count));
    return { buckets, maxCount };
  }, [receipts, minTime, maxTime, totalDuration]);

  // Selected range percentage for visual highlight
  const selectedPct = useMemo(() => {
    const s = Math.max(minTime, new Date(selectedRange[0]).getTime());
    const e = Math.min(maxTime, new Date(selectedRange[1]).getTime());
    const left = Math.max(0, Math.min(100, ((s - minTime) / totalDuration) * 100));
    const width = Math.max(2, Math.min(100 - left, ((e - s) / totalDuration) * 100));
    return { left, width };
  }, [selectedRange, minTime, maxTime, totalDuration]);

  // Chapter markers with real date positions
  const chapterMarkers = useMemo(() => {
    return chapters.map((ch) => {
      const t = parseTimestamp(ch.dateRange[0])?.getTime() || minTime;
      const pct = Math.max(0, Math.min(100, ((t - minTime) / totalDuration) * 100));
      return {
        id: ch.id,
        title: ch.title,
        dominantType: ch.dominantType,
        pct,
      };
    });
  }, [chapters, minTime, totalDuration]);

  // Handle click on timeline to set center of selected period
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = minTime + pct * totalDuration;
    const targetYear = new Date(targetTime).getFullYear();

    // Set 2-year window around clicked year
    const startYear = Math.max(2013, targetYear - 1);
    const endYear = Math.min(2024, targetYear + 1);
    onRangeChange([`${startYear}-01-01T00:00:00Z`, `${endYear}-12-31T23:59:59Z`]);
  };

  const isAllSelected = selectedRange[0].includes('2013') && selectedRange[1].includes('2024');

  return (
    <div className="w-full bg-parchment-100 flex flex-col space-y-3" role="group" aria-label="Interactive timeline scrubber">
      {/* Top Header: Quick Period Selectors + Active Range Label */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mr-1 hidden sm:inline">
            Period:
          </span>
          {QUICK_PERIODS.map((p) => {
            const isSelected =
              selectedRange[0] === p.range[0] && selectedRange[1] === p.range[1];
            return (
              <button
                key={p.id}
                onClick={() => onRangeChange(p.range)}
                className={`px-2.5 py-1 rounded-xs font-mono text-xs transition-colors border ${
                  isSelected
                    ? p.id === 'convergence'
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'bg-ink-900 text-parchment-100 border-ink-900 font-bold'
                    : p.id === 'convergence'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                    : 'bg-parchment-200 text-ink-700 border-ink-300 hover:border-ink-600'
                }`}
                aria-pressed={isSelected}
              >
                {p.id === 'convergence' && <Sparkles size={11} className="inline mr-1" />}
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Selected Period Indicator */}
        <div className="font-mono text-xs text-ink-600 flex items-center gap-2">
          <span>
            {new Date(selectedRange[0]).getFullYear()} — {new Date(selectedRange[1]).getFullYear()}
          </span>
          {!isAllSelected && (
            <button
              onClick={() => onRangeChange(['2013-01-01T00:00:00Z', '2024-12-31T23:59:59Z'])}
              className="text-[11px] underline text-ink-500 hover:text-ink-900"
            >
              Reset to All
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Track */}
      <div
        onClick={handleTimelineClick}
        className="h-16 w-full bg-parchment-200 border border-ink-300 relative cursor-pointer select-none rounded-xs overflow-hidden"
        title="Click anywhere to scrub timeline period"
        role="slider"
        aria-valuemin={2013}
        aria-valuemax={2024}
        aria-valuenow={new Date(selectedRange[0]).getFullYear()}
        aria-label="Timeline scrubber"
        tabIndex={0}
      >
        {/* The Convergence Overlap Highlight (2015–2018) */}
        <div
          className="absolute top-0 bottom-0 bg-amber-500/15 border-x border-amber-500/40 pointer-events-none"
          style={{
            left: `${((new Date('2015-01-01').getTime() - minTime) / totalDuration) * 100}%`,
            width: `${((new Date('2018-12-31').getTime() - new Date('2015-01-01').getTime()) / totalDuration) * 100}%`,
          }}
        >
          <span className="absolute top-1 left-2 font-mono text-[9px] uppercase tracking-widest text-amber-800 font-bold hidden sm:inline">
            Convergence
          </span>
        </div>

        {/* Density Histogram Bars */}
        <div className="absolute inset-0 flex items-end px-1 pb-1 gap-px pointer-events-none opacity-80">
          {densityBuckets.buckets.map((bucket, i) => {
            const heightPct = Math.max(8, Math.min(100, (bucket.count / densityBuckets.maxCount) * 100));
            return (
              <div
                key={i}
                className="flex-1 rounded-t-xs"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: TYPE_COLORS[bucket.dominantType] || '#8A8480',
                }}
              />
            );
          })}
        </div>

        {/* Selected Window Range Shading */}
        <div
          className="absolute top-0 bottom-0 border-x-2 border-ink-900 bg-ink-900/10 pointer-events-none transition-all duration-200"
          style={{
            left: `${selectedPct.left}%`,
            width: `${selectedPct.width}%`,
          }}
        />

        {/* Real Chapter Markers */}
        <div className="absolute top-1 inset-x-0 h-4 pointer-events-none">
          {chapterMarkers.map((cm, i) => (
            <button
              key={cm.id}
              onClick={(e) => {
                e.stopPropagation();
                onChapterSelect?.(cm.id);
              }}
              className={`absolute top-0 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono pointer-events-auto transition-transform ${
                selectedChapterId === cm.id
                  ? 'bg-ink-900 text-parchment-100 scale-125 z-10'
                  : 'bg-parchment-50 text-ink-700 border border-ink-400 hover:scale-110'
              }`}
              style={{ left: `${cm.pct}%` }}
              title={`Chapter ${i + 1}: ${cm.title}`}
              aria-label={`Jump to Chapter ${i + 1}: ${cm.title}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Year Scale Labels */}
      <div className="flex justify-between items-center text-[11px] font-mono text-ink-500 px-0.5">
        <span>2013 (Spotify Launch)</span>
        <span className="text-amber-800 font-medium">2015–2018 (Convergence)</span>
        <span>2022–2024 (Financial Era)</span>
      </div>
    </div>
  );
}
