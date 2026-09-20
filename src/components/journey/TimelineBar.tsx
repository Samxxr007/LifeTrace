import React, { useState, useMemo } from 'react';
import type { Chapter, LifeReceipt, ReceiptType } from '@/types';
import { TYPE_COLORS, parseTimestamp, formatDateShort } from '@/lib/utils';
import { QUICK_PERIODS } from '@/hooks/useJourney';
import { Sparkles, Clock, Calendar, Filter } from 'lucide-react';

export type TimeGranularity = 'all' | 'year' | 'month' | 'week' | 'day';

interface TimelineBarProps {
  receipts: LifeReceipt[];
  chapters: Chapter[];
  dateRange: [string, string];
  selectedRange: [string, string];
  onRangeChange: (range: [string, string]) => void;
  onChapterSelect?: (chapterId: string) => void;
  selectedChapterId?: string | null;
  onOpenRelive?: (dateIso: string) => void;
}

export default function TimelineBar({
  receipts,
  chapters,
  dateRange,
  selectedRange,
  onRangeChange,
  onChapterSelect,
  selectedChapterId,
  onOpenRelive,
}: TimelineBarProps) {
  const [granularity, setGranularity] = useState<TimeGranularity>('all');
  const [activeDomainFilter, setActiveDomainFilter] = useState<string>('all');

  // Dynamic time boundaries based on real dataset records (no hardcoded years)
  const { minTime, maxTime, nowTime } = useMemo(() => {
    const now = Date.now();
    if (!receipts || receipts.length === 0) {
      return {
        minTime: now - 365 * 24 * 3600 * 1000,
        maxTime: now + 90 * 24 * 3600 * 1000,
        nowTime: now,
      };
    }

    let min = Infinity;
    let max = -Infinity;

    receipts.forEach((r) => {
      const t = parseTimestamp(r.timestamp)?.getTime();
      if (t) {
        if (t < min) min = t;
        if (t > max) max = t;
      }
    });

    // Pad dynamically: ensure at least min is bounded, and max includes upcoming if any
    const finalMin = isFinite(min) ? min : new Date('2013-01-01T00:00:00Z').getTime();
    const finalMax = isFinite(max) ? Math.max(max, now) : new Date('2025-12-31T23:59:59Z').getTime();

    return { minTime: finalMin, maxTime: finalMax, nowTime: now };
  }, [receipts]);

  const totalDuration = Math.max(1, maxTime - minTime);

  // Filter receipts by active domain if specified
  const filteredReceipts = useMemo(() => {
    if (activeDomainFilter === 'all') return receipts;
    if (activeDomainFilter === 'user') return receipts.filter((r) => r.source === 'user');
    if (activeDomainFilter === 'synthetic') return receipts.filter((r) => r.source === 'synthetic');
    return receipts.filter((r) => r.type === activeDomainFilter);
  }, [receipts, activeDomainFilter]);

  // Dynamic density histogram based on granularity
  const densityBuckets = useMemo(() => {
    let bucketCount = 48; // default
    if (granularity === 'year') bucketCount = 24;
    else if (granularity === 'month') bucketCount = 60;
    else if (granularity === 'week') bucketCount = 80;
    else if (granularity === 'day') bucketCount = 100;

    const buckets = Array.from({ length: bucketCount }, () => ({
      count: 0,
      dominantType: 'note' as ReceiptType,
      isFuture: false,
    }));

    filteredReceipts.forEach((r) => {
      const t = parseTimestamp(r.timestamp)?.getTime();
      if (!t || t < minTime || t > maxTime) return;
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor(((t - minTime) / totalDuration) * bucketCount)));
      buckets[idx].count++;
      if (t >= nowTime) buckets[idx].isFuture = true;
      if (r.type === 'music') buckets[idx].dominantType = 'music';
      else if (r.type === 'expense') buckets[idx].dominantType = 'expense';
      else if (r.type === 'transaction') buckets[idx].dominantType = 'transaction';
      else if (r.type === 'event') buckets[idx].dominantType = 'event';
      else if (r.type === 'place') buckets[idx].dominantType = 'place';
    });

    const maxCount = Math.max(1, ...buckets.map((b) => b.count));
    return { buckets, maxCount };
  }, [filteredReceipts, minTime, maxTime, totalDuration, granularity, nowTime]);

  // Selected range percentage for visual highlight
  const selectedPct = useMemo(() => {
    const s = Math.max(minTime, new Date(selectedRange[0]).getTime());
    const e = Math.min(maxTime, new Date(selectedRange[1]).getTime());
    const left = Math.max(0, Math.min(100, ((s - minTime) / totalDuration) * 100));
    const width = Math.max(2, Math.min(100 - left, ((e - s) / totalDuration) * 100));
    return { left, width };
  }, [selectedRange, minTime, maxTime, totalDuration]);

  // Where "now" sits on the timeline
  const nowPct = useMemo(() => {
    if (nowTime < minTime) return 0;
    if (nowTime > maxTime) return 100;
    return ((nowTime - minTime) / totalDuration) * 100;
  }, [nowTime, minTime, maxTime, totalDuration]);

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

    // Window size depends on granularity
    let windowSpan = 365 * 24 * 3600 * 1000; // 1 year default
    if (granularity === 'month') windowSpan = 30 * 24 * 3600 * 1000;
    else if (granularity === 'week') windowSpan = 7 * 24 * 3600 * 1000;
    else if (granularity === 'day') windowSpan = 24 * 3600 * 1000;

    const start = new Date(Math.max(minTime, targetTime - windowSpan / 2)).toISOString();
    const end = new Date(Math.min(maxTime, targetTime + windowSpan / 2)).toISOString();

    onRangeChange([start, end]);
  };

  const startYear = new Date(minTime).getFullYear();
  const endYear = new Date(maxTime).getFullYear();
  const currentSelectedStart = new Date(selectedRange[0]).toLocaleDateString();
  const currentSelectedEnd = new Date(selectedRange[1]).toLocaleDateString();

  return (
    <div
      className="w-full bg-parchment-100 flex flex-col space-y-3"
      role="group"
      aria-label="Interactive timeline scrubber"
    >
      {/* Top Header: Granularity + Domain Filters + Relive CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200/80 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mr-1 hidden sm:inline">
            Granularity:
          </span>
          {(['all', 'year', 'month', 'week', 'day'] as TimeGranularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-2 py-0.5 rounded-xs font-mono text-[11px] uppercase transition-colors border ${
                granularity === g
                  ? 'bg-ink-900 text-parchment-100 border-ink-900 font-bold'
                  : 'bg-parchment-200 text-ink-700 border-ink-300 hover:border-ink-600'
              }`}
            >
              {g}
            </button>
          ))}

          <div className="h-4 w-px bg-ink-300 mx-1 hidden sm:block" />

          {/* Domain Filter Pills */}
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mr-1 hidden sm:inline">
            Domain:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'music', label: 'Music' },
            { id: 'expense', label: 'Expense' },
            { id: 'transaction', label: 'Transact' },
            { id: 'place', label: 'Places' },
            { id: 'synthetic', label: 'Cafes & Events' },
            { id: 'user', label: 'User Added' },
          ].map((df) => (
            <button
              key={df.id}
              onClick={() => setActiveDomainFilter(df.id)}
              className={`px-2 py-0.5 rounded-xs font-mono text-[11px] transition-colors ${
                activeDomainFilter === df.id
                  ? 'bg-ink-800 text-parchment-100 font-bold'
                  : 'bg-parchment-200/80 text-ink-600 hover:bg-parchment-300'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Relive This Period Button */}
        {onOpenRelive && (
          <button
            onClick={() => onOpenRelive(selectedRange[0])}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xs font-mono text-xs font-bold transition-all shadow-xs"
            title="Inspect surrounding moments and active connections for this date"
          >
            <Clock size={13} />
            <span>Relive Selected Date</span>
          </button>
        )}
      </div>

      {/* Preset Quick Periods */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mr-1 hidden sm:inline">
            Presets:
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
            {currentSelectedStart} — {currentSelectedEnd}
          </span>
          <button
            onClick={() => onRangeChange([new Date(minTime).toISOString(), new Date(maxTime).toISOString()])}
            className="text-[11px] underline text-ink-500 hover:text-ink-900"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Main Interactive Track */}
      <div
        onClick={handleTimelineClick}
        className="h-16 w-full bg-parchment-200 border border-ink-300 relative cursor-pointer select-none rounded-xs overflow-hidden"
        title="Click anywhere to scrub timeline period"
        role="slider"
        aria-valuemin={startYear}
        aria-valuemax={endYear}
        aria-label="Timeline scrubber"
        tabIndex={0}
      >
        {/* Dynamic Future / Upcoming Zone (if now is within timeline span) */}
        {nowPct > 0 && nowPct < 100 && (
          <div
            className="absolute top-0 bottom-0 bg-amber-500/10 border-l border-dashed border-amber-600/60 pointer-events-none"
            style={{
              left: `${nowPct}%`,
              right: 0,
            }}
          >
            <span className="absolute top-1 right-2 font-mono text-[9px] uppercase tracking-widest text-amber-800 font-bold hidden sm:inline">
              Upcoming / Future
            </span>
          </div>
        )}

        {/* Density Histogram Bars */}
        <div className="absolute inset-0 flex items-end px-1 pb-1 gap-px pointer-events-none opacity-80">
          {densityBuckets.buckets.map((bucket, i) => {
            const heightPct = Math.max(8, Math.min(100, (bucket.count / densityBuckets.maxCount) * 100));
            return (
              <div
                key={i}
                className="flex-1 rounded-t-xs transition-all"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: bucket.isFuture
                    ? '#C4622D'
                    : TYPE_COLORS[bucket.dominantType] || '#8A8480',
                  opacity: bucket.count === 0 ? 0.2 : 0.9,
                }}
              />
            );
          })}
        </div>

        {/* Selected Window Range Shading */}
        <div
          className="absolute top-0 bottom-0 border-x-2 border-ink-900 bg-ink-900/10 pointer-events-none transition-all duration-150"
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

      {/* Year Scale Labels (Dynamic) */}
      <div className="flex justify-between items-center text-[11px] font-mono text-ink-500 px-0.5">
        <span>{startYear} (Earliest Trace)</span>
        <span className="text-amber-800 font-medium">Historical Continuous Archive</span>
        <span>{endYear} (Present & Horizon)</span>
      </div>
    </div>
  );
}
