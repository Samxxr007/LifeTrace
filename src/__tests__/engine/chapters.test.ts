import { describe, it, expect } from 'vitest';
import { buildChapters } from '@/engine/chapters';
import type { LifeReceipt, Connection } from '@/types';

const mockReceipts: LifeReceipt[] = [
  {
    id: 'm1',
    title: 'Song A',
    type: 'music',
    source: 'spotify',
    timestamp: '2015-06-01T12:00:00Z',
    tags: ['music'],
    metadata: { artist: 'Artist One' },
  },
  {
    id: 'm2',
    title: 'Song B',
    type: 'music',
    source: 'spotify',
    timestamp: '2015-06-15T12:00:00Z',
    tags: ['music'],
    metadata: { artist: 'Artist One' },
  },
  {
    id: 'h1',
    title: 'Groceries',
    type: 'expense',
    source: 'household',
    timestamp: '2016-02-10T10:00:00Z',
    amount: 500,
    tags: ['expense'],
    metadata: {},
  },
  {
    id: 't1',
    title: 'Flight',
    type: 'transaction',
    source: 'transactions',
    timestamp: '2023-05-10T10:00:00Z',
    amount: 4000,
    tags: ['transaction'],
    metadata: {},
  },
];

const mockConnections: Connection[] = [
  {
    id: 'm1-m2',
    sourceId: 'm1',
    targetId: 'm2',
    score: 0.9,
    strength: 'strong',
    signals: [{ type: 'category_resonance', weight: 1, label: 'Shared artist' }],
    explanation: 'Both tracks by Artist One',
  },
];

describe('Story & Chapter Engine', () => {
  it('generates chronological chapters from receipts', () => {
    const chapters = buildChapters(mockReceipts, mockConnections);
    expect(chapters.length).toBeGreaterThan(0);

    // Verify first chapter properties
    const first = chapters[0];
    expect(first.id).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.dateRange).toBeDefined();
    expect(first.stats.totalReceipts).toBeGreaterThan(0);
  });

  it('attaches connections to their respective chapters', () => {
    const chapters = buildChapters(mockReceipts, mockConnections);
    const chapterWithConnections = chapters.find((c) => c.connections.length > 0);
    expect(chapterWithConnections).toBeDefined();
  });

  it('calculates factual statistics without psychological claims', () => {
    const chapters = buildChapters(mockReceipts, mockConnections);
    chapters.forEach((ch) => {
      expect(ch.narrative).toBeDefined();
      // Verifies narrative does not claim personality/psychological traits
      expect(ch.narrative.toLowerCase()).not.toContain('personality');
      expect(ch.narrative.toLowerCase()).not.toContain('emotional state');
      expect(ch.narrative.toLowerCase()).not.toContain('you felt');
    });
  });
});
