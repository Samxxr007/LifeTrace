import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ReceiptTypeIcon } from './ReceiptTypeIcon';
import { useUserData } from '@/hooks/useUserData';
import { generateId } from '@/lib/storage';
import type { ReceiptType, LifeReceipt } from '@/types';
import { Sparkles, Check, AlertCircle } from 'lucide-react';

interface AddReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  initialType?: ReceiptType;
  initialDate?: string;
}

const DOMAINS: { type: ReceiptType; label: string; desc: string }[] = [
  { type: 'music', label: 'Music', desc: 'Song, album, or listening session' },
  { type: 'expense', label: 'Expense', desc: 'Household bill, grocery, or dining' },
  { type: 'transaction', label: 'Transaction', desc: 'Card swipe, online purchase' },
  { type: 'place', label: 'Place', desc: 'Cafe, park, venue, or city visit' },
  { type: 'movie', label: 'Movie', desc: 'Cinema screening, streaming night' },
  { type: 'event', label: 'Event', desc: 'Concert, conference, or meetup' },
  { type: 'photo', label: 'Photo', desc: 'Visual moment or memory capture' },
  { type: 'message', label: 'Message', desc: 'Conversation excerpt or note' },
  { type: 'search', label: 'Search', desc: 'Curiosity trace or research query' },
  { type: 'note', label: 'Note', desc: 'Thought, reflection, or memo' },
];

