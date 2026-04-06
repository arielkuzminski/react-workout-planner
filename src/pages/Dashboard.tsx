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
import { getEntryVolume } from '../utils/analyticsUtils';

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

        const volume = getEntryVolume(entry);
        const topSet = entry.exerciseType === 'weight'
          ? entry.sets.reduce((best, set) => {
              const setVol = (set.weight ?? 0) * (set.reps ?? 0);
              return setVol > (best.weight ?? 0) * (best.reps ?? 0) ? set : best;
            }, entry.sets[0])
          : entry.sets.reduce((best, set) =>
              (set.durationSec ?? 0) > (best.durationSec ?? 0) ? set : best,
            entry.sets[0]);

        return [
          {
            date: new Date(session.completedAt ?? session.startedAt).toLocaleDateString('pl-PL'),
            volume,
            topSet: entry.exerciseType === 'weight'
              ? `${topSet?.weight ?? 0}kg × ${topSet?.reps ?? 0}`
              : `${topSet?.durationSec ?? 0}s`,
          },
        ];
      });
  }, [completedSessions, selectedExerciseId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">Progres</h2>
        <p className="mt-1 text-stone-500">Lekki widok trendu zamiast ciężkiego dashboardu.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-stone-500">Zakończone sesje</p>
          <p className="mt-2 text-3xl sm:text-4xl font-bold">{completedSessions.length}</p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-stone-500">Ćwiczenia w obiegu</p>
          <p className="mt-2 text-3xl sm:text-4xl font-bold">{usedExerciseIds.length}</p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-stone-500">Ostatnia sesja</p>
          <p className="mt-2 text-lg sm:text-xl font-bold break-words">
            {completedSessions[0]
              ? new Date(completedSessions[0].completedAt ?? completedSessions[0].startedAt).toLocaleDateString('pl-PL')
              : 'Brak'}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
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
        <section className="rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold break-words">{selectedExercise.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-stone-600">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              {selectedExercise.type === 'time' ? 'Czas łączny (s)' : 'Objętość (kg)'}
            </div>
          </div>

          <div className="h-64 sm:h-72 -mx-2 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                <YAxis width={36} tick={{ fontSize: 11 }} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload as { date: string; volume: number; topSet: string };
                  return (
                    <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-md">
                      <p className="font-medium">{data.date}</p>
                      <p className="text-emerald-600">
                        {selectedExercise?.type === 'time' ? 'Czas' : 'Objętość'}: {data.volume.toLocaleString('pl-PL')}{selectedExercise?.type === 'time' ? 's' : ' kg'}
                      </p>
                      <p className="text-stone-500">Top set: {data.topSet}</p>
                    </div>
                  );
                }} />
                <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-6 sm:p-8 text-center text-stone-500">
          Wybierz ćwiczenie, żeby zobaczyć trend.
        </div>
      )}
    </div>
  );
}
