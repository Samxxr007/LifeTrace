import { LifeReceipt, Connection, ConnectionSignal, ConnectionStrength } from '@/types';
import { getTimeBucket, DAY_NAMES } from '@/lib/utils';

/**
 * Multi-Domain Connection Discovery Engine
 *
 * Evaluates multi-signal evidence across all 10 life receipt domains:
 * 1. Temporal Proximity (diffHours <= 1, <= 6, <= 24)
 * 2. Location Coherence (same city, same place)
 * 3. Domain & Category Resonance (Music ↔ Transaction, Movie ↔ Place, etc.)
 * 4. Shared Semantic Tags (coffee, cinema, travel, etc.)
 * 5. Time of Day (same 2h window, same 4h bucket)
 * 6. Weekly Rhythm (same day of week within +-14 days)
 * 7. Scenario Context (shared deterministic scenarioId)
 *
 * Strength Classification:
 * - STRONG: 3+ meaningful independent signals, or very close temporal (<=30m) + domain/city resonance
 * - MODERATE: 2 meaningful independent signals
 * - WEAK: <2 signals (filtered out to preserve high-confidence discovery)
 *
 * Complexity: O(N log N) sort + O(N · K) sliding window with K <= 30.
 * Pre-computes numeric timestamps and builds a bidirectional O(1) Map index.
 */

let lastReceiptsRef: LifeReceipt[] | null = null;
let cachedAllConnections: Connection[] | null = null;
let cachedConnectionIndex: Map<string, Connection[]> | null = null;

function buildIndex(connections: Connection[]): Map<string, Connection[]> {
  const index = new Map<string, Connection[]>();
  for (const conn of connections) {
    if (!index.has(conn.sourceId)) index.set(conn.sourceId, []);
    index.get(conn.sourceId)!.push(conn);

    if (!index.has(conn.targetId)) index.set(conn.targetId, []);
    index.get(conn.targetId)!.push(conn);
  }
  return index;
}

