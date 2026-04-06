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
import ExercisePicker from '../components/ExercisePicker';
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
  const usedExercises = useMemo(
    () => exerciseLibrary.filter((exercise) => usedExerciseIds.includes(exercise.id)),
    [exerciseLibrary, usedExerciseIds],
  );

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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-text-primary">Progres</h2>
        <p className="mt-1 text-text-secondary">Lekki widok trendu zamiast ciężkiego dashboardu.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-text-secondary">Zakończone sesje</p>
          <p className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">{completedSessions.length}</p>
        </div>
        <div className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-text-secondary">Ćwiczenia w obiegu</p>
          <p className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">{usedExerciseIds.length}</p>
        </div>
        <div className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-text-secondary">Ostatnia sesja</p>
          <p className="mt-2 text-lg sm:text-xl font-bold break-words text-text-primary">
            {completedSessions[0]
              ? new Date(completedSessions[0].completedAt ?? completedSessions[0].startedAt).toLocaleDateString('pl-PL')
              : 'Brak'}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
        <p className="text-sm font-semibold text-text-primary">Ćwiczenie</p>
        <div className="mt-3">
          <ExercisePicker
            exercises={usedExercises}
            value={selectedExerciseId ? [selectedExerciseId] : []}
            onChange={(exerciseIds) => setSelectedExerciseId(exerciseIds[0] ?? '')}
            onSubmit={(exerciseIds) => setSelectedExerciseId(exerciseIds[0] ?? '')}
            placeholder="Wybierz ćwiczenie"
            selectionMode="single"
            showSelectionIndicator={false}
            showFooter={false}
            autoSubmitOnSelect
            title="Wybierz ćwiczenie"
            subtitle="Wybierz jedną pozycję z listy, aby zobaczyć trend."
          />
        </div>
      </section>

      {selectedExercise && progressionData.length > 0 ? (
        <section className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold break-words text-text-primary">{selectedExercise.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-text-secondary">
              <span className="inline-block h-3 w-3 rounded-full bg-success" />
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
                    <div className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm shadow-md">
                      <p className="font-medium text-text-primary">{data.date}</p>
                      <p className="text-success-text">
                        {selectedExercise?.type === 'time' ? 'Czas' : 'Objętość'}: {data.volume.toLocaleString('pl-PL')}{selectedExercise?.type === 'time' ? 's' : ' kg'}
                      </p>
                      <p className="text-text-secondary">Top set: {data.topSet}</p>
                    </div>
                  );
                }} />
                <Line type="monotone" dataKey="volume" stroke="var(--color-chart-line)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-border-strong bg-surface-card p-6 sm:p-8 text-center text-text-secondary">
          Wybierz ćwiczenie, żeby zobaczyć trend.
        </div>
      )}
    </div>
  );
}
