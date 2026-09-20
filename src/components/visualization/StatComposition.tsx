import React from 'react';
import { LifeInsights } from '@/types';
import { formatCount, formatAmountExact } from '@/lib/utils';

interface StatCompositionProps {
  insights: LifeInsights;
}

export default function StatComposition({ insights }: StatCompositionProps) {
  return (
    <div className="w-full border-t border-b border-ink-300 py-8 my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="flex flex-col space-y-2 md:border-r border-ink-300 md:pr-8">
          <span className="text-label text-ink-500 uppercase tracking-widest">Total Records</span>
          <span className="font-mono text-display text-ink-900">{formatCount(insights.totalRecords)}</span>
        </div>

        <div className="flex flex-col space-y-2 md:border-r border-ink-300 md:pr-8">
          <span className="text-label text-ink-500 uppercase tracking-widest">Listening Time</span>
          <span className="font-mono text-display text-ink-900">{formatCount(insights.totalListeningHours)}<span className="text-2xl text-ink-500 ml-1">hrs</span></span>
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-label text-ink-500 uppercase tracking-widest">Total Spent</span>
          <span className="font-mono text-display text-ink-900">{formatAmountExact(insights.totalSpent)}</span>
        </div>

      </div>
    </div>
  );
}
