import { useMemo } from 'react';
import type { Chapter, LifeReceipt, DataSource, SpotifyStats, HouseholdStats, TransactionStats, LifeInsights } from '@/types';
import { computeInsights } from '@/engine/insights';

export interface QuickPeriod {
  id: string;
  label: string;
  range: [string, string];
  description: string;
}

export const QUICK_PERIODS: QuickPeriod[] = [
  {
    id: 'all',
    label: 'All Eras (2013–2024)',
    range: ['2013-01-01T00:00:00Z', '2024-12-31T23:59:59Z'],
    description: 'Complete 11-year digital footprint across all 3 datasets.',
  },
  {
    id: 'convergence',
    label: 'The Convergence (2015–2018)',
    range: ['2015-01-01T00:00:00Z', '2018-12-31T23:59:59Z'],
    description: 'Music listening and daily household expenditures overlap in real time.',
  },
  {
    id: 'early',
    label: 'Early Soundtrack (2013–2015)',
    range: ['2013-01-01T00:00:00Z', '2015-01-01T00:00:00Z'],
    description: 'Initial Spotify streaming history and early artist exploration.',
  },
  {
    id: 'modern',
    label: 'Digital Finance Era (2022–2024)',
    range: ['2022-01-01T00:00:00Z', '2024-12-31T23:59:59Z'],
    description: 'Modern financial transactions and digital commerce activity.',
  },
];

export function useJourney(
  receipts: LifeReceipt[],
  connections: any[],
  chapters: Chapter[],
  selectedRange: [string, string],
  filterSource: DataSource | null,
  spotifyStats: SpotifyStats | null,
  householdStats: HouseholdStats | null,
  transactionStats: TransactionStats | null
) {
  // 1. Filter chapters by domain source and selected date range
  const filteredChapters = useMemo(() => {
    const startMs = new Date(selectedRange[0]).getTime();
    const endMs = new Date(selectedRange[1]).getTime();

    return chapters.filter((ch) => {
      // Source match
      if (filterSource && ch.dominantSource !== filterSource) return false;

      // Date range overlap match
      const chStart = new Date(ch.dateRange[0]).getTime();
      const chEnd = new Date(ch.dateRange[1]).getTime();
      const overlaps = chStart <= endMs && chEnd >= startMs;
      return overlaps;
    });
  }, [chapters, filterSource, selectedRange]);

  // 2. Filter receipts for macro analysis in active range
  const activeReceipts = useMemo(() => {
    const startMs = new Date(selectedRange[0]).getTime();
    const endMs = new Date(selectedRange[1]).getTime();

    return receipts.filter((r) => {
      if (filterSource && r.source !== filterSource) return false;
      const t = new Date(r.timestamp).getTime();
      return t >= startMs && t <= endMs;
    });
  }, [receipts, filterSource, selectedRange]);

  // 3. Compute active insights
  const insights: LifeInsights = useMemo(() => {
    return computeInsights(
      activeReceipts,
      connections,
      [],
      filteredChapters,
      spotifyStats || ({} as any),
      householdStats || ({} as any),
      transactionStats || ({} as any)
    );
  }, [activeReceipts, connections, filteredChapters, spotifyStats, householdStats, transactionStats]);

  // 4. Check if current range intersects with The Convergence (2015–2018)
  const isConvergenceActive = useMemo(() => {
    const startYear = new Date(selectedRange[0]).getFullYear();
    const endYear = new Date(selectedRange[1]).getFullYear();
    return startYear <= 2018 && endYear >= 2015;
  }, [selectedRange]);

  return {
    filteredChapters,
    activeReceipts,
    insights,
    isConvergenceActive,
    quickPeriods: QUICK_PERIODS,
  };
}
