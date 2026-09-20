import React from 'react';
import type { LifeReceipt, Connection } from '@/types';
import { formatDate, formatAmount, formatDateRange } from '@/lib/utils';
import { ReceiptTypeIcon } from './ReceiptTypeIcon';
import { Badge } from '../ui/Badge';
import { EmptyConnections } from '../ui/EmptyState';

interface ReceiptDetailProps {
  receipt: LifeReceipt;
  connections?: Connection[];
  allReceipts?: LifeReceipt[];
  onClose: () => void;
  onReceiptClick?: (receiptId: string) => void;
}

export function ReceiptDetail({ receipt, connections = [], allReceipts = [], onClose: _onClose, onReceiptClick }: ReceiptDetailProps) {
  const { type, title, timestamp, amount, source, category, subcategory, location, metadata } = receipt;

  const renderField = (label: string, value?: string | number | null) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="flex flex-col py-3 border-b border-ink-200 last:border-0" key={label}>
        <span className="text-xs font-mono uppercase text-ink-500 mb-1">{label}</span>
        <span className="font-body text-ink-900 text-sm">{String(value)}</span>
      </div>
    );
  };

  const locationStr = location
    ? [location.city, location.state].filter(Boolean).join(', ')
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start space-x-4 pb-6 border-b border-ink-300">
        <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-parchment-200">
          <ReceiptTypeIcon type={type} size={24} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-display text-2xl text-ink-900 leading-tight">
              {title}
            </h3>
            {source === 'synthetic' && <Badge source="synthetic" label="Synthetic" size="sm" />}
          </div>
          <time className="font-body text-ink-500 text-sm">
            {formatDate(timestamp, 'EEEE, MMM d, yyyy · h:mm a')}
          </time>
        </div>
      </div>

      {/* Details */}
      <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 border-b border-ink-300">
        {renderField('Category', category)}
        {renderField('Subcategory', subcategory)}
        {amount !== undefined && (
          <div className="flex flex-col py-3 border-b border-ink-200 last:border-0">
            <span className="text-xs font-mono uppercase text-ink-500 mb-1">Amount</span>
            <span className="font-mono text-ink-900 text-base">{formatAmount(amount)}</span>
          </div>
        )}
        {renderField('Artist', metadata?.artist)}
        {renderField('Album', metadata?.album)}
        {renderField('Platform', metadata?.platform)}
        {renderField('Merchant', metadata?.merchant)}
        {renderField('Payment mode', metadata?.paymentMode)}
        {locationStr && renderField('Location', locationStr)}
        {metadata?.note && renderField('Note', String(metadata.note))}
      </div>

      {/* Connected Moments */}
      <div className="py-6 flex-1 overflow-y-auto">
        <h4 className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-4">
          Connected Moments ({connections.length})
        </h4>

        {connections.length === 0 ? (
          <EmptyConnections />
        ) : (
          <div className="space-y-4">
            {connections.slice(0, 5).map((conn) => {
              const otherReceiptId = conn.sourceId === receipt.id ? conn.targetId : conn.sourceId;
              const otherReceipt = allReceipts.find((r) => r.id === otherReceiptId);

              return (
                <div
                  key={conn.id}
                  className="p-3 bg-parchment-200 border border-ink-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      onClick={() => onReceiptClick?.(otherReceiptId)}
                      className="font-display text-base text-ink-900 hover:text-burnt-600 transition-colors text-left font-semibold focus:outline-none focus-visible:underline"
                    >
                      {otherReceipt ? otherReceipt.title : otherReceiptId}
                    </button>
                    <span
                      className={`shrink-0 font-mono text-[10px] uppercase px-1.5 py-0.5 border ${
                        conn.strength === 'strong'
                          ? 'border-burnt-500 text-burnt-600 bg-burnt-50'
                          : conn.strength === 'moderate'
                          ? 'border-amber-500 text-amber-600 bg-amber-50'
                          : 'border-ink-400 text-ink-500'
                      }`}
                    >
                      {conn.strength}
                    </span>
                  </div>

                  {otherReceipt && (
                    <p className="font-mono text-xs text-ink-500 mb-2">
                      {formatDate(otherReceipt.timestamp, 'MMM d, yyyy · h:mm a')} · {otherReceipt.source}
                    </p>
                  )}

                  <p className="font-mono text-xs uppercase tracking-wider text-ink-600 mb-1">
                    Connected because:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 mb-3 text-xs font-body text-ink-700">
                    {conn.signals && conn.signals.length > 0 ? (
                      conn.signals.map((sig, sIdx) => (
                        <li key={sIdx}>
                          <span className="font-mono text-[11px] uppercase text-ink-500">[{sig.type.replace(/_/g, ' ')}]</span>{' '}
                          {sig.label}
                        </li>
                      ))
                    ) : (
                      <li>{conn.explanation}</li>
                    )}
                  </ul>

                  <button
                    onClick={() => onReceiptClick?.(otherReceiptId)}
                    className="font-mono text-xs uppercase tracking-wider text-ink-900 hover:underline flex items-center gap-1"
                  >
                    <span>View connected receipt →</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer — Data source */}
      <div className="pt-4 border-t border-ink-300 text-center">
        <p className="font-mono text-xs text-ink-400">
          Source: <span className="capitalize">{source?.replace(/_/g, ' ') || 'Unknown'}</span>
        </p>
      </div>
    </div>
  );
}
