import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

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
  return format(d, 'MMM d, yyyy · h:mm a');
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
    morning: 'Morning (6 AM – 12 PM)',
    afternoon: 'Afternoon (12 PM – 6 PM)',
    evening: 'Evening (6 PM – 10 PM)',
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
