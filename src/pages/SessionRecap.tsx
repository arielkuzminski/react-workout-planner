import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, Dumbbell, Layers, Trophy } from 'lucide-react';
import { useWorkoutStore } from '../store';
import { calculateSessionStats } from '../utils/analyticsUtils';
import { getPlanLabelBySession } from '../utils/templateUtils';

export default function SessionRecap() {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const plans = useWorkoutStore((state) => state.plans);

  const lastSession = completedSessions[0];
  const previousSessions = completedSessions.slice(1);

  const stats = useMemo(() => {
    if (!lastSession) return null;
    return calculateSessionStats(lastSession, previousSessions);
  }, [lastSession, previousSessions]);

  if (!lastSession || !stats) {
    return (
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-6 text-center">
        <h2 className="text-2xl font-bold text-text-primary">Brak ukończonej sesji</h2>
        <Link to="/" className="inline-flex mt-4 px-4 py-3 rounded-xl bg-brand text-text-inverted font-semibold">
          Wróć do startu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-surface-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 text-center space-y-2">
        <Trophy className="w-12 h-12 mx-auto text-warning-icon" />
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">Dobra robota!</h2>
        <p className="text-text-secondary">
          {getPlanLabelBySession(plans, lastSession, 'Quick log')} zakończony
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-4 sm:p-5 text-center">
          <Clock className="w-6 h-6 mx-auto text-brand-text mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-text-primary">{stats.durationMinutes}</p>
          <p className="text-sm text-text-secondary">minut</p>
        </div>
        <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-4 sm:p-5 text-center">
          <Dumbbell className="w-6 h-6 mx-auto text-success-text mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-text-primary break-words">{stats.totalVolume.toLocaleString('pl-PL')}</p>
          <p className="text-sm text-text-secondary">kg wolumenu</p>
        </div>
        <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-4 sm:p-5 text-center">
          <Layers className="w-6 h-6 mx-auto text-accent-violet mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-text-primary">{stats.totalSets}</p>
          <p className="text-sm text-text-secondary">serii</p>
        </div>
        <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-4 sm:p-5 text-center">
          <Dumbbell className="w-6 h-6 mx-auto text-accent-orange mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-text-primary">{stats.totalExercises}</p>
          <p className="text-sm text-text-secondary">ćwiczeń</p>
        </div>
      </section>

      {stats.prs.length > 0 && (
        <section className="bg-warning-soft rounded-2xl border border-warning-border shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-warning-icon" />
            <h3 className="text-lg font-bold text-warning-text">Rekordy osobiste!</h3>
          </div>
          {stats.prs.map((pr, i) => (
            <div key={`${pr.exerciseId}-${pr.type}-${i}`} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
              <span className="font-medium text-warning-text break-words">{pr.exerciseName}</span>
              <span className="text-warning-text">
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
          className="flex-1 px-5 py-3 rounded-xl bg-btn-dark hover:bg-btn-dark-hover active:bg-btn-dark-active text-text-inverted font-semibold text-center transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Zobacz historię
        </Link>
        <Link
          to="/"
          className="flex-1 px-5 py-3 rounded-xl bg-surface-raised hover:bg-surface-inset active:bg-surface-inset text-text-primary font-semibold text-center transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Wróć do startu
        </Link>
      </div>
    </div>
  );
}
