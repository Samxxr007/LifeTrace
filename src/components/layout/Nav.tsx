import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Nav() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // In a real app, this would come from a global store/context
  const totalRecordCount = 12405; 

  const navItems = [
    { label: 'Journey', path: '/journey', color: 'hover:text-ink-900 decoration-ink-900' },
    { label: 'Discover', path: '/discover', color: 'hover:text-forest-500 decoration-forest-500' },
    { label: 'Explore', path: '/explore', color: 'hover:text-navy-500 decoration-navy-500' },
  ];

  return (
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
            {totalRecordCount.toLocaleString()} Records
          </span>
        )}
      </div>

      <div className="flex space-x-8">
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
    </nav>
  );
}
