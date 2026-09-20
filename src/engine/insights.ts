import { LifeReceipt, Connection, Pattern, Chapter, SpotifyStats, HouseholdStats, TransactionStats, LifeInsights } from '@/types';

export function computeInsights(
  receipts: LifeReceipt[],
  connections: Connection[],
  patterns: Pattern[],
  chapters: Chapter[],
  spotifyStats: SpotifyStats | null,
  householdStats: HouseholdStats | null,
  transactionStats: TransactionStats | null
): LifeInsights {
  const sorted = [...receipts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  const dateRange: [string, string] = sorted.length > 0 
    ? [sorted[0].timestamp, sorted[sorted.length - 1].timestamp] 
    : [new Date().toISOString(), new Date().toISOString()];
    
  let spotifyTotal = 0;
  let householdTotal = 0;
  let transactionTotal = 0;
  
  const catCount: Record<string, number> = {};
  
  for (const r of receipts) {
    if (r.source === 'spotify') spotifyTotal++;
    if (r.source === 'household') householdTotal++;
    if (r.source === 'transactions') transactionTotal++;
    if (r.category) {
      catCount[r.category] = (catCount[r.category] || 0) + 1;
    }
  }
  
  let totalSpent = 0;
  if (householdStats) totalSpent += householdStats.totalSpent || 0;
  if (transactionStats) totalSpent += transactionStats.totalSpent || 0;
  
  let totalListeningHours = 0;
  let topArtist = 'Unknown';
  let topArtistCount = 0;
  if (spotifyStats) {
    totalListeningHours = (spotifyStats.totalListeningMs || 0) / (1000 * 60 * 60);
    if (spotifyStats.topArtists && spotifyStats.topArtists.length > 0) {
      topArtist = spotifyStats.topArtists[0].name;
      topArtistCount = spotifyStats.topArtists[0].count;
    }
  }
  
  const topCategory = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || 'Unknown';
  
  let peakActivityHour = 0;
  if (spotifyStats?.hourDistribution) {
      const maxVal = Math.max(...spotifyStats.hourDistribution);
      peakActivityHour = spotifyStats.hourDistribution.indexOf(maxVal);
  }
  
  return {
    totalRecords: receipts.length,
    spotifyTotal,
    householdTotal,
    transactionTotal,
    dateRange,
    totalSpent,
    totalListeningHours,
    topArtist,
    topArtistCount,
    topCategory,
    connectionCount: connections.length,
    patternCount: patterns.length,
    chapterCount: chapters.length,
    peakActivityHour,
    peakActivityDay: 0 // Simplification
  };
}
