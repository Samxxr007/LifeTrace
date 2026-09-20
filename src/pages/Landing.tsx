import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Music, CreditCard } from 'lucide-react';

const Landing: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [showLines, setShowLines] = useState(false);

  useEffect(() => {
    if (!prefersReducedMotion) {
      const timer = setTimeout(() => setShowLines(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowLines(true);
    }
  }, [prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-parchment-100 font-sans text-ink-900 selection:bg-ink-200">
      {/* SECTION 1 — HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-12 pb-24 px-6">
        <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <span className="font-display text-xl tracking-wide font-medium">LifeTrace</span>
        </nav>

        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-ink-900 mb-6 tracking-tight">
            LifeTrace
          </h1>
          <p className="font-body text-xl text-ink-500 italic mb-16">
            Every moment leaves a trace.
          </p>

          <div className="relative w-full max-w-2xl h-64 mb-16" aria-hidden="true">
            {/* Receipt fragments animation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: showLines ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
              <path d="M 150 80 Q 250 120 350 70 T 500 120" fill="none" stroke="currentColor" strokeWidth="1" className="text-ink-300" />
              <path d="M 200 160 Q 300 100 450 150" fill="none" stroke="currentColor" strokeWidth="1" className="text-ink-300" />
            </svg>
            
            {/* Fragments */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-4 left-1/4 bg-white/50 backdrop-blur-sm p-3 border border-ink-200 flex items-center gap-2 transform -rotate-6"
            >
              <Music size={14} className="text-ink-500" />
              <span className="font-mono text-xs text-ink-700 truncate w-24">The Mowgli's</span>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-8 right-1/4 bg-white/50 backdrop-blur-sm p-3 border border-ink-200 flex items-center gap-2 transform rotate-3"
            >
              <CreditCard size={14} className="text-ink-500" />
              <span className="font-mono text-xs text-ink-700 truncate w-24">Uber Trip</span>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm p-3 border border-ink-200 flex items-center gap-2 transform -rotate-2"
            >
              <FileText size={14} className="text-ink-500" />
              <span className="font-mono text-xs text-ink-700 truncate w-24">Grocery</span>
            </motion.div>
          </div>

          <p className="font-mono text-sm text-ink-500 mb-8 uppercase tracking-widest">
            162,588 records across three datasets
          </p>

          <a 
            href="/discover" 
            className="inline-flex items-center justify-center px-8 py-4 bg-ink-900 text-parchment-100 font-mono text-sm uppercase tracking-widest hover:bg-ink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ink-500 focus:ring-offset-2 focus:ring-offset-parchment-100"
          >
            Enter the Archive
          </a>
        </div>
        
        <div className="absolute bottom-8 right-8 animate-bounce" aria-hidden="true">
          <span className="font-mono text-xs text-ink-400 uppercase tracking-widest rotate-90 origin-right inline-block">
            Scroll
          </span>
        </div>
      </section>

      {/* SECTION 2 — THE DATASETS */}
      <section className="bg-parchment-200 py-32 px-6 border-y border-ink-200">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="font-mono text-sm text-ink-500 uppercase tracking-widest mb-4">Three Datasets.</p>
            <h2 className="font-display text-5xl md:text-6xl text-ink-900">One Archive.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Music */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-t border-ink-300 pt-6"
            >
              <div className="font-display text-4xl mb-2 text-ink-900">149,860</div>
              <div className="font-mono text-sm uppercase tracking-wider mb-6 text-ink-600">music moments</div>
              <p className="font-body text-ink-800 mb-2">The Mowgli's to The Beatles</p>
              <p className="font-mono text-xs text-ink-500 mb-6">July 2013 – Dec 2024</p>
              <p className="font-body text-sm text-ink-600">Spotify listening history</p>
            </motion.div>

            {/* Life Receipts */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-t border-ink-300 pt-6"
            >
              <div className="font-display text-4xl mb-2 text-ink-900">2,461</div>
              <div className="font-mono text-sm uppercase tracking-wider mb-6 text-ink-600">life receipts</div>
              <p className="font-body text-ink-800 mb-2">Food to Travel</p>
              <p className="font-mono text-xs text-ink-500 mb-6">Jan 2015 – Sep 2018</p>
              <p className="font-body text-sm text-ink-600">Daily household</p>
            </motion.div>

            {/* Transactions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-t border-ink-300 pt-6"
            >
              <div className="font-display text-4xl mb-2 text-ink-900">10,267</div>
              <div className="font-mono text-sm uppercase tracking-wider mb-6 text-ink-600">transactions</div>
              <p className="font-body text-ink-800 mb-2">Shopping & Subscriptions</p>
              <p className="font-mono text-xs text-ink-500 mb-6">Jan 2015 – Sep 2018</p>
              <p className="font-body text-sm text-ink-600">India financial</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE CONCEPT */}
      <section className="py-40 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-5xl text-ink-900 mb-24">
            What does this data reveal?
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            <div className="flex-1">
              <div className="font-mono text-sm uppercase tracking-widest text-ink-900 mb-4">Moments</div>
              <p className="font-body text-sm text-ink-600">Single points in time, captured and frozen.</p>
            </div>
            
            <div className="hidden md:block text-ink-300">→</div>
            
            <div className="flex-1">
              <div className="font-mono text-sm uppercase tracking-widest text-ink-900 mb-4">Connections</div>
              <p className="font-body text-sm text-ink-600">Invisible threads linking disparate events.</p>
            </div>
            
            <div className="hidden md:block text-ink-300">→</div>
            
            <div className="flex-1">
              <div className="font-mono text-sm uppercase tracking-widest text-ink-900 mb-4">Stories</div>
              <p className="font-body text-sm text-ink-600">The overarching narrative of your timeline.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4 — CTA */}
      <section className="pb-40 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-8"
        >
          <a 
            href="/discover" 
            className="font-display text-3xl md:text-4xl text-ink-900 hover:text-burnt-600 transition-colors underline decoration-1 underline-offset-8"
          >
            Trace your archive →
          </a>
          <a 
            href="/discover?view=patterns" 
            className="font-mono text-sm uppercase tracking-widest text-ink-500 hover:text-ink-900 transition-colors"
          >
            or explore the moments →
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
