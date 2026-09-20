import { LifeReceipt, Connection, ConnectionSignal } from '@/types';
import { scoreToStrength, getHour, getTimeBucket, getDayOfWeek, DAY_NAMES } from '@/lib/utils';

let cachedConnections: Connection[] | null = null;

export function findConnections(receipts: LifeReceipt[], maxConnections = 300): Connection[] {
  if (cachedConnections) return cachedConnections;

  const sorted = [...receipts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const connections: Connection[] = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    const timeA = new Date(a.timestamp).getTime();
    const hourA = getHour(a.timestamp);
    const bucketA = getTimeBucket(hourA);
    const dayA = getDayOfWeek(a.timestamp);
    
    for (let j = i + 1; j < Math.min(i + 31, sorted.length); j++) {
      const b = sorted[j];
      const timeB = new Date(b.timestamp).getTime();
      const diffHours = (timeB - timeA) / (1000 * 60 * 60);
      
      if (diffHours > 24) continue;
      
      const signals: (ConnectionSignal & { score: number })[] = [];
      
      // TEMPORAL_PROXIMITY
      const tempScore = Math.max(0, 1 - diffHours / 24);
      if (tempScore > 0) {
        signals.push({
          type: 'temporal_proximity',
          weight: 1,
          label: 'temporal_proximity',
          score: tempScore
        });
      }
      
      // CATEGORY_RESONANCE
      let catScore = 0;
      const typeACat = a.type === 'music' ? 'music' : a.category || a.type;
      const typeBCat = b.type === 'music' ? 'music' : b.category || b.type;
      
      if ((typeACat === 'music' && typeBCat === 'subscription') || (typeBCat === 'music' && typeACat === 'subscription')) catScore = 0.85;
      else if ((typeACat === 'music' && typeBCat === 'entertainment') || (typeBCat === 'music' && typeACat === 'entertainment')) catScore = 0.85;
      else if ((typeACat === 'food' && typeBCat === 'grocery') || (typeBCat === 'food' && typeACat === 'grocery')) catScore = 0.8;
      else if ((typeACat === 'transportation' && typeBCat === 'travel') || (typeBCat === 'transportation' && typeACat === 'travel')) catScore = 0.75;
      else if ((typeACat === 'health' && typeBCat === 'fitness') || (typeBCat === 'health' && typeACat === 'fitness')) catScore = 0.9;
      else if ((typeACat === 'entertainment' && typeBCat === 'entertainment')) catScore = 0.9;

      if (catScore > 0) {
        signals.push({
          type: 'category_resonance',
          weight: 1,
          label: 'category_resonance',
          score: catScore
        });
      }
      
      // TIME_OF_DAY
      const hourB = getHour(b.timestamp);
      const bucketB = getTimeBucket(hourB);
      let timeScore = 0;
      if (bucketA === bucketB) {
        timeScore = 0.6;
        if (Math.abs(hourA - hourB) <= 2) timeScore = 0.9;
      }
      if (timeScore > 0) {
        signals.push({
          type: 'time_of_day',
          weight: 1,
          label: 'time_of_day',
          score: timeScore
        });
      }
      
      // WEEKLY_RHYTHM
      const dayB = getDayOfWeek(b.timestamp);
      let weeklyScore = 0;
      if (dayA === dayB && Math.abs(timeA - timeB) <= 14 * 24 * 60 * 60 * 1000) {
        weeklyScore = 0.5;
      }
      if (weeklyScore > 0) {
        signals.push({
          type: 'weekly_rhythm',
          weight: 1,
          label: 'weekly_rhythm',
          score: weeklyScore
        });
      }
      
      const scoreSum = signals.reduce((sum, s) => sum + (s.weight * s.score), 0);
      
      const hasStrongTemporal = diffHours <= 1;
      const hasStrongCategory = catScore >= 0.8;
      const weakSignalsCount = signals.filter(s => s.type !== 'temporal_proximity' || diffHours <= 6).length;
      
      if (hasStrongTemporal || hasStrongCategory || weakSignalsCount >= 2) {
        let explanation = "These moments occurred close in time.";
        if (hasStrongTemporal) explanation = `These moments occurred ${Math.max(1, Math.round(diffHours * 60))} minutes apart on the same ${bucketA}.`;
        else if (hasStrongCategory) explanation = `Both belong to related categories and occurred within ${Math.max(1, Math.round(diffHours))} hours.`;
        else if (weeklyScore > 0) explanation = `This pattern recurs every ${DAY_NAMES[dayA]} ${bucketA}.`;

        connections.push({
          id: `${a.id}-${b.id}`,
          sourceId: a.id,
          targetId: b.id,
          score: Math.min(1, scoreSum),
          signals: signals.map(s => ({ type: s.type, weight: s.weight, label: s.label })),
          explanation,
          strength: scoreToStrength(Math.min(1, scoreSum))
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
