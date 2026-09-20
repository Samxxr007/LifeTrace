import React from 'react';
import type { Connection, LifeReceipt } from '@/types';

interface ConnectionChainProps {
  connection: Connection;
  receipts: LifeReceipt[];
  onSelectReceipt: (id: string) => void;
}

export const ConnectionChain: React.FC<ConnectionChainProps> = ({
  connection,
  receipts,
  onSelectReceipt
}) => {
  const receiptA = receipts.find(r => r.id === connection.sourceId);
  const receiptB = receipts.find(r => r.id === connection.targetId);

  if (!receiptA || !receiptB) return null;

  return (
    <div className="flex flex-col border-l border-ink-200 ml-4 pl-8 py-4 relative my-8">
      {/* Receipt A */}
      <div className="relative group cursor-pointer" onClick={() => onSelectReceipt(receiptA.id)}>
        <div className="absolute -left-[41px] top-4 w-3 h-3 bg-parchment-100 border-2 border-ink-900 rounded-full" />
        <div className="mb-2">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-500">{receiptA.type}</span>
        </div>
        <h3 className="font-display text-xl text-ink-900 group-hover:text-burnt-600 transition-colors">
          {receiptA.title}
        </h3>
        <p className="font-mono text-sm text-ink-500 mt-1">
          {new Date(receiptA.timestamp).toLocaleDateString()}
        </p>
      </div>

      {/* Connection Line & Label */}
      <div className="my-6 relative">
        <div className="inline-block bg-parchment-100 px-3 py-1 border border-ink-200 text-xs font-mono uppercase tracking-wider text-ink-600 z-10 relative">
          {connection.signals[0]?.label || connection.explanation.slice(0, 40)}
        </div>
      </div>

      {/* Receipt B */}
      <div className="relative group cursor-pointer" onClick={() => onSelectReceipt(receiptB.id)}>
        <div className="absolute -left-[41px] top-4 w-3 h-3 bg-parchment-100 border-2 border-ink-900 rounded-full" />
        <div className="mb-2">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-500">{receiptB.type}</span>
        </div>
        <h3 className="font-display text-xl text-ink-900 group-hover:text-burnt-600 transition-colors">
          {receiptB.title}
        </h3>
        <p className="font-mono text-sm text-ink-500 mt-1">
          {new Date(receiptB.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
