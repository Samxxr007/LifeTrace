import React, { useState } from 'react';
import type { Pattern, LifeReceipt } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PatternCardProps {
  pattern: Pattern;
  receipts: LifeReceipt[];
}

export const PatternCard: React.FC<PatternCardProps> = React.memo(({ pattern, receipts }) => {
  const [expanded, setExpanded] = useState(false);
  const relatedReceipts = pattern.receipts || receipts.filter(r => r.category === pattern.name || r.tags?.includes(pattern.type));

  // Determine color bar based on pattern type (simple hash for visual variety)
  const colors = ['bg-burnt-500', 'bg-forest-500', 'bg-navy-500', 'bg-ink-700'];
  const colorClass = colors[pattern.id.length % colors.length];

  return (
    <div className="relative border-y border-ink-200 py-8 my-[-1px] group">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass}`} />
      
      <div className="pl-6 md:pl-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display text-2xl md:text-3xl text-ink-900 max-w-2xl">
            {pattern.name}
          </h3>
          <span className="font-mono text-sm text-ink-500 hidden md:inline-block">
            {pattern.frequency || relatedReceipts.length} instances
          </span>
        </div>

        <p className="font-body text-ink-700 max-w-3xl leading-relaxed mb-6">
          {pattern.description}
        </p>

        {pattern.evidence && (
          <p className="font-mono text-xs text-ink-500 mb-6 bg-parchment-200 p-3 rounded max-w-2xl">
            {pattern.evidence}
          </p>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink-600 hover:text-ink-900 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide Evidence' : 'View Evidence'}
        </button>

        {expanded && (
          <div className="mt-8 border-t border-ink-100 pt-6 space-y-4">
            {relatedReceipts.slice(0, 10).map(receipt => (
              <div key={receipt.id} className="flex justify-between items-center py-2">
                <div>
                  <div className="font-mono text-xs text-ink-400 mb-1">{new Date(receipt.timestamp).toLocaleDateString()}</div>
                  <div className="font-body text-ink-800">{receipt.title}</div>
                </div>
                <div className="font-mono text-xs uppercase bg-parchment-200 px-2 py-1 text-ink-500">
                  {receipt.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

PatternCard.displayName = 'PatternCard';
