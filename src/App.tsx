import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';
import Home from './pages/Home';
import Import from './pages/Import';
import SessionRecap from './pages/SessionRecap';
import Plans from './pages/Templates';

const History = lazy(() => import('./pages/History'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function RouteFallback() {
  return (
    <div className="rounded-[2rem] border border-border bg-surface-card px-5 py-8 text-sm text-text-secondary shadow-sm">
      Ładowanie widoku...
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl font-bold text-text-tertiary">404</span>
      <p className="mt-3 text-lg text-text-secondary">Nie ma opieprzania się! Zasuwaj ćwiczyć!</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 font-semibold text-text-inverted transition-colors hover:bg-brand-hover active:bg-brand-active"
      >
        Wróć do treningu
      </Link>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <PwaUpdatePrompt />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/recap" element={<SessionRecap />} />
            <Route path="/history" element={<Suspense fallback={<RouteFallback />}><History /></Suspense>} />
            <Route path="/progress" element={<Suspense fallback={<RouteFallback />}><Dashboard /></Suspense>} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/settings" element={<Suspense fallback={<RouteFallback />}><Settings /></Suspense>} />
            <Route path="/import" element={<Import />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
