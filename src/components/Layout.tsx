import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, BarChart3, Dumbbell, History, Settings } from 'lucide-react';
import { APP_EVENTS } from '../constants/storage';

export default function Layout() {
  const location = useLocation();
  const [storageFull, setStorageFull] = useState(false);

  useEffect(() => {
    const handler = () => setStorageFull(true);
    window.addEventListener(APP_EVENTS.storageFull, handler);
    return () => window.removeEventListener(APP_EVENTS.storageFull, handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const desktopLinkClass = (path: string) =>
    isActive(path)
      ? 'text-brand-text bg-brand-soft'
      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised';
  const mobileLinkClass = (path: string) =>
    isActive(path)
      ? 'text-brand-text border-b-2 border-brand'
      : 'text-text-secondary hover:text-text-primary';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-surface-card border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
            aria-label="Przejdź na stronę główną"
          >
            <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-brand-text shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight">Siłka</h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-tight">Siła i walka określa Twój byt!</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${desktopLinkClass('/')}`}
            >
              <Activity className="w-4 h-4" />
              <span>Trening</span>
            </Link>
            <Link
              to="/history"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${desktopLinkClass('/history')}`}
            >
              <History className="w-4 h-4" />
              <span>Historia</span>
            </Link>
            <Link
              to="/progress"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${desktopLinkClass('/progress')}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Progres</span>
            </Link>
            <Link
              to="/settings"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${desktopLinkClass('/settings')}`}
            >
              <Settings className="w-4 h-4" />
              <span>Konfiguracja</span>
            </Link>
          </nav>
        </div>
      </header>

      {storageFull && (
        <div className="bg-danger text-text-inverted text-center text-sm font-medium px-4 py-2">
          Pamięć przeglądarki jest pełna — wyeksportuj dane w Konfiguracji, aby ich nie stracić.
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface-card border-t shadow-lg md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-5xl mx-auto flex">
          <Link to="/" className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${mobileLinkClass('/')}`}>
            <Activity className="w-5 h-5" />
            <span className="max-[479px]:hidden">Trening</span>
          </Link>
          <Link
            to="/history"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${mobileLinkClass('/history')}`}
          >
            <History className="w-5 h-5" />
            <span className="max-[479px]:hidden">Historia</span>
          </Link>
          <Link
            to="/progress"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${mobileLinkClass('/progress')}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="max-[479px]:hidden">Progres</span>
          </Link>
          <Link
            to="/settings"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${mobileLinkClass('/settings')}`}
          >
            <Settings className="w-5 h-5" />
            <span className="max-[479px]:hidden">Konfiguracja</span>
          </Link>
        </div>
      </nav>

      <div className="md:hidden h-16" />
    </div>
  );
}
