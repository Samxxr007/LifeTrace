import React, { useState, useEffect, Suspense } from 'react';
import type { DataSource, Chapter } from '@/types';
import ChapterPanel from '@/components/journey/ChapterPanel';
import TimelineBar from '@/components/journey/TimelineBar';
import LifeOrbit2D from '@/components/visualization/LifeOrbit2D';
import StatComposition from '@/components/visualization/StatComposition';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useLifeData } from '@/hooks/useLifeData';
import { useConnections } from '@/hooks/useConnections';
import { useChapters } from '@/hooks/useChapters';
import { computeInsights } from '@/engine/insights';
import { formatDateRange, formatCount, TYPE_COLORS } from '@/lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// Lazy-loaded 3D Life Orbit
const LifeOrbit = React.lazy(() => import('@/components/visualization/LifeOrbit'));

export default function Journey() {
  const [canUseWebGL, setCanUseWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<DataSource | null>(null);
  const [dateRange, setDateRange] = useState<[string, string]>(['2013-01-01T00:00:00Z', '2024-12-31T23:59:59Z']);

  const { receipts, spotifyStats, householdStats, transactionStats, isLoading } = useLifeData();
  const { connections } = useConnections(receipts);
  const { chapters } = useChapters(receipts, connections);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setCanUseWebGL(false);
    } catch {
      setCanUseWebGL(false);
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleNodeSelect = (chapter: Chapter | null) => {
    setSelectedChapterId(chapter ? chapter.id : null);
  };

  const handleExploreChapter = (id: string) => {
    window.location.href = `/discover?view=stories&chapter=${id}`;
  };

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) || null;
  const use3D = canUseWebGL && !prefersReducedMotion;

  const insights = computeInsights(
    receipts,
    connections,
    [],
    chapters,
    spotifyStats || ({} as any),
    householdStats || ({} as any),
    transactionStats || ({} as any)
  );

  return (
    <div className="w-full min-h-screen bg-parchment-100 flex flex-col font-body text-ink-900 pb-28">
      <h1 className="sr-only">Life Journey — Life Orbit & Timeline</h1>

      {/* Top Filter Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 pb-3 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink-500">Visual Centerpiece</span>
          <h2 className="font-display text-2xl sm:text-3xl text-ink-900">Life Orbit</h2>
        </div>

        {/* Domain Filter Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 bg-parchment-200 p-1 rounded-sm border border-ink-300">
          <button
            onClick={() => setFilterSource(null)}
            className={`px-3 py-1 font-mono text-xs tracking-wider rounded-sm transition-colors ${
              !filterSource ? 'bg-ink-900 text-parchment-100' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilterSource('spotify')}
            className={`px-3 py-1 font-mono text-xs tracking-wider rounded-sm transition-colors ${
              filterSource === 'spotify' ? 'bg-burnt-500 text-parchment-100' : 'text-ink-600 hover:text-burnt-700'
            }`}
          >
            MUSIC
          </button>
          <button
            onClick={() => setFilterSource('household')}
            className={`px-3 py-1 font-mono text-xs tracking-wider rounded-sm transition-colors ${
              filterSource === 'household' ? 'bg-forest-500 text-parchment-100' : 'text-ink-600 hover:text-forest-700'
            }`}
          >
            EXPENSES
          </button>
          <button
            onClick={() => setFilterSource('transactions')}
            className={`px-3 py-1 font-mono text-xs tracking-wider rounded-sm transition-colors ${
              filterSource === 'transactions' ? 'bg-navy-500 text-parchment-100' : 'text-ink-600 hover:text-navy-700'
            }`}
          >
            TRANSACTIONS
          </button>
        </div>
      </div>

      {/* 3D Orbit Viewport — fixed responsive height, scrollable past it */}
      <section className="relative w-full h-[48vh] sm:h-[58vh] md:h-[65vh] border-y border-ink-300 bg-parchment-100">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingState message="Mapping celestial orbits..." />
          </div>
        ) : use3D ? (
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center font-mono text-xs text-ink-500">
                  <LoadingState message="Rendering celestial orbit..." />
                </div>
              }
            >
              <LifeOrbit
                chapters={chapters}
                receipts={receipts}
                selectedChapterId={selectedChapterId}
                onNodeSelect={handleNodeSelect}
                filterSource={filterSource}
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <LifeOrbit2D
            chapters={chapters}
            receipts={receipts}
            selectedChapterId={selectedChapterId}
            onNodeSelect={handleNodeSelect}
            filterSource={filterSource}
          />
        )}

        {/* Minimal, non-intrusive convergence badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="inline-flex items-center gap-1.5 bg-parchment-50/90 backdrop-blur-sm border border-ink-300 px-3 py-1 rounded-full text-xs font-mono text-ink-700 shadow-xs">
            <Sparkles size={12} className="text-amber-600" />
            <span>2015–2018 Convergence: Music & Daily Life Intersect</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-4 pointer-events-none z-10 flex items-center gap-3 font-mono text-[10px] text-ink-500 uppercase tracking-wider hidden sm:flex">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-burnt-500 inline-block" /> Music
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-forest-500 inline-block" /> Household
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-navy-500 inline-block" /> Transactions
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" /> The Convergence
          </span>
        </div>
      </section>

      {/* Timeline Scrubber */}
      <section className="w-full bg-parchment-100 py-4 border-b border-ink-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <TimelineBar
            receipts={receipts}
            chapters={chapters}
            dateRange={['2013-01-01', '2024-12-31']}
            selectedRange={dateRange}
            onRangeChange={setDateRange}
          />
        </div>
      </section>

      {/* Chapter Cards / Details Feed (Fully scrollable on mobile!) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-10">
        <div className="flex justify-between items-baseline mb-6 border-b border-ink-300 pb-3">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500">Chronological Narrative</span>
            <h3 className="font-display text-2xl text-ink-900">Life Chapters</h3>
          </div>
          <Link
            to="/discover?view=stories"
            className="font-mono text-xs uppercase tracking-wider text-ink-600 hover:text-ink-900 flex items-center gap-1"
          >
            <span>Full Story</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => {
            const isSelected = selectedChapterId === chapter.id;
            return (
              <div
                key={chapter.id}
                onClick={() => setSelectedChapterId(isSelected ? null : chapter.id)}
                className={`p-6 border transition-all cursor-pointer rounded-sm ${
                  isSelected
                    ? 'border-ink-900 bg-parchment-200 shadow-md'
                    : 'border-ink-300 bg-parchment-50 hover:bg-parchment-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="font-mono text-xs uppercase font-medium"
                    style={{ color: TYPE_COLORS[chapter.dominantType] }}
                  >
                    {chapter.dominantType}
                  </span>
                  <span className="font-mono text-xs text-ink-500">
                    {formatCount(chapter.stats.totalReceipts)} moments
                  </span>
                </div>

                <h4 className="font-display text-xl font-bold text-ink-900 mb-1">{chapter.title}</h4>
                <p className="font-mono text-xs text-ink-500 mb-4">
                  {formatDateRange(chapter.dateRange[0], chapter.dateRange[1])}
                </p>

                <p className="font-body text-sm text-ink-700 line-clamp-2 mb-4">
                  {chapter.narrative || chapter.subtitle}
                </p>

                <div className="flex justify-between items-center text-xs font-mono text-ink-600 pt-3 border-t border-ink-200">
                  <span>{chapter.stats.topArtist || chapter.dominantCategory || 'Mixed'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExploreChapter(chapter.id);
                    }}
                    className="hover:text-ink-900 underline underline-offset-2"
                  >
                    Read Chapter →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Aggregate Statistics Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-16">
        <div className="border-t border-ink-300 pt-10">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-2 block">
            Macro Analysis
          </span>
          <h3 className="font-display text-2xl text-ink-900 mb-8">Archive Synthesis</h3>
          <StatComposition insights={insights} />
        </div>
      </section>

      {/* Slide-in Detail Drawer for selected chapter */}
      <ChapterPanel
        chapter={selectedChapter}
        onClose={() => setSelectedChapterId(null)}
        onExploreChapter={handleExploreChapter}
      />
    </div>
  );
}
