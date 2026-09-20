import { LifeReceipt, Connection, ConnectionSignal } from '@/types';
import { scoreToStrength, getTimeBucket, DAY_NAMES } from '@/lib/utils';

let cachedConnections: Connection[] | null = null;

export function findConnections(receipts: LifeReceipt[], maxConnections = 300): Connection[] {
  if (cachedConnections) return cachedConnections;
  if (!receipts || receipts.length === 0) return [];

  // Sort and pre-compute timestamps and time properties in a single O(N) pass
  const prepared = receipts
    .map(r => {
      const d = new Date(r.timestamp);
      const time = d.getTime();
      const hour = d.getHours();
      const bucket = getTimeBucket(hour);
      const day = d.getDay();
      const category = r.type === 'music' ? 'music' : (r.category || r.type).toLowerCase();
      return { r, time, hour, bucket, day, category };
    })
    .sort((a, b) => a.time - b.time);

  const connections: Connection[] = [];

  for (let i = 0; i < prepared.length; i++) {
    const a = prepared[i];
    const limit = Math.min(i + 31, prepared.length);

    for (let j = i + 1; j < limit; j++) {
      const b = prepared[j];
      const diffHours = (b.time - a.time) / (1000 * 60 * 60);

      if (diffHours > 24) break; // Because it's sorted, subsequent items are even farther

      const signals: (ConnectionSignal & { score: number })[] = [];

      // 1. TEMPORAL PROXIMITY
      const tempScore = Math.max(0, 1 - diffHours / 24);
      if (tempScore > 0) {
        signals.push({
          type: 'temporal_proximity',
          weight: 1,
          label: diffHours <= 1 
            ? `${Math.max(1, Math.round(diffHours * 60))}m apart`
            : `${Math.round(diffHours)}h apart`,
          score: tempScore,
        });
      }

      // 2. CATEGORY RESONANCE
      let catScore = 0;
      const catA = a.category;
      const catB = b.category;

      if ((catA === 'music' && catB.includes('subscription')) || (catB === 'music' && catA.includes('subscription'))) catScore = 0.85;
      else if ((catA === 'music' && catB.includes('entertainment')) || (catB === 'music' && catA.includes('entertainment'))) catScore = 0.85;
      else if ((catA.includes('food') && catB.includes('grocery')) || (catB.includes('food') && catA.includes('grocery'))) catScore = 0.8;
      else if ((catA.includes('transport') && catB.includes('travel')) || (catB.includes('transport') && catA.includes('travel'))) catScore = 0.75;
      else if ((catA.includes('health') && catB.includes('fitness')) || (catB.includes('health') && catA.includes('fitness'))) catScore = 0.9;
      else if (catA.includes('entertainment') && catB.includes('entertainment')) catScore = 0.9;

      if (catScore > 0) {
        signals.push({
          type: 'category_resonance',
          weight: 1,
          label: 'Shared domain resonance',
          score: catScore,
        });
      }

      // 3. TIME OF DAY
      let timeScore = 0;
      if (a.bucket === b.bucket) {
        timeScore = 0.6;
        if (Math.abs(a.hour - b.hour) <= 2) timeScore = 0.9;
      }
      if (timeScore > 0) {
        signals.push({
          type: 'time_of_day',
          weight: 1,
          label: `Both in ${a.bucket}`,
          score: timeScore,
        });
      }

      // 4. WEEKLY RHYTHM
      let weeklyScore = 0;
      if (a.day === b.day && Math.abs(b.time - a.time) <= 14 * 24 * 60 * 60 * 1000) {
        weeklyScore = 0.5;
      }
      if (weeklyScore > 0) {
        signals.push({
          type: 'weekly_rhythm',
          weight: 1,
          label: `Weekly rhythm on ${DAY_NAMES[a.day]}`,
          score: weeklyScore,
        });
      }

      const scoreSum = signals.reduce((sum, s) => sum + s.weight * s.score, 0);
      const hasStrongTemporal = diffHours <= 1;
      const hasStrongCategory = catScore >= 0.8;
      const weakSignalsCount = signals.filter(s => s.type !== 'temporal_proximity' || diffHours <= 6).length;

      if (hasStrongTemporal || hasStrongCategory || weakSignalsCount >= 2) {
        let explanation = 'These moments occurred close in time.';
        if (hasStrongTemporal) {
          explanation = `These moments occurred ${Math.max(1, Math.round(diffHours * 60))} minutes apart on the same ${a.bucket}.`;
        } else if (hasStrongCategory) {
          explanation = `Both belong to related categories and occurred within ${Math.max(1, Math.round(diffHours))} hours.`;
        } else if (weeklyScore > 0) {
          explanation = `This pattern recurs every ${DAY_NAMES[a.day]} ${a.bucket}.`;
        }

        connections.push({
          id: `${a.r.id}-${b.r.id}`,
          sourceId: a.r.id,
          targetId: b.r.id,
          score: Math.min(1, scoreSum),
          signals: signals.map(s => ({ type: s.type, weight: s.weight, label: s.label })),
          explanation,
          strength: scoreToStrength(Math.min(1, scoreSum)),
        });
      }
    }
  }

  connections.sort((a, b) => b.score - a.score);
  cachedConnections = connections.slice(0, maxConnections);
  return cachedConnections;
}

export function getConnectionsForReceipt(receiptId: string, allConnections: Connection[]): Connection[] {
  return allConnections.filter(c => c.sourceId === receiptId || c.targetId === receiptId);
}
