import type {
  LifeReceipt,
  BookmarkItem,
  BookmarkTargetType,
  FeaturedItem,
  DiaryEntry,
  SavedView,
  FutureEvent,
  UserProfile,
} from '@/types';

export const STORAGE_KEYS = {
  USER_RECEIPTS: 'lifetrace_user_receipts',
  DIARY: 'lifetrace_diary',
  BOOKMARKS: 'lifetrace_bookmarks',
  FEATURED: 'lifetrace_featured',
  SAVED_VIEWS: 'lifetrace_saved_views',
  FUTURE_EVENTS: 'lifetrace_future_events',
  USER_PROFILE: 'lifetrace_user_profile',
} as const;

export const STORAGE_CHANGE_EVENT = 'lifetrace-storage-change';

// Collision-resistant ID generator with browser crypto & fallback
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

// In-memory fallback if localStorage is blocked or quota is exceeded
const memoryFallback = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    console.warn(`[LifeTrace Storage] Could not read key "${key}" from localStorage:`, err);
  }
  return memoryFallback.get(key) || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (err) {
    console.warn(`[LifeTrace Storage] Could not write key "${key}" to localStorage:`, err);
  }
  memoryFallback.set(key, value);
}

function safeParse<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

function notifyChange(key: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
  }
}

// ==========================================
// 1. User Receipts
// ==========================================
export function getUserReceipts(): LifeReceipt[] {
  return safeParse<LifeReceipt[]>(safeGetItem(STORAGE_KEYS.USER_RECEIPTS), []);
}

export function saveUserReceipt(receipt: LifeReceipt): LifeReceipt {
  const receipts = getUserReceipts();
  const existingIdx = receipts.findIndex((r) => r.id === receipt.id);

  const cleanReceipt: LifeReceipt = {
    ...receipt,
    id: receipt.id || generateId(),
    source: 'user',
    provenance: 'user-created',
    tags: receipt.tags || ['user-created'],
  };

  if (existingIdx >= 0) {
    receipts[existingIdx] = cleanReceipt;
  } else {
    receipts.unshift(cleanReceipt);
  }

  safeSetItem(STORAGE_KEYS.USER_RECEIPTS, JSON.stringify(receipts));
  notifyChange(STORAGE_KEYS.USER_RECEIPTS);
  return cleanReceipt;
}

export function deleteUserReceipt(id: string): void {
  const receipts = getUserReceipts().filter((r) => r.id !== id);
  safeSetItem(STORAGE_KEYS.USER_RECEIPTS, JSON.stringify(receipts));
  
  // Also clean up any featured or bookmark items referencing this receipt
  removeFeatured(id);
  removeBookmark(id);

  notifyChange(STORAGE_KEYS.USER_RECEIPTS);
}

