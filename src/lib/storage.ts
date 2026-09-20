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

// ==========================================
// 8. Curated Sample Life Data & Syncing
// ==========================================

export const DEFAULT_USER_RECEIPTS: LifeReceipt[] = [
  {
    id: 'user-receipt-01',
    type: 'expense',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-11-14T20:30:00.000Z',
    title: 'Anniversary Dinner at Olive Beach',
    description: 'Celebratory 5th anniversary dinner in the courtyard under the banyan tree.',
    category: 'Dining',
    subcategory: 'Restaurant',
    amount: 3850,
    currency: 'INR',
    expenseType: 'Expense',
    location: { city: 'Bangalore', locationName: 'Olive Beach, Wood Street' },
    metadata: { merchant: 'Olive Beach', paymentMode: 'Card', partySize: 2 },
    tags: ['dining', 'anniversary', 'user-created', 'celebration', 'bangalore'],
  },
  {
    id: 'user-receipt-02',
    type: 'expense',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-09-03T16:45:00.000Z',
    title: 'Vinyl Record Haul — Abbey Road & Kind of Blue',
    description: 'Acquired 180g analog pressings of Abbey Road and Miles Davis Kind of Blue.',
    category: 'Music & Hobbies',
    subcategory: 'Vinyl',
    amount: 4200,
    currency: 'INR',
    expenseType: 'Expense',
    location: { city: 'Bangalore', locationName: 'The Revolver Club Record Fair' },
    metadata: { merchant: 'The Revolver Club', records: 'Abbey Road, Kind of Blue', format: '12" Vinyl' },
    tags: ['music', 'vinyl', 'analog', 'audio', 'user-created'],
  },
  {
    id: 'user-receipt-03',
    type: 'event',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-12-10T06:30:00.000Z',
    title: 'Morning 10K Run along Marine Drive',
    description: 'Sunrise training run from Nariman Point to Chowpatty and back.',
    category: 'Fitness',
    location: { city: 'Mumbai', locationName: 'Marine Drive Promenade' },
    metadata: { distance: '10.2 km', duration: '54m 12s', pace: '5:18 /km' },
    tags: ['fitness', 'running', 'morning', 'mumbai', 'user-created'],
  },
  {
    id: 'user-receipt-04',
    type: 'transaction',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-01-20T11:15:00.000Z',
    title: 'Flight Ticket to Kochi-Muziris Biennale',
    description: 'Round-trip flight booking to Kochi for the art biennale weekend.',
    category: 'Travel',
    subcategory: 'Flights',
    amount: 5600,
    currency: 'INR',
    location: { city: 'Kochi', locationName: 'Cochin International Airport' },
    metadata: { merchant: 'IndiGo Airlines', pnr: '6E-481', seat: '14A' },
    tags: ['travel', 'art', 'biennale', 'flight', 'user-created'],
  },
  {
    id: 'user-receipt-05',
    type: 'transaction',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2022-07-18T14:20:00.000Z',
    title: 'Custom Mechanical Keyboard (Keychron K2)',
    description: 'Wireless mechanical keyboard with Gateron brown switches for the creative studio.',
    category: 'Electronics',
    subcategory: 'Hardware',
    amount: 8999,
    currency: 'INR',
    location: { city: 'Bangalore', locationName: 'Keychron India' },
    metadata: { merchant: 'Keychron India', model: 'K2 v2 RGB Aluminum', switches: 'Gateron Brown' },
    tags: ['tech', 'workspace', 'hardware', 'setup', 'user-created'],
  },
  {
    id: 'user-receipt-06',
    type: 'event',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2024-02-17T15:00:00.000Z',
    title: 'Weekend Pottery Workshop with Maya',
    description: 'Wheel-throwing and clay shaping class. Made two hand-thrown ceramic espresso cups.',
    category: 'Workshop',
    amount: 2500,
    currency: 'INR',
    location: { city: 'Bangalore', locationName: 'Clay Station Studio' },
    metadata: { instructor: 'Clay Station', attendees: 2, itemsMade: 2 },
    tags: ['workshop', 'art', 'weekend', 'pottery', 'user-created'],
  },
  {
    id: 'user-receipt-07',
    type: 'expense',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-02-12T10:15:00.000Z',
    title: 'Pour-Over Coffee & Almond Croissant',
    description: 'Morning coffee ritual following Sunday journaling session.',
    category: 'Coffee',
    subcategory: 'Cafe',
    amount: 480,
    currency: 'INR',
    expenseType: 'Expense',
    location: { city: 'Bangalore', locationName: 'Blue Tokai Cafe Indiranagar' },
    metadata: { merchant: 'Blue Tokai', roast: 'Attikan Estate', brewMethod: 'V60' },
    tags: ['coffee', 'reading', 'weekend', 'cafe', 'user-created'],
  },
  {
    id: 'user-receipt-08',
    type: 'place',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-10-28T17:30:00.000Z',
    title: 'Sunset at Fort Kochi Promenade',
    description: 'Watched Chinese fishing nets against the sunset after gallery visits.',
    category: 'Place',
    location: { city: 'Kochi', locationName: 'Fort Kochi Beach Promenade' },
    metadata: { placeName: 'Fort Kochi Promenade', weather: 'Clear / Golden hour' },
    tags: ['travel', 'heritage', 'sunset', 'kochi', 'user-created'],
  },
  {
    id: 'user-receipt-09',
    type: 'note',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-06-21T22:10:00.000Z',
    title: 'Midnight Solstice Reading Notes',
    description: 'Excerpts from Calvino’s Invisible Cities and thoughts on personal memory architectures.',
    category: 'Literature',
    location: { city: 'Bangalore', locationName: 'Home Library' },
    metadata: { book: 'Invisible Cities', author: 'Italo Calvino', noteType: 'Archival Reflection' },
    tags: ['reading', 'literature', 'reflection', 'note', 'user-created'],
  },
  {
    id: 'user-receipt-10',
    type: 'movie',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2023-07-22T19:30:00.000Z',
    title: 'Oppenheimer 70mm IMAX Screening',
    description: 'Opening weekend 70mm screening at PVR IMAX with friends.',
    category: 'Cinema',
    subcategory: 'Film',
    amount: 850,
    currency: 'INR',
    location: { city: 'Bangalore', locationName: 'PVR IMAX Vega City' },
    metadata: { director: 'Christopher Nolan', format: 'IMAX 70mm', screen: 'Audi 1' },
    tags: ['movie', 'cinema', 'imax', 'entertainment', 'user-created'],
  },
];

