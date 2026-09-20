import type { LifeReceipt, ReceiptType, DataSource } from './receipt';
import type { Connection } from './connection';

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
