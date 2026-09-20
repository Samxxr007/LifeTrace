import React from 'react';

export type StrengthFilter = 'All' | 'Strong' | 'Moderate';
export type TypeFilter = 'All' | 'Music↔Expense' | 'Music↔Transaction' | 'Within Music';

interface FilterState {
  strength: StrengthFilter;
  type: TypeFilter;
}

interface ConnectionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

export const ConnectionFilters: React.FC<ConnectionFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const strengthOptions: StrengthFilter[] = ['All', 'Strong', 'Moderate'];
  const typeOptions: TypeFilter[] = ['All', 'Music↔Expense', 'Music↔Transaction', 'Within Music'];

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-12 py-6 border-b border-ink-200">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">Strength</span>
        <div className="flex flex-wrap gap-2">
          {strengthOptions.map(opt => (
            <button
              key={opt}
              aria-pressed={filters.strength === opt}
              onClick={() => onFilterChange({ ...filters, strength: opt })}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border ${
                filters.strength === opt 
                  ? 'bg-ink-900 text-parchment-100 border-ink-900' 
                  : 'bg-transparent text-ink-600 border-ink-300 hover:border-ink-500'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">Type Pair</span>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map(opt => (
            <button
              key={opt}
              aria-pressed={filters.type === opt}
              onClick={() => onFilterChange({ ...filters, type: opt })}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border ${
                filters.type === opt 
                  ? 'bg-ink-900 text-parchment-100 border-ink-900' 
                  : 'bg-transparent text-ink-600 border-ink-300 hover:border-ink-500'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