export const DEFAULT_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'diary-01',
    title: 'Reflecting on the 2017 Monsoon Sessions',
    content: "Revisiting old playlist logs from the 2017 monsoon. It’s wild how certain tracks bring back the exact damp scent of the campus library, the flickering tube lights, and late-night coding sprints. Music truly acts as an emotional index for memory.",
    timestamp: '2023-08-20T21:30:00.000Z',
    createdAt: '2023-08-20T21:30:00.000Z',
    updatedAt: '2023-08-20T21:30:00.000Z',
    linkedReceiptIds: ['user-receipt-02', 'user-receipt-09'],
    tags: ['music', 'nostalgia', 'monsoon', 'reflection'],
    mood: 'Reflective',
  },
  {
    id: 'diary-02',
    title: 'Setting up the New Creative Studio',
    content: "Finally finished assembling the walnut desk and hooked up the vintage speakers and mechanical keyboard. Playing Miles Davis' 'Kind of Blue' on vinyl right now. Everything feels tactile, grounded, and focused.",
    timestamp: '2023-09-05T19:00:00.000Z',
    createdAt: '2023-09-05T19:00:00.000Z',
    updatedAt: '2023-09-05T19:00:00.000Z',
    linkedReceiptIds: ['user-receipt-02', 'user-receipt-05'],
    tags: ['studio', 'music', 'workspace', 'focus'],
    mood: 'Peaceful',
  },
  {
    id: 'diary-03',
    title: 'Post-Marathon Marine Drive Morning',
    content: "Completed the 10K at sunrise. The breeze off the Arabian Sea was crisp. Sitting at a promenade cafe with black coffee and looking at the sea. Grateful for the rhythm of the city and consistent training.",
    timestamp: '2023-12-10T10:15:00.000Z',
    createdAt: '2023-12-10T10:15:00.000Z',
    updatedAt: '2023-12-10T10:15:00.000Z',
    linkedReceiptIds: ['user-receipt-03'],
    tags: ['fitness', 'running', 'mumbai', 'morning'],
    mood: 'Energized',
  },
  {
    id: 'diary-04',
    title: 'Biennale Wanderings in Fort Kochi',
    content: "Spent 7 hours walking through Aspinwall House and pepper warehouses turned into art installations. The contrast between ancient spice docks and contemporary video art is mesmerizing. Finished the evening watching fishing nets dip into the sunset.",
    timestamp: '2023-01-21T20:00:00.000Z',
    createdAt: '2023-01-21T20:00:00.000Z',
    updatedAt: '2023-01-21T20:00:00.000Z',
    linkedReceiptIds: ['user-receipt-04', 'user-receipt-08'],
    tags: ['art', 'travel', 'kochi', 'culture'],
    mood: 'Inspired',
  },
];

