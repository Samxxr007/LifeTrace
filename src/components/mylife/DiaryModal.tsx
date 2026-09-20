import React, { useState, useMemo, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ReceiptTypeIcon } from '@/components/receipts/ReceiptTypeIcon';
import { useUserData } from '@/hooks/useUserData';
import type { DiaryEntry, LifeReceipt } from '@/types';
import { formatDate, formatAmount } from '@/lib/utils';
import { BookOpen, Search, X, Check, Tag, Smile } from 'lucide-react';

interface DiaryModalProps {
  open: boolean;
  onClose: () => void;
  entryToEdit?: DiaryEntry | null;
  initialDate?: string;
  initialReceiptIds?: string[];
  allReceipts: LifeReceipt[];
}

const USER_MOODS = [
  'Reflective',
  'Celebratory',
  'Focused',
  'Relaxed',
  'Grateful',
  'Curious',
  'Energetic',
  'Peaceful',
];

export function DiaryModal({
  open,
  onClose,
  entryToEdit,
  initialDate,
  initialReceiptIds = [],
  allReceipts,
}: DiaryModalProps) {
  const { addDiaryEntry } = useUserData();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [linkedReceiptIds, setLinkedReceiptIds] = useState<string[]>([]);

  // Receipt search for linker
  const [isLinkingReceipts, setIsLinkingReceipts] = useState(false);
  const [receiptSearch, setReceiptSearch] = useState('');

  useEffect(() => {
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setContent(entryToEdit.content);
      setTimestamp(entryToEdit.timestamp.slice(0, 16));
      setTagsInput(entryToEdit.tags.join(', '));
      setSelectedMood(entryToEdit.mood);
      setLinkedReceiptIds(entryToEdit.linkedReceiptIds || []);
    } else {
      const now = initialDate ? new Date(initialDate) : new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

      setTitle('');
      setContent('');
      setTimestamp(formatted);
      setTagsInput('');
      setSelectedMood(undefined);
      setLinkedReceiptIds(initialReceiptIds);
    }
    setIsLinkingReceipts(false);
    setReceiptSearch('');
  }, [entryToEdit, initialDate, initialReceiptIds, open]);

  // Find linked receipts objects
  const linkedReceipts = useMemo(() => {
    const idSet = new Set(linkedReceiptIds);
    return allReceipts.filter((r) => idSet.has(r.id));
  }, [allReceipts, linkedReceiptIds]);

  // Receipts available to search & attach
  const searchableReceipts = useMemo(() => {
    if (!receiptSearch.trim()) return allReceipts.slice(0, 30);
    const q = receiptSearch.toLowerCase();
    return allReceipts
      .filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          (r.metadata?.artist && String(r.metadata.artist).toLowerCase().includes(q)) ||
          (r.metadata?.merchant && String(r.metadata.merchant).toLowerCase().includes(q)) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.location?.city && r.location.city.toLowerCase().includes(q))
        );
      })
      .slice(0, 40);
  }, [allReceipts, receiptSearch]);

  const toggleLinkReceipt = (id: string) => {
    setLinkedReceiptIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    addDiaryEntry({
      id: entryToEdit?.id,
      title: title.trim(),
      content: content.trim(),
      timestamp: new Date(timestamp).toISOString(),
      linkedReceiptIds,
      tags: parsedTags,
      mood: selectedMood,
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={entryToEdit ? 'Edit Diary Entry' : 'New Diary Entry'}
      description="Reflect on your life moments and connect personal memories with archive receipts."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Title */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
            Entry Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. A peaceful evening walk in Indiranagar"
            className="w-full px-3 py-2 bg-parchment-50 border border-ink-300 rounded-sm text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
            required
          />
        </div>

        {/* Date & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm font-mono text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. weekend, travel, reflection"
              className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
            />
          </div>
        </div>

        {/* Optional User-Selected Mood */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Smile size={13} />
              <span>Optional Mood (User-Selected Only)</span>
            </span>
            {selectedMood && (
              <button
                type="button"
                onClick={() => setSelectedMood(undefined)}
                className="text-[11px] font-mono text-crimson-600 hover:underline"
              >
                Clear Mood
              </button>
            )}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {USER_MOODS.map((mood) => {
              const isSelected = selectedMood === mood;
              return (
                <button
                  type="button"
                  key={mood}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedMood(isSelected ? undefined : mood);
                  }}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-ink-900 text-parchment-100 border-ink-900 font-bold shadow-xs'
                      : 'bg-parchment-50 text-ink-700 border-ink-300 hover:bg-parchment-200'
                  }`}
                >
                  {isSelected && <Check size={12} className="text-parchment-100" />}
                  <span>{mood}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-mono text-ink-500 shrink-0">Or custom:</span>
            <input
              type="text"
              value={USER_MOODS.includes(selectedMood || '') ? '' : selectedMood || ''}
              onChange={(e) => setSelectedMood(e.target.value.trim() ? e.target.value : undefined)}
              placeholder="Type your own mood (e.g. Nostalgic, Melancholic)..."
              className="flex-1 px-2.5 py-1 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
            Personal Reflection & Memory *
          </label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely about what happened, what you felt, or what this day meant to you..."
            className="w-full p-3 bg-parchment-50 border border-ink-300 rounded-sm text-sm text-ink-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-ink-900"
            required
          />
        </div>

        {/* Linked Receipts Section */}
        <div className="p-3 bg-parchment-200/70 border border-ink-200 rounded-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-700 font-bold flex items-center gap-1.5">
              <Tag size={13} />
              <span>Linked Life Receipts ({linkedReceiptIds.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsLinkingReceipts(!isLinkingReceipts)}
              className="text-xs font-mono text-ink-600 hover:text-ink-900 underline"
            >
              {isLinkingReceipts ? 'Done Selecting' : '+ Attach Receipts from Archive'}
            </button>
          </div>

          {/* Currently linked chips */}
          {linkedReceipts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {linkedReceipts.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-1 px-2 py-1 bg-parchment-50 border border-ink-300 rounded-xs text-xs font-body"
                >
                  <ReceiptTypeIcon type={r.type} size={13} />
                  <span className="font-medium max-w-[150px] truncate">{r.title}</span>
                  <button
                    type="button"
                    onClick={() => toggleLinkReceipt(r.id)}
                    className="text-ink-400 hover:text-ink-900 ml-1"
                    title="Unlink receipt"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Expandable Search Picker */}
          {isLinkingReceipts && (
            <div className="mt-2 pt-2 border-t border-ink-300 space-y-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  type="text"
                  value={receiptSearch}
                  onChange={(e) => setReceiptSearch(e.target.value)}
                  placeholder="Search moments by song, place, expense, merchant..."
                  className="w-full pl-8 pr-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {searchableReceipts.map((r) => {
                  const isLinked = linkedReceiptIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => toggleLinkReceipt(r.id)}
                      className={`flex items-center justify-between p-2 rounded-xs border text-xs cursor-pointer transition-colors ${
                        isLinked
                          ? 'bg-ink-900 text-parchment-100 border-ink-900'
                          : 'bg-parchment-50 border-ink-200 hover:bg-parchment-100 text-ink-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ReceiptTypeIcon type={r.type} size={14} />
                        <span className="font-medium truncate">{r.title}</span>
                        <span className="text-[10px] opacity-70 font-mono">
                          {formatDate(new Date(r.timestamp))}
                        </span>
                      </div>
                      <div className="shrink-0 ml-2">
                        {isLinked ? (
                          <Check size={14} />
                        ) : (
                          <span className="font-mono text-[10px] text-ink-500">
                            {r.amount ? formatAmount(r.amount) : r.type}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex items-center gap-1.5">
            <BookOpen size={14} />
            <span>{entryToEdit ? 'Save Changes' : 'Save Entry'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
