import React, { useState, useMemo, useEffect } from 'react';
import { useLifeData } from '@/hooks/useLifeData';
import { useUserData } from '@/hooks/useUserData';
import * as storage from '@/lib/storage';
import { useConnections } from '@/hooks/useConnections';
import { getConnectionsForReceipt } from '@/engine/connections';
import { formatDate, formatAmount } from '@/lib/utils';
import { ReceiptTypeIcon } from '@/components/receipts/ReceiptTypeIcon';
import { ReceiptCard } from '@/components/receipts/ReceiptCard';
import { ReceiptDetail } from '@/components/receipts/ReceiptDetail';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { DiaryView } from '@/components/mylife/DiaryView';
import { FutureEventsView } from '@/components/mylife/FutureEventsView';
import { AddReceiptDialog } from '@/components/receipts/AddReceiptDialog';
import { DiaryModal } from '@/components/mylife/DiaryModal';
import { FeatureButton } from '@/components/common/FeatureButton';
import { BookmarkButton } from '@/components/common/BookmarkButton';
import type { LifeReceipt } from '@/types';
import {
  Star,
  Bookmark,
  BookOpen,
  Calendar,
  Plus,
  Edit3,
  Check,
  Sparkles,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type MyLifeTab = 'diary' | 'bookmarks' | 'my-receipts' | 'future' | 'saved-views';

export default function MyLife() {
  const navigate = useNavigate();
  const { receipts } = useLifeData();
  const { connections } = useConnections(receipts);
  const {
    userReceipts,
    diaryEntries,
    bookmarks,
    featuredItems,
    savedViews,
    futureEvents,
    profile,
    updateProfile,
    deleteUserReceipt,
    deleteSavedView,
    resetSampleData,
    refreshAll,
  } = useUserData();

  const [activeTab, setActiveTab] = useState<MyLifeTab>('diary');
  const [selectedReceipt, setSelectedReceipt] = useState<LifeReceipt | null>(null);

  // Automatically initialize sample archive data if any collection is empty
  useEffect(() => {
    if (
      userReceipts.length === 0 ||
      bookmarks.length === 0 ||
      futureEvents.length === 0 ||
      savedViews.length === 0 ||
      diaryEntries.length === 0
    ) {
      storage.seedSampleUserData(true);
      refreshAll();
    }
  }, [userReceipts.length, bookmarks.length, futureEvents.length, savedViews.length, diaryEntries.length, refreshAll]);

  // Dialog states
  const [addReceiptOpen, setAddReceiptOpen] = useState(false);
  const [diaryModalOpen, setDiaryModalOpen] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.displayName);
  const [editBio, setEditBio] = useState(profile.bio);

  const handleSaveProfile = () => {
    updateProfile({
      displayName: editName.trim() || profile.displayName,
      bio: editBio.trim() || profile.bio,
    });
    setIsEditingProfile(false);
  };

  // Receipt lookup map
  const receiptMap = useMemo(() => {
    return new Map(receipts.map((r) => [r.id, r]));
  }, [receipts]);

  // Featured receipts objects
  const featuredReceipts = useMemo(() => {
    return featuredItems
      .map((item) => receiptMap.get(item.receiptId))
      .filter(Boolean) as LifeReceipt[];
  }, [featuredItems, receiptMap]);

  // Bookmarked receipts objects
  const bookmarkedReceipts = useMemo(() => {
    return bookmarks
      .map((b) => ({
        bookmark: b,
        receipt: receiptMap.get(b.targetId),
      }))
      .filter((b) => Boolean(b.receipt));
  }, [bookmarks, receiptMap]);

  // Active connections for selected receipt
  const receiptConnections = useMemo(() => {
    if (!selectedReceipt) return [];
    return getConnectionsForReceipt(selectedReceipt.id, connections);
  }, [selectedReceipt, connections]);

  const upcomingCount = futureEvents.filter((e) => e.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 font-body pt-8 pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Profile Header & Stats */}
        <header className="p-6 md:p-8 bg-parchment-50 border border-ink-300 rounded-sm shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <span className="font-mono text-xs uppercase tracking-widest text-ink-500 block">
                Personal Archive & Memory Hub
              </span>

              {isEditingProfile ? (
                <div className="space-y-3 pt-1 max-w-md">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-parchment-100 border border-ink-300 rounded-sm font-display text-xl text-ink-900"
                    placeholder="Your Name / Alias"
                  />
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3 py-1.5 bg-parchment-100 border border-ink-300 rounded-sm text-xs text-ink-900"
                    placeholder="Short bio or archival goal..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={handleSaveProfile}>
                      <Check size={13} className="mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-display text-3xl md:text-4xl text-ink-900 font-bold">
                      {profile.displayName}
                    </h1>
                    <button
                      onClick={() => {
                        setEditName(profile.displayName);
                        setEditBio(profile.bio);
                        setIsEditingProfile(true);
                      }}
                      className="p-1 text-ink-400 hover:text-ink-900 rounded transition-colors"
                      title="Edit Profile"
                      aria-label="Edit Profile"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                  <p className="font-body text-sm text-ink-600 max-w-xl mt-1 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetSampleData();
                }}
                className="flex items-center gap-1.5 border-amber-600/50 bg-amber-50/80 text-amber-900 hover:bg-amber-100 hover:border-amber-700 transition-all font-medium"
                title="Sync and restore curated sample moments, diary entries, bookmarks, and future plans"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>Sync Sample Archive</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAddReceiptOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>+ Add Receipt</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiaryModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                <span>Write Diary</span>
              </Button>
            </div>
          </div>

          {/* Archival Summary Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-ink-200">
            <div className="p-3 bg-parchment-100 border border-ink-200/80 rounded-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
                Total Moments
              </span>
              <span className="font-display text-2xl text-ink-900 font-bold">
                {receipts.length.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-parchment-100 border border-ink-200/80 rounded-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
                My Receipts
              </span>
              <span className="font-display text-2xl text-burnt-600 font-bold">
                {userReceipts.length}
              </span>
            </div>
            <div className="p-3 bg-parchment-100 border border-ink-200/80 rounded-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
                Diary Entries
              </span>
              <span className="font-display text-2xl text-forest-600 font-bold">
                {diaryEntries.length}
              </span>
            </div>
            <div className="p-3 bg-parchment-100 border border-ink-200/80 rounded-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
                Bookmarks
              </span>
              <span className="font-display text-2xl text-amber-700 font-bold">
                {bookmarks.length}
              </span>
            </div>
            <div className="p-3 bg-parchment-100 border border-ink-200/80 rounded-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
                Featured
              </span>
              <span className="font-display text-2xl text-amber-600 font-bold">
                {featuredItems.length}
              </span>
            </div>
            <div className="p-3 bg-parchment-100 border border-ink-200/80 rounded-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">
                Upcoming Plans
              </span>
              <span className="font-display text-2xl text-navy-700 font-bold">
                {upcomingCount}
              </span>
            </div>
          </div>
        </header>

        {/* PROMINENT FEATURED MOMENTS SHOWCASE (Before Deeper Tabs) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={18} className="fill-amber-500 text-amber-600" />
              <h2 className="font-display text-xl md:text-2xl text-ink-900 font-bold">
                Featured Moments Showcase
              </h2>
            </div>
            <span className="font-mono text-xs text-ink-500">
              {featuredReceipts.length} Featured
            </span>
          </div>

          {featuredReceipts.length === 0 ? (
            <div className="p-8 text-center bg-parchment-50 border border-ink-200 rounded-sm space-y-2">
              <p className="font-display text-base text-ink-800">Nothing featured yet.</p>
              <p className="font-body text-xs text-ink-500 max-w-md mx-auto">
                Feature a moment to showcase it on your profile. Star any song, expense, or memory in
                Explore or Journey to pin it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredReceipts.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReceipt(r)}
                  className="p-4 bg-parchment-50 border border-amber-600/30 rounded-sm shadow-2xs hover:border-amber-600 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-parchment-200 flex items-center justify-center shrink-0">
                          <ReceiptTypeIcon type={r.type} size={16} />
                        </div>
                        <span className="font-mono text-[10px] uppercase text-ink-500 tracking-wider">
                          {r.category || r.type}
                        </span>
                      </div>
                      <FeatureButton receiptId={r.id} title={r.title} size={15} />
                    </div>

                    <h3 className="font-display text-base text-ink-900 font-bold line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="font-mono text-[11px] text-ink-500">
                      {formatDate(new Date(r.timestamp))}
                      {r.location?.city ? ` · ${r.location.city}` : ''}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-ink-200 flex items-center justify-between text-xs">
                    {r.amount ? (
                      <span className="font-mono font-bold text-ink-900">
                        {formatAmount(r.amount)}
                      </span>
                    ) : r.metadata?.artist ? (
                      <span className="font-body text-ink-600 truncate max-w-[150px]">
                        {String(r.metadata.artist)}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-ink-400 uppercase">
                        {r.source}
                      </span>
                    )}

                    <span className="font-mono text-[11px] text-amber-700 flex items-center gap-0.5">
                      <span>View</span>
                      <ExternalLink size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DEEPER TABS SECTION */}
        <section className="space-y-6 pt-4">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap border-b border-ink-300 gap-1">
            {[
              { id: 'diary', label: `Personal Diary (${diaryEntries.length})`, icon: BookOpen },
              { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})`, icon: Bookmark },
              { id: 'my-receipts', label: `My Receipts (${userReceipts.length})`, icon: Sparkles },
              { id: 'future', label: `Future Plans (${upcomingCount})`, icon: Calendar },
              { id: 'saved-views', label: `Saved Views (${savedViews.length})`, icon: Bookmark },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MyLifeTab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors ${
                    isActive
                      ? 'border-ink-900 text-ink-900 font-bold bg-parchment-200/50'
                      : 'border-transparent text-ink-500 hover:text-ink-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Personal Diary */}
          {activeTab === 'diary' && (
            <DiaryView
              allReceipts={receipts}
              onSelectReceipt={(r) => setSelectedReceipt(r)}
            />
          )}

          {/* Tab 2: Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-ink-900">Bookmarked Moments</h3>
                <span className="font-mono text-xs text-ink-500">
                  {bookmarkedReceipts.length} moments saved
                </span>
              </div>

              {bookmarkedReceipts.length === 0 ? (
                <div className="p-12 text-center bg-parchment-50 border border-ink-200 rounded-sm space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-parchment-200 flex items-center justify-center text-ink-400">
                    <Bookmark size={22} />
                  </div>
                  <h4 className="font-display text-base text-ink-800">No saved moments yet</h4>
                  <p className="font-body text-xs text-ink-500 max-w-sm mx-auto">
                    When something catches your attention in Explore or Journey, bookmark it to find
                    it here later.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/explore')}
                    className="mt-2"
                  >
                    Browse Explore
                  </Button>
                </div>
              ) : (
                <div className="bg-parchment-50 border border-ink-200 rounded-sm divide-y divide-ink-200">
                  {bookmarkedReceipts.map(({ bookmark, receipt }) => {
                    if (!receipt) return null;
                    return (
                      <ReceiptCard
                        key={bookmark.id}
                        receipt={receipt}
                        onClick={() => setSelectedReceipt(receipt)}
                        showSource
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: My Receipts */}
          {activeTab === 'my-receipts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-ink-900">Personal Receipts Added</h3>
                  <p className="font-body text-xs text-ink-500">
                    Moments, expenses, and notes you created directly into your archive.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setAddReceiptOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>+ Add Receipt</span>
                </Button>
              </div>

              {userReceipts.length === 0 ? (
                <div className="p-12 text-center bg-parchment-50 border border-ink-200 rounded-sm space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-parchment-200 flex items-center justify-center text-ink-400">
                    <Sparkles size={22} />
                  </div>
                  <h4 className="font-display text-base text-ink-800">No personal receipts yet</h4>
                  <p className="font-body text-xs text-ink-500 max-w-sm mx-auto">
                    Your archive holds your historical records. Add your first personal receipt to
                    bridge past and present.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAddReceiptOpen(true)}
                    className="mt-2"
                  >
                    Add Your First Receipt
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userReceipts.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 bg-parchment-50 border border-ink-200 rounded-sm flex items-center justify-between gap-4 hover:border-ink-400 transition-colors"
                    >
                      <div
                        onClick={() => setSelectedReceipt(r)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-parchment-200 flex items-center justify-center shrink-0">
                          <ReceiptTypeIcon type={r.type} size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-body text-sm font-medium text-ink-900 truncate">
                            {r.title}
                          </h4>
                          <span className="font-mono text-[11px] text-ink-500">
                            {formatDate(new Date(r.timestamp))} · {r.category || r.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {r.amount && (
                          <span className="font-mono text-xs font-semibold text-ink-900">
                            {formatAmount(r.amount)}
                          </span>
                        )}
                        <BookmarkButton
                          targetId={r.id}
                          targetType="receipt"
                          title={r.title}
                          size={14}
                        />
                        <FeatureButton receiptId={r.id} title={r.title} size={14} />
                        <button
                          onClick={() => deleteUserReceipt(r.id)}
                          className="p-1 text-ink-400 hover:text-crimson-600 transition-colors"
                          title="Delete receipt"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Future Plans */}
          {activeTab === 'future' && (
            <FutureEventsView onSelectReceipt={(r) => setSelectedReceipt(r)} />
          )}

          {/* Tab 5: Saved Views */}
          {activeTab === 'saved-views' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-ink-900">Saved Exploration Views</h3>
                  <p className="font-body text-xs text-ink-500">
                    Named search filters and query snapshots you can restore at any time.
                  </p>
                </div>
              </div>

              {savedViews.length === 0 ? (
                <div className="p-12 text-center bg-parchment-50 border border-ink-200 rounded-sm space-y-2">
                  <p className="font-body text-xs text-ink-500">
                    No saved views yet. Go to Explore, set up your desired filters, and click "Saved
                    Views → Save Current".
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/explore')}
                    className="mt-2"
                  >
                    Go to Explore
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedViews.map((view) => (
                    <div
                      key={view.id}
                      className="p-4 bg-parchment-50 border border-ink-200 rounded-sm flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-display text-base text-ink-900 font-bold">
                          {view.name}
                        </h4>
                        <span className="font-mono text-[11px] text-ink-500">
                          Saved on {formatDate(new Date(view.createdAt))} · Type: {view.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/explore')}
                          className="text-xs"
                        >
                          Open in Explore
                        </Button>
                        <button
                          onClick={() => deleteSavedView(view.id)}
                          className="p-1.5 text-ink-400 hover:text-crimson-600 transition-colors"
                          title="Delete saved view"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Receipt Detail Drawer */}
        <Drawer
          open={selectedReceipt !== null}
          onClose={() => setSelectedReceipt(null)}
          title="Moment Detail"
        >
          {selectedReceipt && (
            <ReceiptDetail
              receipt={selectedReceipt}
              connections={receiptConnections}
              allReceipts={receipts}
              onClose={() => setSelectedReceipt(null)}
              onReceiptClick={(id) => {
                const r = receiptMap.get(id);
                if (r) setSelectedReceipt(r);
              }}
            />
          )}
        </Drawer>

        {/* Global Dialogs */}
        <AddReceiptDialog
          open={addReceiptOpen}
          onClose={() => setAddReceiptOpen(false)}
        />

        <DiaryModal
          open={diaryModalOpen}
          onClose={() => setDiaryModalOpen(false)}
          allReceipts={receipts}
        />
      </div>
    </div>
  );
}
