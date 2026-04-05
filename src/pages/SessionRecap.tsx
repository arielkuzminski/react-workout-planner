import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, Dumbbell, Layers, Trophy } from 'lucide-react';
import { useWorkoutStore } from '../store';
import { calculateSessionStats } from '../utils/analyticsUtils';

export default function SessionRecap() {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);

  const lastSession = completedSessions[0];
  const previousSessions = completedSessions.slice(1);

  const stats = useMemo(() => {
    if (!lastSession) return null;
    return calculateSessionStats(lastSession, previousSessions);
  }, [lastSession, previousSessions]);

  if (!lastSession || !stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Brak ukończonej sesji</h2>
        <Link to="/" className="inline-flex mt-4 px-4 py-3 rounded-xl bg-blue-700 text-white font-semibold">
          Wróć do startu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center space-y-2">
        <Trophy className="w-12 h-12 mx-auto text-amber-500" />
        <h2 className="text-3xl font-bold text-gray-900">Dobra robota!</h2>
        <p className="text-gray-600">
          {lastSession.templateId ? `Template ${lastSession.templateId}` : 'Quick log'} zakończony
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <Clock className="w-6 h-6 mx-auto text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.durationMinutes}</p>
          <p className="text-sm text-gray-500">minut</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <Dumbbell className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.totalVolume.toLocaleString('pl-PL')}</p>
          <p className="text-sm text-gray-500">kg wolumenu</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <Layers className="w-6 h-6 mx-auto text-violet-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.totalSets}</p>
          <p className="text-sm text-gray-500">serii</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <Dumbbell className="w-6 h-6 mx-auto text-orange-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.totalExercises}</p>
          <p className="text-sm text-gray-500">ćwiczeń</p>
        </div>
      </section>

      {stats.prs.length > 0 && (
        <section className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-amber-900">Rekordy osobiste!</h3>
          </div>
          {stats.prs.map((pr, i) => (
            <div key={`${pr.exerciseId}-${pr.type}-${i}`} className="flex items-center justify-between text-sm">
              <span className="font-medium text-amber-900">{pr.exerciseName}</span>
              <span className="text-amber-700">
                {pr.type === 'weight'
                  ? `${pr.previousBest}kg → ${pr.value}kg`
                  : `${pr.previousBest}kg vol → ${pr.value}kg vol`}
              </span>
            </div>
          ))}
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/history"
          className="flex-1 px-5 py-3 rounded-xl bg-gray-900 hover:bg-black active:bg-gray-800 text-white font-semibold text-center transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Zobacz historię
        </Link>
        <Link
          to="/"
          className="flex-1 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 font-semibold text-center transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Wróć do startu
        </Link>
      </div>
    </div>
  );
}
