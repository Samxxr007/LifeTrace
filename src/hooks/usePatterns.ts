import { useState, useEffect } from 'react';
import { LifeReceipt, Pattern, SpotifyStats, HouseholdStats } from '@/types';
import { detectPatterns } from '@/engine/patterns';

export function usePatterns(receipts: LifeReceipt[], spotifyStats: SpotifyStats | null, householdStats: HouseholdStats | null) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (receipts.length === 0) return;
    
    let mounted = true;
    setIsComputing(true);
    
    const timer = setTimeout(() => {
      const result = detectPatterns(receipts, spotifyStats, householdStats);
      if (mounted) {
        setPatterns(result);
        setIsComputing(false);
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [receipts, spotifyStats, householdStats]);

  return { patterns, isComputing };
}
