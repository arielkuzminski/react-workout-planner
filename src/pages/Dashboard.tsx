import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useWorkoutStore } from '../store';

export default function Progress() {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const exerciseLibrary = useWorkoutStore((state) => state.exerciseLibrary);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  const usedExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    completedSessions.forEach((session) => {
      session.entries.forEach((entry) => ids.add(entry.exerciseId));
    });
    return Array.from(ids);
  }, [completedSessions]);

  const selectedExercise = exerciseLibrary.find((exercise) => exercise.id === selectedExerciseId);

  const progressionData = useMemo(() => {
    if (!selectedExerciseId) {
      return [];
    }

    return completedSessions
      .slice()
      .reverse()
      .flatMap((session) => {
        const entry = session.entries.find((candidate) => candidate.exerciseId === selectedExerciseId);
        if (!entry) {
          return [];
        }

        const firstSet = entry.sets[0];
        return [
          {
            date: new Date(session.completedAt ?? session.startedAt).toLocaleDateString('pl-PL'),
            primary: entry.exerciseType === 'time' ? firstSet?.durationSec ?? 0 : firstSet?.weight ?? 0,
            secondary:
              entry.exerciseType === 'time'
                ? entry.sets.reduce((sum, set) => sum + (set.durationSec ?? 0), 0)
                : entry.sets.reduce((sum, set) => sum + (set.reps ?? 0), 0),
          },
        ];
      });
  }, [completedSessions, selectedExerciseId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Progres</h2>
        <p className="mt-1 text-stone-500">Lekki widok trendu zamiast ciężkiego dashboardu.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Zakończone sesje</p>
          <p className="mt-2 text-4xl font-bold">{completedSessions.length}</p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Ćwiczenia w obiegu</p>
          <p className="mt-2 text-4xl font-bold">{usedExerciseIds.length}</p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Ostatnia sesja</p>
          <p className="mt-2 text-xl font-bold">
            {completedSessions[0]
              ? new Date(completedSessions[0].completedAt ?? completedSessions[0].startedAt).toLocaleDateString('pl-PL')
              : 'Brak'}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <label htmlFor="exercise-select" className="text-sm font-semibold">Ćwiczenie</label>
        <select
          id="exercise-select"
          value={selectedExerciseId}
          onChange={(event) => setSelectedExerciseId(event.target.value)}
          className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
        >
          <option value="">Wybierz ćwiczenie</option>
          {usedExerciseIds.map((exerciseId) => {
            const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
            return (
              <option key={exerciseId} value={exerciseId}>
                {exercise?.name || exerciseId}
              </option>
            );
          })}
        </select>
      </section>

      {selectedExercise && progressionData.length > 0 ? (
        <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{selectedExercise.name}</h3>
            <p className="mt-1 text-sm text-stone-500">
              {selectedExercise.type === 'time'
                ? 'Primary = czas pierwszej serii, secondary = suma sekund'
                : 'Primary = ciężar pierwszej serii, secondary = suma reps'}
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="primary" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="secondary" stroke="#1f2937" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
          Wybierz ćwiczenie, żeby zobaczyć trend.
        </div>
      )}
    </div>
  );
}
