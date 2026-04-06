import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, BarChart3, Dumbbell, History, Settings } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const desktopLinkClass = (path: string) =>
    isActive(path)
      ? 'text-blue-700 bg-blue-50'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  const mobileLinkClass = (path: string) =>
    isActive(path)
      ? 'text-blue-700 border-b-2 border-blue-700'
      : 'text-gray-600 hover:text-gray-900';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 rounded-md transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            aria-label="Przejdź na stronę główną"
          >
            <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-blue-700 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Siłka</h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-tight">Siła i walka określa Twój byt!</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${desktopLinkClass('/')}`}
            >
              <Activity className="w-4 h-4" />
              <span>Start</span>
            </Link>
            <Link
              to="/history"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${desktopLinkClass('/history')}`}
            >
              <History className="w-4 h-4" />
              <span>Historia</span>
            </Link>
            <Link
              to="/progress"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${desktopLinkClass('/progress')}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Progres</span>
            </Link>
            <Link
              to="/settings"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${desktopLinkClass('/settings')}`}
            >
              <Settings className="w-4 h-4" />
              <span>Konfiguracja</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
        <div className="max-w-5xl mx-auto flex">
          <Link to="/" className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${mobileLinkClass('/')}`}>
            <Activity className="w-5 h-5" />
            <span className="max-[479px]:hidden">Start</span>
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
