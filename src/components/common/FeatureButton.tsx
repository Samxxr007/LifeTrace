import React from 'react';
import { Star } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { cn } from '@/lib/utils';

interface FeatureButtonProps {
  receiptId: string;
  title?: string;
  caption?: string;
  size?: number;
  className?: string;
}

export function FeatureButton({
  receiptId,
  title = 'moment',
  caption,
  size = 15,
  className,
}: FeatureButtonProps) {
  const { isFeatured, toggleFeatured } = useUserData();
  const featured = isFeatured(receiptId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFeatured(receiptId, caption);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'p-1.5 rounded-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ink-900',
        featured
          ? 'text-amber-600 bg-amber-500/15 hover:bg-amber-500/25'
          : 'text-ink-400 hover:text-ink-800 hover:bg-parchment-200/80',
        className
      )}
      title={featured ? 'Remove from profile showcase' : 'Feature on profile showcase'}
      aria-label={featured ? `Unfeature ${title}` : `Feature ${title} on profile`}
      aria-pressed={featured}
    >
      <Star
        size={size}
        className={cn('transition-transform', featured ? 'fill-amber-500 text-amber-600' : 'fill-none')}
      />
    </button>
  );
}
