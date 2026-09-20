import React, { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import type { SavedView, SearchFilters } from '@/types';
import { Bookmark, Save, Trash2, Check, ChevronDown } from 'lucide-react';

interface SavedViewsMenuProps {
  currentFilters: SearchFilters;
  currentSort: string;
  currentPeriod: string;
  onApplyView: (view: SavedView) => void;
}

export function SavedViewsMenu({
  currentFilters,
  currentSort,
  currentPeriod,
  onApplyView,
}: SavedViewsMenuProps) {
  const { savedViews, saveView, deleteSavedView } = useUserData();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewName, setViewName] = useState('');

  const exploreViews = savedViews.filter((v) => v.type === 'explore');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = viewName.trim();
    if (!trimmed) return;

    saveView(trimmed, 'explore', {
      ...currentFilters,
      sortOrder: currentSort,
      selectedPeriod: currentPeriod,
    } as any);

    setViewName('');
    setIsSaving(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment-200 border border-ink-300 rounded-xs text-xs font-mono text-ink-800 hover:bg-parchment-300 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bookmark size={13} className="text-amber-700" />
        <span>Saved Views ({exploreViews.length})</span>
        <ChevronDown size={13} className="text-ink-500" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-64 bg-parchment-50 border border-ink-300 rounded-sm shadow-lg z-30 p-2 space-y-2 font-body"
          role="menu"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-ink-200">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-bold">
              Saved Filter Views
            </span>
            <button
              onClick={() => setIsSaving(!isSaving)}
              className="font-mono text-[10px] text-ink-700 hover:text-ink-900 underline flex items-center gap-0.5"
            >
              <Save size={10} />
              <span>{isSaving ? 'Cancel' : '+ Save Current'}</span>
            </button>
          </div>

          {isSaving && (
            <form onSubmit={handleSave} className="p-1.5 bg-parchment-200/80 rounded-xs space-y-1.5">
              <label htmlFor="saved-view-name" className="sr-only">
                Saved view name
              </label>
              <input
                id="saved-view-name"
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="View name (e.g. 2017 Coffee & Music)"
                aria-label="Saved view name"
                className="w-full px-2 py-1 bg-parchment-50 border border-ink-300 rounded-xs text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-1 bg-ink-900 text-parchment-100 text-[11px] font-mono uppercase tracking-wider rounded-xs hover:bg-ink-800"
              >
                Save View
              </button>
            </form>
          )}

          {exploreViews.length === 0 ? (
            <div className="py-3 text-center text-xs text-ink-500">
              No saved views yet. Customize filters above and click "+ Save Current".
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {exploreViews.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-2 rounded-xs hover:bg-parchment-200/80 transition-colors group text-xs"
                >
                  <button
                    onClick={() => {
                      onApplyView(view);
                      setIsOpen(false);
                    }}
                    className="text-left font-medium text-ink-900 hover:text-ink-950 flex-1 truncate mr-2"
                  >
                    {view.name}
                  </button>
                  <button
                    onClick={() => deleteSavedView(view.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-crimson-600 p-1"
                    title="Delete saved view"
                    aria-label={`Delete ${view.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
