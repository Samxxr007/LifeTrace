import React, { useState, useEffect, Suspense } from 'react';
import { DataSource, Chapter } from '@/types';
import ChapterPanel from '@/components/journey/ChapterPanel';
import TimelineBar from '@/components/journey/TimelineBar';
import LifeOrbit2D from '@/components/visualization/LifeOrbit2D';
import { LoadingState } from '@/components/ui/LoadingState';
import { useLifeData } from '@/hooks/useLifeData';
import { useConnections } from '@/hooks/useConnections';
import { useChapters } from '@/hooks/useChapters';

// Lazy load the 3D orbit component
const LifeOrbit = React.lazy(() => import('@/components/visualization/LifeOrbit'));

export default function Journey() {
  const [canUseWebGL, setCanUseWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<DataSource | null>(null);
  const [dateRange, setDateRange] = useState<[string, string]>(['2013-01-01T00:00:00Z', '2024-12-31T23:59:59Z']);

  const { receipts, isLoading } = useLifeData();
  const { connections } = useConnections(receipts);
  const { chapters } = useChapters(receipts, connections);
  const loading = isLoading;

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setCanUseWebGL(false);
    } catch (e) {
      setCanUseWebGL(false);
    }

    // Check reduced motion
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

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-parchment-100">
        <LoadingState message="Tracing your moments..." />
      </div>
    );
  }

  const selectedChapter = chapters.find(c => c.id === selectedChapterId) || null;
  const use3D = canUseWebGL && !prefersReducedMotion;

  return (
    <div className="w-full h-screen bg-parchment-100 flex flex-col overflow-hidden relative font-body text-ink-900">
      
      <h1 className="sr-only">Life Journey</h1>

      {/* Header Filters */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="pointer-events-auto flex space-x-6">
          <button 
            onClick={() => setFilterSource(null)}
            className={`font-mono text-sm tracking-widest ${!filterSource ? 'text-ink-900 border-b border-ink-900' : 'text-ink-500 hover:text-ink-700'}`}
          >
            ALL
          </button>
          <button 
            onClick={() => setFilterSource('spotify')}
            className={`font-mono text-sm tracking-widest ${filterSource === 'spotify' ? 'text-burnt-500 border-b border-burnt-500' : 'text-ink-500 hover:text-ink-700'}`}
          >
            MUSIC
          </button>
          <button 
            onClick={() => setFilterSource('household')}
            className={`font-mono text-sm tracking-widest ${filterSource === 'household' ? 'text-forest-500 border-b border-forest-500' : 'text-ink-500 hover:text-ink-700'}`}
          >
            EXPENSES
          </button>
          <button 
            onClick={() => setFilterSource('transactions')}
            className={`font-mono text-sm tracking-widest ${filterSource === 'transactions' ? 'text-navy-500 border-b border-navy-500' : 'text-ink-500 hover:text-ink-700'}`}
          >
            TRANSACTIONS
          </button>
        </div>
      </header>

      {/* Main Visualization Area */}
      <main className="flex-1 relative w-full h-full">
        {use3D ? (
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center font-mono text-ink-500">Tracing your moments...</div>}>
            <LifeOrbit 
              chapters={chapters} 
              receipts={receipts} 
              selectedChapterId={selectedChapterId}
              onNodeSelect={handleNodeSelect}
              filterSource={filterSource}
            />
          </Suspense>
        ) : (
          <LifeOrbit2D
            chapters={chapters} 
            receipts={receipts} 
            selectedChapterId={selectedChapterId}
            onNodeSelect={handleNodeSelect}
            filterSource={filterSource}
          />
        )}

        {/* Key Insight */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-parchment-50 border border-ink-300 px-6 py-3 rounded-full shadow-lg pointer-events-none text-center">
          <p className="font-display italic text-ink-700">
            Your Convergence period (2015–2018) is where music and daily life intersected
          </p>
        </div>
      </main>

      {/* Side Panel */}
      <ChapterPanel 
        chapter={selectedChapter} 
        onClose={() => setSelectedChapterId(null)} 
        onExploreChapter={handleExploreChapter} 
      />

      {/* Timeline Scrubber */}
      <div className="z-20">
        <TimelineBar 
          receipts={receipts}
          chapters={chapters}
          dateRange={['2013-01-01', '2024-12-31']}
          selectedRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>

    </div>
  );
}
