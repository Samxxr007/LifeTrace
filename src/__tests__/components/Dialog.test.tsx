import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '@/components/ui/Dialog';

describe('Dialog', () => {
  it('renders when open=true', () => {
    render(
      <Dialog open={true} onClose={vi.fn()} title="Test Dialog">
        <div>Dialog Content</div>
      </Dialog>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('is hidden when open=false', () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="Test Dialog">
        <div>Dialog Content</div>
      </Dialog>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape key calls onClose', () => {
    const handleClose = vi.fn();
    render(
      <Dialog open={true} onClose={handleClose} title="Test Dialog">
        <div>Content</div>
      </Dialog>
    );
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('backdrop click calls onClose', async () => {
    const handleClose = vi.fn();
    render(
      <Dialog open={true} onClose={handleClose} title="Test Dialog">
        <div>Content</div>
      </Dialog>
    );
    
    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
    
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('has role="dialog", aria-modal="true" and title is rendered', () => {
    render(
      <Dialog open={true} onClose={vi.fn()} title="Accessible Title">
        <div>Content</div>
      </Dialog>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    const title = screen.getByText('Accessible Title');
    expect(title).toHaveAttribute('id', 'dialog-title');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  });
});
