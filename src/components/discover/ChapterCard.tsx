import React from 'react';
import type { Chapter } from '@/types';
import { formatDate, formatDateRange } from '@/lib/utils';

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
  onExplore: (id: string) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = React.memo(({ chapter, index, onExplore }) => {
  const formattedIndex = (index + 1).toString().padStart(2, '0');
  const [startDate, endDate] = chapter.dateRange;

  return (
    <div className="border-t border-ink-900 pt-8 pb-24 group">
      <div className="font-mono text-xs text-ink-500 tracking-widest uppercase mb-4">
        Chapter {formattedIndex}
      </div>

      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink-900 mb-4 group-hover:text-burnt-700 transition-colors">
        {chapter.title}
      </h2>

      <div className="font-mono text-sm text-ink-500 mb-12">
        {formatDateRange(startDate, endDate)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <p className="font-body text-ink-800 text-lg leading-relaxed">
            {chapter.narrative || chapter.subtitle}
          </p>
        </div>

        <div className="md:col-span-4 md:col-start-9 flex flex-col justify-end">
          <div className="font-mono text-xs text-ink-500 space-y-2 mb-8">
            <div>{chapter.stats.totalReceipts.toLocaleString()} moments recorded</div>
            {chapter.stats.topArtist && <div>Top artist: {chapter.stats.topArtist}</div>}
            {chapter.stats.topCategory && <div>Top category: {chapter.stats.topCategory}</div>}
          </div>

          <button
            onClick={() => onExplore(chapter.id)}
            className="self-start font-mono text-sm uppercase tracking-widest text-ink-900 border border-ink-900 px-6 py-3 hover:bg-ink-900 hover:text-parchment-100 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-ink-900"
          >
            Explore the evidence →
          </button>
        </div>
      </div>
    </div>
  );
});

ChapterCard.displayName = 'ChapterCard';
