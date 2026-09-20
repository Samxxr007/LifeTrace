export type ReceiptType =
  | 'music'
  | 'expense'
  | 'transaction'
  | 'place'
  | 'entertainment'
  | 'movie'
  | 'photo'
  | 'message'
  | 'search'
  | 'event'
  | 'note';

export type DataSource =
  | 'spotify'
  | 'household'
  | 'transactions'
  | 'synthetic'
  | 'user'
  | 'derived';

export type DataProvenance = 'source' | 'synthetic' | 'user-created' | 'derived';

export type ExpenseType = 'Expense' | 'Income' | 'Transfer-Out';

export interface LifeLocation {
  city?: string;
  state?: string;
  locationName?: string;
  lat?: number;
  long?: number;
}

export interface LifeReceipt {
  id: string;
  type: ReceiptType;
  source: DataSource;
  provenance: DataProvenance;
  timestamp: string; // ISO 8601 string
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  amount?: number;
  currency?: string;
  expenseType?: ExpenseType;
  location?: LifeLocation;
  scenarioId?: string;
  status?: 'future' | 'completed' | 'active';
  completedAt?: string;
  plannedEventId?: string;
  metadata: {
    // Music
    artist?: string;
    album?: string;
    platform?: string;
    msPlayed?: number;
    skipped?: boolean;
    shuffle?: boolean;
    // Movie
    movie?: string;
    // Expense / Transaction
    paymentMode?: string;
    merchant?: string;
    note?: string;
    // Place
    placeName?: string;
    city?: string;
    // Communication / Search / Photo
    messageText?: string;
    searchQuery?: string;
    photoCaption?: string;
    // Open
    [key: string]: unknown;
  };
  tags: string[];
}
