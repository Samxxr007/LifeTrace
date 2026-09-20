import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
// @ts-ignore
import { LifeReceipt } from '@/types';
import { ReceiptCard } from './ReceiptCard';
import { EmptySearchResults } from '../ui/EmptyState';

interface ReceiptListProps {
  receipts: LifeReceipt[];
  onSelect: (receipt: LifeReceipt) => void;
}

const ReceiptList = React.memo(({ receipts, onSelect }: ReceiptListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: receipts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // 64px row height as requested
    overscan: 10,
  });

  if (receipts.length === 0) {
    return <EmptySearchResults />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 text-sm font-body text-ink-500" aria-live="polite">
        Showing {receipts.length} moment{receipts.length !== 1 ? 's' : ''}
      </div>

      <div 
        ref={parentRef} 
        className="flex-1 overflow-y-auto"
        role="list"
        aria-label="Moments timeline"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const receipt = receipts[virtualItem.index];
            if (!receipt) return null;
            return (
              <div
                key={virtualItem.key}
                role="listitem"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ReceiptCard 
                  receipt={receipt} 
                  compact={true} 
                  onClick={onSelect} 
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ReceiptList.displayName = 'ReceiptList';

export { ReceiptList };
