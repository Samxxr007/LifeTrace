import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiaryView } from '@/components/mylife/DiaryView';
import { DiaryModal } from '@/components/mylife/DiaryModal';
import { getDiaryEntries, saveDiaryEntry } from '@/lib/storage';
import type { LifeReceipt } from '@/types';

const mockReceipts: LifeReceipt[] = [
  {
    id: 'mock-rec-1',
    type: 'music',
    source: 'user',
    provenance: 'user-created',
    timestamp: '2024-05-15T10:00:00Z',
    title: 'Morning Jazz Track',
    tags: ['jazz'],
    metadata: {},
  },
];

describe('DiaryView & DiaryModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no diary entries exist', () => {
    render(<DiaryView allReceipts={mockReceipts} />);

    expect(screen.getByText('Your story starts here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /write first memory/i })).toBeInTheDocument();
  });

  it('renders existing diary entries with user mood and content', () => {
    saveDiaryEntry({
      title: 'Coffee in the Rain',
      content: 'Sat by the window watching the monsoon rain.',
      timestamp: '2024-07-10T15:00:00Z',
      linkedReceiptIds: ['mock-rec-1'],
      tags: ['monsoon', 'coffee'],
      mood: 'Peaceful',
    });

    render(<DiaryView allReceipts={mockReceipts} />);

    expect(screen.getByText('Coffee in the Rain')).toBeInTheDocument();
    expect(screen.getByText('Peaceful')).toBeInTheDocument();
    expect(screen.getByText('Sat by the window watching the monsoon rain.')).toBeInTheDocument();
    expect(screen.getByText('Morning Jazz Track')).toBeInTheDocument();
  });

  it('DiaryModal creates a new entry and saves user-selected mood', () => {
    const handleClose = vi.fn();
    render(
      <DiaryModal
        open={true}
        onClose={handleClose}
        allReceipts={mockReceipts}
      />
    );

    const titleInput = screen.getByPlaceholderText(/peaceful evening walk/i);
    const contentInput = screen.getByPlaceholderText(/write freely about what happened/i);

    fireEvent.change(titleInput, { target: { value: 'New Life Chapter' } });
    fireEvent.change(contentInput, { target: { value: 'Reflecting on my creative journey.' } });

    // Click mood chip "Grateful"
    const gratefulChip = screen.getByRole('button', { name: 'Grateful' });
    fireEvent.click(gratefulChip);

    const saveBtn = screen.getByRole('button', { name: /save entry/i });
    fireEvent.click(saveBtn);

    const entries = getDiaryEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].title).toBe('New Life Chapter');
    expect(entries[0].mood).toBe('Grateful');
    expect(entries[0].content).toContain('Reflecting on my creative journey');
  });
});
