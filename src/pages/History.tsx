import { formatDistanceToNowStrict } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useWorkoutStore } from '../store';
import { getPlanLabelBySession } from '../utils/templateUtils';

export default function History() {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const plans = useWorkoutStore((state) => state.plans);
  const deleteCompletedSession = useWorkoutStore((state) => state.deleteCompletedSession);

  if (completedSessions.length === 0) {
    return (
      <div className="rounded-[2rem] border border-border bg-surface-card p-6 sm:p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-text-primary">Brak historii</h2>
        <p className="mt-2 text-text-secondary">Zakończ pierwszą sesję, żeby zobaczyć recap treningów.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-text-primary">Historia</h2>
        <p className="mt-1 text-text-secondary">{completedSessions.length} ukończonych sesji</p>
      </div>

      {completedSessions.map((session) => (
        <article
          key={session.id}
          className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold break-words text-text-primary">
                  {getPlanLabelBySession(plans, session, 'Freestyle session')}
                </h3>
                <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-semibold text-text-secondary">
                  {formatDistanceToNowStrict(new Date(session.endedAt || session.startedAt), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {session.entries.length} ćwiczeń •{' '}
                {session.entries.reduce((sum, entry) => sum + entry.sets.filter((set) => set.completed).length, 0)}{' '}
                ukończonych serii
              </p>
            </div>
            <button
              onClick={() => deleteCompletedSession(session.id)}
              className="rounded-xl p-2 text-text-tertiary transition-colors hover:bg-danger-soft hover:text-danger-text active:bg-danger-hover-bg cursor-pointer focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none"
              aria-label="Usuń sesję"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {session.notes && (
            <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm text-text-secondary">
              {session.notes}
            </p>
          )}

          <div className="mt-4 space-y-3">
            {session.entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl bg-surface px-4 py-3 text-sm text-text-primary"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold break-words">{entry.exerciseNameSnapshot}</span>
                  <span className="text-text-secondary">
                    {entry.sets.filter((set) => set.completed).length} serii
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.sets
                    .filter((set) => set.completed)
                    .map((set) => (
                      <span
                        key={set.id}
                        className="rounded-full bg-surface-card px-3 py-1 text-xs font-medium text-text-secondary"
                      >
                        {entry.exerciseType === 'time'
                          ? `${set.durationSec || 0}s`
                          : `${set.weight || 0} kg × ${set.reps || 0}`}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
