import { LifeReceipt, Connection, Chapter } from '@/types';

export function buildChapters(receipts: LifeReceipt[], connections: Connection[]): Chapter[] {
  if (!receipts.length) return [];
  
  const sorted = [...receipts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
  const windows: { start: number; end: number; receipts: LifeReceipt[] }[] = [];
  
  let currentStart = new Date(sorted[0].timestamp).getTime();
  let currentReceipts: LifeReceipt[] = [];
  
  for (const r of sorted) {
    const t = new Date(r.timestamp).getTime();
    if (t - currentStart > WINDOW_MS) {
      if (currentReceipts.length > 0) {
        windows.push({ start: currentStart, end: currentStart + WINDOW_MS, receipts: currentReceipts });
      }
      currentStart = t;
      currentReceipts = [r];
    } else {
      currentReceipts.push(r);
    }
  }
  if (currentReceipts.length > 0) {
    windows.push({ start: currentStart, end: currentStart + WINDOW_MS, receipts: currentReceipts });
  }
  
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | null = null;
  
  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    const isDense = w.receipts.length > 10;
    
    if (isDense) {
      if (!currentChapter) {
        currentChapter = initChapter(w);
      } else {
        currentChapter.receipts.push(...w.receipts);
        currentChapter.dateRange[1] = new Date(w.end).toISOString();
      }
    } else {
      if (currentChapter) {
        chapters.push(finalizeChapter(currentChapter, connections));
        currentChapter = null;
      }
      chapters.push(finalizeChapter(initChapter(w), connections));
    }
  }
  if (currentChapter) {
    chapters.push(finalizeChapter(currentChapter, connections));
  }
  
  return chapters.sort((a, b) => new Date(a.dateRange[0]).getTime() - new Date(b.dateRange[0]).getTime());
}

function initChapter(w: { start: number; end: number; receipts: LifeReceipt[] }): Chapter {
  return {
    id: `chapter-${w.start}`,
    title: '',
    subtitle: '',
    dateRange: [new Date(w.start).toISOString(), new Date(w.end).toISOString()],
    receipts: [...w.receipts],
    connections: [],
    dominantType: 'note',
    dominantSource: 'synthetic',
    narrative: '',
    stats: { totalReceipts: 0 }
  };
}

function finalizeChapter(ch: Chapter, allConnections: Connection[]): Chapter {
  const typeCount: Record<string, number> = {};
  const sourceCount: Record<string, number> = {};
  const catCount: Record<string, number> = {};
  
  for (const r of ch.receipts) {
    typeCount[r.type] = (typeCount[r.type] || 0) + 1;
    sourceCount[r.source] = (sourceCount[r.source] || 0) + 1;
    if (r.category) {
      catCount[r.category] = (catCount[r.category] || 0) + 1;
    }
  }
  
  const domType = Object.keys(typeCount).sort((a, b) => typeCount[b] - typeCount[a])[0] || 'note';
  const domSource = Object.keys(sourceCount).sort((a, b) => sourceCount[b] - sourceCount[a])[0] || 'synthetic';
  const domCat = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || undefined;
  
  ch.dominantType = domType as any;
  ch.dominantSource = domSource as any;
  ch.dominantCategory = domCat;
  ch.stats.totalReceipts = ch.receipts.length;
  
  const year = new Date(ch.dateRange[0]).getFullYear();
  
  if (domType === 'music' && ch.receipts.some(r => r.type === 'music' && new Date(r.timestamp).getHours() >= 22)) {
    ch.title = "The Late-Night Sessions";
  } else if (domSource === 'spotify' && sourceCount['household'] > 0) {
    ch.title = "The Convergence";
  } else if (domCat === 'subscription' || domCat === 'expense.subscription') {
    ch.title = "The Subscription Life";
  } else if (domCat === 'travel' || domCat === 'transaction.travel') {
    ch.title = "The Travel Burst";
  } else if (domType === 'entertainment') {
    ch.title = "The Entertainment Loop";
  } else if (domCat === 'health' || domCat === 'fitness' || domCat === 'expense.health' || domCat === 'transaction.fitness') {
    ch.title = "The Health Phase";
  } else if (ch.receipts.length < 5) {
    ch.title = "The Quiet Period";
  } else {
    ch.title = `A Period of Activity ${year}`;
  }
  
  ch.subtitle = `${ch.receipts.length} moments recorded.`;
  ch.narrative = `During this phase, data reflects a focus on ${domType} activities.`;
  
  const ids = new Set(ch.receipts.map(r => r.id));
  ch.connections = allConnections.filter(c => ids.has(c.sourceId) && ids.has(c.targetId));
  
  return ch;
}
