// ─── Receipt Types ─────────────────────────────────────────────────────────────

export type ReceiptType =
  | 'music'
  | 'expense'
  | 'transaction'
  | 'place'
  | 'entertainment'
  | 'note'
  | 'event';

export type DataSource =
  | 'spotify'
  | 'household'
  | 'transactions'
  | 'synthetic'
  | 'derived';

export type ExpenseType = 'Expense' | 'Income' | 'Transfer-Out';

export interface LifeLocation {
  city?: string;
  state?: string;
  lat?: number;
  long?: number;
}

export interface LifeReceipt {
  id: string;
  type: ReceiptType;
  source: DataSource;
  timestamp: string; // ISO 8601 string (parsed to Date when needed)
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  amount?: number;
  currency?: string;
  expenseType?: ExpenseType;
  location?: LifeLocation;
  metadata: {
    // Music
    artist?: string;
    album?: string;
    platform?: string;
    msPlayed?: number;
    skipped?: boolean;
    shuffle?: boolean;
    // Expense
    paymentMode?: string;
    note?: string;
    // Transaction
    merchant?: string;
    // Open
    [key: string]: unknown;
  };
  tags: string[];
  // NOTE: raw field is intentionally omitted — sensitive data never stored
}

// ─── Connection Types ──────────────────────────────────────────────────────────

export type ConnectionSignalType =
  | 'temporal_proximity'
  | 'category_resonance'
  | 'time_of_day'
  | 'weekly_rhythm'
  | 'location_cluster'
  | 'cross_domain';

export interface ConnectionSignal {
  type: ConnectionSignalType;
  weight: number;
  label: string;
}

export type ConnectionStrength = 'strong' | 'moderate' | 'weak';

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  score: number; // 0–1, internal heuristic
  signals: ConnectionSignal[];
  explanation: string; // Human-readable, no psychological inference
  strength: ConnectionStrength;
}

// ─── Pattern Types ─────────────────────────────────────────────────────────────

export type PatternType =
  | 'hourly'
  | 'weekly'
  | 'category'
  | 'artist'
  | 'spending'
  | 'subscription';

export interface Pattern {
  id: string;
  name: string;
  description: string;
  evidence: string;
  frequency: number;
  receipts: LifeReceipt[];
  type: PatternType;
}

// ─── Chapter Types ─────────────────────────────────────────────────────────────

export interface ChapterStats {
  totalReceipts: number;
  totalSpent?: number;
  topArtist?: string;
  topCategory?: string;
  peakHour?: number;
  avgDailyActivity?: number;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  dateRange: [string, string]; // ISO strings
  receipts: LifeReceipt[];
  connections: Connection[];
  dominantType: ReceiptType;
  dominantSource: DataSource;
  dominantCategory?: string;
  narrative: string;
  stats: ChapterStats;
}

// ─── Insights Types ────────────────────────────────────────────────────────────

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

// ─── Search / Filter Types ─────────────────────────────────────────────────────

export interface SearchFilters {
  query: string;
  types: ReceiptType[];
  sources: DataSource[];
  categories: string[];
  dateRange: [string | null, string | null]; // ISO strings
  amountRange: [number | null, number | null];
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  types: [],
  sources: [],
  categories: [],
  dateRange: [null, null],
  amountRange: [null, null],
};

// ─── Orbit Types (Life Orbit visualization) ────────────────────────────────────

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

// ─── Aggregated Stats (from preprocessor) ──────────────────────────────────────

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
