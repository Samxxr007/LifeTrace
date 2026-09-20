import { useState, useEffect } from 'react';
import { LifeReceipt, Pattern, SpotifyStats, HouseholdStats } from '@/types';
import { detectPatterns } from '@/engine/patterns';

export function usePatterns(receipts: LifeReceipt[], spotifyStats: SpotifyStats | null, householdStats: HouseholdStats | null) {
  const [patterns, setPatterns] = useState<Pattern[]>(() => {
    return receipts.length > 0 ? detectPatterns(receipts, spotifyStats, householdStats) : [];
  });
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (receipts.length === 0) {
      setPatterns([]);
      return;
    }

    const currentResult = detectPatterns(receipts, spotifyStats, householdStats);
    if (patterns.length === currentResult.length && patterns.length > 0) {
      return;
    }
    
    let mounted = true;
    setIsComputing(true);
    
    const timer = setTimeout(() => {
      if (mounted) {
        setPatterns(currentResult);
        setIsComputing(false);
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [receipts, spotifyStats, householdStats, patterns]);

  return { patterns, isComputing };
}
