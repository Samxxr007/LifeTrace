import React from 'react';
import { CheckCircle2, Clock, Layers, Calendar, ArrowRight } from 'lucide-react';
import type { Connection, LifeReceipt } from '@/types';
import { formatDate, formatAmount, TYPE_COLORS, SOURCE_LABELS } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ConnectionExplainerProps {
  connection: Connection;
  receiptA: LifeReceipt;
  receiptB: LifeReceipt;
}

export const ConnectionExplainer: React.FC<ConnectionExplainerProps> = ({
  connection,
  receiptA,
  receiptB,
}) => {
  const diffHours = Math.abs(
    (new Date(receiptB.timestamp).getTime() - new Date(receiptA.timestamp).getTime()) / (1000 * 60 * 60)
  );

  return (
    <div className="bg-parchment-50 p-6 sm:p-8 border border-ink-300 h-full rounded-xs shadow-xs">
      {/* Evidence Strength Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-ink-200">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink-500 block mb-1">
            Evidence-Based Relationship
          </span>
          <h3 className="font-display text-2xl text-ink-900">Connected Moments</h3>
        </div>
        <span
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wider rounded-xs border font-medium ${
            connection.strength === 'strong'
              ? 'bg-burnt-100 text-burnt-800 border-burnt-300'
              : connection.strength === 'moderate'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-parchment-200 text-ink-700 border-ink-300'
          }`}
        >
          {connection.strength} Evidence ({connection.signals.length} {connection.signals.length === 1 ? 'signal' : 'signals'})
        </span>
      </div>

      {/* Side-by-side Connected Moments Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Moment A */}
        <div className="p-4 bg-parchment-100 border border-ink-200 rounded-xs">
          <div className="flex justify-between items-center mb-1.5">
            <span
              className="font-mono text-[10px] uppercase font-bold tracking-wider"
              style={{ color: TYPE_COLORS[receiptA.type] }}
            >
              {SOURCE_LABELS[receiptA.source]} · {receiptA.type}
            </span>
          </div>
          <h4 className="font-display font-bold text-base text-ink-900 mb-1 leading-snug truncate">
            {receiptA.title}
          </h4>
          <p className="font-mono text-xs text-ink-500 mb-2">
            {formatDate(receiptA.timestamp, 'MMM d, yyyy · h:mm a')}
          </p>
          {receiptA.amount !== undefined && (
            <p className="font-mono text-xs text-ink-800 font-medium">
              Amount: {formatAmount(receiptA.amount)}
            </p>
          )}
        </div>

        {/* Moment B */}
        <div className="p-4 bg-parchment-100 border border-ink-200 rounded-xs">
          <div className="flex justify-between items-center mb-1.5">
            <span
              className="font-mono text-[10px] uppercase font-bold tracking-wider"
              style={{ color: TYPE_COLORS[receiptB.type] }}
            >
              {SOURCE_LABELS[receiptB.source]} · {receiptB.type}
            </span>
          </div>
          <h4 className="font-display font-bold text-base text-ink-900 mb-1 leading-snug truncate">
            {receiptB.title}
          </h4>
          <p className="font-mono text-xs text-ink-500 mb-2">
            {formatDate(receiptB.timestamp, 'MMM d, yyyy · h:mm a')}
          </p>
          {receiptB.amount !== undefined && (
            <p className="font-mono text-xs text-ink-800 font-medium">
              Amount: {formatAmount(receiptB.amount)}
            </p>
          )}
        </div>
      </div>

      {/* "Connected Because..." Section */}
      <div className="mb-6">
        <h4 className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-3">
          Connected Because
        </h4>

        <ul className="space-y-2.5">
          {/* 1. Temporal relationship */}
          <li className="flex items-start gap-2.5 text-sm text-ink-800 font-body">
            <Clock size={16} className="text-burnt-600 mt-0.5 shrink-0" />
            <span>
              <strong>Temporal Proximity:</strong> Occurred{' '}
              {diffHours < 1
                ? `${Math.max(1, Math.round(diffHours * 60))} minutes apart`
                : `${Math.round(diffHours)} hours apart`}
              .
            </span>
          </li>

          {/* 2. Signals breakdown */}
          {connection.signals.map((sig, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-ink-800 font-body">
              <CheckCircle2 size={16} className="text-forest-600 mt-0.5 shrink-0" />
              <span>
                <strong>{sig.type.replace(/_/g, ' ').toUpperCase()}:</strong> {sig.label}
              </span>
            </li>
          ))}

          {/* 3. Cross-domain resonance if applicable */}
          {receiptA.source !== receiptB.source && (
            <li className="flex items-start gap-2.5 text-sm text-ink-800 font-body">
              <Layers size={16} className="text-navy-600 mt-0.5 shrink-0" />
              <span>
                <strong>Cross-Domain Resonance:</strong> Bridges {SOURCE_LABELS[receiptA.source]} and{' '}
                {SOURCE_LABELS[receiptB.source]} data.
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Narrative Explanation */}
      {connection.explanation && (
        <div className="p-4 bg-parchment-100 border border-ink-200 rounded-xs mb-6">
          <p className="font-body text-sm text-ink-700 italic leading-relaxed">
            "{connection.explanation}"
          </p>
        </div>
      )}

      {/* Action link */}
      <div className="pt-4 border-t border-ink-200 flex justify-end">
        <Link
          to="/explore"
          className="font-mono text-xs uppercase tracking-wider text-ink-600 hover:text-ink-900 flex items-center gap-1.5"
        >
          <span>Find in Explorer</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};
