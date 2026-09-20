import { useState, useEffect, useCallback } from 'react';
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
import * as storage from '@/lib/storage';

export interface UserDataState {
  userReceipts: LifeReceipt[];
  diaryEntries: DiaryEntry[];
  bookmarks: BookmarkItem[];
  featuredItems: FeaturedItem[];
  savedViews: SavedView[];
  futureEvents: FutureEvent[];
  profile: UserProfile;
}

export function useUserData() {
  const [data, setData] = useState<UserDataState>(() => ({
    userReceipts: storage.getUserReceipts(),
    diaryEntries: storage.getDiaryEntries(),
    bookmarks: storage.getBookmarks(),
    featuredItems: storage.getFeatured(),
    savedViews: storage.getSavedViews(),
    futureEvents: storage.getFutureEvents(),
    profile: storage.getUserProfile(),
  }));

  const refreshAll = useCallback(() => {
    setData({
      userReceipts: storage.getUserReceipts(),
      diaryEntries: storage.getDiaryEntries(),
      bookmarks: storage.getBookmarks(),
      featuredItems: storage.getFeatured(),
      savedViews: storage.getSavedViews(),
      futureEvents: storage.getFutureEvents(),
      profile: storage.getUserProfile(),
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      refreshAll();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(storage.STORAGE_CHANGE_EVENT, handleStorageChange);
      window.addEventListener('storage', handleStorageChange); // Across tabs
      return () => {
        window.removeEventListener(storage.STORAGE_CHANGE_EVENT, handleStorageChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [refreshAll]);

  // Wrapped actions so components never directly touch storage
  const addUserReceipt = useCallback((receipt: LifeReceipt) => {
    return storage.saveUserReceipt(receipt);
  }, []);

  const deleteUserReceipt = useCallback((id: string) => {
    storage.deleteUserReceipt(id);
  }, []);

  const addDiaryEntry = useCallback(
    (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      return storage.saveDiaryEntry(entry);
    },
    []
  );

  const deleteDiaryEntry = useCallback((id: string) => {
    storage.deleteDiaryEntry(id);
  }, []);

  const toggleBookmark = useCallback(
    (
      targetId: string,
      targetType: BookmarkTargetType,
      title: string,
      subtitle?: string,
      note?: string
    ) => {
      return storage.toggleBookmark(targetId, targetType, title, subtitle, note);
    },
    []
  );

  const isBookmarked = useCallback(
    (targetId: string) => {
      return data.bookmarks.some((b) => b.targetId === targetId);
    },
    [data.bookmarks]
  );

  const toggleFeatured = useCallback((receiptId: string, caption?: string) => {
    return storage.toggleFeatured(receiptId, caption);
  }, []);

  const isFeatured = useCallback(
    (receiptId: string) => {
      return data.featuredItems.some((f) => f.receiptId === receiptId);
    },
    [data.featuredItems]
  );

  const saveView = useCallback(
    (name: string, type: 'explore' | 'journey', filters: SavedView['filters']) => {
      return storage.saveView(name, type, filters);
    },
    []
  );

  const deleteSavedView = useCallback((id: string) => {
    storage.deleteSavedView(id);
  }, []);

  const addFutureEvent = useCallback(
    (
      event: Omit<FutureEvent, 'id' | 'status' | 'createdAt'> & {
        id?: string;
        status?: 'future' | 'completed';
      }
    ) => {
      return storage.saveFutureEvent(event);
    },
    []
  );

  const deleteFutureEvent = useCallback((id: string) => {
    storage.deleteFutureEvent(id);
  }, []);

  const completeFutureEvent = useCallback((id: string, actualTimestamp?: string) => {
    return storage.completeFutureEvent(id, actualTimestamp);
  }, []);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    return storage.saveUserProfile(profile);
  }, []);

  const resetSampleData = useCallback(() => {
    storage.resetSampleUserData();
    refreshAll();
  }, [refreshAll]);

  const seedSampleData = useCallback((force = false) => {
    storage.seedSampleUserData(force);
    refreshAll();
  }, [refreshAll]);

  return {
    ...data,
    refreshAll,
    addUserReceipt,
    deleteUserReceipt,
    addDiaryEntry,
    deleteDiaryEntry,
    toggleBookmark,
    isBookmarked,
    toggleFeatured,
    isFeatured,
    saveView,
    deleteSavedView,
    addFutureEvent,
    deleteFutureEvent,
    completeFutureEvent,
    updateProfile,
    resetSampleData,
    seedSampleData,
  };
}
