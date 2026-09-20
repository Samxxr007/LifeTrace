import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useJourney, QUICK_PERIODS } from '@/hooks/useJourney';
import type { Chapter, LifeReceipt } from '@/types';

const mockReceipts: LifeReceipt[] = [
  {
    id: 'r1',
    title: 'Track 2014',
    type: 'music',
    source: 'spotify',
    timestamp: '2014-05-01T12:00:00Z',
    tags: [],
    metadata: {},
  },
  {
    id: 'r2',
    title: 'Grocery 2016',
    type: 'expense',
    source: 'household',
    timestamp: '2016-07-01T12:00:00Z',
    tags: [],
    metadata: {},
  },
  {
    id: 'r3',
    title: 'Flight 2023',
    type: 'transaction',
    source: 'transactions',
    timestamp: '2023-09-01T12:00:00Z',
    tags: [],
    metadata: {},
  },
];

const mockChapters: Chapter[] = [
  {
    id: 'ch-early',
    title: 'Early Era',
    subtitle: '2013-2014',
    dateRange: ['2013-01-01T00:00:00Z', '2014-12-31T23:59:59Z'],
    receipts: [mockReceipts[0]],
    connections: [],
    dominantType: 'music',
    dominantSource: 'spotify',
    narrative: 'Early streaming',
    stats: { totalReceipts: 1 },
  },
  {
    id: 'ch-convergence',
    title: 'The Convergence',
    subtitle: '2015-2018',
    dateRange: ['2015-01-01T00:00:00Z', '2018-12-31T23:59:59Z'],
    receipts: [mockReceipts[1]],
    connections: [],
    dominantType: 'expense',
    dominantSource: 'household',
    narrative: 'Overlap era',
    stats: { totalReceipts: 1 },
  },
  {
    id: 'ch-modern',
    title: 'Modern Era',
    subtitle: '2022-2024',
    dateRange: ['2022-01-01T00:00:00Z', '2024-12-31T23:59:59Z'],
    receipts: [mockReceipts[2]],
    connections: [],
    dominantType: 'transaction',
    dominantSource: 'transactions',
    narrative: 'Commerce era',
    stats: { totalReceipts: 1 },
  },
];

describe('useJourney Hook', () => {
  it('returns all chapters when date range covers all eras', () => {
    const { result } = renderHook(() =>
      useJourney(
        mockReceipts,
        [],
        mockChapters,
        ['2013-01-01T00:00:00Z', '2024-12-31T23:59:59Z'],
        null,
        null,
        null,
        null
      )
    );

    expect(result.current.filteredChapters.length).toBe(3);
    expect(result.current.isConvergenceActive).toBe(true);
    expect(result.current.quickPeriods.length).toBe(QUICK_PERIODS.length);
  });

  it('filters chapters when timeline is scrubbed to The Convergence (2015–2018)', () => {
    const { result } = renderHook(() =>
      useJourney(
        mockReceipts,
        [],
        mockChapters,
        ['2015-01-01T00:00:00Z', '2018-12-31T23:59:59Z'],
        null,
        null,
        null,
        null
      )
    );

    expect(result.current.filteredChapters.length).toBe(1);
    expect(result.current.filteredChapters[0].id).toBe('ch-convergence');
    expect(result.current.isConvergenceActive).toBe(true);
  });

  it('filters chapters by domain source', () => {
    const { result } = renderHook(() =>
      useJourney(
        mockReceipts,
        [],
        mockChapters,
        ['2013-01-01T00:00:00Z', '2024-12-31T23:59:59Z'],
        'transactions',
        null,
        null,
        null
      )
    );

    expect(result.current.filteredChapters.length).toBe(1);
    expect(result.current.filteredChapters[0].dominantSource).toBe('transactions');
  });

  it('correctly sets isConvergenceActive to false for non-overlapping periods', () => {
    const { result } = renderHook(() =>
      useJourney(
        mockReceipts,
        [],
        mockChapters,
        ['2022-01-01T00:00:00Z', '2024-12-31T23:59:59Z'],
        null,
        null,
        null,
        null
      )
    );

    expect(result.current.isConvergenceActive).toBe(false);
  });
});
