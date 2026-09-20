# LifeTrace 🧾

> **Every moment leaves a trace.**

LifeTrace is a client-side digital archive, interactive museum, and data sculpture built for the **WebRush 6-Hour Frontend Hackathon** under the challenge *“Your Life, In Receipts 🧾”*.

Rather than presenting raw logs or generic dashboard metrics, LifeTrace takes thousands of disconnected digital fragments—listening history, household expenses, and financial transactions—and weaves them into a coherent narrative: **RAW DATA ↓ INFORMATION ↓ INSIGHTS ↓ CONNECTIONS ↓ STORY**.

---

## 🏛️ Design Philosophy

LifeTrace deliberately rejects standard "AI SaaS dashboard" aesthetics:
- **No dark purple backgrounds, neon gradients, or generic glassmorphism.**
- **Editorial Archive Aesthetic**: Warm parchment backgrounds (`#FAF7F0`, `#F5F0E8`), rich ink typography (`#1A1814`), and intentional accent tones—burnt orange for music (`#C4622D`), forest green for expenses (`#3D5A47`), and navy for financial transactions (`#2B4B6F`).
- **Typography-First**: Playfair Display for editorial headlines, Inter for functional UI, and JetBrains Mono for authentic receipt details.
- **Museum Installation 3D Centerpiece**: A signature Three.js / React Three Fiber **Life Orbit** that renders chapters in a celestial, organic arrangement with demand-based rendering and a 2D SVG fallback.

---

## 🧭 Four Core Experiences

### 1. The Archive Entry (`/`)
- Dynamic hero composition with animated receipt fragments that converge and connect as the archive awakens.
- Editorial statistics exploring the three source datasets spanning 2013 to 2024.
- Clear conceptual journey: *Moments → Connections → Stories*.

### 2. Life Journey & Life Orbit (`/journey`)
- **3D Life Orbit**: Built with `@react-three/fiber` and `@react-three/drei`. Arranges chapters into spatial domain clusters (Music, Expenses, Transactions) orbiting a central Life Core.
- **The Convergence**: Explicitly visualizes the 2015–2018 overlap where Spotify listening and daily household expenses occurred in tandem.
- **Interactive Scrubber**: Bottom timeline bar displaying activity density with draggable range controls.
- **Accessible Fallback**: Seamless fallback to `LifeOrbit2D` (SVG force layout) for environments without WebGL or when `prefers-reduced-motion` is detected.

### 3. Discovered Intelligence (`/discover`)
- **Connections View**: Evidence-based connection engine that identifies temporal proximity, categorical resonance, and weekly rhythms without psychological speculation.
- **Patterns View**:
  - *Activity Heatmap*: 7-day × 24-hour listening density grid.
  - *Artist Loop*: Top artist recurrence visualization.
  - *Spending Flow*: Longitudinal financial area chart.
  - *The Subscription Life*: Timeline analysis of recurring memberships and utility bills.
- **Stories View**: Chronological chapters with data-grounded narratives, key statistics, and clickable evidence receipts.

### 4. Archival Explorer (`/explore`)
- **Instant Fuzzy Search**: High-performance search powered by Fuse.js across titles, artists, merchants, categories, and notes.
- **Virtualization**: Ultra-smooth rendering of thousands of receipts via `@tanstack/react-virtual` at 60 FPS.
- **Multi-faceted Filtering**: Filter by category, receipt type (Music, Expense, Transaction), and sort by timestamp or amount.
- **Moment Detail Drawer**: Slide-in panel displaying comprehensive metadata, payment modes, and direct links to connected moments.

---

## 🔒 Privacy & Data Ethics

LifeTrace operates **100% in the browser** with **zero backend servers or telemetry**:
- **Sensitive Data Stripping**: Build-time sanitization rigorously eliminates card numbers (`cc_num`), customer IDs, date of birth (`dob`), and fraud labels (`is_fraud`).
- **Merchant Cleansing**: Cleans prefixed identifiers (`fraud_` prefixes stripped) into human-readable merchant titles.
- **Evidence-Based Insights**: All narrative chapters and pattern cards cite quantifiable evidence; no psychological assumptions are made.

---

## ⚡ Algorithms & Performance Architecture

### 1. Bounded Temporal Sliding Window
Rather than performing an unindexed \(O(N^2)\) cartesian comparison across thousands of records, LifeTrace implements a **chronologically indexed sliding-window algorithm**:
1. **Pre-indexing & Sorting**: Records are sorted in \(O(N \log N)\), with numeric epoch timestamps, hours, and weekly rhythm buckets pre-computed in a single \(O(N)\) pass.
2. **Bounded Lookahead**: For each moment \(i\), candidate matches \(j\) are evaluated in the forward window \([i+1, \min(i+31, N)]\). Because records are chronologically ordered, the inner evaluation immediately breaks once the time delta exceeds 24 hours.
3. **Complexity**: Total operations are strictly bounded at \(O(N \log N) + O(N \cdot K)\) where \(K \le 30\). For \(N = 3,260\), comparisons are bounded at \(\le 97,800\) checks, computing in **under 5 milliseconds** on modern mobile devices.

### 2. Lazy 3D Scene Loading & Mobile Observational Mode
- **Zero Initial 3D Payload**: Three.js, React Three Fiber, and Drei are split into isolated vendor chunks (`three-vendor.js`) and lazy-loaded only when the `/journey` route is accessed.
- **Non-blocking Touch Scrolling**: On mobile devices, `OrbitControls` rotation is observational by default (`pointer-events-none`), allowing single-finger vertical swiping to scroll through the Journey page with zero resistance. An interactive toggle (`[✦ Rotate 3D]`) lets users freely inspect the celestial sculpture on demand.
- **Mesh Budget**: The 3D scene renders a strictly controlled budget of ~65 visual objects (core, 3 orbital tracks, 48 ambient moment particles, and chapter nodes), preventing GPU thermal throttling.
- **Graceful Fallbacks**: If WebGL context fails or `prefers-reduced-motion` is detected, an SVG force layout (`LifeOrbit2D`) renders instantly.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom editorial design tokens
- **3D Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Visualizations**: [Recharts](https://recharts.org/) + custom SVG density scrubbers & heatmaps
- **Search & Virtualization**: [Fuse.js](https://fusejs.io/) + [@tanstack/react-virtual](https://tanstack.com/virtual)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Testing**: [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Samxxr007/LifeTrace.git
cd LifeTrace

# Install dependencies
npm install --legacy-peer-deps

# Preprocess raw datasets (generates sanitized src/data/*.json)
node scripts/preprocess-data.mjs

# Start local development server
npm run dev
```

### Running Tests

```bash
# Run unit tests
npm test
# or
npx vitest run
```

### Production Build

```bash
# Compile and package for production
npm run build

# Preview production build locally
npm run preview
```

---

## ♿ Accessibility Commitments

- Semantic HTML landmarks (`<main>`, `<header>`, `<footer>`, `<article>`, `<button>`).
- Keyboard navigability across all views, drawers, and modal dialogs with focus trapping.
- Unambiguous 3px solid focus indicators on all interactive elements.
- Dedicated `Skip to main content` navigation link.
- Support for `prefers-reduced-motion` with static fallbacks for 3D and animated elements.
- Live regions (`aria-live="polite"`) for dynamic search counts and filter states.

---

## 📄 License

MIT License. Built with ❤️ for WebRush Frontend Hackathon.
