import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, BarChart3, ClipboardList, Dumbbell, History, Upload } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-blue-700 border-b-2 border-blue-700'
      : 'text-gray-600 hover:text-gray-900';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 rounded-md transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            aria-label="Przejdź na stronę główną"
          >
            <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-blue-700 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Silka</h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-tight">Capture-first dziennik treningowy</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 md:static bg-white border-t shadow-lg md:shadow-none">
        <div className="max-w-5xl mx-auto flex">
          <Link to="/" className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${isActive('/')}`}>
            <Activity className="w-5 h-5" />
            <span className="hidden md:inline">Start</span>
          </Link>
          <Link
            to="/plans"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${isActive('/plans')}`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="hidden md:inline">Plany Treningowe</span>
          </Link>
          <Link
            to="/history"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${isActive('/history')}`}
          >
            <History className="w-5 h-5" />
            <span className="hidden md:inline">Historia</span>
          </Link>
          <Link
            to="/progress"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${isActive('/progress')}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden md:inline">Progres</span>
          </Link>
          <Link
            to="/import"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${isActive('/import')}`}
          >
            <Upload className="w-5 h-5" />
            <span className="hidden lg:inline">Import / Export</span>
          </Link>
        </div>
      </nav>

      <div className="md:hidden h-16" />
    </div>
  );
}
