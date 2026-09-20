import React from 'react';
import { LucideIcon, Search, Link2, FileQuestion } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 min-h-[300px]', className)}>
      {Icon && (
        <div className="mb-4 text-ink-300">
          <Icon className="w-12 h-12 stroke-1" aria-hidden="true" />
        </div>
      )}
      <h3 className="font-display text-2xl text-ink-900 mb-2">{title}</h3>
      {description && <p className="font-body text-ink-500 max-w-md mb-6">{description}</p>}
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export const EmptySearchResults = () => (
  <EmptyState
    icon={Search}
    title="No moments found"
    description="We couldn't find any records matching your current filters. Try adjusting your search criteria."
  />
);

export const EmptyConnections = () => (
  <EmptyState
    icon={Link2}
    title="No connected moments"
    description="This record doesn't seem to have any related moments in your timeline yet."
  />
);

export const IncompleteReceipt = () => (
  <EmptyState
    icon={FileQuestion}
    title="Partial record"
    description="The details for this moment are incomplete or still being processed."
  />
);