// ==========================================
// 2. Diary Entries
// ==========================================
export function getDiaryEntries(): DiaryEntry[] {
  const entries = safeParse<DiaryEntry[]>(safeGetItem(STORAGE_KEYS.DIARY), []);
  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function saveDiaryEntry(
  entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): DiaryEntry {
  const entries = getDiaryEntries();
  const now = new Date().toISOString();

  let savedEntry: DiaryEntry;
  if (entry.id) {
    const existingIdx = entries.findIndex((e) => e.id === entry.id);
    if (existingIdx >= 0) {
      savedEntry = {
        ...entries[existingIdx],
        ...entry,
        id: entry.id,
        updatedAt: now,
      };
      entries[existingIdx] = savedEntry;
    } else {
      savedEntry = {
        ...entry,
        id: entry.id,
        createdAt: now,
        updatedAt: now,
      };
      entries.unshift(savedEntry);
    }
  } else {
    savedEntry = {
      ...entry,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    entries.unshift(savedEntry);
  }

  safeSetItem(STORAGE_KEYS.DIARY, JSON.stringify(entries));
  notifyChange(STORAGE_KEYS.DIARY);
  return savedEntry;
}

export function deleteDiaryEntry(id: string): void {
  const entries = getDiaryEntries().filter((e) => e.id !== id);
  safeSetItem(STORAGE_KEYS.DIARY, JSON.stringify(entries));
  notifyChange(STORAGE_KEYS.DIARY);
}

// ==========================================
// 3. Bookmarks
// ==========================================
export function getBookmarks(): BookmarkItem[] {
  return safeParse<BookmarkItem[]>(safeGetItem(STORAGE_KEYS.BOOKMARKS), []);
}

export function isBookmarked(targetId: string): boolean {
  return getBookmarks().some((b) => b.targetId === targetId);
}

export function toggleBookmark(
  targetId: string,
  targetType: BookmarkTargetType,
  title: string,
  subtitle?: string,
  note?: string
): boolean {
  const bookmarks = getBookmarks();
  const existingIdx = bookmarks.findIndex((b) => b.targetId === targetId);

  if (existingIdx >= 0) {
    bookmarks.splice(existingIdx, 1);
    safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    notifyChange(STORAGE_KEYS.BOOKMARKS);
    return false; // Removed
  } else {
    const newBookmark: BookmarkItem = {
      id: generateId(),
      targetId,
      targetType,
      title,
      subtitle,
      note,
      createdAt: new Date().toISOString(),
    };
    bookmarks.unshift(newBookmark);
    safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    notifyChange(STORAGE_KEYS.BOOKMARKS);
    return true; // Added
  }
}

export function removeBookmark(targetId: string): void {
  const bookmarks = getBookmarks().filter((b) => b.targetId !== targetId);
  safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  notifyChange(STORAGE_KEYS.BOOKMARKS);
}

// ==========================================
// 4. Featured Moments (Receipts)
// ==========================================
export function getFeatured(): FeaturedItem[] {
  return safeParse<FeaturedItem[]>(safeGetItem(STORAGE_KEYS.FEATURED), []);
}

export function isFeatured(receiptId: string): boolean {
  return getFeatured().some((f) => f.receiptId === receiptId);
}

export function toggleFeatured(receiptId: string, caption?: string): boolean {
  const featured = getFeatured();
  const existingIdx = featured.findIndex((f) => f.receiptId === receiptId);

  if (existingIdx >= 0) {
    featured.splice(existingIdx, 1);
    safeSetItem(STORAGE_KEYS.FEATURED, JSON.stringify(featured));
    notifyChange(STORAGE_KEYS.FEATURED);
    return false; // Removed
  } else {
    const newFeatured: FeaturedItem = {
      id: generateId(),
      receiptId,
      createdAt: new Date().toISOString(),
      caption,
      order: featured.length,
    };
    featured.unshift(newFeatured);
    safeSetItem(STORAGE_KEYS.FEATURED, JSON.stringify(featured));
    notifyChange(STORAGE_KEYS.FEATURED);
    return true; // Added
  }
}

export function removeFeatured(receiptId: string): void {
  const featured = getFeatured().filter((f) => f.receiptId !== receiptId);
  safeSetItem(STORAGE_KEYS.FEATURED, JSON.stringify(featured));
  notifyChange(STORAGE_KEYS.FEATURED);
}

// ==========================================
// 5. Saved Views (Explore / Journey)
// ==========================================
export function getSavedViews(): SavedView[] {
  return safeParse<SavedView[]>(safeGetItem(STORAGE_KEYS.SAVED_VIEWS), []);
}

export function saveView(
  name: string,
  type: 'explore' | 'journey',
  filters: SavedView['filters']
): SavedView {
  const views = getSavedViews();
  const newView: SavedView = {
    id: generateId(),
    name: name.trim() || `View ${views.length + 1}`,
    type,
    filters,
    createdAt: new Date().toISOString(),
  };

  views.unshift(newView);
  safeSetItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(views));
  notifyChange(STORAGE_KEYS.SAVED_VIEWS);
  return newView;
}

export function deleteSavedView(id: string): void {
  const views = getSavedViews().filter((v) => v.id !== id);
  safeSetItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(views));
  notifyChange(STORAGE_KEYS.SAVED_VIEWS);
}

