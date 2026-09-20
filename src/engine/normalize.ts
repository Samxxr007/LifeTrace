import { LifeReceipt, SpotifyStats, HouseholdStats, TransactionStats, DataManifest } from '@/types';
import { loadSyntheticReceipts } from '@/data/synthetic/scenarios';

import spotifyData from '@/data/spotify-sample.json';
import householdData from '@/data/household.json';
import transactionsData from '@/data/transactions.json';
import spotifyStatsData from '@/data/spotify-stats.json';
import householdStatsData from '@/data/household-stats.json';
import transactionsStatsData from '@/data/transactions-stats.json';
import manifestData from '@/data/manifest.json';

let cachedSpotifyReceipts: LifeReceipt[] | null = null;
let cachedHouseholdReceipts: LifeReceipt[] | null = null;
let cachedTransactionReceipts: LifeReceipt[] | null = null;
let cachedAllReceipts: LifeReceipt[] | null = null;

let cachedSpotifyStats: SpotifyStats | null = null;
let cachedHouseholdStats: HouseholdStats | null = null;
let cachedTransactionStats: TransactionStats | null = null;
let cachedManifest: DataManifest | null = null;

const sanitizeRecord = (record: any, source: string): LifeReceipt => {
  const metadata = record.metadata ? { ...record.metadata } : {};
  if (metadata.merchant) {
    metadata.merchant = metadata.merchant.replace(/^fraud_/, '');
  }
  
  return {
    id: record.id,
    type: record.type,
    source: source as any,
    provenance: 'source',
    timestamp: record.timestamp,
    title: record.title,
    description: record.description,
    category: record.category,
    subcategory: record.subcategory,
    amount: record.amount,
    currency: record.currency,
    expenseType: record.expenseType,
    location: record.location,
    metadata,
    tags: record.tags || []
  };
};

export const loadSpotifyReceipts = (): LifeReceipt[] => {
  if (cachedSpotifyReceipts) return cachedSpotifyReceipts;
  cachedSpotifyReceipts = (spotifyData as any[]).map(r => sanitizeRecord(r, 'spotify'));
  return cachedSpotifyReceipts;
};

export const loadHouseholdReceipts = (): LifeReceipt[] => {
  if (cachedHouseholdReceipts) return cachedHouseholdReceipts;
  cachedHouseholdReceipts = (householdData as any[]).map(r => sanitizeRecord(r, 'household'));
  return cachedHouseholdReceipts;
};

export const loadTransactionReceipts = (): LifeReceipt[] => {
  if (cachedTransactionReceipts) return cachedTransactionReceipts;
  cachedTransactionReceipts = (transactionsData as any[]).map(r => sanitizeRecord(r, 'transactions'));
  return cachedTransactionReceipts;
};

export { loadSyntheticReceipts } from '@/data/synthetic/scenarios';
import { getUserReceipts } from '@/lib/storage';

export const loadAllReceipts = (): LifeReceipt[] => {
  if (cachedAllReceipts) return cachedAllReceipts;
  const all = [
    ...loadSpotifyReceipts(),
    ...loadHouseholdReceipts(),
    ...loadTransactionReceipts(),
    ...loadSyntheticReceipts(),
  ];
  cachedAllReceipts = all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return cachedAllReceipts;
};

export const loadUnifiedReceipts = (): LifeReceipt[] => {
  const base = loadAllReceipts();
  const user = getUserReceipts();
  if (user.length === 0) return base;
  return [...base, ...user].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const loadSpotifyStats = (): SpotifyStats => {
  if (cachedSpotifyStats) return cachedSpotifyStats;
  cachedSpotifyStats = spotifyStatsData as unknown as SpotifyStats;
  return cachedSpotifyStats;
};

export const loadHouseholdStats = (): HouseholdStats => {
  if (cachedHouseholdStats) return cachedHouseholdStats;
  cachedHouseholdStats = householdStatsData as unknown as HouseholdStats;
  return cachedHouseholdStats;
};

export const loadTransactionStats = (): TransactionStats => {
  if (cachedTransactionStats) return cachedTransactionStats;
  cachedTransactionStats = transactionsStatsData as unknown as TransactionStats;
  return cachedTransactionStats;
};

export const loadManifest = (): DataManifest => {
  if (cachedManifest) return cachedManifest;
  cachedManifest = manifestData as unknown as DataManifest;
  return cachedManifest;
};
