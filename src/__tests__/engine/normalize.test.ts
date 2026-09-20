import { describe, it, expect, vi } from 'vitest';
import { loadSpotifyReceipts, loadHouseholdReceipts, loadTransactionReceipts } from '@/engine/normalize';

vi.mock('@/data/spotify-sample.json', () => ({
  default: [
    {
      id: "s1",
      type: "music",
      timestamp: "2023-10-15T09:30:00Z",
      title: "Song 1",
      metadata: { artist: "Artist 1" }
    }
  ]
}));

vi.mock('@/data/household.json', () => ({
  default: [
    {
      id: "h1",
      type: "expense",
      timestamp: "2023-10-15T10:00:00Z",
      title: "Groceries",
      category: "food"
    }
  ]
}));

vi.mock('@/data/transactions.json', () => ({
  default: [
    {
      id: "t1",
      type: "transaction",
      timestamp: "2023-10-15T11:00:00Z",
      title: "Flight",
      cc_num: "1234-5678-9012-3456",
      customer_id: "c123",
      is_fraud: false,
      dob: "1990-01-01",
      metadata: { merchant: "fraud_Airline" }
    }
  ]
}));

vi.mock('@/data/spotify-stats.json', () => ({ default: {} }));
vi.mock('@/data/household-stats.json', () => ({ default: {} }));
vi.mock('@/data/transactions-stats.json', () => ({ default: {} }));
vi.mock('@/data/manifest.json', () => ({ default: {} }));

describe('Normalize Engine', () => {
  it('Valid Spotify record loads correctly with source: spotify', () => {
    const receipts = loadSpotifyReceipts();
    expect(receipts[0].source).toBe('spotify');
    expect(receipts[0].title).toBe('Song 1');
  });

  it('Valid household record loads with source: household', () => {
    const receipts = loadHouseholdReceipts();
    expect(receipts[0].source).toBe('household');
    expect(receipts[0].title).toBe('Groceries');
  });

  it('Valid transaction has NO cc_num, customer_id, is_fraud, dob fields', () => {
    const receipts = loadTransactionReceipts();
    const r = receipts[0] as any;
    expect(r.cc_num).toBeUndefined();
    expect(r.customer_id).toBeUndefined();
    expect(r.is_fraud).toBeUndefined();
    expect(r.dob).toBeUndefined();
  });

  it('merchant name has fraud_ stripped', () => {
    const receipts = loadTransactionReceipts();
    expect(receipts[0].metadata.merchant).toBe('Airline');
  });

  it('timestamp is valid ISO string', () => {
    const receipts = loadTransactionReceipts();
    const ts = receipts[0].timestamp;
    expect(isNaN(new Date(ts).getTime())).toBe(false);
    expect(new Date(ts).toISOString()).toContain('2023-10-15T11:00:00');
  });
});
