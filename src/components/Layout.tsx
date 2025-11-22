import { Outlet, Link, useLocation } from 'react-router-dom';
import { Dumbbell, History, BarChart3, Upload, Home } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Silka</h1>
            <span className="text-sm text-gray-500 ml-auto">Dziennik Treningowy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* Navigation - Bottom Bar (Mobile) / Sidebar (Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 md:static bg-white border-t md:border-t-0 md:border-l shadow-lg md:shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex md:flex-col gap-0">
            <Link
              to="/"
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-3 ${isActive('/')} hover:text-blue-600 transition-colors`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Strona główna</span>
            </Link>

            <Link
              to="/history"
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-3 ${isActive('/history')} hover:text-blue-600 transition-colors`}
            >
              <History className="w-5 h-5" />
              <span className="hidden md:inline">Historia</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-3 ${isActive('/dashboard')} hover:text-blue-600 transition-colors`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden md:inline">Wykresy</span>
            </Link>

            <Link
              to="/import"
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-3 ${isActive('/import')} hover:text-blue-600 transition-colors`}
            >
              <Upload className="w-5 h-5" />
              <span className="hidden md:inline">Import</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for mobile navigation */}
      <div className="md:hidden h-16" />
    </div>
  );
}
