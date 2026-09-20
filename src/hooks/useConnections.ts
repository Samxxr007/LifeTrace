import { useState, useEffect, useCallback } from 'react';
import { LifeReceipt, Connection } from '@/types';
import { findConnections, getConnectionsForReceipt } from '@/engine/connections';

export function useConnections(receipts: LifeReceipt[]) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (receipts.length === 0) return;
    
    let mounted = true;
    setIsComputing(true);
    
    const timer = setTimeout(() => {
      const result = findConnections(receipts);
      if (mounted) {
        setConnections(result);
        setIsComputing(false);
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [receipts]);
  
  const getConnectionsFor = useCallback((receiptId: string) => {
    return getConnectionsForReceipt(receiptId, connections);
  }, [connections]);

  return { connections, isComputing, getConnectionsFor };
}
