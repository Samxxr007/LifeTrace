import React from 'react';
import type { LifeReceipt, Connection } from '@/types';
import { formatDate, formatAmount, formatDateRange } from '@/lib/utils';
import { ReceiptTypeIcon } from './ReceiptTypeIcon';
import { Badge } from '../ui/Badge';
import { EmptyConnections } from '../ui/EmptyState';

interface ReceiptDetailProps {
  receipt: LifeReceipt;
  connections?: Connection[];
  onClose: () => void;
  onReceiptClick?: (receiptId: string) => void;
}

export function ReceiptDetail({ receipt, connections = [], onClose: _onClose, onReceiptClick }: ReceiptDetailProps) {
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
          <div className="space-y-3">
            {connections.slice(0, 5).map((conn) => {
              const otherReceiptId = conn.sourceId === receipt.id ? conn.targetId : conn.sourceId;
              return (
                <button
                  key={conn.id}
                  onClick={() => onReceiptClick?.(otherReceiptId)}
                  className="w-full text-left flex items-start p-3 bg-parchment-200 hover:bg-parchment-100 border border-ink-300 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-ink-900"
                >
                  <div className="mr-3 mt-0.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        conn.strength === 'strong'
                          ? 'bg-burnt-500'
                          : conn.strength === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-ink-400'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs uppercase text-ink-500 mb-1">
                      {conn.strength} connection
                    </p>
                    <p className="font-body text-sm text-ink-700">
                      {conn.explanation}
                    </p>
                  </div>
                </button>
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
