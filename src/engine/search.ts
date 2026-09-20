import type { LifeReceipt, SearchFilters } from '@/types';
import Fuse from 'fuse.js';

let cachedFuse: { receipts: LifeReceipt[]; instance: Fuse<LifeReceipt> } | null = null;

export function getFuseIndex(receipts: LifeReceipt[]): Fuse<LifeReceipt> {
  if (cachedFuse && cachedFuse.receipts === receipts) {
    return cachedFuse.instance;
  }

  const instance = new Fuse(receipts, {
    keys: [
      'title',
      'description',
      'category',
      'subcategory',
      'metadata.artist',
      'metadata.album',
      'metadata.merchant',
      'metadata.note',
      'tags',
    ],
    threshold: 0.35,
  });

  cachedFuse = { receipts, instance };
  return instance;
}

export function searchReceipts(receipts: LifeReceipt[], filters: SearchFilters): LifeReceipt[] {
  if (!receipts || receipts.length === 0) return [];

  let filtered = receipts;

  // 1. Text Query (Fuzzy Search via Fuse.js)
  if (filters.query && filters.query.trim()) {
    const fuse = getFuseIndex(receipts);
    filtered = fuse.search(filters.query.trim()).map((res) => res.item);
  }

  // 2. Receipt Type Filter
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter((r) => filters.types.includes(r.type));
  }

  // 3. Data Source Filter (Spotify, Household, Transactions, Synthetic, Derived)
  if (filters.sources && filters.sources.length > 0) {
    filtered = filtered.filter((r) => filters.sources.includes(r.source));
  }

  // 4. Category Filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((r) => r.category && filters.categories.includes(r.category));
  }

  // 5. Amount Range Filter
  if (filters.amountRange && (filters.amountRange[0] !== null || filters.amountRange[1] !== null)) {
    const min = filters.amountRange[0] !== null ? filters.amountRange[0] : -Infinity;
    const max = filters.amountRange[1] !== null ? filters.amountRange[1] : Infinity;
    filtered = filtered.filter((r) => {
      if (r.amount === undefined || r.amount === null) return false;
      return r.amount >= min && r.amount <= max;
    });
  }

  // 6. Date Range Filter
  if (filters.dateRange && (filters.dateRange[0] !== null || filters.dateRange[1] !== null)) {
    const min = filters.dateRange[0] !== null ? new Date(filters.dateRange[0]).getTime() : -Infinity;
    const max = filters.dateRange[1] !== null ? new Date(filters.dateRange[1]).getTime() : Infinity;
    filtered = filtered.filter((r) => {
      const t = new Date(r.timestamp).getTime();
      return t >= min && t <= max;
    });
  }

  return filtered;
}