export const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'bookmark-01',
    targetId: 'user-receipt-01',
    targetType: 'receipt',
    title: 'Anniversary Dinner at Olive Beach',
    subtitle: 'Dining • 14 Nov 2023',
    createdAt: '2023-11-15T09:00:00.000Z',
    note: 'One of our all-time favorite meals. The grilled sea bass was unforgettable.',
  },
  {
    id: 'bookmark-02',
    targetId: 'user-receipt-02',
    targetType: 'receipt',
    title: 'Vinyl Record Haul — Abbey Road & Kind of Blue',
    subtitle: 'Music & Hobbies • 03 Sep 2023',
    createdAt: '2023-09-04T12:00:00.000Z',
    note: 'Essential analog additions to the home sound library.',
  },
  {
    id: 'bookmark-03',
    targetId: 'user-receipt-06',
    targetType: 'receipt',
    title: 'Weekend Pottery Workshop with Maya',
    subtitle: 'Workshop • 17 Feb 2024',
    createdAt: '2024-02-18T10:00:00.000Z',
    note: 'Handmade two ceramic espresso cups. First time on the wheel!',
  },
  {
    id: 'bookmark-04',
    targetId: 'user-receipt-10',
    targetType: 'receipt',
    title: 'Oppenheimer 70mm IMAX Screening',
    subtitle: 'Cinema • 22 Jul 2023',
    createdAt: '2023-07-23T11:00:00.000Z',
    note: 'A masterclass in sound design and non-linear pacing.',
  },
  {
    id: 'bookmark-05',
    targetId: 'user-receipt-04',
    targetType: 'receipt',
    title: 'Flight Ticket to Kochi-Muziris Biennale',
    subtitle: 'Travel • 20 Jan 2023',
    createdAt: '2023-01-21T09:00:00.000Z',
    note: 'The beginning of an unforgettable art weekend across pepper warehouses.',
  },
  {
    id: 'bookmark-06',
    targetId: 'user-receipt-03',
    targetType: 'receipt',
    title: 'Morning 10K Run along Marine Drive',
    subtitle: 'Fitness • 10 Dec 2023',
    createdAt: '2023-12-11T08:00:00.000Z',
    note: 'Personal best pace under the crisp Arabian Sea sunrise.',
  },
];

export const DEFAULT_FEATURED: FeaturedItem[] = [
  {
    id: 'featured-01',
    receiptId: 'user-receipt-01',
    createdAt: '2023-11-15T00:00:00.000Z',
    caption: 'Our 5th anniversary dinner at Olive Beach under the courtyard banyan tree.',
    order: 0,
  },
  {
    id: 'featured-02',
    receiptId: 'user-receipt-02',
    createdAt: '2023-09-04T00:00:00.000Z',
    caption: 'Finding pristine 180g analog pressings of Abbey Road and Miles Davis.',
    order: 1,
  },
  {
    id: 'featured-03',
    receiptId: 'user-receipt-04',
    createdAt: '2023-01-22T00:00:00.000Z',
    caption: 'Art exploration and heritage warehouse walks at Kochi-Muziris Biennale.',
    order: 2,
  },
  {
    id: 'featured-04',
    receiptId: 'user-receipt-03',
    createdAt: '2023-12-11T00:00:00.000Z',
    caption: '10K sunrise run along the Arabian Sea at Marine Drive.',
    order: 3,
  },
];

