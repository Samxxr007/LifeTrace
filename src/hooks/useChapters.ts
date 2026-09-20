import { useState, useEffect } from 'react';
import { LifeReceipt, Connection, Chapter } from '@/types';
import { buildChapters } from '@/engine/chapters';

export function useChapters(receipts: LifeReceipt[], connections: Connection[]) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (receipts.length === 0) return;
    
    let mounted = true;
    setIsComputing(true);
    
    const timer = setTimeout(() => {
      const result = buildChapters(receipts, connections);
      if (mounted) {
        setChapters(result);
        setIsComputing(false);
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [receipts, connections]);

  return { chapters, isComputing };
}
