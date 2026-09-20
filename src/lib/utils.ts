import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import type { ReceiptType, DataSource, ConnectionStrength } from '@/types';

// ─── Class Name Utility ────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Date Utilities ────────────────────────────────────────────────────────────

export function parseTimestamp(ts: string): Date | null {
  if (!ts) return null;
  const d = parseISO(ts);
  return isValid(d) ? d : null;
}

export function formatDate(ts: string, fmt = 'MMM d, yyyy'): string {
  const d = parseTimestamp(ts);
  if (!d) return 'Unknown date';
  return format(d, fmt);
}

export function formatDateTime(ts: string): string {
  const d = parseTimestamp(ts);
  if (!d) return 'Unknown date';
  return format(d, "MMM d, yyyy · h:mm a");
}

export function formatDateShort(ts: string): string {
  return formatDate(ts, 'MMM d, yyyy');
}

export function formatDateRange(start: string, end: string): string {
  const s = parseTimestamp(start);
  const e = parseTimestamp(end);
  if (!s || !e) return '';
  if (s.getFullYear() === e.getFullYear()) {
    return `${format(s, 'MMM d')} — ${format(e, 'MMM d, yyyy')}`;
  }
  return `${format(s, 'MMM yyyy')} — ${format(e, 'MMM yyyy')}`;
}

export function timeAgo(ts: string): string {
  const d = parseTimestamp(ts);
  if (!d) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getHour(ts: string): number {
  const d = parseTimestamp(ts);
  return d ? d.getHours() : 0;
}

export function getDayOfWeek(ts: string): number {
  const d = parseTimestamp(ts);
  return d ? d.getDay() : 0;
}

export function getTimeBucket(hour: number): 'morning' | 'afternoon' | 'evening' | 'late-night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'late-night';
}

export function getTimeBucketLabel(ts: string): string {
  const hour = getHour(ts);
  const bucket = getTimeBucket(hour);
  const labels = {
    'morning': 'Morning (6 AM – 12 PM)',
    'afternoon': 'Afternoon (12 PM – 6 PM)',
    'evening': 'Evening (6 PM – 10 PM)',
    'late-night': 'Late Night (10 PM – 6 AM)',
  };
  return labels[bucket];
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12 AM';
  if (i < 12) return `${i} AM`;
  if (i === 12) return '12 PM';
  return `${i - 12} PM`;
});

// ─── Amount Utilities ──────────────────────────────────────────────────────────

const INR_FMT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const INR_FMT_DECIMAL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(amount: number | undefined, currency = 'INR'): string {
  if (amount === undefined || amount === null) return '—';
  if (currency === 'INR') return INR_FMT.format(amount);
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatAmountExact(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—';
  return INR_FMT_DECIMAL.format(amount);
}

export function formatListeningTime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatTrackDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// ─── Type Utilities ────────────────────────────────────────────────────────────

export const TYPE_LABELS: Record<ReceiptType, string> = {
  music: 'Music',
  expense: 'Expense',
  transaction: 'Transaction',
  place: 'Place',
  entertainment: 'Entertainment',
  movie: 'Movie',
  photo: 'Photo',
  message: 'Message',
  search: 'Search',
  note: 'Note',
  event: 'Event',
};

export const SOURCE_LABELS: Record<DataSource, string> = {
  spotify: 'Spotify',
  household: 'Household',
  transactions: 'Transactions',
  synthetic: 'Synthetic',
  derived: 'Derived',
};

export const TYPE_COLORS: Record<ReceiptType, string> = {
  music:         '#C4622D', // burnt-500
  expense:       '#3D5A47', // forest-500
  transaction:   '#2B4B6F', // navy-500
  place:         '#8B6914', // amber-500
  entertainment: '#8B3A3A', // crimson-500
  movie:         '#8B3A3A', // crimson-500
  photo:         '#7B4B94', // purple-500
  message:       '#2E6F60', // teal-500
  search:        '#A05A2C', // copper-500
  note:          '#8A8480', // ink-500
  event:         '#5E2626', // crimson-700
};

export const TYPE_BG_COLORS: Record<ReceiptType, string> = {
  music:         '#FBE8DC',
  expense:       '#DCE8E0',
  transaction:   '#DCE5EF',
  place:         '#F5EDCC',
  entertainment: '#F5DADA',
  movie:         '#F5DADA',
  photo:         '#F0E5F5',
  message:       '#DCF2EC',
  search:        '#FDEFE5',
  note:          '#F0EDE8',
  event:         '#F5DADA',
};

export const STRENGTH_LABELS: Record<ConnectionStrength, string> = {
  strong:   'Strong Connection',
  moderate: 'Moderate Connection',
  weak:     'Weak Connection',
};

// ─── Number Utilities ──────────────────────────────────────────────────────────

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString('en-IN');
}

export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
}

// ─── String Utilities ──────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── Array Utilities ───────────────────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function sortByDate(arr: { timestamp: string }[], dir: 'asc' | 'desc' = 'desc') {
  return [...arr].sort((a, b) => {
    const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return dir === 'asc' ? diff : -diff;
  });
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Score Utility ─────────────────────────────────────────────────────────────

export function scoreToPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function scoreToStrength(score: number): ConnectionStrength {
  if (score >= 0.7) return 'strong';
  if (score >= 0.5) return 'moderate';
  return 'weak';
}
