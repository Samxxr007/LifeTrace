import React from 'react';
import { Music2, Receipt, CreditCard, MapPin, Clapperboard, FileText, Calendar, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReceiptType = 'music' | 'expense' | 'transaction' | 'place' | 'entertainment' | 'note' | 'event';

interface ReceiptTypeIconProps {
  type: ReceiptType | string;
  size?: number;
  className?: string;
}

export function ReceiptTypeIcon({ type, size = 20, className }: ReceiptTypeIconProps) {
  const getIconConfig = () => {
    switch (type) {
      case 'music':
        return { icon: Music2, color: 'text-burnt-500' };
      case 'expense':
        return { icon: Receipt, color: 'text-forest-500' };
      case 'transaction':
        return { icon: CreditCard, color: 'text-navy-500' };
      case 'place':
        return { icon: MapPin, color: 'text-amber-500' };
      case 'entertainment':
        return { icon: Clapperboard, color: 'text-crimson-500' };
      case 'note':
        return { icon: FileText, color: 'text-ink-500' };
      case 'event':
        return { icon: Calendar, color: 'text-crimson-700' };
      default:
        return { icon: HelpCircle, color: 'text-ink-300' };
    }
  };

  const { icon: Icon, color } = getIconConfig();

  return (
    <Icon 
      size={size} 
      className={cn(color, className)} 
      aria-hidden="true"
    />
  );
}
