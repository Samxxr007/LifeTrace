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
  timestamp: string; // ISO 8601 string
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
}
