import type { ReceiptType, DataSource } from './receipt';

export interface LifeInsights {
  totalRecords: number;
  spotifyTotal: number;
  householdTotal: number;
  transactionTotal: number;
  dateRange: [string, string]; // ISO strings
  totalSpent: number;
  totalListeningHours: number;
  topArtist: string;
  topArtistCount: number;
  topCategory: string;
  connectionCount: number;
  patternCount: number;
  chapterCount: number;
  peakActivityHour: number;
  peakActivityDay: number; // 0=Sunday, 6=Saturday
}

export interface OrbitNode {
  id: string;
  label: string;
  type: ReceiptType | 'core';
  source: DataSource | 'core';
  count: number;
  dateRange: [string, string];
  topSignal?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface OrbitEdge {
  sourceId: string;
  targetId: string;
  strength: number;
}

export interface SpotifyStats {
  totalRecords: number;
  totalListeningMs: number;
  skipRate: number;
  topArtists: { name: string; count: number }[];
  hourDistribution: number[];
  heatmap: number[][];
  monthlyAggregates: Record<string, { count: number; ms: number; skips: number }>;
  platformDistribution: Record<string, number>;
  dateRange: { start: string; end: string };
}

export interface HouseholdStats {
  totalRecords: number;
  totalExpenses: number;
  totalSpent: number;
  topCategories: { name: string; count: number; total: number }[];
  monthlySpending: Record<string, number>;
  dateRange: { start: string; end: string };
}

export interface TransactionStats {
  totalRecords: number;
  totalSpent: number;
  topCategories: { name: string; count: number; total: number }[];
  topCities: { name: string; count: number }[];
  dateRange: { start: string; end: string };
}

export interface DataManifest {
  generated: string;
  datasets: {
    spotify: { sample: number; total: number; dateRange: { start: string; end: string } };
    household: { total: number; dateRange: { start: string; end: string } };
    transactions: { total: number; dateRange: { start: string; end: string } };
  };
  totalRecords: number;
}
