import React, { useState, useMemo } from 'react';
import type { DiaryEntry, LifeReceipt } from '@/types';
import { useUserData } from '@/hooks/useUserData';
import { formatDate, formatAmount } from '@/lib/utils';
import { ReceiptTypeIcon } from '@/components/receipts/ReceiptTypeIcon';
import { Button } from '@/components/ui/Button';
import { DiaryModal } from './DiaryModal';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Tag,
  Edit2,
  Trash2,
  Paperclip,
  Smile,
} from 'lucide-react';

interface DiaryViewProps {
  allReceipts: LifeReceipt[];
  onSelectReceipt?: (receipt: LifeReceipt) => void;
}

export function DiaryView({ allReceipts, onSelectReceipt }: DiaryViewProps) {
  const { diaryEntries, deleteDiaryEntry } = useUserData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<DiaryEntry | null>(null);

  // Map of receipts for quick lookup
  const receiptMap = useMemo(() => {
    return new Map(allReceipts.map((r) => [r.id, r]));
  }, [allReceipts]);

  // All unique tags across entries
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    diaryEntries.forEach((e) => (e.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [diaryEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return diaryEntries.filter((e) => {
      const matchesSearch =
        !searchQuery.trim() ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || (e.tags && e.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [diaryEntries, searchQuery, selectedTag]);

  const handleEdit = (entry: DiaryEntry) => {
    setEntryToEdit(entry);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setEntryToEdit(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Personal Life Diary</h2>
          <p className="font-body text-xs text-ink-500 mt-0.5">
            Reflective memories linked to moments and receipts from your archive.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Entry</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-parchment-200/60 border border-ink-200 rounded-sm">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by keyword, memory, title..."
            className="w-full pl-8 pr-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mr-1">
              Tags:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded-xs font-mono text-[11px] transition-colors ${
                selectedTag === null
                  ? 'bg-ink-900 text-parchment-100 font-bold'
                  : 'bg-parchment-50 text-ink-600 hover:bg-parchment-100'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-xs font-mono text-[11px] transition-colors ${
                  selectedTag === tag
                    ? 'bg-ink-900 text-parchment-100 font-bold'
                    : 'bg-parchment-50 text-ink-600 hover:bg-parchment-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List or Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center bg-parchment-50 border border-ink-200 rounded-sm space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-parchment-200 flex items-center justify-center text-ink-500">
            <BookOpen size={24} />
          </div>
          <h3 className="font-display text-lg text-ink-900">Your story starts here</h3>
          <p className="font-body text-xs text-ink-500 max-w-sm mx-auto">
            Write your first reflection, capture a meaningful day, or attach receipts from your archive.
          </p>
          <Button variant="primary" size="sm" onClick={handleCreateNew}>
            Write First Memory
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const linked = (entry.linkedReceiptIds || [])
              .map((id) => receiptMap.get(id))
              .filter(Boolean) as LifeReceipt[];

            return (
              <article
                key={entry.id}
                className="p-5 bg-parchment-50 border border-ink-200 rounded-sm shadow-2xs space-y-4 hover:border-ink-400 transition-colors"
              >
                {/* Header: Title + Date + Mood + Actions */}
                <div className="flex items-start justify-between gap-3 border-b border-ink-200/60 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg text-ink-900">{entry.title}</h3>
                      {entry.mood && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-600/30 text-amber-900 text-[10px] font-mono rounded">
                          <Smile size={11} />
                          <span>{entry.mood}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs font-mono text-ink-500">
                      <Calendar size={12} />
                      <span>{formatDate(new Date(entry.timestamp))}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 text-ink-500 hover:text-ink-900 rounded hover:bg-parchment-200 transition-colors"
                      title="Edit entry"
                      aria-label={`Edit ${entry.title}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteDiaryEntry(entry.id)}
                      className="p-1.5 text-ink-400 hover:text-crimson-600 rounded hover:bg-parchment-200 transition-colors"
                      title="Delete entry"
                      aria-label={`Delete ${entry.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="font-body text-sm text-ink-800 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>

                {/* Attached Receipts */}
                {linked.length > 0 && (
                  <div className="pt-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-bold mb-2 flex items-center gap-1">
                      <Paperclip size={11} />
                      <span>Attached Moments ({linked.length})</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {linked.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => onSelectReceipt?.(r)}
                          className="flex items-center justify-between p-2.5 bg-parchment-100 border border-ink-200/80 rounded-xs hover:border-ink-400 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ReceiptTypeIcon type={r.type} size={15} />
                            <div className="truncate">
                              <span className="font-body text-xs font-medium text-ink-900 block truncate">
                                {r.title}
                              </span>
                              <span className="font-mono text-[10px] text-ink-500">
                                {formatDate(new Date(r.timestamp))}
                              </span>
                            </div>
                          </div>
                          {r.amount && (
                            <span className="font-mono text-xs font-semibold text-ink-800 ml-2 shrink-0">
                              {formatAmount(r.amount)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {entry.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-parchment-200 text-ink-600 text-[10px] font-mono rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Diary Modal for Create / Edit */}
      <DiaryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEntryToEdit(null);
        }}
        entryToEdit={entryToEdit}
        allReceipts={allReceipts}
      />
    </div>
  );
}
