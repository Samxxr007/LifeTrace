import type { LifeReceipt } from './receipt';

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
