import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';
import Home from './pages/Home';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import SessionRecap from './pages/SessionRecap';
import Plans from './pages/Templates';
import Settings from './pages/Settings';

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
            <Route path="/history" element={<History />} />
            <Route path="/progress" element={<Dashboard />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/import" element={<Import />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
