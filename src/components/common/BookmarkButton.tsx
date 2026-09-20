import React from 'react';
import { Bookmark } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import type { BookmarkTargetType } from '@/types';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  targetId: string;
  targetType: BookmarkTargetType;
  title: string;
  subtitle?: string;
  note?: string;
  size?: number;
  className?: string;
}

export function BookmarkButton({
  targetId,
  targetType,
  title,
  subtitle,
  note,
  size = 15,
  className,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useUserData();
  const bookmarked = isBookmarked(targetId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(targetId, targetType, title, subtitle, note);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'p-1.5 rounded-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ink-900',
        bookmarked
          ? 'text-amber-700 bg-amber-500/15 hover:bg-amber-500/25'
          : 'text-ink-400 hover:text-ink-800 hover:bg-parchment-200/80',
        className
      )}
      title={bookmarked ? 'Remove from bookmarks' : 'Bookmark this item'}
      aria-label={bookmarked ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
      aria-pressed={bookmarked}
    >
      <Bookmark
        size={size}
        className={cn('transition-transform', bookmarked ? 'fill-amber-600' : 'fill-none')}
      />
    </button>
  );
}
