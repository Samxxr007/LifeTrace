import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConnectionChain } from '@/components/discover/ConnectionChain';
import { ConnectionExplainer } from '@/components/discover/ConnectionExplainer';
import { ConnectionFilters } from '@/components/discover/ConnectionFilters';
import type { StrengthFilter, TypeFilter } from '@/components/discover/ConnectionFilters';
import { PatternCard } from '@/components/discover/PatternCard';
import { ChapterCard } from '@/components/discover/ChapterCard';
import { NarrativeBlock } from '@/components/discover/NarrativeBlock';
import { ActivityHeatmap } from '@/components/discover/ActivityHeatmap';
import { ArtistLoop } from '@/components/discover/ArtistLoop';
import { SpendingFlow } from '@/components/discover/SpendingFlow';
import { SubscriptionTimeline } from '@/components/discover/SubscriptionTimeline';

import { useLifeData } from '@/hooks/useLifeData';
import { useConnections } from '@/hooks/useConnections';
import { usePatterns } from '@/hooks/usePatterns';
import { useChapters } from '@/hooks/useChapters';
import { LoadingState } from '@/components/ui/LoadingState';

interface FilterState {
  strength: StrengthFilter;
  type: TypeFilter;
}

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'connections';

  const { receipts, spotifyStats, householdStats, isLoading } = useLifeData();
  const { connections } = useConnections(receipts);
  const { patterns } = usePatterns(receipts, spotifyStats, householdStats);
  const { chapters } = useChapters(receipts, connections);

  const [filters, setFilters] = useState<FilterState>({ strength: 'All', type: 'All' });
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  const setView = (view: string) => {
    setSearchParams({ view });
  };

  // Filter connections by strength
  const filteredConnections = connections.filter(conn => {
    if (filters.strength === 'All') return true;
    if (filters.strength === 'Strong') return conn.strength === 'strong';
    if (filters.strength === 'Moderate') return conn.strength === 'moderate';
    return true;
  });

  const selectedConnection = filteredConnections.find(c => c.id === selectedConnectionId) || filteredConnections[0];
  const connReceiptA = selectedConnection ? receipts.find(r => r.id === selectedConnection.sourceId) : null;
  const connReceiptB = selectedConnection ? receipts.find(r => r.id === selectedConnection.targetId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-100">
        <LoadingState message="Finding your patterns..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 font-body pt-16 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TAB BAR */}
        <div
          className="flex gap-8 mb-16 border-b border-ink-300"
          role="tablist"
          aria-label="Discover views"
        >
          {(['connections', 'patterns', 'stories'] as const).map(view => (
            <button
              key={view}
              role="tab"
              aria-selected={currentView === view}
              onClick={() => setView(view)}
              className={`pb-4 font-mono text-sm uppercase tracking-widest transition-colors capitalize ${
                currentView === view
                  ? 'text-ink-900 border-b-2 border-ink-900'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* CONNECTIONS VIEW */}
        {currentView === 'connections' && (
          <div role="tabpanel" aria-label="Connections">
            <header className="mb-12">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-2">
                Discovered
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-ink-900 mb-3">
                Connections
              </h1>
              <p
                className="font-mono text-ink-500 text-sm"
                aria-live="polite"
                aria-atomic="true"
              >
                {filteredConnections.length} threads found across your archive
              </p>
            </header>

            <ConnectionFilters filters={filters} onFilterChange={setFilters} />

            {filteredConnections.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-body italic text-ink-500">
                  {connections.length === 0
                    ? 'Analyzing records for connections…'
                    : 'No connections match the current filter.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8 mt-8">
                {/* Connection list */}
                <div className="md:w-[40%] space-y-3 max-h-[80vh] overflow-y-auto pr-2">
                  {filteredConnections.map(conn => (
                    <button
                      key={conn.id}
                      onClick={() => setSelectedConnectionId(conn.id)}
                      className={`w-full text-left transition-opacity ${
                        selectedConnectionId === conn.id
                          ? 'opacity-100'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                      aria-pressed={selectedConnectionId === conn.id}
                    >
                      <ConnectionChain
                        connection={conn}
                        receipts={receipts}
                        onSelectReceipt={() => {}}
                      />
                    </button>
                  ))}
                </div>

                {/* Explainer panel */}
                <div className="md:w-[60%] sticky top-20 self-start">
                  {selectedConnection && connReceiptA && connReceiptB ? (
                    <ConnectionExplainer
                      connection={selectedConnection}
                      receiptA={connReceiptA}
                      receiptB={connReceiptB}
                    />
                  ) : (
                    <div className="p-8 border border-ink-300 text-ink-500 text-sm font-body italic">
                      Select a connection to see why these moments are linked.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PATTERNS VIEW */}
        {currentView === 'patterns' && (
          <div role="tabpanel" aria-label="Patterns">
            <header className="mb-16">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-2">
                Discovered
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-ink-900">
                Patterns in Your Data
              </h1>
            </header>

            <div className="space-y-20">
              {/* Activity Heatmap */}
              {spotifyStats?.heatmap && (
                <section>
                  <ActivityHeatmap
                    heatmap={spotifyStats.heatmap}
                    totalRecords={spotifyStats.totalRecords}
                  />
                  <hr className="border-ink-300 mt-16" />
                </section>
              )}

              {/* Artist Loop */}
              {spotifyStats?.topArtists && spotifyStats.topArtists.length > 0 && (
                <section>
                  <ArtistLoop
                    topArtists={spotifyStats.topArtists}
                    totalPlays={spotifyStats.totalRecords}
                  />
                  <hr className="border-ink-300 mt-16" />
                </section>
              )}

              {/* Spending Flow */}
              {householdStats?.monthlySpending && (
                <section>
                  <SpendingFlow
                    monthlySpending={householdStats.monthlySpending}
                    topCategories={householdStats.topCategories || []}
                  />
                  <hr className="border-ink-300 mt-16" />
                </section>
              )}

              {/* Subscription Timeline */}
              {receipts.filter(r => r.source === 'household').length > 0 && (
                <section>
                  <SubscriptionTimeline
                    receipts={receipts.filter(r => r.source === 'household')}
                  />
                  <hr className="border-ink-300 mt-16" />
                </section>
              )}

              {/* Other patterns */}
              {patterns.length > 0 && (
                <section>
                  <h2 className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-8">
                    Behavioral Patterns
                  </h2>
                  <div className="space-y-4">
                    {patterns.map(pattern => (
                      <PatternCard
                        key={pattern.id}
                        pattern={pattern}
                        receipts={receipts}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* STORIES VIEW */}
        {currentView === 'stories' && (
          <div role="tabpanel" aria-label="Stories">
            <header className="mb-20">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-2">
                Your archive, in chapters
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-ink-900">
                The Story
              </h1>
            </header>

            {chapters.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-body italic text-ink-500">
                  Assembling your chapters…
                </p>
              </div>
            ) : (
              <div>
                {chapters.map((chapter, i) => (
                  <React.Fragment key={chapter.id}>
                    <ChapterCard
                      chapter={chapter}
                      index={i}
                      onExplore={(id) => {
                        console.log('Explore chapter:', id);
                      }}
                    />
                    {i < chapters.length - 1 && (
                      <NarrativeBlock
                        text="As one phase closed, the scattered traces began to form a new pattern."
                        delay={0.1}
                      />
                    )}
                  </React.Fragment>
                ))}

                <div className="mt-32 pt-12 border-t border-ink-300 text-center">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="font-mono text-xs uppercase tracking-widest text-ink-600 hover:text-ink-900 transition-colors"
                  >
                    Start from the beginning →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
