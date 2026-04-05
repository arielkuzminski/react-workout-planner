import { formatDistanceToNowStrict } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useWorkoutStore } from '../store';

export default function History() {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const deleteCompletedSession = useWorkoutStore((state) => state.deleteCompletedSession);

  if (completedSessions.length === 0) {
    return (
      <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold">Brak historii</h2>
        <p className="mt-2 text-stone-500">Zakończ pierwszą sesję, żeby zobaczyć recap treningów.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Historia</h2>
        <p className="mt-1 text-stone-500">{completedSessions.length} ukończonych sesji</p>
      </div>

      {completedSessions.map((session) => (
        <article
          key={session.id}
          className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {session.templateId ? `Template ${session.templateId}` : 'Freestyle session'}
                </h3>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
                  {formatDistanceToNowStrict(new Date(session.endedAt || session.startedAt), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-500">
                {session.entries.length} ćwiczeń •{' '}
                {session.entries.reduce((sum, entry) => sum + entry.sets.filter((set) => set.completed).length, 0)}{' '}
                ukończonych serii
              </p>
            </div>
            <button
              onClick={() => deleteCompletedSession(session.id)}
              className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
              aria-label="Usuń sesję"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {session.notes && (
            <p className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
              {session.notes}
            </p>
          )}

          <div className="mt-4 space-y-3">
            {session.entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{entry.exerciseNameSnapshot}</span>
                  <span className="text-stone-500">
                    {entry.sets.filter((set) => set.completed).length} serii
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.sets
                    .filter((set) => set.completed)
                    .map((set) => (
                      <span
                        key={set.id}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600"
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
