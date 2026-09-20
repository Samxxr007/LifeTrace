import React from 'react';
import { cn, formatDate, formatAmount } from '@/lib/utils';
import type { LifeReceipt } from '@/types';
import { ReceiptTypeIcon } from './ReceiptTypeIcon';
import { Badge } from '../ui/Badge';

export interface ReceiptCardProps {
  receipt: LifeReceipt;
  compact?: boolean;
  onClick?: (receipt: LifeReceipt) => void;
  highlighted?: boolean;
  showSource?: boolean;
}

const ReceiptCard = React.memo(({
  receipt,
  compact = false,
  onClick,
  highlighted = false,
  showSource = false
}: ReceiptCardProps) => {
  if (!receipt) return null;
  const { type, title, timestamp, amount, source, category, metadata } = receipt;

  const isSynthetic = source === 'synthetic';
  const displaySubtitle = metadata?.artist || category || type;

  const content = (
    <article
      className={cn(
        'group flex items-center justify-between border-b border-ink-300 transition-colors',
        highlighted ? 'bg-parchment-200' : 'bg-transparent',
        onClick ? 'hover:bg-parchment-200 cursor-pointer' : '',
        compact ? 'py-3 px-4' : 'py-5 px-4'
      )}
    >
      <div className="flex items-center space-x-4 overflow-hidden">
        <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-parchment-200 group-hover:bg-parchment-100 transition-colors">
          <ReceiptTypeIcon type={type} size={18} />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-body font-medium text-ink-900 truncate text-sm md:text-base">
              {title}
            </h3>
            {showSource && isSynthetic && (
              <Badge source="synthetic" label="Synthetic" size="sm" />
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-ink-500 font-body mt-0.5">
            <span className="truncate max-w-[100px] sm:max-w-[180px] capitalize">
              {displaySubtitle}
            </span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={timestamp} className="shrink-0">
              {formatDate(timestamp, 'MMM d, yyyy')}
            </time>
          </div>
        </div>
      </div>

      {amount !== undefined && amount !== null && (
        <div className="shrink-0 ml-4 text-right">
          <span className="font-mono text-ink-900 font-medium text-sm">
            {formatAmount(amount)}
          </span>
        </div>
      )}
    </article>
  );

  if (onClick) {
    return (
      <button
        onClick={() => onClick(receipt)}
        className="w-full text-left focus:outline-none focus-visible:outline-2 focus-visible:outline-ink-900 block"
        aria-label={`View details for ${title}`}
      >
        {content}
      </button>
    );
  }

  return content;
});

ReceiptCard.displayName = 'ReceiptCard';

export { ReceiptCard };
