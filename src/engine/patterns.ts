import { LifeReceipt, Pattern, SpotifyStats, HouseholdStats } from '@/types';
import { getHour, getDayOfWeek } from '@/lib/utils';

export function detectPatterns(receipts: LifeReceipt[], spotifyStats: SpotifyStats | null, householdStats: HouseholdStats | null): Pattern[] {
  const patterns: Pattern[] = [];
  if (!receipts.length) return patterns;
  
  // 1. Peak Listening Hours
  if (spotifyStats && spotifyStats.hourDistribution && spotifyStats.hourDistribution.length > 0) {
    const hours = spotifyStats.hourDistribution;
    const avg = hours.reduce((a, b) => a + b, 0) / hours.length || 1;
    let peakHour = 0;
    let peakVal = 0;
    for (let i = 0; i < hours.length; i++) {
      if (hours[i] > peakVal) {
        peakVal = hours[i];
        peakHour = i;
      }
    }
    if (peakVal > avg * 1.5) {
      const startAmPm = peakHour < 12 ? 'AM' : 'PM';
      const endAmPm = (peakHour + 1) % 24 < 12 ? 'AM' : 'PM';
      const sH = peakHour % 12 || 12;
      const eH = (peakHour + 1) % 12 || 12;
      
      const patternReceipts = receipts.filter(r => r.source === 'spotify' && getHour(r.timestamp) === peakHour);
      
      patterns.push({
        id: 'peak-listening',
        name: 'Peak Listening Hours',
        description: 'Most active music listening time',
        evidence: `${peakVal.toFixed(0)} plays between ${sH} ${startAmPm} and ${eH} ${endAmPm} — ${(peakVal / avg).toFixed(1)}× your average.`,
        frequency: peakVal,
        receipts: patternReceipts.slice(0, 50),
        type: 'hourly'
      });
    }
  }
  
  // 2. Top Artists
  if (spotifyStats && spotifyStats.topArtists && spotifyStats.topArtists.length > 0) {
    for (let i = 0; i < Math.min(5, spotifyStats.topArtists.length); i++) {
      const artist = spotifyStats.topArtists[i];
      if (artist.count > 10) {
        const patternReceipts = receipts.filter(r => r.source === 'spotify' && r.metadata && r.metadata.artist === artist.name);
        patterns.push({
          id: `top-artist-${i}`,
          name: `Top Artist: ${artist.name}`,
          description: 'Frequently played artist',
          evidence: `Appeared ${artist.count} times in your history.`,
          frequency: artist.count,
          receipts: patternReceipts.slice(0, 50),
          type: 'artist'
        });
      }
    }
  }
  
  // 3. Skip Bursts
  const spotifyReceipts = receipts.filter(r => r.source === 'spotify');
  let skipCount = 0;
  let totalSpotify = 0;
  for (const r of spotifyReceipts) {
    totalSpotify++;
    if (r.metadata && r.metadata.skipped) skipCount++;
  }
  if (totalSpotify > 0 && (skipCount / totalSpotify) > 0.5) {
    const patternReceipts = spotifyReceipts.filter(r => r.metadata && r.metadata.skipped);
    patterns.push({
      id: 'skip-bursts',
      name: 'High Skip Rate',
      description: 'Period with frequent skipping',
      evidence: `${skipCount} skips detected, over 50% of plays.`,
      frequency: skipCount,
      receipts: patternReceipts.slice(0, 50),
      type: 'category'
    });
  }
  
  // 4. Subscription Life
  const subs = receipts.filter(r => r.source === 'household' && r.subcategory && ['Netflix', 'Tata Sky', 'Mobile', 'HBR', 'Subscription'].some(s => r.subcategory?.includes(s) || r.title.includes(s)));
  const subMonths = new Set(subs.map(r => r.timestamp.substring(0, 7)));
  if (subMonths.size >= 2) {
    patterns.push({
      id: 'subscription-life',
      name: 'Active Subscriptions',
      description: 'Recurring monthly payments',
      evidence: `Paid ${subMonths.size} consecutive months.`,
      frequency: subMonths.size,
      receipts: subs.slice(0, 50),
      type: 'subscription'
    });
  }
  
  // 5. Spending Spikes
  if (householdStats && householdStats.monthlySpending) {
    const months = Object.keys(householdStats.monthlySpending);
    if (months.length > 0) {
      const avgSpend = months.reduce((a, k) => a + householdStats.monthlySpending[k], 0) / months.length;
      for (const m of months) {
        if (householdStats.monthlySpending[m] >= avgSpend * 1.5 && avgSpend > 0) {
          const mReceipts = receipts.filter(r => r.source === 'household' && r.timestamp.startsWith(m));
          patterns.push({
            id: `spending-spike-${m}`,
            name: `Spending Spike: ${m}`,
            description: 'Unusually high expenses',
            evidence: `Month had ₹${householdStats.monthlySpending[m].toFixed(0)} — ${(householdStats.monthlySpending[m] / avgSpend).toFixed(1)}× monthly average.`,
            frequency: 1,
            receipts: mReceipts.slice(0, 50),
            type: 'spending'
          });
        }
      }
    }
  }
  
  return patterns;
}

export function getPatternReceipts(pattern: Pattern, receipts: LifeReceipt[]): LifeReceipt[] {
  return pattern.receipts;
}
