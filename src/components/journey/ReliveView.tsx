import React, { useState, useMemo } from 'react';
import type { LifeReceipt, Connection } from '@/types';
import { formatDate, formatAmount, parseTimestamp } from '@/lib/utils';
import { ReceiptTypeIcon } from '@/components/receipts/ReceiptTypeIcon';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { findConnections, getConnectionsForReceipt } from '@/engine/connections';
import {
  Sparkles,
  Clock,
  Calendar,
  BookOpen,
  Maximize2,
  Minimize2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ReliveViewProps {
  open: boolean;
  onClose: () => void;
  selectedDateIso: string;
  receipts: LifeReceipt[];
  onOpenDiaryWithReceipts?: (date: string, receiptIds: string[]) => void;
  onSelectReceipt?: (receipt: LifeReceipt) => void;
}

export function ReliveView({
  open,
  onClose,
  selectedDateIso,
  receipts,
  onOpenDiaryWithReceipts,
  onSelectReceipt,
}: ReliveViewProps) {
  // Window mode: 6 hours (curated) vs 24 hours (expanded)
  const [windowHours, setWindowHours] = useState<6 | 24>(6);

  const targetTime = useMemo(() => {
    const t = parseTimestamp(selectedDateIso)?.getTime();
    return t || Date.now();
  }, [selectedDateIso]);

  // Filter surrounding receipts within +- windowHours
  const surroundingMoments = useMemo(() => {
    const windowMs = windowHours * 60 * 60 * 1000;
    const minT = targetTime - windowMs;
    const maxT = targetTime + windowMs;

    return receipts
      .filter((r) => {
        const t = parseTimestamp(r.timestamp)?.getTime();
        return t && t >= minT && t <= maxT;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [receipts, targetTime, windowHours]);

  // Multi-domain summary in this window
  const summary = useMemo(() => {
    const domainCounts: Record<string, number> = {};
    let totalSpent = 0;

    surroundingMoments.forEach((r) => {
      domainCounts[r.type] = (domainCounts[r.type] || 0) + 1;
      if (r.amount && r.amount > 0) {
        totalSpent += r.amount;
      }
    });

    return { domainCounts, totalSpent };
  }, [surroundingMoments]);

  // Active connections between moments in this window
  const activeConnections = useMemo(() => {
    if (surroundingMoments.length < 2) return [];
    return findConnections(surroundingMoments, 10);
  }, [surroundingMoments]);

  const handleJournalClick = () => {
    if (onOpenDiaryWithReceipts) {
      const receiptIds = surroundingMoments.map((r) => r.id);
      onOpenDiaryWithReceipts(selectedDateIso, receiptIds);
      onClose();
    }
  };

  const formattedDate = useMemo(() => {
    return formatDate(new Date(targetTime));
  }, [targetTime]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Relive This Moment"
      description={`Curated context and surrounding memory traces for ${formattedDate}`}
      size="lg"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Control Bar: Window Selector + Journal Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-parchment-200/70 border border-ink-200 rounded-sm">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-ink-600" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-600">
              Temporal Window:
            </span>
            <button
              onClick={() => setWindowHours(6)}
              className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors ${
                windowHours === 6
                  ? 'bg-ink-900 text-parchment-100 font-bold'
                  : 'bg-parchment-100 text-ink-700 hover:bg-parchment-300'
              }`}
            >
              ±6 Hours (Curated)
            </button>
            <button
              onClick={() => setWindowHours(24)}
              className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors ${
                windowHours === 24
                  ? 'bg-ink-900 text-parchment-100 font-bold'
                  : 'bg-parchment-100 text-ink-700 hover:bg-parchment-300'
              }`}
            >
              ±24 Hours (Full Day)
            </button>
          </div>

          {onOpenDiaryWithReceipts && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleJournalClick}
              className="flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              <span>Journal This Day</span>
            </Button>
          )}
        </div>

        {/* Multi-Domain Activity Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-parchment-50 border border-ink-200 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
              Total Moments
            </span>
            <span className="font-display text-2xl text-ink-900">
              {surroundingMoments.length}
            </span>
          </div>
          <div className="p-3 bg-parchment-50 border border-ink-200 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
              Active Domains
            </span>
            <span className="font-display text-2xl text-forest-600">
              {Object.keys(summary.domainCounts).length}
            </span>
          </div>
          <div className="p-3 bg-parchment-50 border border-ink-200 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
              Discovered Links
            </span>
            <span className="font-display text-2xl text-amber-700">
              {activeConnections.length}
            </span>
          </div>
          <div className="p-3 bg-parchment-50 border border-ink-200 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
              Total Spent
            </span>
            <span className="font-mono text-xl text-navy-700">
              {summary.totalSpent > 0 ? formatAmount(summary.totalSpent) : '₹0'}
            </span>
          </div>
        </div>

        {/* Surrounding Moments Chronological Stream */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-ink-600 mb-3 flex items-center gap-1.5">
            <Calendar size={14} />
            <span>Moments in Window ({surroundingMoments.length})</span>
          </h3>

          {surroundingMoments.length === 0 ? (
            <div className="p-8 text-center bg-parchment-50 border border-ink-200 rounded-sm">
              <p className="font-display text-base text-ink-700">
                No moments recorded in this ±{windowHours}h window.
              </p>
              <p className="font-body text-xs text-ink-500 mt-1">
                Try expanding the window to ±24 hours or select another date from the timeline.
              </p>
              {windowHours === 6 && (
                <button
                  onClick={() => setWindowHours(24)}
                  className="mt-3 px-3 py-1.5 bg-ink-900 text-parchment-100 text-xs font-mono rounded"
                >
                  Expand to ±24 Hours
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {surroundingMoments.map((m) => {
                const isOrigin =
                  Math.abs(new Date(m.timestamp).getTime() - targetTime) < 5 * 60 * 1000;

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectReceipt?.(m)}
                    className={`flex items-center justify-between p-3 rounded-sm border transition-all cursor-pointer ${
                      isOrigin
                        ? 'bg-amber-500/10 border-amber-600/50 shadow-xs'
                        : 'bg-parchment-50 border-ink-200 hover:bg-parchment-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-parchment-200 flex items-center justify-center shrink-0">
                        <ReceiptTypeIcon type={m.type} size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm font-medium text-ink-900 line-clamp-1">
                            {m.title}
                          </span>
                          {isOrigin && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-amber-600 text-white rounded">
                              Selected Moment
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-ink-500">
                          {formatDate(new Date(m.timestamp))}
                          {m.location?.city ? ` · ${m.location.city}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {m.amount ? (
                        <span className="font-mono text-xs font-semibold text-ink-900">
                          {formatAmount(m.amount)}
                        </span>
                      ) : m.metadata?.artist ? (
                        <span className="font-body text-xs text-ink-600">
                          {String(m.metadata.artist)}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-ink-400 uppercase">
                          {m.type}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Connections Discovered */}
        {activeConnections.length > 0 && (
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-ink-600 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-700" />
              <span>Relationships Active in this Window ({activeConnections.length})</span>
            </h3>

            <div className="space-y-2">
              {activeConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="p-3 bg-parchment-50 border border-ink-200 rounded-sm text-xs font-body"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        conn.strength === 'strong'
                          ? 'bg-amber-500/20 text-amber-800'
                          : 'bg-ink-100 text-ink-700'
                      }`}
                    >
                      {conn.strength.toUpperCase()} CONNECTION
                    </span>
                    <span className="font-mono text-[10px] text-ink-500">
                      Confidence: {Math.round(conn.score * 100)}%
                    </span>
                  </div>
                  <p className="text-ink-800 font-medium">{conn.explanation}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conn.signals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-parchment-200 text-ink-600 text-[10px] font-mono rounded"
                      >
                        ✓ {sig.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
