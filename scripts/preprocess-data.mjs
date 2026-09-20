/**
 * LifeTrace — Build-time Data Preprocessing Script
 * Converts raw datasets into clean, sanitized JSON files for the frontend.
 * Run: node scripts/preprocess-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const RAW_DIR = path.join(ROOT, '..'); // D:\FrontEndArena

// Ensure output directories exist
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, 'synthetic'), { recursive: true });

// ─── Utility ──────────────────────────────────────────────────────────────────

function parseDate(raw) {
  if (!raw) return null;
  const cleaned = raw.trim();
  // Try ISO: "2013-07-08 02:44:34"
  let d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;
  // Try DD/MM/YYYY HH:mm:ss or D/M/YYYY
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    const [, day, month, year, h = '0', m = '0', s = '0'] = match;
    d = new Date(+year, +month - 1, +day, +h, +m, +s);
    if (!isNaN(d.getTime())) return d;
  }
  // Try M/D/YYYY H:mm (financial dataset)
  const match2 = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (match2) {
    const [, month, day, year, h, m] = match2;
    d = new Date(+year, +month - 1, +day, +h, +m);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function sanitizeMerchant(merchant) {
  if (!merchant) return null;
  return merchant.replace(/^fraud_/i, '').trim();
}

function formatCategory(cat) {
  if (!cat) return null;
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  
  // Parse header (handle quoted fields)
  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length === 0 || cols.every(c => !c)) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

// ─── Spotify Processing ────────────────────────────────────────────────────────

function processSpotify() {
  console.log('📡 Processing Spotify history...');
  const csvPath = path.join(RAW_DIR, 'spotify_history.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('⚠️  spotify_history.csv not found, skipping');
    return [];
  }

  const text = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(text);
  console.log(`   Raw records: ${rows.length}`);

  // Parse and validate all records
  const parsed = [];
  for (const row of rows) {
    const ts = parseDate(row['ts']);
    if (!ts) continue;
    const msPlayed = parseInt(row['ms_played']) || 0;
    // Skip if played less than 5 seconds (noise)
    if (msPlayed < 5000) continue;

    parsed.push({
      ts,
      track_name: row['track_name']?.trim() || null,
      artist_name: row['artist_name']?.trim() || null,
      album_name: row['album_name']?.trim() || null,
      platform: row['platform']?.trim() || null,
      ms_played: msPlayed,
      skipped: row['skipped']?.trim()?.toUpperCase() === 'TRUE',
      shuffle: row['shuffle']?.trim()?.toUpperCase() === 'TRUE',
      year: ts.getFullYear(),
      month: ts.getMonth(),
    });
  }
  console.log(`   Valid records: ${parsed.length}`);

  // Stratified sample: ~8000 records across all year-months
  const buckets = {};
  for (const r of parsed) {
    const key = `${r.year}-${r.month}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(r);
  }

  const TARGET = 1500;
  const bucketKeys = Object.keys(buckets);
  const perBucket = Math.max(1, Math.ceil(TARGET / bucketKeys.length));
  
  const sampled = [];
  for (const key of bucketKeys) {
    const bucket = buckets[key];
    // Take evenly spaced samples from bucket
    const step = Math.max(1, Math.floor(bucket.length / perBucket));
    for (let i = 0; i < bucket.length && sampled.length < TARGET; i += step) {
      sampled.push(bucket[i]);
    }
  }

  // Sort by timestamp
  sampled.sort((a, b) => a.ts - b.ts);

  // Build normalized records
  const records = sampled.map((r, i) => ({
    id: `spotify-${i}`,
    type: 'music',
    source: 'spotify',
    timestamp: r.ts.toISOString(),
    title: r.track_name || 'Unknown Track',
    category: 'Music',
    metadata: {
      artist: r.artist_name,
      album: r.album_name,
      platform: r.platform,
      msPlayed: r.ms_played,
      skipped: r.skipped,
      shuffle: r.shuffle,
    },
    tags: [
      'music',
      r.platform || 'unknown',
      r.skipped ? 'skipped' : 'completed',
    ].filter(Boolean),
  }));

  // Also compute aggregated stats for the full 149k dataset
  const allParsed = parsed;
  
  // Artist counts
  const artistCounts = {};
  for (const r of allParsed) {
    if (r.artist_name) artistCounts[r.artist_name] = (artistCounts[r.artist_name] || 0) + 1;
  }
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  // Hour distribution
  const hourCounts = new Array(24).fill(0);
  for (const r of allParsed) {
    hourCounts[r.ts.getHours()]++;
  }

  // Day-of-week + hour heatmap (for activity heatmap)
  const heatmap = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const r of allParsed) {
    heatmap[r.ts.getDay()][r.ts.getHours()]++;
  }

  // Monthly aggregates
  const monthlyAgg = {};
  for (const r of allParsed) {
    const key = `${r.year}-${String(r.month + 1).padStart(2, '0')}`;
    if (!monthlyAgg[key]) monthlyAgg[key] = { count: 0, ms: 0, skips: 0 };
    monthlyAgg[key].count++;
    monthlyAgg[key].ms += r.ms_played;
    if (r.skipped) monthlyAgg[key].skips++;
  }

  // Platform distribution
  const platformCounts = {};
  for (const r of allParsed) {
    if (r.platform) platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
  }

  const stats = {
    totalRecords: allParsed.length,
    totalListeningMs: allParsed.reduce((s, r) => s + r.ms_played, 0),
    skipRate: allParsed.filter(r => r.skipped).length / allParsed.length,
    topArtists,
    hourDistribution: hourCounts,
    heatmap,
    monthlyAggregates: monthlyAgg,
    platformDistribution: platformCounts,
    dateRange: {
      start: allParsed[0]?.ts.toISOString(),
      end: allParsed[allParsed.length - 1]?.ts.toISOString(),
    },
  };

  console.log(`   Sampled: ${records.length} records for visualization`);
  console.log(`   Top artist: ${topArtists[0]?.name} (${topArtists[0]?.count} plays)`);

  return { records, stats };
}

// ─── Household Processing ──────────────────────────────────────────────────────

function processHousehold() {
  console.log('🏠 Processing Household Transactions...');
  const csvPath = path.join(RAW_DIR, 'Daily Household Transactions.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('⚠️  Household CSV not found, skipping');
    return { records: [], stats: {} };
  }

  const text = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(text);
  console.log(`   Raw records: ${rows.length}`);

  const records = [];
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ts = parseDate(row['Date']);
    if (!ts) { skipped++; continue; }

    const amount = parseFloat(row['Amount']);
    const safeAmount = isNaN(amount) ? undefined : Math.abs(amount);
    const expenseType = row['Income/Expense']?.trim() || 'Expense';
    const category = row['Category']?.trim() || 'Other';
    const subcategory = row['Subcategory']?.trim() || null;
    const note = row['Note']?.trim() || null;
    const mode = row['Mode']?.trim() || null;

    const titleParts = [subcategory, category].filter(Boolean);
    const title = titleParts.length > 0 ? titleParts.join(' · ') : 'Expense';

    records.push({
      id: `household-${i}`,
      type: 'expense',
      source: 'household',
      timestamp: ts.toISOString(),
      title,
      description: note,
      category,
      subcategory,
      amount: safeAmount,
      currency: 'INR',
      expenseType,
      metadata: {
        paymentMode: mode,
        note,
      },
      tags: [
        'expense',
        category.toLowerCase().replace(/\s+/g, '_'),
        mode ? mode.toLowerCase().replace(/\s+/g, '_') : null,
        expenseType.toLowerCase().replace(/[\-\/]/g, '_'),
      ].filter(Boolean),
    });
  }

  console.log(`   Valid records: ${records.length} (skipped ${skipped})`);

  // Compute stats
  const expenses = records.filter(r => r.expenseType === 'Expense');
  const categoryCounts = {};
  const categoryTotals = {};
  for (const r of expenses) {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    categoryTotals[r.category] = (categoryTotals[r.category] || 0) + (r.amount || 0);
  }

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count, total: Math.round(categoryTotals[name]) }));

  // Monthly spending
  const monthlySpending = {};
  for (const r of expenses) {
    const key = r.timestamp.slice(0, 7); // YYYY-MM
    if (!monthlySpending[key]) monthlySpending[key] = 0;
    monthlySpending[key] += r.amount || 0;
  }

  const stats = {
    totalRecords: records.length,
    totalExpenses: expenses.length,
    totalSpent: expenses.reduce((s, r) => s + (r.amount || 0), 0),
    topCategories,
    monthlySpending,
    dateRange: {
      start: records[0]?.timestamp,
      end: records[records.length - 1]?.timestamp,
    },
  };

  console.log(`   Total spent: ₹${Math.round(stats.totalSpent).toLocaleString()}`);
  console.log(`   Top category: ${topCategories[0]?.name} (${topCategories[0]?.count} records)`);

  // Sample to 1000 records for fast client-side performance
  const sampledRecords = records.length > 1000 
    ? records.filter((_, idx) => idx % Math.ceil(records.length / 1000) === 0).slice(0, 1000)
    : records;

  return { records: sampledRecords, stats };
}

// ─── Financial Transactions Processing ────────────────────────────────────────

function processTransactions() {
  console.log('💳 Processing Financial Transactions...');
  const jsonPath = path.join(RAW_DIR, 'Augmented_IndiaTransactMultiFacet2024.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn('⚠️  Transactions JSON not found, skipping');
    return { records: [], stats: {} };
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`   Raw records: ${raw.length}`);

  const records = [];
  let skipped = 0;

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    const ts = parseDate(row['trans_date_trans_time']);
    if (!ts) { skipped++; continue; }

    const amount = parseFloat(row['amt']);
    const safeAmount = isNaN(amount) || amount < 0 ? undefined : amount;
    
    // NEVER store: cc_num, customer_id, is_fraud, dob
    const merchant = sanitizeMerchant(row['merchant']);
    const category = formatCategory(row['category']);
    const city = row['city']?.trim() || null;
    const state = row['state']?.trim() || null;
    const lat = parseFloat(row['lat']);
    const long = parseFloat(row['long']);

    const title = merchant || category || 'Transaction';

    records.push({
      id: `transaction-${i}`,
      type: 'transaction',
      source: 'transactions',
      timestamp: ts.toISOString(),
      title,
      category: category || 'Other',
      amount: safeAmount,
      currency: 'INR',
      location: {
        city: city || undefined,
        state: state || undefined,
        lat: isNaN(lat) ? undefined : lat,
        long: isNaN(long) ? undefined : long,
      },
      metadata: {
        merchant: merchant || undefined,
      },
      tags: [
        'transaction',
        row['category'] || 'other',
        city?.toLowerCase().replace(/\s+/g, '_'),
      ].filter(Boolean),
    });
  }

  console.log(`   Valid records: ${records.length} (skipped ${skipped})`);

  // Compute stats
  const categoryCounts = {};
  const categoryTotals = {};
  for (const r of records) {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    categoryTotals[r.category] = (categoryTotals[r.category] || 0) + (r.amount || 0);
  }

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count, total: Math.round(categoryTotals[name]) }));

  // City distribution
  const cityCounts = {};
  for (const r of records) {
    if (r.location?.city) {
      cityCounts[r.location.city] = (cityCounts[r.location.city] || 0) + 1;
    }
  }
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const stats = {
    totalRecords: records.length,
    totalSpent: records.reduce((s, r) => s + (r.amount || 0), 0),
    topCategories,
    topCities,
    dateRange: {
      start: records[0]?.timestamp,
      end: records[records.length - 1]?.timestamp,
    },
  };

  console.log(`   Total spent: ₹${Math.round(stats.totalSpent).toLocaleString()}`);
  console.log(`   Top category: ${topCategories[0]?.name}`);

  // Sample to 1000 records for fast client-side performance
  const sampledRecords = records.length > 1000
    ? records.filter((_, idx) => idx % Math.ceil(records.length / 1000) === 0).slice(0, 1000)
    : records;

  return { records: sampledRecords, stats };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍 LifeTrace Data Preprocessor\n' + '═'.repeat(40));

  const spotify = processSpotify();
  const household = processHousehold();
  const transactions = processTransactions();

  // Write Spotify sample
  fs.writeFileSync(
    path.join(DATA_DIR, 'spotify-sample.json'),
    JSON.stringify(spotify.records || [], null, 0)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, 'spotify-stats.json'),
    JSON.stringify(spotify.stats || {}, null, 2)
  );

  // Write Household
  fs.writeFileSync(
    path.join(DATA_DIR, 'household.json'),
    JSON.stringify(household.records || [], null, 0)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, 'household-stats.json'),
    JSON.stringify(household.stats || {}, null, 2)
  );

  // Write Transactions
  fs.writeFileSync(
    path.join(DATA_DIR, 'transactions.json'),
    JSON.stringify(transactions.records || [], null, 0)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, 'transactions-stats.json'),
    JSON.stringify(transactions.stats || {}, null, 2)
  );

  // Write manifest
  const manifest = {
    generated: new Date().toISOString(),
    datasets: {
      spotify: {
        sample: spotify.records?.length || 0,
        total: spotify.stats?.totalRecords || 0,
        dateRange: spotify.stats?.dateRange || {},
      },
      household: {
        total: household.records?.length || 0,
        dateRange: household.stats?.dateRange || {},
      },
      transactions: {
        total: transactions.records?.length || 0,
        dateRange: transactions.stats?.dateRange || {},
      },
    },
    totalRecords:
      (spotify.stats?.totalRecords || 0) +
      (household.records?.length || 0) +
      (transactions.records?.length || 0),
  };

  fs.writeFileSync(
    path.join(DATA_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('\n✅ Preprocessing complete!');
  console.log(`   Spotify sample: ${manifest.datasets.spotify.sample} records`);
  console.log(`   Household: ${manifest.datasets.household.total} records`);
  console.log(`   Transactions: ${manifest.datasets.transactions.total} records`);
  console.log(`   Total real records: ${manifest.totalRecords.toLocaleString()}`);
  console.log(`   Output: ${DATA_DIR}\n`);
}

main().catch(err => {
  console.error('❌ Preprocessing failed:', err);
  process.exit(1);
});
