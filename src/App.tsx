import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Lazy-loaded pages for code splitting
const Landing     = lazy(() => import('@/pages/Landing'));
const Journey     = lazy(() => import('@/pages/Journey'));
const Discover    = lazy(() => import('@/pages/Discover'));
const Explore     = lazy(() => import('@/pages/Explore'));

const PageFallback = ({ message }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-parchment-100">
    <LoadingState message={message || 'Tracing your moments...'} />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/"           element={<Landing />} />
              <Route path="/journey"    element={
                <Suspense fallback={<PageFallback message="Connecting the dots..." />}>
                  <Journey />
                </Suspense>
              } />
              <Route path="/discover"   element={
                <Suspense fallback={<PageFallback message="Finding your patterns..." />}>
                  <Discover />
                </Suspense>
              } />
              <Route path="/explore"    element={
                <Suspense fallback={<PageFallback message="Loading your archive..." />}>
                  <Explore />
                </Suspense>
              } />
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppShell>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
