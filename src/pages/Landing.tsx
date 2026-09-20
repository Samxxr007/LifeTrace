import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Music, CreditCard, ArrowRight, Sparkles, Layers, Network, BookOpen, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-12 pb-20 px-6">
        <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <span className="font-display text-xl tracking-wide font-medium">LifeTrace</span>
          <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
            WebRush 6-Hour Frontend Hackathon
          </span>
        </nav>

        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-3 block">
            Digital Archive · Interactive Museum · Data Sculpture
          </span>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-ink-900 mb-6 tracking-tight">
            LifeTrace
          </h1>
          <p className="font-body text-xl text-ink-600 italic mb-12">
            Every moment leaves a trace.
          </p>

          <div className="relative w-full max-w-2xl h-56 mb-12" aria-hidden="true">
            {/* Receipt fragments animation */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ opacity: showLines ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
            >
              <path
                d="M 150 80 Q 250 120 350 70 T 500 120"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-ink-300"
              />
              <path
                d="M 200 160 Q 300 100 450 150"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-ink-300"
              />
            </svg>

            {/* Fragments */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-4 left-1/4 bg-white/60 backdrop-blur-sm p-3 border border-ink-200 flex items-center gap-2 transform -rotate-6 shadow-xs"
            >
              <Music size={14} className="text-burnt-600" />
              <span className="font-mono text-xs text-ink-700 truncate w-24">The Mowgli's</span>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-8 right-1/4 bg-white/60 backdrop-blur-sm p-3 border border-ink-200 flex items-center gap-2 transform rotate-3 shadow-xs"
            >
              <CreditCard size={14} className="text-navy-600" />
              <span className="font-mono text-xs text-ink-700 truncate w-24">Uber Trip</span>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm p-3 border border-ink-200 flex items-center gap-2 transform -rotate-2 shadow-xs"
            >
              <FileText size={14} className="text-forest-600" />
              <span className="font-mono text-xs text-ink-700 truncate w-24">Grocery</span>
            </motion.div>
          </div>

          <p className="font-mono text-sm text-ink-500 mb-8 uppercase tracking-widest">
            162,588 records across three datasets
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/journey"
              className="inline-flex items-center justify-center px-8 py-4 bg-ink-900 text-parchment-100 font-mono text-sm uppercase tracking-widest hover:bg-ink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ink-500 focus:ring-offset-2 focus:ring-offset-parchment-100"
            >
              Enter the Archive
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-8 py-4 border border-ink-900 text-ink-900 font-mono text-sm uppercase tracking-widest hover:bg-parchment-200 transition-colors focus:outline-none focus:ring-2 focus:ring-ink-500"
            >
              Explore Receipts
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 animate-bounce" aria-hidden="true">
          <span className="font-mono text-xs text-ink-400 uppercase tracking-widest rotate-90 origin-right inline-block">
            Scroll
          </span>
        </div>
      </section>

      {/* SECTION 2 — FROM RECEIPTS TO A LIFE STORY (Explicit Problem Alignment) */}
      <section className="bg-parchment-50 py-24 px-6 border-t border-ink-300">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-2 block">
              Core Architecture
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-ink-900 mb-6">
              From Receipts to a Life Story
            </h2>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              Explore recorded moments. Discover relationships between them. Follow the patterns they create. See the story hidden inside the data.
            </p>
          </div>

          {/* Explicit Transformation Flow: RAW DATA → INSIGHTS → CONNECTIONS → STORIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Raw Receipts */}
            <Link
              to="/explore"
              className="group p-6 bg-parchment-100 border border-ink-300 hover:border-ink-900 transition-all rounded-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center text-ink-700">
                    <Layers size={18} />
                  </div>
                  <span className="font-mono text-xs text-ink-400">01</span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-2 group-hover:text-burnt-600 transition-colors">
                  Raw Receipts
                </h3>
                <p className="font-body text-sm text-ink-600 leading-relaxed">
                  Explore individual recorded moments across Music, Household and Financial datasets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink-200 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-ink-500 group-hover:text-ink-900">
                <span>Explore records</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 2. Insights */}
            <Link
              to="/journey"
              className="group p-6 bg-parchment-100 border border-ink-300 hover:border-ink-900 transition-all rounded-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center text-ink-700">
                    <Compass size={18} />
                  </div>
                  <span className="font-mono text-xs text-ink-400">02</span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-2 group-hover:text-burnt-600 transition-colors">
                  Insights
                </h3>
                <p className="font-body text-sm text-ink-600 leading-relaxed">
                  See aggregated activity, spending, listening and temporal patterns across 11 years.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink-200 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-ink-500 group-hover:text-ink-900">
                <span>View Orbit</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 3. Connections */}
            <Link
              to="/discover?view=connections"
              className="group p-6 bg-parchment-100 border border-ink-300 hover:border-ink-900 transition-all rounded-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center text-ink-700">
                    <Network size={18} />
                  </div>
                  <span className="font-mono text-xs text-ink-400">03</span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-2 group-hover:text-burnt-600 transition-colors">
                  Connections
                </h3>
                <p className="font-body text-sm text-ink-600 leading-relaxed">
                  Discover evidence-based relationships between recorded moments using temporal and category heuristics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink-200 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-ink-500 group-hover:text-ink-900">
                <span>View threads</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 4. Stories */}
            <Link
              to="/discover?view=stories"
              className="group p-6 bg-parchment-100 border border-ink-300 hover:border-ink-900 transition-all rounded-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center text-ink-700">
                    <BookOpen size={18} />
                  </div>
                  <span className="font-mono text-xs text-ink-400">04</span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-2 group-hover:text-burnt-600 transition-colors">
                  Stories
                </h3>
                <p className="font-body text-sm text-ink-600 leading-relaxed">
                  Follow data-grounded chapters derived from observed patterns and real evidence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink-200 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-ink-500 group-hover:text-ink-900">
                <span>Read chapters</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE THREE DATASETS */}
      <section className="bg-parchment-200 py-24 px-6 border-y border-ink-300">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="font-mono text-sm text-ink-500 uppercase tracking-widest mb-2">Three Datasets.</p>
            <h2 className="font-display text-5xl md:text-6xl text-ink-900">One Archive.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Music */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-t border-ink-400 pt-6"
            >
              <div className="font-display text-4xl mb-2 text-ink-900">149,860</div>
              <div className="font-mono text-sm uppercase tracking-wider mb-4 text-burnt-700 font-semibold">
                music moments
              </div>
              <p className="font-body text-ink-800 mb-1">The Mowgli's to The Beatles</p>
              <p className="font-mono text-xs text-ink-500 mb-4">July 2013 – Dec 2024</p>
              <p className="font-body text-sm text-ink-600">
                11 years of streaming history, track metadata, shuffle patterns, and listening durations.
              </p>
            </motion.div>

            {/* Life Receipts (Household) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-t border-ink-400 pt-6"
            >
              <div className="font-display text-4xl mb-2 text-ink-900">2,461</div>
              <div className="font-mono text-sm uppercase tracking-wider mb-4 text-forest-700 font-semibold">
                life receipts
              </div>
              <p className="font-body text-ink-800 mb-1">Food, Utilities, Daily Expenses</p>
              <p className="font-mono text-xs text-ink-500 mb-4">Jan 2015 – Sep 2018</p>
              <p className="font-body text-sm text-ink-600">
                Granular household expenditures totaling ₹19.5L, capturing daily sustenance and recurring living costs.
              </p>
            </motion.div>

            {/* Transactions (Financial) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-t border-ink-400 pt-6"
            >
              <div className="font-display text-4xl mb-2 text-ink-900">10,267</div>
              <div className="font-mono text-sm uppercase tracking-wider mb-4 text-navy-700 font-semibold">
                financial transactions
              </div>
              <p className="font-body text-ink-800 mb-1">Commerce, Travel & Digital Spend</p>
              <p className="font-mono text-xs text-ink-500 mb-4">2022 – 2024</p>
              <p className="font-body text-sm text-ink-600">
                Multi-facet transactions across Indian commerce, sanitized to remove sensitive card and account numbers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — THE CONVERGENCE CALLOUT */}
      <section className="py-24 px-6 bg-parchment-100 border-b border-ink-300">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest mb-6">
            <Sparkles size={13} />
            <span>Factual Data Overlap</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-4">
            The Convergence — 2015–2018
          </h2>
          <p className="font-body text-lg text-ink-700 leading-relaxed max-w-2xl mx-auto mb-8">
            Music listening and daily household expenditures overlap across this 4-year period. LifeTrace connects concurrent grocery runs and soundtrack selections without inferring psychological intent.
          </p>
          <Link
            to="/journey"
            className="font-mono text-xs uppercase tracking-widest text-ink-900 underline underline-offset-8 hover:text-burnt-600 transition-colors"
          >
            Explore The Convergence in Life Orbit →
          </Link>
        </div>
      </section>

      {/* SECTION 5 — FOOTER CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h3 className="font-display text-2xl md:text-3xl text-ink-900 mb-4">
            Ready to explore your archive?
          </h3>
          <p className="font-body text-sm text-ink-600 mb-8">
            All data is processed client-side. Zero tracking, zero telemetry, zero psychological inference.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/journey"
              className="px-6 py-3 bg-ink-900 text-parchment-100 font-mono text-xs uppercase tracking-widest hover:bg-ink-800 transition-colors"
            >
              Start Journey
            </Link>
            <Link
              to="/discover"
              className="px-6 py-3 border border-ink-300 text-ink-700 font-mono text-xs uppercase tracking-widest hover:border-ink-900 transition-colors"
            >
              View Connections
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
