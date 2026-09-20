import { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { ReceiptList } from '@/components/receipts/ReceiptList';
import { ReceiptDetail } from '@/components/receipts/ReceiptDetail';
import { EmptySearchResults } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useLifeData } from '@/hooks/useLifeData';
import { useSearch } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { getConnectionsForReceipt } from '@/engine/connections';
import type { LifeReceipt, ReceiptType, DataSource } from '@/types';
import { TYPE_LABELS, SOURCE_LABELS } from '@/lib/utils';

const RECEIPT_TYPES: ReceiptType[] = ['music', 'expense', 'transaction'];
const DATA_SOURCES: DataSource[] = ['spotify', 'household', 'transactions'];

const YEAR_PRESETS = [
  { label: 'All Eras', range: [null, null] as [string | null, string | null] },
  { label: '2013–2015', range: ['2013-01-01T00:00:00Z', '2015-12-31T23:59:59Z'] as [string | null, string | null] },
  { label: '2015–2018 (Convergence)', range: ['2015-01-01T00:00:00Z', '2018-12-31T23:59:59Z'] as [string | null, string | null] },
  { label: '2019–2021', range: ['2019-01-01T00:00:00Z', '2021-12-31T23:59:59Z'] as [string | null, string | null] },
  { label: '2022–2024', range: ['2022-01-01T00:00:00Z', '2024-12-31T23:59:59Z'] as [string | null, string | null] },
];

export default function Explore() {
  const { receipts, isLoading } = useLifeData();
  const { connections } = useConnections(receipts);
  const { results, filters, setFilters, totalCount, isFiltered } = useSearch(receipts);

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
  const [selectedReceipt, setSelectedReceipt] = useState<LifeReceipt | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All Eras');

  // Debounce search query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, query: queryInput }));
    }, 200);
    return () => clearTimeout(timer);
  }, [queryInput, setFilters]);

  // Extract top categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set).sort();
  }, [receipts]);

  // Apply sorting
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
    setFilters((f) => {
      const exists = f.types.includes(type);
      return {
        ...f,
        types: exists ? f.types.filter((t) => t !== type) : [...f.types, type],
      };
    });
  };

  const toggleSource = (source: DataSource) => {
    setFilters((f) => {
      const exists = f.sources.includes(source);
      return {
        ...f,
        sources: exists ? f.sources.filter((s) => s !== source) : [...f.sources, source],
      };
    });
  };

  const handlePeriodChange = (label: string, range: [string | null, string | null]) => {
    setSelectedPeriod(label);
    setFilters((f) => ({ ...f, dateRange: range }));
  };

  const handleResetFilters = () => {
    setQueryInput('');
    setSelectedPeriod('All Eras');
    setFilters({
      query: '',
      types: [],
      sources: [],
      categories: [],
      dateRange: [null, null],
      amountRange: [null, null],
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-100">
        <LoadingState message="Loading your archive..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 font-body pt-12 pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-2">
            Archival Search & Filter
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-900 mb-2">
            Explore Receipts
          </h1>
          <p className="font-body text-sm text-ink-600">
            Search and inspect individual recorded moments across Music, Household, and Financial datasets.
          </p>
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
            placeholder="Search moments, artists, merchants, categories, or notes…"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            aria-label="Search your archive"
            className="w-full pl-11 pr-10 py-3.5 bg-parchment-200 border border-ink-300 text-ink-900 font-body text-sm placeholder:text-ink-500 focus:outline-none focus:border-ink-700 transition-colors rounded-xs shadow-xs"
          />
          {queryInput && (
            <button
              onClick={() => setQueryInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900"
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="space-y-3 mb-6 bg-parchment-50 p-4 border border-ink-200 rounded-xs">
          {/* Row 1: Source & Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase text-ink-500 mr-2">Type:</span>
            {RECEIPT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                aria-pressed={filters.types.includes(type)}
                className={`px-3 py-1 font-mono text-xs uppercase tracking-wider border transition-colors rounded-xs ${
                  filters.types.includes(type)
                    ? 'bg-ink-900 text-parchment-100 border-ink-900'
                    : 'bg-parchment-200 text-ink-700 border-ink-300 hover:border-ink-700'
                }`}
              >
                {TYPE_LABELS[type]}
                {filters.types.includes(type) && ' ✕'}
              </button>
            ))}

            <div className="h-4 w-px bg-ink-300 mx-2 hidden sm:block" />

            <span className="font-mono text-xs uppercase text-ink-500 mr-2">Source:</span>
            {DATA_SOURCES.map((source) => (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                aria-pressed={filters.sources.includes(source)}
                className={`px-3 py-1 font-mono text-xs uppercase tracking-wider border transition-colors rounded-xs ${
                  filters.sources.includes(source)
                    ? 'bg-ink-900 text-parchment-100 border-ink-900'
                    : 'bg-parchment-200 text-ink-700 border-ink-300 hover:border-ink-700'
                }`}
              >
                {SOURCE_LABELS[source]}
                {filters.sources.includes(source) && ' ✕'}
              </button>
            ))}
          </div>

          {/* Row 2: Period & Sort Dropdowns */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase text-ink-500 mr-1">Period:</span>
              <div className="flex flex-wrap gap-1.5">
                {YEAR_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePeriodChange(preset.label, preset.range)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors ${
                      selectedPeriod === preset.label
                        ? 'bg-ink-900 text-parchment-100 border-ink-900 font-bold'
                        : 'bg-parchment-200 text-ink-700 border-ink-300 hover:border-ink-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Category selector */}
              {categories.length > 0 && (
                <select
                  value={filters.categories[0] || ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      categories: e.target.value ? [e.target.value] : [],
                    }))
                  }
                  aria-label="Filter by category"
                  className="bg-parchment-200 border border-ink-300 text-ink-700 font-mono text-xs py-1.5 px-2 focus:outline-none focus:border-ink-700 rounded-xs"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-ink-500" aria-hidden="true" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  aria-label="Sort receipts"
                  className="bg-parchment-200 border border-ink-300 text-ink-700 font-mono text-xs py-1.5 px-2 focus:outline-none focus:border-ink-700 rounded-xs"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="amount-high">Amount: High → Low</option>
                  <option value="amount-low">Amount: Low → High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Result Count & Reset */}
        <div className="flex justify-between items-center mb-4">
          <p
            className="font-mono text-xs text-ink-600"
            aria-live="polite"
            aria-atomic="true"
          >
            Showing {sorted.length.toLocaleString()} of {receipts.length.toLocaleString()} recorded receipts
          </p>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="font-mono text-xs text-ink-500 hover:text-ink-900 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Receipt list */}
        {sorted.length === 0 ? (
          <div className="py-20 text-center bg-parchment-50 border border-ink-200 rounded-xs">
            <p className="font-body text-ink-700 text-base mb-2">No recorded receipts match these filters.</p>
            <p className="font-mono text-xs text-ink-500 mb-6">
              Try adjusting your search query, clearing category filters, or expanding the time period.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-ink-900 text-parchment-100 font-mono text-xs uppercase tracking-wider hover:bg-ink-800 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <ReceiptList receipts={sorted} onSelect={setSelectedReceipt} />
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
                const r = receipts.find((rec) => rec.id === id);
                if (r) setSelectedReceipt(r);
              }}
            />
          )}
        </Drawer>
      </div>
    </div>
  );
}
