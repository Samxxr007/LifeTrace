import { describe, it, expect } from 'vitest';
import { findConnections, getConnectionsForReceipt, getConnectionIndex } from '@/engine/connections';
import { loadAllReceipts, loadSyntheticReceipts } from '@/engine/normalize';
import type { LifeReceipt } from '@/types';

describe('Connection Engine & Multi-Domain Pipeline', () => {
  const deterministicReceipts: LifeReceipt[] = [
    {
      id: 'fixture-music-1',
      title: 'Cafe Study Beats',
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: 'scenario-test-1',
      timestamp: '2023-04-10T14:00:00Z',
      tags: ['coffee', 'study'],
      location: { city: 'Chennai' },
      metadata: { artist: 'Lofi Producer' },
    },
    {
      id: 'fixture-trans-1',
      title: 'Coffee at Campus Cafe',
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: 'scenario-test-1',
      timestamp: '2023-04-10T14:15:00Z', // 15 mins apart, same city, same scenario
      tags: ['coffee', 'expense'],
      location: { city: 'Chennai' },
      metadata: { merchant: 'Campus Cafe' },
    },
    {
      id: 'fixture-expense-1',
      title: 'Monthly Spotify Subscription',
      type: 'expense',
      source: 'household',
      provenance: 'source',
      timestamp: '2023-04-10T17:00:00Z', // 3 hours apart, same day, category resonance
      category: 'subscription',
      tags: ['music', 'subscription'],
      metadata: {},
    },
    {
      id: 'fixture-isolated-1',
      title: 'Unrelated Flight',
      type: 'transaction',
      source: 'transactions',
      provenance: 'source',
      timestamp: '2024-08-15T10:00:00Z', // Months away, unrelated
      category: 'travel',
      tags: ['travel'],
      metadata: {},
    },
  ];

  it('1. Produces expected strong cross-domain connection (Music ↔ Transaction)', () => {
    const connections = findConnections(deterministicReceipts);
    expect(connections.length).toBeGreaterThan(0);

    const musicTrans = connections.find(
      (c) =>
        (c.sourceId === 'fixture-music-1' && c.targetId === 'fixture-trans-1') ||
        (c.sourceId === 'fixture-trans-1' && c.targetId === 'fixture-music-1')
    );
    expect(musicTrans).toBeDefined();
    expect(musicTrans?.strength).toBe('strong');
    expect(musicTrans?.explanation).toContain('minutes apart');
  });

  it('2. Produces moderate connection when signals are valid but less concentrated', () => {
    const connections = findConnections(deterministicReceipts);
    const musicExp = connections.find(
      (c) =>
        (c.sourceId === 'fixture-music-1' && c.targetId === 'fixture-expense-1') ||
        (c.sourceId === 'fixture-expense-1' && c.targetId === 'fixture-music-1')
    );
    expect(musicExp).toBeDefined();
    expect(['moderate', 'strong']).toContain(musicExp?.strength);
  });

  it('3. Bidirectional lookup via getConnectionsForReceipt returns connections from both sides', () => {
    const connections = findConnections(deterministicReceipts);

    const fromMusic = getConnectionsForReceipt('fixture-music-1', connections);
    expect(fromMusic.length).toBeGreaterThanOrEqual(1);

    const fromTrans = getConnectionsForReceipt('fixture-trans-1', connections);
    expect(fromTrans.length).toBeGreaterThanOrEqual(1);

    // Both should link to each other
    expect(fromMusic.some((c) => c.sourceId === 'fixture-trans-1' || c.targetId === 'fixture-trans-1')).toBe(true);
    expect(fromTrans.some((c) => c.sourceId === 'fixture-music-1' || c.targetId === 'fixture-music-1')).toBe(true);
  });

  it('4. Unrelated isolated receipts return 0 connections', () => {
    const connections = findConnections(deterministicReceipts);
    const isolated = getConnectionsForReceipt('fixture-isolated-1', connections);
    expect(isolated.length).toBe(0);
  });

  it('5. Synthetic enrichment loads deterministically with correct schemas and provenance', () => {
    const synthetic = loadSyntheticReceipts();
    expect(synthetic.length).toBeGreaterThanOrEqual(250);
    expect(synthetic.length).toBeLessThanOrEqual(450);

    synthetic.forEach((r) => {
      expect(r.provenance).toBe('synthetic');
      expect(r.source).toBe('synthetic');
      expect(r.scenarioId).toBeDefined();
      expect(r.scenarioId).toContain('scenario-');
      expect(r.timestamp).toBeDefined();
      expect(new Date(r.timestamp).getTime()).not.toBeNaN();
    });
  });

  it('6. Real dataset with synthetic enrichment produces rich multi-domain connections', () => {
    const allReceipts = loadAllReceipts();
    const connections = findConnections(allReceipts);

    expect(allReceipts.length).toBeGreaterThan(3400); // 3263 + ~285 synthetic
    expect(connections.length).toBeGreaterThan(2000);

    const receiptMap = new Map(allReceipts.map((r) => [r.id, r]));

    let strongCount = 0;
    let moderateCount = 0;
    let musicExpenseCount = 0;
    let musicTransCount = 0;
    let withinMusicCount = 0;
    let crossDomainCount = 0;

    connections.forEach((c) => {
      if (c.strength === 'strong') strongCount++;
      if (c.strength === 'moderate') moderateCount++;

      const rA = receiptMap.get(c.sourceId);
      const rB = receiptMap.get(c.targetId);
      if (!rA || !rB) return;

      const typeA = rA.type;
      const typeB = rB.type;
      const pair = [typeA, typeB].sort().join('↔');
      if (typeA !== typeB) crossDomainCount++;
      if (pair === 'expense↔music') musicExpenseCount++;
      if (pair === 'music↔transaction') musicTransCount++;
      if (typeA === 'music' && typeB === 'music') withinMusicCount++;
    });

    const domainDist: Record<string, number> = {};
    allReceipts.forEach((r) => {
      domainDist[r.type] = (domainDist[r.type] || 0) + 1;
    });

    console.log('=== MULTI-DOMAIN CONNECTION METRICS ===');
    console.log('Total receipts:', allReceipts.length);
    console.log('Domain distribution:', domainDist);
    console.log('Total connections:', connections.length);
    console.log('Strong connections:', strongCount);
    console.log('Moderate connections:', moderateCount);
    console.log('Cross-domain connections:', crossDomainCount);
    console.log('Music ↔ Expense count:', musicExpenseCount);
    console.log('Music ↔ Transaction count:', musicTransCount);
    console.log('Within Music count:', withinMusicCount);
    console.log('=======================================');

    // Verification of non-zero multi-domain metrics
    expect(strongCount).toBeGreaterThan(0);
    expect(moderateCount).toBeGreaterThan(0);
    expect(musicExpenseCount).toBeGreaterThan(0);
    expect(musicTransCount).toBeGreaterThan(0);
    expect(withinMusicCount).toBeGreaterThan(0);
    expect(crossDomainCount).toBeGreaterThan(100);
  });

  it('7. No duplicate connections or invalid receipt IDs exist in the complete graph', () => {
    const allReceipts = loadAllReceipts();
    const connections = findConnections(allReceipts);
    const receiptIdSet = new Set(allReceipts.map((r) => r.id));
    const seenPairs = new Set<string>();

    let invalidCount = 0;
    let duplicateCount = 0;

    connections.forEach((c) => {
      if (!receiptIdSet.has(c.sourceId) || !receiptIdSet.has(c.targetId)) {
        invalidCount++;
      }
      const pairKey = [c.sourceId, c.targetId].sort().join('--');
      if (seenPairs.has(pairKey)) {
        duplicateCount++;
      }
      seenPairs.add(pairKey);
    });

    expect(invalidCount).toBe(0);
    expect(duplicateCount).toBe(0);
  });

  it('8. Cross-Domain Acceptance Test: Evaluates connections across all 10 domain pairs', () => {
    const baseTime = new Date('2024-05-15T18:00:00Z').getTime();

    // 10 Deterministic domain receipts clustered within 1 hour in Bengaluru
    const crossDomainFixtures: LifeReceipt[] = [
      {
        id: 'cd-music',
        type: 'music',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime).toISOString(),
        title: 'Sunset Lofi Beats',
        tags: ['music', 'lofi'],
        location: { city: 'Bengaluru' },
        metadata: { artist: 'Chillhop' },
      },
      {
        id: 'cd-trans',
        type: 'transaction',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 10 * 60 * 1000).toISOString(),
        title: 'Starbucks Coffee',
        category: 'Dining',
        tags: ['coffee'],
        location: { city: 'Bengaluru' },
        metadata: { merchant: 'Starbucks' },
      },
      {
        id: 'cd-expense',
        type: 'expense',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 15 * 60 * 1000).toISOString(),
        title: 'Evening Snack',
        category: 'Food',
        tags: ['food'],
        metadata: { paymentMode: 'UPI' },
      },
      {
        id: 'cd-place',
        type: 'place',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 20 * 60 * 1000).toISOString(),
        title: 'Forum Mall',
        tags: ['shopping'],
        location: { city: 'Bengaluru', locationName: 'Forum Mall' },
        metadata: { placeName: 'Forum Mall' },
      },
      {
        id: 'cd-movie',
        type: 'movie',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 25 * 60 * 1000).toISOString(),
        title: 'Dune: Part Two',
        category: 'Entertainment',
        tags: ['cinema'],
        location: { city: 'Bengaluru' },
        metadata: { movie: 'Dune: Part Two' },
      },
      {
        id: 'cd-search',
        type: 'search',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 30 * 60 * 1000).toISOString(),
        title: 'Best dinner near Forum Mall',
        tags: ['search'],
        metadata: { searchQuery: 'Best dinner near Forum Mall' },
      },
      {
        id: 'cd-photo',
        type: 'photo',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 35 * 60 * 1000).toISOString(),
        title: 'Mall fountain photo',
        tags: ['photo'],
        location: { city: 'Bengaluru', locationName: 'Forum Mall' },
        metadata: { photoCaption: 'Mall fountain photo' },
      },
      {
        id: 'cd-event',
        type: 'event',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 40 * 60 * 1000).toISOString(),
        title: 'Tech Meetup Bengaluru',
        category: 'Event',
        tags: ['tech', 'meetup'],
        location: { city: 'Bengaluru', locationName: 'Forum Mall' },
        metadata: {},
      },
      {
        id: 'cd-message',
        type: 'message',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 45 * 60 * 1000).toISOString(),
        title: 'Arrived at the meetup',
        tags: ['message'],
        metadata: { messageText: 'Arrived at the meetup' },
      },
      {
        id: 'cd-note',
        type: 'note',
        source: 'user',
        provenance: 'user-created',
        timestamp: new Date(baseTime + 50 * 60 * 1000).toISOString(),
        title: 'Notes on AI presentation',
        tags: ['note'],
        metadata: { notes: 'Great discussion on agentic systems' },
      },
    ];

    const connections = findConnections(crossDomainFixtures);
    expect(connections.length).toBeGreaterThan(0);

    const strongConns = connections.filter((c) => c.strength === 'strong');
    const moderateConns = connections.filter((c) => c.strength === 'moderate');

    expect(strongConns.length).toBeGreaterThan(0);
    expect(moderateConns.length).toBeGreaterThan(0);

    // Verify key pairs fired
    const pairKeys = new Set(
      connections.map((c) => {
        const rA = crossDomainFixtures.find((r) => r.id === c.sourceId);
        const rB = crossDomainFixtures.find((r) => r.id === c.targetId);
        return [rA?.type, rB?.type].sort().join('↔');
      })
    );

    expect(pairKeys.has('music↔transaction')).toBe(true);
    expect(pairKeys.has('movie↔place') || pairKeys.has('movie↔transaction')).toBe(true);
    expect(pairKeys.has('photo↔place')).toBe(true);
    expect(pairKeys.has('event↔message') || pairKeys.has('event↔place')).toBe(true);
  });
});
