import { describe, it, expect } from 'vitest';
import { findConnections } from '@/engine/connections';
import { LifeReceipt } from '@/types';

describe('Connections Engine', () => {
  it('Tests findConnections', () => {
    const receipts: Partial<LifeReceipt>[] = [
      { id: '1', timestamp: '2023-10-15T18:00:00Z', type: 'note', category: 'a' },
      { id: '2', timestamp: '2023-10-15T18:18:00Z', type: 'note', category: 'b' },
      { id: '3', timestamp: '2023-10-15T18:00:00Z', type: 'note', category: 'c' },
      { id: '4', timestamp: '2023-11-15T18:00:00Z', type: 'note', category: 'c' },
      { id: '5', timestamp: '2023-10-16T10:00:00Z', type: 'note', category: 'd' },
      { id: '6', timestamp: '2023-10-18T14:00:00Z', type: 'note', category: 'e' },
      { id: '7', timestamp: '2023-10-17T10:00:00Z', type: 'note', category: 'f' },
      { id: '8', timestamp: '2023-10-17T11:00:00Z', type: 'note', category: 'g' }
    ];
    
    const connections = findConnections(receipts as LifeReceipt[], 100);
    
    const conn12 = connections.find(c => (c.sourceId === '1' && c.targetId === '2') || (c.sourceId === '2' && c.targetId === '1'));
    expect(conn12).toBeDefined();
    expect(conn12?.explanation).toContain('minutes apart');
    expect(conn12?.score).toBeGreaterThan(0);
    expect(conn12?.score).toBeLessThanOrEqual(1);
    expect(['strong', 'moderate', 'weak']).toContain(conn12?.strength);
    
    const conn34 = connections.find(c => (c.sourceId === '3' && c.targetId === '4') || (c.sourceId === '4' && c.targetId === '3'));
    expect(conn34).toBeUndefined();
    
    const conn56 = connections.find(c => (c.sourceId === '5' && c.targetId === '6') || (c.sourceId === '6' && c.targetId === '5'));
    expect(conn56).toBeUndefined();
    
    const conn78 = connections.find(c => (c.sourceId === '7' && c.targetId === '8') || (c.sourceId === '8' && c.targetId === '7'));
    expect(conn78).toBeDefined();
  });
});
