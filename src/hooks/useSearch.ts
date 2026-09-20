import { useState, useMemo } from 'react';
import type { LifeReceipt, SearchFilters } from '@/types';
import { DEFAULT_FILTERS } from '@/types';
import { searchReceipts } from '@/engine/search';

export function useSearch(receipts: LifeReceipt[]) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const results = useMemo(() => {
    return searchReceipts(receipts, filters);
  }, [receipts, filters]);

  const isFiltered = useMemo(() => {
    return (
      filters.query !== '' ||
      (filters.types && filters.types.length > 0) ||
      (filters.sources && filters.sources.length > 0) ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.amountRange && (filters.amountRange[0] !== null || filters.amountRange[1] !== null)) ||
      (filters.dateRange && (filters.dateRange[0] !== null || filters.dateRange[1] !== null))
    );
  }, [filters]);

  return { results, filters, setFilters, totalCount: results.length, isFiltered };
}
