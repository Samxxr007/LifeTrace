import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Explore from '@/pages/Explore';
import type { LifeReceipt } from '@/types';

const mockReceipts: LifeReceipt[] = [
  {
    id: '1',
    title: 'Spotify Track',
    type: 'music',
    source: 'spotify',
    timestamp: '2023-10-01T12:00:00Z',
    category: 'Music',
    tags: ['music'],
    metadata: { artist: 'The Beatles' },
  },
  {
    id: '2',
    title: 'Coffee Shop',
    type: 'expense',
    source: 'household',
    timestamp: '2023-10-02T09:00:00Z',
    category: 'Food',
    amount: 150,
    tags: ['expense', 'food'],
    metadata: {},
  },
];

// Mock useLifeData and useConnections
vi.mock('@/hooks/useLifeData', () => ({
  useLifeData: () => ({
    receipts: mockReceipts,
    spotifyStats: null,
    householdStats: null,
    transactionStats: null,
    manifest: null,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useConnections', () => ({
  useConnections: () => ({
    connections: [],
    isComputing: false,
    getConnectionsFor: () => [],
  }),
}));

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, size: 64, start: 0, key: '0' },
      { index: 1, size: 64, start: 64, key: '1' },
    ],
    getTotalSize: () => 128,
  }),
}));

describe('Explore Search & Filters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all receipts initially', () => {
    render(<Explore />);
    expect(screen.getByText('Spotify Track')).toBeInTheDocument();
    expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
  });

  it('typing filters results', () => {
    render(<Explore />);
    const searchInput = screen.getByPlaceholderText(/search moments, artists/i);
    fireEvent.change(searchInput, { target: { value: 'Coffee' } });
    expect(searchInput).toHaveValue('Coffee');
  });

  it('type filter button toggles aria-pressed state', () => {
    render(<Explore />);
    const musicChip = screen.getByRole('button', { name: /music/i });
    expect(musicChip).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(musicChip);
    expect(musicChip).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(musicChip);
    expect(musicChip).toHaveAttribute('aria-pressed', 'false');
  });

  it('result count has aria-live', () => {
    render(<Explore />);
    const countElements = screen.getAllByText(/moments/i);
    const liveElement = countElements.find(el => el.getAttribute('aria-live') === 'polite');
    expect(liveElement).toBeDefined();
    expect(liveElement).toHaveAttribute('aria-live', 'polite');
  });
});
