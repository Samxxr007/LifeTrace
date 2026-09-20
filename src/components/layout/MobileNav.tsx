import React from 'react';
import { NavLink } from 'react-router-dom';
import { Route, Compass, Search, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const items = [
    { label: 'Home', path: '/', icon: Compass, activeColor: 'text-ink-900' },
    { label: 'Journey', path: '/journey', icon: Route, activeColor: 'text-burnt-600' },
    { label: 'Discover', path: '/discover', icon: Sparkles, activeColor: 'text-forest-600' },
    { label: 'Explore', path: '/explore', icon: Search, activeColor: 'text-navy-600' },
    { label: 'My Life', path: '/my-life', icon: User, activeColor: 'text-amber-700' },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-parchment-100/95 backdrop-blur border-t border-ink-200 z-40 pb-safe"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {items.map(({ label, path, icon: Icon, activeColor }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 focus:outline-none focus-visible:ring-inset focus-visible:ring-3 focus-visible:ring-ink-900',
              isActive ? activeColor : 'text-ink-400'
            )}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5]' : 'stroke-2')} aria-hidden="true" />
                <span className={cn(
                  'text-[10px] font-medium tracking-wide',
                  isActive ? 'font-bold' : ''
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
