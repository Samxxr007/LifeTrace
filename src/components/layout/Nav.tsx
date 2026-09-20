import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLifeData } from '@/hooks/useLifeData';
import { AddReceiptDialog } from '@/components/receipts/AddReceiptDialog';
import { Plus } from 'lucide-react';

export function Nav() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const { receipts } = useLifeData();
  const [addReceiptOpen, setAddReceiptOpen] = useState(false);

  const navItems = [
    { label: 'Journey', path: '/journey', color: 'hover:text-ink-900 decoration-ink-900' },
    { label: 'Discover', path: '/discover', color: 'hover:text-forest-500 decoration-forest-500' },
    { label: 'Explore', path: '/explore', color: 'hover:text-navy-500 decoration-navy-500' },
    { label: 'My Life', path: '/my-life', color: 'hover:text-amber-700 decoration-amber-700' },
  ];

  return (
    <>
      <nav className="hidden md:flex items-center justify-between px-8 py-4 bg-parchment-100/95 backdrop-blur border-b border-ink-200">
        <div className="flex items-baseline space-x-6">
          <NavLink 
            to="/" 
            className="font-display text-lg text-ink-900 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-3 focus-visible:ring-ink-900 rounded"
          >
            LifeTrace
          </NavLink>
          {isLanding ? (
            <span className="font-body text-sm text-ink-500 italic">Every moment leaves a trace.</span>
          ) : (
            <span className="font-mono text-xs text-ink-500 uppercase tracking-widest">
              {receipts.length.toLocaleString()} Records
            </span>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'font-body text-sm font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-ink-900 rounded px-1 py-0.5',
                  isActive ? `text-ink-900 underline underline-offset-8 decoration-2 ${item.color.split(' ')[1]}` : 'text-ink-500',
                  item.color.split(' ')[0]
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => setAddReceiptOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-parchment-100 rounded-xs font-mono text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <Plus size={13} />
            <span>Add Receipt</span>
          </button>
        </div>
      </nav>

      <AddReceiptDialog
        open={addReceiptOpen}
        onClose={() => setAddReceiptOpen(false)}
      />
    </>
  );
}

