import { LifeReceipt } from './receipt';
import { SearchFilters } from './search';

export type BookmarkTargetType =
  | 'receipt'
  | 'connection'
  | 'chapter'
  | 'pattern'
  | 'diary'
  | 'saved-view'
  | 'timeline';

export interface BookmarkItem {
  id: string;
  targetId: string;
  targetType: BookmarkTargetType;
  title: string;
  subtitle?: string;
  createdAt: string;
  note?: string;
}

export interface FeaturedItem {
  id: string;
  receiptId: string; // Focused specifically on receipts/moments for a clean profile showcase
  createdAt: string;
  caption?: string;
  order: number;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string; // Clean text
  timestamp: string; // ISO string of the journal entry date
  createdAt: string;
  updatedAt: string;
  linkedReceiptIds: string[]; // Attached LifeReceipt IDs from archive
  tags: string[];
  mood?: string; // Strictly user-entered only. Never automatically inferred or psychologically claimed.
}

export interface SavedView {
  id: string;
  name: string;
  type: 'explore' | 'journey';
  filters: SearchFilters | Record<string, unknown>;
  createdAt: string;
}

export interface FutureEvent {
  id: string;
  title: string;
  date: string; // ISO string
  time?: string;
  location?: string;
  category: string;
  type: 'event' | 'travel' | 'purchase' | 'milestone' | 'entertainment';
  notes?: string;
  status: 'future' | 'completed';
  completedAt?: string;
  createdAt: string;
}

export interface UserProfile {
  displayName: string;
  bio: string;
  archivalGoal: string;
  joinedDate: string;
}
