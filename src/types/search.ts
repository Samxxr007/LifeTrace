import type { ReceiptType, DataSource } from './receipt';

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
