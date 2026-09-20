import React from 'react';
import { cn } from '@/lib/utils';
// Note: Assuming TYPE_COLORS or TYPE_BG_COLORS are available in utils or types.
// We'll use hardcoded values if not strictly imported, but mapping to the design system.

export interface BadgeProps {
  type?: 'music' | 'expense' | 'transaction' | 'place' | 'entertainment' | 'note' | 'event' | string;
  source?: 'synthetic' | string;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ type, source, label, size = 'sm', className }: BadgeProps) {
  const isSynthetic = source === 'synthetic';
  
  // Custom colors mapped from principles
  const getBadgeColor = () => {
    if (isSynthetic) return 'bg-purple-100 text-purple-800'; // Specific requirement for synthetic
    
    switch (type) {
      case 'music':
        return 'bg-burnt-100 text-burnt-800';
      case 'expense':
        return 'bg-forest-100 text-forest-800';
      case 'transaction':
        return 'bg-navy-100 text-navy-800';
      default:
        return 'bg-parchment-200 text-ink-700 border border-ink-200';
    }
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono uppercase rounded-full',
        getBadgeColor(),
        sizes[size],
        className
      )}
    >
      {label}
    </span>
  );
}