// ==========================================
// 6. Future Events (Plans & Milestones)
// ==========================================
export function getFutureEvents(): FutureEvent[] {
  const events = safeParse<FutureEvent[]>(safeGetItem(STORAGE_KEYS.FUTURE_EVENTS), []);
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function saveFutureEvent(
  event: Omit<FutureEvent, 'id' | 'status' | 'createdAt'> & {
    id?: string;
    status?: 'future' | 'completed';
  }
): FutureEvent {
  const events = getFutureEvents();
  const now = new Date().toISOString();

  let savedEvent: FutureEvent;
  if (event.id) {
    const existingIdx = events.findIndex((e) => e.id === event.id);
    if (existingIdx >= 0) {
      savedEvent = {
        ...events[existingIdx],
        ...event,
        id: event.id,
        status: event.status || events[existingIdx].status || 'future',
      };
      events[existingIdx] = savedEvent;
    } else {
      savedEvent = {
        ...event,
        id: event.id,
        status: event.status || 'future',
        createdAt: now,
      };
      events.push(savedEvent);
    }
  } else {
    savedEvent = {
      ...event,
      id: generateId(),
      status: event.status || 'future',
      createdAt: now,
    };
    events.push(savedEvent);
  }

  safeSetItem(STORAGE_KEYS.FUTURE_EVENTS, JSON.stringify(events));
  notifyChange(STORAGE_KEYS.FUTURE_EVENTS);
  return savedEvent;
}

export function deleteFutureEvent(id: string): void {
  const events = getFutureEvents().filter((e) => e.id !== id);
  safeSetItem(STORAGE_KEYS.FUTURE_EVENTS, JSON.stringify(events));
  notifyChange(STORAGE_KEYS.FUTURE_EVENTS);
}

/**
 * Converts a planned Future Event into a completed event receipt!
 * Preserves semantic distinction:
 * - Event remains archived with status: 'completed'
 * - Creates a LifeReceipt with completedAt and plannedEventId
 */
export function completeFutureEvent(id: string, actualTimestamp?: string): LifeReceipt | null {
  const events = getFutureEvents();
  const eventIdx = events.findIndex((e) => e.id === id);
  if (eventIdx < 0) return null;

  const event = events[eventIdx];
  const completionTime = actualTimestamp || new Date().toISOString();

  // 1. Mark the future event as completed
  events[eventIdx] = {
    ...event,
    status: 'completed',
    completedAt: completionTime,
  };
  safeSetItem(STORAGE_KEYS.FUTURE_EVENTS, JSON.stringify(events));

  // 2. Create the completed event receipt
  const completedReceipt: LifeReceipt = {
    id: generateId(),
    type: event.type === 'travel' || event.type === 'event' ? 'event' : 'event',
    source: 'user',
    provenance: 'user-created',
    timestamp: completionTime,
    completedAt: completionTime,
    plannedEventId: event.id,
    status: 'completed',
    title: `[Completed] ${event.title}`,
    description: event.notes,
    category: event.category || 'Milestone',
    location: event.location ? { locationName: event.location } : undefined,
    metadata: {
      plannedDate: event.date,
      plannedTime: event.time,
      originalType: event.type,
      notes: event.notes,
    },
    tags: [
      'completed-event',
      event.type,
      'user-created',
      ...(event.category ? [event.category.toLowerCase()] : []),
    ],
  };

  saveUserReceipt(completedReceipt);
  notifyChange(STORAGE_KEYS.FUTURE_EVENTS);
  return completedReceipt;
}

// ==========================================
// 7. User Profile
// ==========================================
export const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Archivist',
  bio: 'Tracing every moment, expense, and melody across time.',
  archivalGoal: 'Cataloging personal history through receipts and real memory traces.',
  joinedDate: '2026-01-01T00:00:00.000Z',
};

export function getUserProfile(): UserProfile {
  return safeParse<UserProfile>(safeGetItem(STORAGE_KEYS.USER_PROFILE), DEFAULT_PROFILE);
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const updated: UserProfile = {
    ...current,
    ...profile,
  };
  safeSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
  notifyChange(STORAGE_KEYS.USER_PROFILE);
  return updated;
}
