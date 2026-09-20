import React from 'react';

export type StrengthFilter = 'All' | 'Strong' | 'Moderate';
export type TypeFilter = 'All' | 'Music↔Expense' | 'Music↔Transaction' | 'Within Music';

export interface FilterState {
  strength: StrengthFilter;
  type: TypeFilter;
}

interface ConnectionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  strengthCounts?: Record<StrengthFilter, number>;
  typeCounts?: Record<TypeFilter, number>;
}

export const ConnectionFilters: React.FC<ConnectionFiltersProps> = ({
  filters,
  onFilterChange,
  strengthCounts,
  typeCounts,
}) => {
  const strengthOptions: { id: StrengthFilter; label: string }[] = [
    { id: 'All', label: 'All' },
    { id: 'Strong', label: 'Strong' },
    { id: 'Moderate', label: 'Moderate' },
  ];

  const typeOptions: { id: TypeFilter; label: string }[] = [
    { id: 'All', label: 'All' },
    { id: 'Music↔Expense', label: 'Music ↔ Expense' },
    { id: 'Music↔Transaction', label: 'Music ↔ Transaction' },
    { id: 'Within Music', label: 'Within Music' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-12 py-6 border-b border-ink-200">
      {/* Strength Filter */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Strength
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by connection strength">
          {strengthOptions.map((opt) => {
            const isSelected = filters.strength === opt.id;
            const count = strengthCounts ? strengthCounts[opt.id] : undefined;
            return (
              <button
                key={opt.id}
                aria-pressed={isSelected}
                onClick={() => onFilterChange({ ...filters, strength: opt.id })}
                className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-ink-900 text-parchment-100 border-ink-900 font-bold'
                    : 'bg-transparent text-ink-700 border-ink-300 hover:border-ink-600'
                }`}
              >
                <span>{opt.label}</span>
                {count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-xs ${
                      isSelected ? 'bg-ink-700 text-parchment-200' : 'bg-parchment-300 text-ink-600'
                    }`}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type Pair Filter */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Type Pair
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by domain relationship">
          {typeOptions.map((opt) => {
            const isSelected = filters.type === opt.id;
            const count = typeCounts ? typeCounts[opt.id] : undefined;
            return (
              <button
                key={opt.id}
                aria-pressed={isSelected}
                onClick={() => onFilterChange({ ...filters, type: opt.id })}
                className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-ink-900 text-parchment-100 border-ink-900 font-bold'
                    : 'bg-transparent text-ink-700 border-ink-300 hover:border-ink-600'
                }`}
              >
                <span>{opt.label}</span>
                {count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-xs ${
                      isSelected ? 'bg-ink-700 text-parchment-200' : 'bg-parchment-300 text-ink-600'
                    }`}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
