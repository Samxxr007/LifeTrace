import React, { useState, useMemo } from 'react';
import { useUserData } from '@/hooks/useUserData';
import type { FutureEvent, LifeReceipt } from '@/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
  Plane,
  Ticket,
  Milestone,
  ShoppingBag,
} from 'lucide-react';

interface FutureEventsViewProps {
  onSelectReceipt?: (receipt: LifeReceipt) => void;
}

export function FutureEventsView({ onSelectReceipt: _onSelectReceipt }: FutureEventsViewProps) {
  const { futureEvents, addFutureEvent, deleteFutureEvent, completeFutureEvent } = useUserData();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<FutureEvent['type']>('event');
  const [notes, setNotes] = useState('');

  const upcomingEvents = useMemo(() => {
    return futureEvents.filter((e) => e.status !== 'completed');
  }, [futureEvents]);

  const completedEvents = useMemo(() => {
    return futureEvents.filter((e) => e.status === 'completed');
  }, [futureEvents]);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setCategory('');
    setType('event');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    addFutureEvent({
      title: title.trim(),
      date: new Date(date).toISOString(),
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      category: category.trim() || 'Upcoming',
      type,
      notes: notes.trim() || undefined,
      status: 'future',
    });

    resetForm();
    setModalOpen(false);
  };

  const getCountdownText = (dateIso: string) => {
    const target = new Date(dateIso).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Past scheduled date';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 30) return `In ${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    return `In ${months} ${months === 1 ? 'month' : 'months'}`;
  };

  const getTypeIcon = (eventType: FutureEvent['type']) => {
    switch (eventType) {
      case 'travel':
        return Plane;
      case 'entertainment':
        return Ticket;
      case 'milestone':
        return Milestone;
      case 'purchase':
        return ShoppingBag;
      default:
        return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Future Events & Plans</h2>
          <p className="font-body text-xs text-ink-500 mt-0.5">
            Upcoming concerts, trips, milestones, and experiences to look forward to.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Plan Event</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-ink-900 text-ink-900 font-bold'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          Upcoming ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-ink-900 text-ink-900 font-bold'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          Completed Archive ({completedEvents.length})
        </button>
      </div>

      {/* Events Stream */}
      {activeTab === 'upcoming' ? (
        upcomingEvents.length === 0 ? (
          <div className="p-12 text-center bg-parchment-50 border border-ink-200 rounded-sm space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-parchment-200 flex items-center justify-center text-ink-500">
              <Calendar size={24} />
            </div>
            <h3 className="font-display text-lg text-ink-900">Nothing planned yet</h3>
            <p className="font-body text-xs text-ink-500 max-w-sm mx-auto">
              Add something you are looking forward to — a concert, a trip, or an upcoming milestone.
            </p>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
              Plan Your First Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((evt) => {
              const Icon = getTypeIcon(evt.type);
              const countdown = getCountdownText(evt.date);

              return (
                <div
                  key={evt.id}
                  className="p-5 bg-parchment-50 border border-ink-200 rounded-sm shadow-2xs space-y-3 hover:border-ink-400 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-800">
                          <Icon size={16} />
                        </div>
                        <div>
                          <h3 className="font-display text-base text-ink-900 font-bold">
                            {evt.title}
                          </h3>
                          <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
                            {evt.category || evt.type}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 bg-amber-600 text-white font-mono text-[10px] font-bold rounded-xs shrink-0">
                        {countdown}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-ink-600 py-1">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-ink-400" />
                        <span>
                          {formatDate(new Date(evt.date))}
                          {evt.time ? ` at ${evt.time}` : ''}
                        </span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-ink-400" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>

                    {evt.notes && (
                      <p className="text-xs font-body text-ink-700 mt-2 line-clamp-2">
                        {evt.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-ink-200">
                    <button
                      onClick={() => completeFutureEvent(evt.id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-forest-600 hover:bg-forest-700 text-white font-mono text-xs rounded-xs font-medium transition-colors"
                      title="Convert to a completed life receipt"
                    >
                      <CheckCircle size={13} />
                      <span>Mark as Experienced</span>
                    </button>

                    <button
                      onClick={() => deleteFutureEvent(evt.id)}
                      className="text-ink-400 hover:text-crimson-600 p-1 transition-colors"
                      title="Delete event"
                      aria-label={`Delete ${evt.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        completedEvents.length === 0 ? (
          <div className="p-12 text-center bg-parchment-50 border border-ink-200 rounded-sm">
            <p className="font-body text-xs text-ink-500">
              No completed events yet. When you experience an upcoming plan, click "Mark as Experienced" to archive it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 bg-parchment-50 border border-ink-200 rounded-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-500/15 flex items-center justify-center text-forest-700">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink-900">
                      {evt.title}
                    </h3>
                    <p className="font-mono text-[11px] text-ink-500">
                      Planned for: {formatDate(new Date(evt.date))}
                      {evt.completedAt && ` · Completed on ${formatDate(new Date(evt.completedAt))}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 bg-forest-100 text-forest-800 text-[10px] font-mono rounded">
                    Archived as Receipt
                  </span>
                  <button
                    onClick={() => deleteFutureEvent(evt.id)}
                    className="text-ink-400 hover:text-crimson-600 p-1"
                    title="Remove record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Plan Future Event Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Plan a Future Event"
        description="Add an upcoming experience or milestone to your timeline horizon."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-body text-ink-900">
          <div>
            <label htmlFor="future-event-title" className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Event Title *
            </label>
            <input
              id="future-event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Coldplay Concert, Tokyo Trip, Graduation"
              className="w-full px-3 py-2 bg-parchment-50 border border-ink-300 rounded-sm text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="future-event-date" className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
                Date *
              </label>
              <input
                id="future-event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm font-mono text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
                required
              />
            </div>
            <div>
              <label htmlFor="future-event-time" className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
                Time (optional)
              </label>
              <input
                id="future-event-time"
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 7:00 PM"
                className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="future-event-type" className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
                Event Type
              </label>
              <select
                id="future-event-type"
                value={type}
                onChange={(e) => setType(e.target.value as FutureEvent['type'])}
                className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
              >
                <option value="event">Event / Gathering</option>
                <option value="travel">Travel / Trip</option>
                <option value="entertainment">Entertainment / Show</option>
                <option value="milestone">Milestone / Life Goal</option>
                <option value="purchase">Planned Purchase</option>
              </select>
            </div>
            <div>
              <label htmlFor="future-event-category" className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
                Category
              </label>
              <input
                id="future-event-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Music, Vacation, Tech"
                className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="future-event-location" className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Location / Venue (optional)
            </label>
            <input
              id="future-event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. DY Patil Stadium, Mumbai"
              className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
            />
          </div>

          <div>
            <label htmlFor="future-event-notes" className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
              Notes & Preparations
            </label>
            <textarea
              id="future-event-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tickets booked, things to pack, friends joining..."
              className="w-full px-3 py-1.5 bg-parchment-50 border border-ink-300 rounded-sm text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-200">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Save Plan</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
