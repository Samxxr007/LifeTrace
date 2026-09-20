import React from 'react';
import { Nav } from './Nav';
import { MobileNav } from './MobileNav';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 flex flex-col font-body selection:bg-ink-900 selection:text-parchment-100">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-ink-900 text-parchment-100 font-medium rounded-sm focus:outline-none focus:ring-4 focus:ring-ink-500"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40">
        <Nav />
      </header>

      <motion.main 
        id="main-content"
        className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-24 md:pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {children}
      </motion.main>

      <MobileNav />

      <footer className="hidden md:block py-8 border-t border-ink-200 mt-auto">
        <div className="max-w-7xl mx-auto px-8 text-sm text-ink-500 flex justify-between">
          <p>© {new Date().getFullYear()} LifeTrace. All rights reserved.</p>
          <p className="font-mono uppercase text-xs tracking-wider">Archival System v1.0</p>
        </div>
      </footer>
    </div>
  );
}
