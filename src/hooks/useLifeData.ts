import { useState, useEffect } from 'react';
import type {
  LifeReceipt,
  SpotifyStats,
  HouseholdStats,
  TransactionStats,
  DataManifest,
} from '@/types';
import {
  loadAllReceipts,
  loadSpotifyStats,
  loadHouseholdStats,
  loadTransactionStats,
  loadManifest,
} from '@/engine/normalize';

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

  useEffect(() => {
    try {
      const receipts = loadAllReceipts();
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
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load archive data. Please refresh.',
      }));
    }
  }, []);

  return state;
}
