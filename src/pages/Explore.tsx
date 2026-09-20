import { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { ReceiptList } from '@/components/receipts/ReceiptList';
import { ReceiptDetail } from '@/components/receipts/ReceiptDetail';
import { EmptySearchResults } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useLifeData } from '@/hooks/useLifeData';
import { useSearch } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { getConnectionsForReceipt } from '@/engine/connections';
import type { LifeReceipt, ReceiptType } from '@/types';
import { TYPE_LABELS } from '@/lib/utils';

const RECEIPT_TYPES: ReceiptType[] = ['music', 'expense', 'transaction'];

export default function Explore() {
  const { receipts, isLoading } = useLifeData();
  const { connections } = useConnections(receipts);
  const { results, filters, setFilters } = useSearch(receipts);

  const [selectedTypes, setSelectedTypes] = useState<ReceiptType[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
  const [selectedReceipt, setSelectedReceipt] = useState<LifeReceipt | null>(null);
  const [queryInput, setQueryInput] = useState('');

  // Debounce query → update hook filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, query: queryInput }));
    }, 200);
    return () => clearTimeout(timer);
  }, [queryInput, setFilters]);

  // Sync type chips → hook filters
  useEffect(() => {
    setFilters(f => ({ ...f, types: selectedTypes }));
  }, [selectedTypes, setFilters]);

  // Apply sort to results
  const sorted = useMemo(() => {
    const arr = [...results];
    if (sortOrder === 'newest') return arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (sortOrder === 'oldest') return arr.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (sortOrder === 'amount-high') return arr.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
    if (sortOrder === 'amount-low') return arr.sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0));
    return arr;
  }, [results, sortOrder]);

  const receiptConnections = useMemo(() => {
    if (!selectedReceipt) return [];
    return getConnectionsForReceipt(selectedReceipt.id, connections);
  }, [selectedReceipt, connections]);

  const toggleType = (type: ReceiptType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-100">
        <LoadingState message="Loading your archive..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 font-body pt-16 pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-2">
            Your archive
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-900">
            Explore
          </h1>
        </header>

        {/* Search bar */}
        <div className="relative mb-6">
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
            size={18}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search moments, artists, merchants, categories…"
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            aria-label="Search your archive"
            className="w-full pl-11 pr-4 py-3 bg-parchment-200 border border-ink-300 text-ink-900 font-body text-sm placeholder:text-ink-500 focus:outline-none focus:border-ink-700 transition-colors"
          />
        </div>

        {/* Filter chips + sort */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          {RECEIPT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              aria-pressed={selectedTypes.includes(type)}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
                selectedTypes.includes(type)
                  ? 'bg-ink-900 text-parchment-100 border-ink-900'
                  : 'bg-transparent text-ink-700 border-ink-300 hover:border-ink-700'
              }`}
            >
              {TYPE_LABELS[type]}
              {selectedTypes.includes(type) && ' ✕'}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-ink-500" aria-hidden="true" />
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
              aria-label="Sort receipts"
              className="bg-transparent border border-ink-300 text-ink-700 font-mono text-xs py-1.5 px-2 focus:outline-none focus:border-ink-700"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount-high">Amount: High → Low</option>
              <option value="amount-low">Amount: Low → High</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <p
          className="font-mono text-xs text-ink-500 mb-6"
          aria-live="polite"
          aria-atomic="true"
        >
          {sorted.length.toLocaleString()} moments
        </p>

        {/* Receipt list */}
        {sorted.length === 0 ? (
          <EmptySearchResults />
        ) : (
          <ReceiptList
            receipts={sorted}
            onSelect={setSelectedReceipt}
          />
        )}

        {/* Detail drawer */}
        <Drawer
          open={selectedReceipt !== null}
          onClose={() => setSelectedReceipt(null)}
          title="Moment Detail"
        >
          {selectedReceipt && (
            <ReceiptDetail
              receipt={selectedReceipt}
              connections={receiptConnections}
              onClose={() => setSelectedReceipt(null)}
              onReceiptClick={(id) => {
                const r = receipts.find(r => r.id === id);
                if (r) setSelectedReceipt(r);
              }}
            />
          )}
        </Drawer>

      </div>
    </div>
  );
}