export function AddReceiptDialog({
  open,
  onClose,
  initialType = 'expense',
  initialDate,
}: AddReceiptDialogProps) {
  const { addUserReceipt } = useUserData();

  const [selectedType, setSelectedType] = useState<ReceiptType>(initialType);
  const [title, setTitle] = useState('');
  const [timestamp, setTimestamp] = useState(() => {
    if (initialDate) return initialDate.slice(0, 16);
    const now = new Date();
    // Format YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  });
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Domain-specific state
  // Music
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [platform, setPlatform] = useState('Spotify');
  const [durationMin, setDurationMin] = useState('3');
  const [skipped, setSkipped] = useState(false);

  // Expense & Transaction
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [merchant, setMerchant] = useState('');

  // Location / Place
  const [placeName, setPlaceName] = useState('');
  const [city, setCity] = useState('');

  // Other details
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle('');
    setTagsInput('');
    setArtist('');
    setAlbum('');
    setAmount('');
    setCategory('');
    setSubcategory('');
    setMerchant('');
    setPlaceName('');
    setCity('');
    setNotes('');
    setSkipped(false);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please provide a title or description for this moment.');
      return;
    }

    if (!timestamp) {
      setError('Please select a valid date and time.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const isoDate = new Date(timestamp).toISOString();

    const newReceipt: LifeReceipt = {
      id: generateId(),
      type: selectedType,
      source: 'user',
      provenance: 'user-created',
      timestamp: isoDate,
      title: trimmedTitle,
      tags: Array.from(new Set(['user-created', selectedType, ...parsedTags])),
      metadata: {},
    };

    // Populate domain-specific metadata
    if (selectedType === 'music') {
      newReceipt.metadata = {
        artist: artist.trim() || undefined,
        album: album.trim() || undefined,
        platform,
        msPlayed: (parseInt(durationMin, 10) || 3) * 60 * 1000,
        skipped,
      };
      newReceipt.category = 'Music';
    } else if (selectedType === 'expense') {
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        newReceipt.amount = parsedAmount;
      }
      newReceipt.currency = 'INR';
      newReceipt.category = category.trim() || 'Expense';
      newReceipt.subcategory = subcategory.trim() || undefined;
      newReceipt.metadata = {
        paymentMode,
        note: notes.trim() || undefined,
      };
    } else if (selectedType === 'transaction') {
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        newReceipt.amount = parsedAmount;
      }
      newReceipt.currency = 'INR';
      newReceipt.category = category.trim() || 'Shopping';
      newReceipt.metadata = {
        merchant: merchant.trim() || trimmedTitle,
      };
      if (city.trim()) {
        newReceipt.location = { city: city.trim() };
      }
    } else if (selectedType === 'place') {
      newReceipt.location = {
        locationName: placeName.trim() || trimmedTitle,
        city: city.trim() || undefined,
      };
      newReceipt.metadata = {
        placeName: placeName.trim() || trimmedTitle,
        note: notes.trim() || undefined,
      };
      newReceipt.category = 'Place';
    } else if (selectedType === 'movie') {
      newReceipt.metadata = {
        movie: trimmedTitle,
        platform: merchant.trim() || 'Cinema',
        note: notes.trim() || undefined,
      };
      newReceipt.category = 'Entertainment';
    } else if (selectedType === 'event') {
      newReceipt.location = {
        locationName: placeName.trim() || undefined,
        city: city.trim() || undefined,
      };
      newReceipt.category = category.trim() || 'Event';
      newReceipt.metadata = {
        notes: notes.trim() || undefined,
      };
    } else if (selectedType === 'photo') {
      newReceipt.metadata = {
        photoCaption: trimmedTitle,
        locationName: placeName.trim() || undefined,
      };
      newReceipt.category = 'Photo';
    } else if (selectedType === 'message') {
      newReceipt.metadata = {
        messageText: notes.trim() || trimmedTitle,
        platform,
      };
      newReceipt.category = 'Communication';
    } else if (selectedType === 'search') {
      newReceipt.metadata = {
        searchQuery: trimmedTitle,
      };
      newReceipt.category = 'Search';
    } else if (selectedType === 'note') {
      newReceipt.description = notes.trim() || undefined;
      newReceipt.category = 'Note';
    }

    try {
      addUserReceipt(newReceipt);
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 700);
    } catch (err) {
      setError('Could not save receipt. Storage might be full.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add Life Receipt"
      description="Record a personal moment, expense, song, or milestone into your archive."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {error && (
          <div
            className="flex items-center gap-2 p-3 bg-crimson-500/10 border border-crimson-500/30 text-crimson-700 text-xs font-mono rounded"
            role="alert"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="flex items-center gap-2 p-3 bg-forest-500/10 border border-forest-500/30 text-forest-700 text-xs font-mono rounded"
            role="status"
          >
            <Check size={16} />
            <span>Moment archived into your unified life pool!</span>
          </div>
        )}

        {/* Domain Selector */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-500 mb-2">
            Select Domain
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DOMAINS.map((d) => {
              const isSelected = selectedType === d.type;
              return (
                <button
                  type="button"
                  key={d.type}
                  onClick={() => setSelectedType(d.type)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-sm border text-left transition-all ${
                    isSelected
                      ? 'bg-ink-900 text-parchment-100 border-ink-900 shadow-sm'
                      : 'bg-parchment-50 border-ink-200 text-ink-700 hover:bg-parchment-200/80 hover:border-ink-400'
                  }`}
                  aria-pressed={isSelected}
                >
                  <ReceiptTypeIcon
                    type={d.type}
                    size={18}
                    className={isSelected ? 'text-parchment-100' : undefined}
                  />
                  <span className="text-xs font-medium mt-1">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Common Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Title / Description *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                selectedType === 'music'
                  ? 'e.g. Video Games'
                  : selectedType === 'expense'
                  ? 'e.g. Blue Tokai Cold Brew'
                  : selectedType === 'place'
                  ? 'e.g. Cubbon Park Morning Walk'
                  : selectedType === 'movie'
                  ? 'e.g. Oppenheimer'
                  : 'Title or primary label'
              }
              className="w-full px-3 py-2 bg-parchment-50 border border-ink-300 rounded-sm text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 bg-parchment-50 border border-ink-300 rounded-sm font-mono text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. coffee, friends, weekend"
              className="w-full px-3 py-2 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
            />
          </div>
        </div>

        {/* Adaptive Domain Fields */}
        <div className="p-4 bg-parchment-200/60 rounded-sm border border-ink-200/80 space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500 font-bold block">
            {selectedType.toUpperCase()} DETAILS
          </span>

          {selectedType === 'music' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-ink-600 mb-1">Artist</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Lana Del Rey"
                  className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-ink-600 mb-1">Album</label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="e.g. Born To Die"
                  className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-ink-600 mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                >
                  <option value="Spotify">Spotify</option>
                  <option value="Apple Music">Apple Music</option>
                  <option value="YouTube Music">YouTube Music</option>
                  <option value="Vinyl">Vinyl Record</option>
                  <option value="Radio">Radio</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-700">
                  <input
                    type="checkbox"
                    checked={skipped}
                    onChange={(e) => setSkipped(e.target.checked)}
                    className="rounded border-ink-400 text-ink-900 focus:ring-ink-900"
                  />
                  <span>Skipped track</span>
                </label>
              </div>
            </div>
          )}

          {(selectedType === 'expense' || selectedType === 'transaction') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-ink-600 mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-ink-600 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Food, Travel, Utilities"
                  className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                />
              </div>
              {selectedType === 'expense' && (
                <div>
                  <label className="block text-[11px] font-mono text-ink-600 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                  >
                    <option value="UPI">UPI / Google Pay</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              )}
              {selectedType === 'transaction' && (
                <div>
                  <label className="block text-[11px] font-mono text-ink-600 mb-1">Merchant</label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. Starbucks Coffee"
                    className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {(selectedType === 'place' || selectedType === 'event') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-ink-600 mb-1">
                  {selectedType === 'place' ? 'Venue / Place Name' : 'Venue / Location'}
                </label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. Third Wave Coffee Roasters"
                  className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-ink-600 mb-1">City / State</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-ink-600 mb-1">
              {selectedType === 'message'
                ? 'Message Excerpt'
                : selectedType === 'note'
                ? 'Note Content'
                : 'Additional Notes'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details or context you want to remember..."
              className="w-full px-2.5 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Save Receipt</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
