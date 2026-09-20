import { describe, it, expect } from 'vitest';
import { searchReceipts } from '@/engine/search';
import type { LifeReceipt, SearchFilters } from '@/types';
import { DEFAULT_FILTERS } from '@/types';

const mockReceipts: LifeReceipt[] = [
  {
    id: '1',
    title: 'The Beatles - Here Comes The Sun',
    type: 'music',
    source: 'spotify',
    timestamp: '2014-06-15T10:00:00Z',
    category: 'Rock',
    tags: ['music', 'rock'],
    metadata: { artist: 'The Beatles', album: 'Abbey Road' },
  },
  {
    id: '2',
    title: 'Weekly Grocery Run',
    type: 'expense',
    source: 'household',
    timestamp: '2016-03-10T14:30:00Z',
    category: 'Food',
    subcategory: 'Groceries',
    amount: 1450,
    currency: 'INR',
    tags: ['expense', 'food'],
    metadata: { paymentMode: 'UPI', note: 'Vegetables & Dairy' },
  },
  {
    id: '3',
    title: 'Airline Flight Booking',
    type: 'transaction',
    source: 'transactions',
    timestamp: '2023-08-20T09:15:00Z',
    category: 'Travel',
    amount: 6200,
    currency: 'INR',
    tags: ['transaction', 'travel'],
    metadata: { merchant: 'IndiGo Airlines' },
  },
  {
    id: '4',
    title: 'Special Synthetic Note',
    type: 'note',
    source: 'synthetic',
    timestamp: '2020-01-01T00:00:00Z',
    tags: ['note'],
    metadata: {},
  },
];

describe('Search & Filter Engine', () => {
  it('returns all receipts with default filters', () => {
    const results = searchReceipts(mockReceipts, DEFAULT_FILTERS);
    expect(results.length).toBe(4);
  });

  it('fuzzy searches across title, artist, and merchant', () => {
    const filters: SearchFilters = { ...DEFAULT_FILTERS, query: 'Beatles' };
    const results = searchReceipts(mockReceipts, filters);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('1');

    const merchantFilter: SearchFilters = { ...DEFAULT_FILTERS, query: 'IndiGo' };
    const merchantResults = searchReceipts(mockReceipts, merchantFilter);
    expect(merchantResults.length).toBe(1);
    expect(merchantResults[0].id).toBe('3');
  });

  it('filters by receipt type', () => {
    const filters: SearchFilters = { ...DEFAULT_FILTERS, types: ['music'] };
    const results = searchReceipts(mockReceipts, filters);
    expect(results.length).toBe(1);
    expect(results[0].type).toBe('music');
  });

  it('filters by data source including provenance (synthetic/household/spotify)', () => {
    const filters: SearchFilters = { ...DEFAULT_FILTERS, sources: ['household'] };
    const results = searchReceipts(mockReceipts, filters);
    expect(results.length).toBe(1);
    expect(results[0].source).toBe('household');

    const synFilters: SearchFilters = { ...DEFAULT_FILTERS, sources: ['synthetic'] };
    const synResults = searchReceipts(mockReceipts, synFilters);
    expect(synResults.length).toBe(1);
    expect(synResults[0].source).toBe('synthetic');
  });

  it('filters by date range / timeline period', () => {
    // 2015–2018 (The Convergence period)
    const filters: SearchFilters = {
      ...DEFAULT_FILTERS,
      dateRange: ['2015-01-01T00:00:00Z', '2018-12-31T23:59:59Z'],
    };
    const results = searchReceipts(mockReceipts, filters);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('2');
  });

  it('filters by amount range', () => {
    const filters: SearchFilters = {
      ...DEFAULT_FILTERS,
      amountRange: [2000, 10000],
    };
    const results = searchReceipts(mockReceipts, filters);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('3');
    expect(results[0].amount).toBe(6200);
  });

  it('returns empty array when no receipts match query', () => {
    const filters: SearchFilters = { ...DEFAULT_FILTERS, query: 'NonExistentXYZ' };
    const results = searchReceipts(mockReceipts, filters);
    expect(results.length).toBe(0);
  });
});
