import { useState, useEffect } from 'react';
import type {
  LifeReceipt,
  SpotifyStats,
  HouseholdStats,
  TransactionStats,
  DataManifest,
} from '@/types';
import {
  loadUnifiedReceipts,
  loadSpotifyStats,
  loadHouseholdStats,
  loadTransactionStats,
  loadManifest,
} from '@/engine/normalize';
import { STORAGE_CHANGE_EVENT, STORAGE_KEYS } from '@/lib/storage';

interface LifeDataState {
  receipts: LifeReceipt[];
  spotifyStats: SpotifyStats | null;
  householdStats: HouseholdStats | null;
  transactionStats: TransactionStats | null;
  manifest: DataManifest | null;
  isLoading: boolean;
  error: string | null;
}

export function useLifeData(): LifeDataState {
  const [state, setState] = useState<LifeDataState>({
    receipts: [],
    spotifyStats: null,
    householdStats: null,
    transactionStats: null,
    manifest: null,
    isLoading: true,
    error: null,
  });

  const loadData = () => {
    try {
      const receipts = loadUnifiedReceipts();
      const spotifyStats = loadSpotifyStats();
      const householdStats = loadHouseholdStats();
      const transactionStats = loadTransactionStats();
      const manifest = loadManifest();

      setState({
        receipts,
        spotifyStats,
        householdStats,
        transactionStats,
        manifest,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Failed to load life data:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load archive data. Please refresh.',
      }));
    }
  };

  useEffect(() => {
    loadData();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key?: string }>;
      const key = customEvent?.detail?.key;
      // If user receipts or future events change, re-sync receipts
      if (!key || key === STORAGE_KEYS.USER_RECEIPTS || key === STORAGE_KEYS.FUTURE_EVENTS) {
        setState((prev) => ({
          ...prev,
          receipts: loadUnifiedReceipts(),
        }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
      return () => {
        window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
      };
    }
  }, []);

  return state;
}
