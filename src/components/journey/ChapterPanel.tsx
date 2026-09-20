import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter } from '@/types';
import { formatCount, formatDateRange, formatAmountExact } from '@/lib/utils';

interface ChapterPanelProps {
  chapter: Chapter | null;
  onClose: () => void;
  onExploreChapter: (id: string) => void;
}

export default function ChapterPanel({ chapter, onClose, onExploreChapter }: ChapterPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && chapter && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === panelRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    let timer: any = null;
    if (chapter) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      window.addEventListener('keydown', handleKeyDown);
      timer = setTimeout(() => {
        const closeBtn = panelRef.current?.querySelector<HTMLElement>('button[aria-label="Close panel"]');
        if (closeBtn) closeBtn.focus();
        else panelRef.current?.focus();
      }, 15);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chapter, onClose]);

  return (
    <AnimatePresence>
      {chapter && (
        <motion.div
          ref={panelRef}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-parchment-100 border-l border-ink-300 shadow-2xl z-50 flex flex-col overflow-y-auto outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chapter-title"
          tabIndex={-1}
        >
          <div className="p-6 border-b border-ink-300 flex justify-between items-center sticky top-0 bg-parchment-100 z-10">
            <span className="text-label text-ink-500 tracking-widest">CHAPTER</span>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-parchment-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ink-900"
              aria-label="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="p-6 flex-1">
            <h2 id="chapter-title" className="font-display text-headline text-ink-900 mb-2 leading-tight">
              {chapter.title}
            </h2>
            <p className="font-mono text-sm text-ink-700 mb-8 pb-4 border-b border-ink-300">
              {formatDateRange(chapter.dateRange[0], chapter.dateRange[1])}
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <h4 className="text-label text-ink-500 tracking-widest mb-1">RECORDS</h4>
                <p className="font-mono text-xl">{formatCount(chapter.stats.totalReceipts)}</p>
              </div>
              {chapter.dominantCategory && (
                <div>
                  <h4 className="text-label text-ink-500 tracking-widest mb-1">TOP SIGNAL</h4>
                  <p className="font-body font-medium text-lg capitalize">{chapter.dominantCategory}</p>
                </div>
              )}
              {chapter.stats.topArtist && (
                <div>
                  <h4 className="text-label text-ink-500 tracking-widest mb-1">TOP ARTIST</h4>
                  <p className="font-body font-medium text-lg">{chapter.stats.topArtist}</p>
                </div>
              )}
              {chapter.stats.totalSpent && (
                <div>
                  <h4 className="text-label text-ink-500 tracking-widest mb-1">SPEND</h4>
                  <p className="font-mono text-xl">{formatAmountExact(chapter.stats.totalSpent)}</p>
                </div>
              )}
            </div>

            <p className="font-body text-ink-700 leading-relaxed italic mb-8 border-l-2 border-ink-300 pl-4">
              "{chapter.narrative}"
            </p>

            {/* Receipt Previews Mock */}
            <div className="mb-8">
              <h4 className="text-label text-ink-500 tracking-widest mb-4">KEY MOMENTS</h4>
              <div className="space-y-3">
                {chapter.receipts.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3 bg-parchment-200 rounded text-sm font-body">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold truncate">{r.title}</span>
                      {r.source === 'synthetic' && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                          {r.type === 'place' ? 'Cafe & Place' : r.type === 'movie' ? 'Cinema' : r.type === 'event' ? 'Event' : 'Experience'}
                        </span>
                      )}
                    </div>
                    <span className="text-ink-500 font-mono text-xs">{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-ink-300 sticky bottom-0 bg-parchment-100 z-10">
            <button
              onClick={() => onExploreChapter(chapter.id)}
              className="w-full py-4 bg-ink-900 text-parchment-100 font-mono text-sm tracking-widest uppercase hover:bg-ink-700 transition-colors focus:outline-none focus:ring-4 focus:ring-ink-300"
            >
              Explore this chapter →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
