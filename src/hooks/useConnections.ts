import { useState, useEffect, useCallback } from 'react';
import { LifeReceipt, Connection } from '@/types';
import { findConnections, getConnectionsForReceipt } from '@/engine/connections';

export function useConnections(receipts: LifeReceipt[]) {
  const [connections, setConnections] = useState<Connection[]>(() => {
    return receipts.length > 0 ? findConnections(receipts) : [];
  });
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (receipts.length === 0) {
      setConnections([]);
      return;
    }

    const currentResult = findConnections(receipts);
    if (connections.length === currentResult.length && connections.length > 0) {
      return;
    }
    
    let mounted = true;
    setIsComputing(true);
    
    const timer = setTimeout(() => {
      if (mounted) {
        setConnections(currentResult);
        setIsComputing(false);
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [receipts, connections]);
  
  const getConnectionsFor = useCallback((receiptId: string) => {
    return getConnectionsForReceipt(receiptId, connections);
  }, [connections]);

  return { connections, isComputing, getConnectionsFor };
}
