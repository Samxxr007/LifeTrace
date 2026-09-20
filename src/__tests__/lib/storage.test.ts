import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUserReceipts,
  saveUserReceipt,
  deleteUserReceipt,
  getDiaryEntries,
  saveDiaryEntry,
  deleteDiaryEntry,
  getBookmarks,
  toggleBookmark,
  isBookmarked,
  removeBookmark,
  getFeatured,
  toggleFeatured,
  isFeatured,
  removeFeatured,
  getSavedViews,
  saveView,
  deleteSavedView,
  getFutureEvents,
  saveFutureEvent,
  deleteFutureEvent,
  completeFutureEvent,
  getUserProfile,
  saveUserProfile,
  generateId,
  STORAGE_KEYS,
} from '@/lib/storage';
import type { LifeReceipt } from '@/types';

describe('Local Storage Abstraction Layer (storage.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Collision-resistant ID generation', () => {
    it('generates distinct IDs across successive invocations', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(50);
    });
  });

  describe('2. User Receipts CRUD', () => {
    it('saves, retrieves, and deletes user receipts with correct provenance', () => {
      expect(getUserReceipts()).toEqual([]);

      const sampleReceipt: LifeReceipt = {
        id: generateId(),
        type: 'music',
        source: 'user',
        provenance: 'user-created',
        timestamp: '2024-05-10T12:00:00Z',
        title: 'Morning Jazz Session',
        category: 'Music',
        tags: ['jazz', 'morning'],
        metadata: { artist: 'Miles Davis' },
      };

      const saved = saveUserReceipt(sampleReceipt);
      expect(saved.id).toBe(sampleReceipt.id);
      expect(saved.source).toBe('user');
      expect(saved.provenance).toBe('user-created');

      const retrieved = getUserReceipts();
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].title).toBe('Morning Jazz Session');

      deleteUserReceipt(saved.id);
      expect(getUserReceipts().length).toBe(0);
    });
  });

  describe('3. Diary Entries CRUD & Receipt Linking', () => {
    it('creates, retrieves, and deletes diary entries with linked receipts and user mood', () => {
      expect(getDiaryEntries()).toEqual([]);

      const entry = saveDiaryEntry({
        title: 'A Memorable Concert',
        content: 'Saw my favorite band live at the arena. Incredible energy and lights.',
        timestamp: '2024-06-15T21:00:00Z',
        linkedReceiptIds: ['rec-1', 'rec-2'],
        tags: ['concert', 'live'],
        mood: 'Celebratory',
      });

      expect(entry.id).toBeDefined();
      expect(entry.createdAt).toBeDefined();
      expect(entry.mood).toBe('Celebratory');
      expect(entry.linkedReceiptIds).toEqual(['rec-1', 'rec-2']);

      const allEntries = getDiaryEntries();
      expect(allEntries.length).toBe(1);
      expect(allEntries[0].title).toBe('A Memorable Concert');

      deleteDiaryEntry(entry.id);
      expect(getDiaryEntries().length).toBe(0);
    });
  });

  describe('4. Bookmarks across multiple entity targets', () => {
    it('supports bookmarking receipts, connections, and stories', () => {
      expect(getBookmarks()).toEqual([]);
      expect(isBookmarked('item-1')).toBe(false);

      // Add bookmark
      const added = toggleBookmark('item-1', 'receipt', 'Special Receipt', 'Music');
      expect(added).toBe(true);
      expect(isBookmarked('item-1')).toBe(true);
      expect(getBookmarks().length).toBe(1);

      // Toggle off
      const removed = toggleBookmark('item-1', 'receipt', 'Special Receipt');
      expect(removed).toBe(false);
      expect(isBookmarked('item-1')).toBe(false);

      // Explicit remove
      toggleBookmark('item-2', 'connection', 'Connection 1');
      expect(getBookmarks().length).toBe(1);
      removeBookmark('item-2');
      expect(getBookmarks().length).toBe(0);
    });
  });

  describe('5. Featured Moments (Receipts)', () => {
    it('toggles featured status and maintains order', () => {
      expect(getFeatured()).toEqual([]);
      expect(isFeatured('rec-100')).toBe(false);

      const added = toggleFeatured('rec-100', 'Top moment of the year');
      expect(added).toBe(true);
      expect(isFeatured('rec-100')).toBe(true);

      const allFeatured = getFeatured();
      expect(allFeatured.length).toBe(1);
      expect(allFeatured[0].receiptId).toBe('rec-100');
      expect(allFeatured[0].caption).toBe('Top moment of the year');

      removeFeatured('rec-100');
      expect(isFeatured('rec-100')).toBe(false);
    });
  });

  describe('6. Saved Views in Explore & Journey', () => {
    it('saves and deletes named search/filter views', () => {
      expect(getSavedViews()).toEqual([]);

      const view = saveView('2017 Coffee & Music', 'explore', {
        query: 'coffee',
        types: ['music', 'expense'],
        sources: ['spotify', 'household'],
        categories: [],
        dateRange: ['2017-01-01', '2017-12-31'],
        amountRange: [null, null],
      });

      expect(view.id).toBeDefined();
      expect(view.name).toBe('2017 Coffee & Music');
      expect(getSavedViews().length).toBe(1);

      deleteSavedView(view.id);
      expect(getSavedViews().length).toBe(0);
    });
  });

  describe('7. Future Events & Semantic Completion to Receipt', () => {
    it('creates future events and converts to completed event receipts upon experience', () => {
      expect(getFutureEvents()).toEqual([]);

      const futureEvt = saveFutureEvent({
        title: 'Coldplay India Tour 2025',
        date: '2025-01-25T19:00:00Z',
        time: '7:00 PM',
        location: 'DY Patil Stadium, Mumbai',
        category: 'Concert',
        type: 'entertainment',
        notes: 'Floor standing tickets booked with friends',
      });

      expect(futureEvt.id).toBeDefined();
      expect(futureEvt.status).toBe('future');

      // Experience the event! Converts to a completed LifeReceipt
      const completedReceipt = completeFutureEvent(futureEvt.id, '2025-01-25T23:00:00Z');
      expect(completedReceipt).not.toBeNull();
      expect(completedReceipt?.source).toBe('user');
      expect(completedReceipt?.provenance).toBe('user-created');
      expect(completedReceipt?.status).toBe('completed');
      expect(completedReceipt?.plannedEventId).toBe(futureEvt.id);
      expect(completedReceipt?.completedAt).toBe('2025-01-25T23:00:00Z');
      expect(completedReceipt?.title).toContain('Coldplay India Tour 2025');

      // Future event status is updated to completed
      const eventsAfter = getFutureEvents();
      const updatedEvt = eventsAfter.find((e) => e.id === futureEvt.id);
      expect(updatedEvt?.status).toBe('completed');
      expect(updatedEvt?.completedAt).toBe('2025-01-25T23:00:00Z');

      // Receipt is now also in user receipts pool
      const userRecs = getUserReceipts();
      expect(userRecs.some((r) => r.plannedEventId === futureEvt.id)).toBe(true);
    });
  });

  describe('8. User Profile', () => {
    it('reads default profile and saves updates', () => {
      const initial = getUserProfile();
      expect(initial.displayName).toBe('Archivist');

      const updated = saveUserProfile({
        displayName: 'Aarav Sharma',
        bio: 'Exploring memories from Bangalore to Mumbai.',
      });

      expect(updated.displayName).toBe('Aarav Sharma');
      expect(getUserProfile().displayName).toBe('Aarav Sharma');
    });
  });
});
