import { useState, useMemo, useEffect } from 'react';
import { LifeReceipt, SearchFilters, DEFAULT_FILTERS } from '@/types';
import Fuse from 'fuse.js';

export function useSearch(receipts: LifeReceipt[]) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [fuseIndex, setFuseIndex] = useState<Fuse<LifeReceipt> | null>(null);
  
  useEffect(() => {
    if (receipts.length > 0 && !fuseIndex) {
      const fuse = new Fuse(receipts, {
        keys: ['title', 'description', 'category', 'subcategory', 'metadata.artist', 'metadata.merchant', 'metadata.note', 'tags'],
        threshold: 0.3
      });
      setFuseIndex(fuse);
    }
  }, [receipts, fuseIndex]);
  
  const results = useMemo(() => {
    let filtered = receipts;
    
    if (filters.query && fuseIndex) {
      filtered = fuseIndex.search(filters.query).map((r: any) => r.item);
    }
    
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(r => filters.types.includes(r.type));
    }
    
    if (filters.sources && filters.sources.length > 0) {
      filtered = filtered.filter(r => filters.sources.includes(r.source));
    }
    
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(r => r.category && filters.categories.includes(r.category));
    }
    
    if (filters.amountRange && (filters.amountRange[0] !== null || filters.amountRange[1] !== null)) {
      filtered = filtered.filter(r => {
        if (r.amount === undefined) return false;
        const min = filters.amountRange[0] !== null ? filters.amountRange[0] : -Infinity;
        const max = filters.amountRange[1] !== null ? filters.amountRange[1] : Infinity;
        return r.amount >= min && r.amount <= max;
      });
    }
    
    if (filters.dateRange && (filters.dateRange[0] !== null || filters.dateRange[1] !== null)) {
      filtered = filtered.filter(r => {
        const t = new Date(r.timestamp).getTime();
        const min = filters.dateRange[0] !== null ? new Date(filters.dateRange[0]).getTime() : -Infinity;
        const max = filters.dateRange[1] !== null ? new Date(filters.dateRange[1]).getTime() : Infinity;
        return t >= min && t <= max;
      });
    }
    
    return filtered;
  }, [receipts, filters, fuseIndex]);
  
  const isFiltered = useMemo(() => {
    return filters.query !== '' || 
           (filters.types && filters.types.length > 0) || 
           (filters.sources && filters.sources.length > 0) || 
           (filters.categories && filters.categories.length > 0) ||
           (filters.amountRange && (filters.amountRange[0] !== null || filters.amountRange[1] !== null)) ||
           (filters.dateRange && (filters.dateRange[0] !== null || filters.dateRange[1] !== null));
  }, [filters]);
  
  return { results, filters, setFilters, totalCount: results.length, isFiltered };
}
