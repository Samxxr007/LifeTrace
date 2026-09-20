import { describe, it, expect } from 'vitest';
import { detectPatterns } from '@/engine/patterns';
import { LifeReceipt, SpotifyStats, HouseholdStats } from '@/types';

describe('Patterns Engine', () => {
  it('Empty dataset -> no patterns', () => {
    const patterns = detectPatterns([], null, null);
    expect(patterns.length).toBe(0);
  });

  it('Peak hour detected from sample data', () => {
    const receipts: Partial<LifeReceipt>[] = [
      { id: '1', source: 'spotify', timestamp: '2023-10-15T09:30:00Z' }
    ];
    const spotifyStats: Partial<SpotifyStats> = {
      hourDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
    const patterns = detectPatterns(receipts as LifeReceipt[], spotifyStats as SpotifyStats, null);
    const p = patterns.find(p => p.type === 'hourly');
    expect(p).toBeDefined();
    expect(p?.evidence).toMatch(/\d+ plays between/);
  });

  it('Top artist identified', () => {
    const receipts: Partial<LifeReceipt>[] = [
      { id: '1', source: 'spotify', metadata: { artist: 'Artist A' } }
    ];
    const spotifyStats: Partial<SpotifyStats> = {
      topArtists: [{ name: 'Artist A', count: 15 }]
    };
    const patterns = detectPatterns(receipts as LifeReceipt[], spotifyStats as SpotifyStats, null);
    const p = patterns.find(p => p.type === 'artist');
    expect(p).toBeDefined();
    expect(p?.evidence).toMatch(/Appeared \d+ times/);
  });

  it('Subscription pattern detected (monthly)', () => {
    const receipts: Partial<LifeReceipt>[] = [
      { id: '1', source: 'household', subcategory: 'Netflix', timestamp: '2023-10-15T00:00:00Z', title: 'N' },
      { id: '2', source: 'household', subcategory: 'Netflix', timestamp: '2023-11-15T00:00:00Z', title: 'N' }
    ];
    const patterns = detectPatterns(receipts as LifeReceipt[], null, null);
    const p = patterns.find(p => p.type === 'subscription');
    expect(p).toBeDefined();
    expect(p?.evidence).toMatch(/Paid \d+ consecutive months/);
  });

  it('Spending spike detected (>1.5× average)', () => {
    const receipts: Partial<LifeReceipt>[] = [
      { id: '1', source: 'household', timestamp: '2023-10-15T00:00:00Z' }
    ];
    const householdStats: Partial<HouseholdStats> = {
      monthlySpending: { '2023-09': 100, '2023-10': 300 }
    };
    const patterns = detectPatterns(receipts as LifeReceipt[], null, householdStats as HouseholdStats);
    const p = patterns.find(p => p.type === 'spending');
    expect(p).toBeDefined();
    expect(p?.evidence).toMatch(/Month had ₹\d+ — \d+\.\d+× monthly average/);
  });
});
