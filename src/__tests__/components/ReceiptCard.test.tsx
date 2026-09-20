import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptCard } from '@/components/receipts/ReceiptCard';
import type { LifeReceipt } from '@/types';

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  formatDate: (date: string) => `Formatted ${date}`,
  formatAmount: (amount: number) => `₹${amount}`,
}));

const mockReceipt: LifeReceipt = {
  id: '1',
  type: 'expense',
  source: 'household',
  title: 'Morning Coffee',
  timestamp: '2023-10-01T08:00:00Z',
  amount: 250,
  category: 'Food',
  tags: ['expense', 'food'],
  metadata: {},
};

describe('ReceiptCard', () => {
  it('renders title, formatted amount, timestamp and correct type icon', () => {
    const { container } = render(<ReceiptCard receipt={mockReceipt} />);
    
    expect(screen.getByText('Morning Coffee')).toBeInTheDocument();
    expect(screen.getByText('₹250')).toBeInTheDocument();
    expect(screen.getByText('Formatted 2023-10-01T08:00:00Z')).toBeInTheDocument();
    expect(container.querySelector('.text-forest-500')).toBeInTheDocument();
  });

  it('calls onClick when clicked and uses button role', () => {
    const handleClick = vi.fn();
    render(<ReceiptCard receipt={mockReceipt} onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /View details for Morning Coffee/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledWith(mockReceipt);
  });

  it('does NOT render sensitive data like cc_num or is_fraud', () => {
    const sensitive = {
      ...mockReceipt,
      cc_num: '1234-5678',
      is_fraud: false,
    } as any;
    render(<ReceiptCard receipt={sensitive} />);
    
    expect(screen.queryByText('1234-5678')).not.toBeInTheDocument();
    expect(screen.queryByText(/fraud/i)).not.toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const partialReceipt: LifeReceipt = {
      id: '2',
      type: 'note',
      source: 'synthetic',
      title: 'Simple Note',
      timestamp: '2023-10-02T10:00:00Z',
      tags: ['note'],
      metadata: {},
    };
    render(<ReceiptCard receipt={partialReceipt} />);
    expect(screen.getByText('Simple Note')).toBeInTheDocument();
    expect(screen.getByText('Formatted 2023-10-02T10:00:00Z')).toBeInTheDocument();
    expect(screen.queryByText('₹')).not.toBeInTheDocument();
  });

  it('renders compact mode with correct classes', () => {
    const { container } = render(<ReceiptCard receipt={mockReceipt} compact={true} />);
    const article = container.querySelector('article');
    expect(article?.className).toContain('py-3');
    expect(article?.className).not.toContain('py-5');
  });

  it('has correct aria attributes when interactive', () => {
    render(<ReceiptCard receipt={mockReceipt} onClick={vi.fn()} />);
    const button = screen.getByRole('button', { name: /View details for Morning Coffee/i });
    expect(button).toHaveAttribute('aria-label', 'View details for Morning Coffee');
  });
});