export function findConnections(receipts: LifeReceipt[], maxConnections?: number): Connection[] {
  if (!receipts || receipts.length === 0) return [];

  // Invalidate cache if receipts array reference changed
  if (receipts !== lastReceiptsRef) {
    cachedAllConnections = null;
    cachedConnectionIndex = null;
    lastReceiptsRef = receipts;
  }

  if (cachedAllConnections) {
    if (maxConnections && maxConnections < cachedAllConnections.length) {
      return cachedAllConnections.slice(0, maxConnections);
    }
    return cachedAllConnections;
  }

  // Pre-index records in a single O(N) pass
  const prepared = receipts
    .map((r) => {
      const d = new Date(r.timestamp);
      const time = d.getTime();
      const hour = d.getHours();
      const bucket = getTimeBucket(hour);
      const day = d.getDay();
      const category = (r.category || r.type || '').toLowerCase();
      const type = r.type;
      const city = r.location?.city || '';
      const placeName = r.location?.locationName || (r.metadata?.placeName as string) || '';
      const tags = new Set((r.tags || []).map((t) => t.toLowerCase()));
      const scenarioId = r.scenarioId || '';
      return { r, time, hour, bucket, day, type, category, city, placeName, tags, scenarioId };
    })
    .sort((a, b) => a.time - b.time);

  const connections: Connection[] = [];

  for (let i = 0; i < prepared.length; i++) {
    const a = prepared[i];
    const limit = Math.min(i + 31, prepared.length);

    for (let j = i + 1; j < limit; j++) {
      const b = prepared[j];
      const diffHours = (b.time - a.time) / (1000 * 60 * 60);

      // Chronologically sorted: subsequent items will be even farther
      if (diffHours > 24) break;

      const signals: (ConnectionSignal & { score: number })[] = [];

      // ─── 1. TEMPORAL PROXIMITY ──────────────────────────────────────────────
      const diffMinutes = Math.max(1, Math.round(diffHours * 60));
      if (diffHours <= 0.5) {
        signals.push({
          type: 'temporal_proximity',
          weight: 1,
          label: `${diffMinutes}m apart`,
          score: 1.0,
        });
      } else if (diffHours <= 1.0) {
        signals.push({
          type: 'temporal_proximity',
          weight: 1,
          label: `${diffMinutes}m apart`,
          score: 0.9,
        });
      } else if (diffHours <= 4.0) {
        signals.push({
          type: 'temporal_proximity',
          weight: 1,
          label: `${Math.round(diffHours)}h apart`,
          score: 0.75,
        });
      } else if (diffHours <= 12.0) {
        signals.push({
          type: 'temporal_proximity',
          weight: 1,
          label: `${Math.round(diffHours)}h apart`,
          score: 0.5,
        });
      }

      // ─── 2. LOCATION / CITY COHERENCE ─────────────────────────────────────────
      if (a.city && b.city && a.city.toLowerCase() === b.city.toLowerCase()) {
        signals.push({
          type: 'same_city',
          weight: 1,
          label: `Both in ${a.city}`,
          score: 0.85,
        });
      }
      if (a.placeName && b.placeName && a.placeName === b.placeName) {
        signals.push({
          type: 'same_place',
          weight: 1,
          label: `Both at ${a.placeName}`,
          score: 0.95,
        });
      }

      // ─── 3. DOMAIN & CATEGORY RESONANCE ──────────────────────────────────────
      let catScore = 0;
      let resonanceLabel = 'Shared domain resonance';

      const pairKey = [a.type, b.type].sort().join('↔');

      // Cross-domain pairs
      if (pairKey === 'music↔transaction') {
        catScore = 0.85;
        resonanceLabel = 'Music soundtrack during commerce';
      } else if (pairKey === 'expense↔music') {
        catScore = 0.85;
        resonanceLabel = 'Music alongside daily expenses';
      } else if (pairKey === 'music↔place') {
        catScore = 0.8;
        resonanceLabel = 'Listening session at place';
      } else if (pairKey === 'movie↔transaction' || (a.category.includes('movie') && b.type === 'transaction') || (b.category.includes('movie') && a.type === 'transaction')) {
        catScore = 0.9;
        resonanceLabel = 'Cinema admission & dining';
      } else if (pairKey === 'movie↔place' || (a.category.includes('movie') && b.type === 'place') || (b.category.includes('movie') && a.type === 'place')) {
        catScore = 0.9;
        resonanceLabel = 'Cinema theater visit';
      } else if (pairKey === 'movie↔music') {
        catScore = 0.85;
        resonanceLabel = 'Film score & soundtrack';
      } else if (pairKey === 'place↔search') {
        catScore = 0.85;
        resonanceLabel = 'Location search followed by visit';
      } else if (pairKey === 'search↔transaction') {
        catScore = 0.85;
        resonanceLabel = 'Product/food search then purchase';
      } else if (pairKey === 'photo↔place') {
        catScore = 0.9;
        resonanceLabel = 'Photo recorded at location';
      } else if (pairKey === 'photo↔transaction') {
        catScore = 0.85;
        resonanceLabel = 'Photo accompanying purchase';
      } else if (pairKey === 'event↔message') {
        catScore = 0.85;
        resonanceLabel = 'Communication coordinating event';
      } else if (pairKey === 'message↔place') {
        catScore = 0.85;
        resonanceLabel = 'Message sent from location';
      } else if (pairKey === 'event↔note') {
        catScore = 0.85;
        resonanceLabel = 'Notes on attended event';
      } else if (pairKey === 'event↔place') {
        catScore = 0.9;
        resonanceLabel = 'Event hosted at venue';
      } else if (pairKey === 'event↔transaction') {
        catScore = 0.85;
        resonanceLabel = 'Event participation & food';
      } else if (pairKey === 'event↔music') {
        catScore = 0.85;
        resonanceLabel = 'Event playlist';
      } else if (pairKey === 'expense↔transaction') {
        catScore = 0.8;
        resonanceLabel = 'Parallel financial activity';
      } else {
        // Intra-domain category matching
        const catA = a.category;
        const catB = b.category;
        if (catA && catB) {
          if ((catA.includes('food') && catB.includes('grocery')) || (catB.includes('food') && catA.includes('grocery'))) {
            catScore = 0.8;
            resonanceLabel = 'Food & grocery affinity';
          } else if ((catA.includes('transport') && catB.includes('travel')) || (catB.includes('transport') && catA.includes('travel'))) {
            catScore = 0.8;
            resonanceLabel = 'Travel & transit correlation';
          } else if ((catA.includes('health') && catB.includes('fitness')) || (catB.includes('health') && catA.includes('fitness'))) {
            catScore = 0.9;
            resonanceLabel = 'Health & fitness continuity';
          } else if (catA === catB && catA.length > 2) {
            catScore = 0.75;
            resonanceLabel = `Both relate to ${catA}`;
          }
        }
      }

      if (catScore > 0) {
        signals.push({
          type: 'category_resonance',
          weight: 1,
          label: resonanceLabel,
          score: catScore,
        });
      }

      // ─── 4. SHARED TAGS ──────────────────────────────────────────────────────
      const commonTags: string[] = [];
      a.tags.forEach((t) => {
        if (b.tags.has(t)) commonTags.push(t);
      });
      if (commonTags.length > 0) {
        signals.push({
          type: 'shared_tags',
          weight: 1,
          label: `Shared tags: ${commonTags.slice(0, 2).join(', ')}`,
          score: 0.75,
        });
      }

      // ─── 5. TIME OF DAY ──────────────────────────────────────────────────────
      let timeScore = 0;
      if (Math.abs(a.hour - b.hour) <= 2) {
        timeScore = 0.85;
        signals.push({
          type: 'time_of_day',
          weight: 1,
          label: `Both around ${a.hour}:00`,
          score: timeScore,
        });
      } else if (a.bucket === b.bucket) {
        timeScore = 0.6;
        signals.push({
          type: 'time_of_day',
          weight: 1,
          label: `Both in ${a.bucket}`,
          score: timeScore,
        });
      }

      // ─── 6. WEEKLY RHYTHM ────────────────────────────────────────────────────
      if (a.day === b.day && Math.abs(b.time - a.time) <= 14 * 24 * 60 * 60 * 1000 && diffHours > 4) {
        signals.push({
          type: 'weekly_rhythm',
          weight: 1,
          label: `Weekly rhythm on ${DAY_NAMES[a.day]}`,
          score: 0.5,
        });
      }

      // ─── 7. SCENARIO CONTEXT ─────────────────────────────────────────────────
      if (a.scenarioId && b.scenarioId && a.scenarioId === b.scenarioId) {
        signals.push({
          type: 'scenario_context',
          weight: 1,
          label: 'Coherent life scenario',
          score: 0.9,
        });
      }

      // ─── ACCEPTANCE & STRENGTH CLASSIFICATION ─────────────────────────────────
      // Require at least 2 independent signals
      if (signals.length >= 2) {
        let strength: ConnectionStrength = 'moderate';

        const isVeryCloseTemporal = diffHours <= 0.75;
        const hasStrongCategory = catScore >= 0.8;
        const hasLocationMatch = Boolean(a.city && b.city && a.city.toLowerCase() === b.city.toLowerCase());

        if (signals.length >= 3 || (isVeryCloseTemporal && (hasStrongCategory || hasLocationMatch))) {
          strength = 'strong';
        } else {
          strength = 'moderate';
        }

        // Build human-readable factual explanation
        let explanation = 'These moments occurred close in time.';
        if (diffHours <= 1) {
          explanation = `These moments occurred ${diffMinutes} minutes apart on the same ${a.bucket}.`;
        } else if (catScore >= 0.8) {
          explanation = `${resonanceLabel} within ${Math.round(diffHours)} hours.`;
        } else if (signals.some((s) => s.type === 'same_city')) {
          explanation = `Both moments occurred in ${a.city} within ${Math.round(diffHours)} hours.`;
        } else if (signals.some((s) => s.type === 'weekly_rhythm')) {
          explanation = `This pattern recurs on ${DAY_NAMES[a.day]} ${a.bucket}.`;
        }

        const scoreSum = signals.reduce((sum, s) => sum + s.weight * s.score, 0);

        connections.push({
          id: `${a.r.id}-${b.r.id}`,
          sourceId: a.r.id,
          targetId: b.r.id,
          score: Math.min(1, scoreSum / Math.max(1, signals.length)),
          signals: signals.map((s) => ({ type: s.type, weight: s.weight, label: s.label })),
          explanation,
          strength,
        });
      }
    }
  }

  // Prioritize diverse cross-domain connections and strong confidence
  connections.sort((a, b) => {
    if (a.strength === 'strong' && b.strength !== 'strong') return -1;
    if (b.strength === 'strong' && a.strength !== 'strong') return 1;
    return b.score - a.score;
  });

  cachedAllConnections = connections;
  cachedConnectionIndex = buildIndex(connections);

  if (maxConnections && maxConnections < connections.length) {
    return connections.slice(0, maxConnections);
  }

  return cachedAllConnections;
}

export function getConnectionIndex(receipts?: LifeReceipt[]): Map<string, Connection[]> {
  if (receipts && receipts !== lastReceiptsRef) {
    findConnections(receipts);
  }
  return cachedConnectionIndex || new Map();
}

export function getConnectionsForReceipt(receiptId: string, allConnections?: Connection[]): Connection[] {
  // 1. Fast O(1) index lookup if index is populated
  if (cachedConnectionIndex && cachedConnectionIndex.has(receiptId)) {
    return cachedConnectionIndex.get(receiptId)!;
  }

  // 2. Direct filter if explicit connection list provided
  if (allConnections && allConnections.length > 0) {
    return allConnections.filter((c) => c.sourceId === receiptId || c.targetId === receiptId);
  }

  return [];
}
