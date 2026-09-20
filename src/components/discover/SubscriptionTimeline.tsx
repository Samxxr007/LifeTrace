import React, { useMemo } from 'react';
import type { LifeReceipt } from '@/types';

interface SubscriptionTimelineProps {
  receipts: LifeReceipt[];
}

export const SubscriptionTimeline: React.FC<SubscriptionTimelineProps> = ({ receipts }) => {
  const subscriptions = useMemo(() => {
    const subsKeywords = ['netflix', 'tata sky', 'mobile', 'hbr', 'subscription', 'spotify', 'amazon prime'];
    
    // Group by likely subscription name
    const groups: Record<string, { start: Date; end: Date; count: number }> = {};
    
    receipts.forEach(r => {
      const titleLower = r.title.toLowerCase();
      const subCatLower = (r.subcategory || '').toLowerCase();
      
      const isSub = subsKeywords.some(k => titleLower.includes(k) || subCatLower.includes(k));
      if (isSub) {
        // Simple normalization
        const name = r.title.split('-')[0].split(/[0-9]/)[0].trim();
        const date = new Date(r.timestamp);
        
        if (!groups[name]) {
          groups[name] = { start: date, end: date, count: 1 };
        } else {
          if (date < groups[name].start) groups[name].start = date;
          if (date > groups[name].end) groups[name].end = date;
          groups[name].count += 1;
        }
      }
    });

    return Object.entries(groups)
      .filter(([_, data]) => data.count > 1) // Only actual recurrences
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [receipts]);

  if (subscriptions.length === 0) {
    return (
      <div className="py-12 border-t border-ink-200">
        <h3 className="font-mono text-sm uppercase tracking-widest text-ink-500 mb-8">
          The Subscription Life
        </h3>
        <p className="font-body text-ink-500 italic">No recurring payments detected.</p>
      </div>
    );
  }

  // Calculate timeline scale
  const minDate = new Date(Math.min(...subscriptions.map(s => s.start.getTime())));
  const maxDate = new Date(Math.max(...subscriptions.map(s => s.end.getTime())));
  const totalDuration = maxDate.getTime() - minDate.getTime();

  return (
    <div className="py-12 border-t border-ink-200">
      <h3 className="font-mono text-sm uppercase tracking-widest text-ink-500 mb-8">
        The Subscription Life
      </h3>

      <div className="space-y-6">
        {subscriptions.map((sub, i) => {
          const leftPct = ((sub.start.getTime() - minDate.getTime()) / totalDuration) * 100;
          const widthPct = Math.max(((sub.end.getTime() - sub.start.getTime()) / totalDuration) * 100, 2); // min width

          // Rotate colors
          const colors = ['bg-navy-400', 'bg-burnt-400', 'bg-forest-400'];
          const barColor = colors[i % colors.length];

          return (
            <div key={sub.name} className="relative">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-body text-ink-800 text-sm truncate pr-4">{sub.name}</span>
                <span className="font-mono text-xs text-ink-400 whitespace-nowrap">
                  {sub.start.getFullYear()} - {sub.end.getFullYear()}
                </span>
              </div>
              <div className="h-1 bg-ink-100 w-full relative">
                <div 
                  className={`absolute h-full ${barColor}`} 
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
