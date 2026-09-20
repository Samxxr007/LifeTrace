import { describe, it, expect, beforeEach } from 'vitest';
import { findConnections, getConnectionsForReceipt, getConnectionIndex } from '@/engine/connections';
import { loadAllReceipts } from '@/engine/normalize';
import type { LifeReceipt } from '@/types';

describe('Connection Engine & Lookup Pipeline', () => {
  const deterministicReceipts: LifeReceipt[] = [
    {
      id: 'mock-music-1',
      title: 'Late Night Track',
      type: 'music',
      source: 'spotify',
      timestamp: '2016-05-10T20:00:00Z',
      tags: [],
      metadata: { artist: 'Artist A' },
    },
    {
      id: 'mock-expense-1',
      title: 'Evening Grocery',
      type: 'expense',
      source: 'household',
      category: 'grocery',
      timestamp: '2016-05-10T20:35:00Z', // 35 minutes apart, same evening
      tags: [],
      metadata: { merchant: 'City Mart' },
    },
    {
      id: 'mock-isolated-1',
      title: 'Distant Moment',
      type: 'transaction',
      source: 'transactions',
      category: 'travel',
      timestamp: '2024-01-01T12:00:00Z', // Years away, no overlap
      tags: [],
      metadata: { merchant: 'Airline X' },
    },
  ];

  it('1. Connection engine produces expected connection between temporally proximate moments', () => {
    const connections = findConnections(deterministicReceipts);
    expect(connections.length).toBeGreaterThan(0);

    const found = connections.find(
      (c) =>
        (c.sourceId === 'mock-music-1' && c.targetId === 'mock-expense-1') ||
        (c.sourceId === 'mock-expense-1' && c.targetId === 'mock-music-1')
    );
    expect(found).toBeDefined();
    expect(found?.score).toBeGreaterThan(0);
    expect(['strong', 'moderate', 'weak']).toContain(found?.strength);
  });

  it('2. sourceId lookup works via getConnectionsForReceipt', () => {
    const connections = findConnections(deterministicReceipts);
    const conns = getConnectionsForReceipt('mock-music-1', connections);
    expect(conns.length).toBe(1);
    expect(conns[0].targetId).toBe('mock-expense-1');
  });

  it('3. targetId lookup works via getConnectionsForReceipt', () => {
    const connections = findConnections(deterministicReceipts);
    const conns = getConnectionsForReceipt('mock-expense-1', connections);
    expect(conns.length).toBe(1);
    expect(conns[0].sourceId).toBe('mock-music-1');
  });

  it('4. receipt with connections returns non-empty array with proper connections', () => {
    const connections = findConnections(deterministicReceipts);
    const conns = getConnectionsForReceipt('mock-music-1', connections);
    expect(conns.length).toBeGreaterThan(0);
    expect(conns[0].id).toContain('mock-music-1');
  });

  it('5. receipt with no connections returns empty array (triggering empty state)', () => {
    const connections = findConnections(deterministicReceipts);
    const conns = getConnectionsForReceipt('mock-isolated-1', connections);
    expect(conns.length).toBe(0);
  });

  it('6. connection evidence is displayed with signals and human-readable explanation', () => {
    const connections = findConnections(deterministicReceipts);
    const conn = connections[0];
    expect(conn.explanation).toBeDefined();
    expect(conn.explanation.length).toBeGreaterThan(5);
    expect(conn.signals.length).toBeGreaterThan(0);
    expect(conn.signals[0].label).toBeDefined();
    expect(conn.signals[0].type).toBeDefined();
  });

  it('7. indexed lookup via getConnectionIndex returns O(1) map', () => {
    findConnections(deterministicReceipts);
    const index = getConnectionIndex();
    expect(index.has('mock-music-1')).toBe(true);
    expect(index.has('mock-expense-1')).toBe(true);
    expect(index.has('mock-isolated-1')).toBe(false);
  });

  it('8. real dataset: explore receipt IDs match connection receipt IDs', () => {
    const realReceipts = loadAllReceipts();
    const realConnections = findConnections(realReceipts);
    const receiptIdSet = new Set(realReceipts.map((r) => r.id));

    expect(realConnections.length).toBeGreaterThan(2000);

    let invalidSourceCount = 0;
    let invalidTargetCount = 0;

    realConnections.forEach((c) => {
      if (!receiptIdSet.has(c.sourceId)) invalidSourceCount++;
      if (!receiptIdSet.has(c.targetId)) invalidTargetCount++;
    });

    expect(invalidSourceCount).toBe(0);
    expect(invalidTargetCount).toBe(0);
  });

  it('9. real dataset: no duplicate connections exist in the collection', () => {
    const realReceipts = loadAllReceipts();
    const realConnections = findConnections(realReceipts);
    const seenPairs = new Set<string>();

    let duplicateCount = 0;
    realConnections.forEach((c) => {
      const pairKey = [c.sourceId, c.targetId].sort().join('--');
      if (seenPairs.has(pairKey)) {
        duplicateCount++;
      }
      seenPairs.add(pairKey);
    });

    expect(duplicateCount).toBe(0);
  });

  it('10. real dataset: all domains (spotify, household, transactions) participate in connections', () => {
    const realReceipts = loadAllReceipts();
    const realConnections = findConnections(realReceipts);
    const participatingSources = new Set<string>();

    const receiptMap = new Map(realReceipts.map((r) => [r.id, r]));
    realConnections.forEach((c) => {
      const rA = receiptMap.get(c.sourceId);
      const rB = receiptMap.get(c.targetId);
      if (rA) participatingSources.add(rA.source);
      if (rB) participatingSources.add(rB.source);
    });

    expect(participatingSources.has('spotify')).toBe(true);
    expect(participatingSources.has('household')).toBe(true);
    expect(participatingSources.has('transactions')).toBe(true);
  });
});
