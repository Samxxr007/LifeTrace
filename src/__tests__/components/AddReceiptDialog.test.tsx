import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddReceiptDialog } from '@/components/receipts/AddReceiptDialog';
import { getUserReceipts } from '@/lib/storage';

describe('AddReceiptDialog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders modal when open=true with domain options and form fields', () => {
    render(<AddReceiptDialog open={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Life Receipt')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Title or primary label|Blue Tokai Cold Brew/i)).toBeInTheDocument();
  });

  it('switches domain fields when domain button is clicked', () => {
    render(<AddReceiptDialog open={true} onClose={vi.fn()} initialType="music" />);

    // Click Expense button
    const expenseBtn = screen.getByRole('button', { name: /expense/i });
    fireEvent.click(expenseBtn);

    // Amount field should now be present
    expect(screen.getByText(/Amount \(₹ INR\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Mode/i)).toBeInTheDocument();
  });

  it('validates required fields and saves user receipt to storage', () => {
    const handleClose = vi.fn();
    render(<AddReceiptDialog open={true} onClose={handleClose} initialType="expense" />);

    const titleInput = screen.getByPlaceholderText(/Blue Tokai Cold Brew|Title or primary label/i);
    const amountInput = screen.getByPlaceholderText(/e\.g\. 250/i);

    fireEvent.change(titleInput, { target: { value: 'Cold Brew Coffee' } });
    fireEvent.change(amountInput, { target: { value: '280' } });

    const submitBtn = screen.getByRole('button', { name: /save receipt/i });
    fireEvent.click(submitBtn);

    const saved = getUserReceipts();
    expect(saved.length).toBe(1);
    expect(saved[0].title).toBe('Cold Brew Coffee');
    expect(saved[0].amount).toBe(280);
    expect(saved[0].source).toBe('user');
    expect(saved[0].provenance).toBe('user-created');
  });
});
