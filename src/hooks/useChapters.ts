import { useState, useEffect } from 'react';
import { LifeReceipt, Connection, Chapter } from '@/types';
import { buildChapters } from '@/engine/chapters';

export function useChapters(receipts: LifeReceipt[], connections: Connection[]) {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    return receipts.length > 0 ? buildChapters(receipts, connections) : [];
  });
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (receipts.length === 0) {
      setChapters([]);
      return;
    }

    const currentResult = buildChapters(receipts, connections);
    if (chapters.length === currentResult.length && chapters.length > 0) {
      return;
    }
    
    let mounted = true;
    setIsComputing(true);
    
    const timer = setTimeout(() => {
      if (mounted) {
        setChapters(currentResult);
        setIsComputing(false);
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [receipts, connections, chapters]);

  return { chapters, isComputing };
}