export const DEFAULT_FUTURE_EVENTS: FutureEvent[] = [
  {
    id: 'future-01',
    title: 'Quarterly Archival Audit & Cold Backup',
    date: '2026-10-15',
    time: '10:00',
    location: 'Home Studio',
    category: 'Archival',
    type: 'milestone',
    notes: 'Export LifeTrace receipts, synchronize diary entries, and backup to encrypted cold storage.',
    status: 'future',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'future-02',
    title: 'Tokyo Cherry Blossom & Jazz Kissaten Tour',
    date: '2027-04-02',
    time: '09:00',
    location: 'Tokyo, Japan',
    category: 'Travel',
    type: 'travel',
    notes: 'Exploring historical vinyl kissaten bars in Shibuya, Shinjuku, and Shimokitazawa.',
    status: 'future',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'future-03',
    title: 'City Half Marathon 2026',
    date: '2026-11-22',
    time: '05:30',
    location: 'Cubbon Park, Bangalore',
    category: 'Fitness',
    type: 'event',
    notes: 'Target pace: under 5:15 min/km for 21.1 km.',
    status: 'future',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'future-04',
    title: 'Acoustic Guitar Fingerstyle Masterclass',
    date: '2026-12-05',
    time: '14:00',
    location: 'Alliance Française',
    category: 'Music',
    type: 'event',
    notes: 'Special weekend masterclass on DADGAD tuning and Celtic harmonics.',
    status: 'future',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'future-05',
    title: 'Modern Frontend Architecture Summit',
    date: '2026-09-28',
    time: '09:30',
    location: 'Convention Center',
    category: 'Technology',
    type: 'event',
    notes: 'Keynote on local-first web applications and digital memory archives.',
    status: 'future',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'future-06',
    title: 'Annual Spotify Hi-Fi Vinyl Boxset Release',
    date: '2026-10-01',
    time: '12:00',
    location: 'Online Store',
    category: 'Music',
    type: 'purchase',
    notes: 'Limited edition analog pressing pre-order.',
    status: 'future',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

export const DEFAULT_SAVED_VIEWS: SavedView[] = [
  {
    id: 'saved-view-01',
    name: 'Late-Night Soundtracks & Memories',
    type: 'explore',
    filters: { types: ['music'], search: 'late night' },
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'saved-view-02',
    name: 'The Convergence (2015–2018)',
    type: 'journey',
    filters: { dateRange: ['2015-01-01T00:00:00Z', '2018-12-31T23:59:59Z'] },
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'saved-view-03',
    name: 'Personal Life Milestones',
    type: 'explore',
    filters: { sources: ['user', 'synthetic'] },
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'saved-view-04',
    name: 'Cafes & Weekend Study Routines',
    type: 'explore',
    filters: { types: ['place', 'expense'], search: 'cafe' },
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'saved-view-05',
    name: 'Cinema & Evening Screenings',
    type: 'explore',
    filters: { types: ['movie'], search: 'cinema' },
    createdAt: '2026-01-10T00:00:00.000Z',
  },
];

export function hasAnyUserData(): boolean {
  const receipts = safeParse<any[]>(safeGetItem(STORAGE_KEYS.USER_RECEIPTS), []);
  const diary = safeParse<any[]>(safeGetItem(STORAGE_KEYS.DIARY), []);
  const bookmarks = safeParse<any[]>(safeGetItem(STORAGE_KEYS.BOOKMARKS), []);
  const featured = safeParse<any[]>(safeGetItem(STORAGE_KEYS.FEATURED), []);
  const future = safeParse<any[]>(safeGetItem(STORAGE_KEYS.FUTURE_EVENTS), []);
  const views = safeParse<any[]>(safeGetItem(STORAGE_KEYS.SAVED_VIEWS), []);

  return (
    receipts.length > 0 &&
    diary.length > 0 &&
    bookmarks.length > 0 &&
    featured.length > 0 &&
    future.length > 0 &&
    views.length > 0
  );
}

export function seedSampleUserData(force = false): void {
  const receipts = safeParse<any[]>(safeGetItem(STORAGE_KEYS.USER_RECEIPTS), []);
  const diary = safeParse<any[]>(safeGetItem(STORAGE_KEYS.DIARY), []);
  const bookmarks = safeParse<any[]>(safeGetItem(STORAGE_KEYS.BOOKMARKS), []);
  const featured = safeParse<any[]>(safeGetItem(STORAGE_KEYS.FEATURED), []);
  const future = safeParse<any[]>(safeGetItem(STORAGE_KEYS.FUTURE_EVENTS), []);
  const views = safeParse<any[]>(safeGetItem(STORAGE_KEYS.SAVED_VIEWS), []);

  if (force || receipts.length === 0) {
    safeSetItem(STORAGE_KEYS.USER_RECEIPTS, JSON.stringify(DEFAULT_USER_RECEIPTS));
    notifyChange(STORAGE_KEYS.USER_RECEIPTS);
  }
  if (force || diary.length === 0) {
    safeSetItem(STORAGE_KEYS.DIARY, JSON.stringify(DEFAULT_DIARY_ENTRIES));
    notifyChange(STORAGE_KEYS.DIARY);
  }
  if (force || bookmarks.length === 0) {
    safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(DEFAULT_BOOKMARKS));
    notifyChange(STORAGE_KEYS.BOOKMARKS);
  }
  if (force || featured.length === 0) {
    safeSetItem(STORAGE_KEYS.FEATURED, JSON.stringify(DEFAULT_FEATURED));
    notifyChange(STORAGE_KEYS.FEATURED);
  }
  if (force || future.length === 0) {
    safeSetItem(STORAGE_KEYS.FUTURE_EVENTS, JSON.stringify(DEFAULT_FUTURE_EVENTS));
    notifyChange(STORAGE_KEYS.FUTURE_EVENTS);
  }
  if (force || views.length === 0) {
    safeSetItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(DEFAULT_SAVED_VIEWS));
    notifyChange(STORAGE_KEYS.SAVED_VIEWS);
  }
}

export function resetSampleUserData(): void {
  seedSampleUserData(true);
}

export function initSampleUserData(force = false): void {
  const isSeededV6 = safeGetItem('lifetrace_seed_v6') === 'true';
  if (force || !isSeededV6 || !hasAnyUserData()) {
    seedSampleUserData(true);
    safeSetItem('lifetrace_seed_v6', 'true');
  }
}
