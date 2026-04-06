import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import ExerciseLogger from './ExerciseLogger';
import ExercisePicker from './ExercisePicker';
import ProgressIndicator from './ProgressIndicator';
import RestTimer from './RestTimer';
import { ExerciseDefinition, SessionEntry } from '../types';
import { useWorkoutStore } from '../store';

export default function ActiveTrainingView() {
  const navigate = useNavigate();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {}
    };

    acquire();

    return () => {
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, []);

  const activeSession = useWorkoutStore((state) => state.activeSession);
  const exerciseLibrary = useWorkoutStore((state) => state.exerciseLibrary);
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const addExerciseToActiveSession = useWorkoutStore((state) => state.addExerciseToActiveSession);
  const updateSetInActiveSession = useWorkoutStore((state) => state.updateSetInActiveSession);
  const addSetToEntry = useWorkoutStore((state) => state.addSetToEntry);
  const updateEntryNotes = useWorkoutStore((state) => state.updateEntryNotes);
  const removeEntryFromActiveSession = useWorkoutStore((state) => state.removeEntryFromActiveSession);
  const completeActiveSession = useWorkoutStore((state) => state.completeActiveSession);
  const abandonActiveSession = useWorkoutStore((state) => state.abandonActiveSession);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const availableExercises = useMemo(
    () =>
      exerciseLibrary.filter(
        (exercise) =>
          !activeSession?.entries.some((entry) => entry.exerciseId === exercise.id),
      ),
    [activeSession?.entries, exerciseLibrary],
  );

  useEffect(() => {
    const availableIds = new Set(availableExercises.map((exercise) => exercise.id));
    setSelectedExerciseIds((current) => current.filter((exerciseId) => availableIds.has(exerciseId)));
  }, [availableExercises]);

  const definitionMap = useMemo(() => {
    const map = new Map<string, ExerciseDefinition>();
    for (const def of exerciseLibrary) {
      map.set(def.id, def);
    }
    return map;
  }, [exerciseLibrary]);

  const previousEntryMap = useMemo(() => {
    const map = new Map<string, SessionEntry>();
    const completed = [...completedSessions]
      .filter((session) => session.status === 'completed')
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? b.startedAt).getTime() -
          new Date(a.completedAt ?? a.startedAt).getTime(),
      );

    for (const session of completed) {
      for (const entry of session.entries) {
        if (!map.has(entry.exerciseId)) {
          map.set(entry.exerciseId, entry);
        }
      }
    }

    return map;
  }, [completedSessions]);

  if (!activeSession) {
    return null;
  }

  const handleAddExercises = (exerciseIds: string[]) => {
    if (exerciseIds.length === 0) {
      return;
    }

    exerciseIds.forEach((exerciseId) => addExerciseToActiveSession(exerciseId));
    setSelectedExerciseIds([]);
  };

  const handleComplete = () => {
    completeActiveSession();
    navigate('/recap');
  };

  return (
    <div className="space-y-6">
      <section className="bg-surface-card rounded-2xl border border-border shadow-sm p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">Aktywna sesja</h2>
          <p className="max-w-2xl text-text-secondary">
            Dodawaj ćwiczenia, loguj serie i wracaj tutaj w dowolnym momencie bez ryzyka utraty draftu.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => abandonActiveSession()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-text-inverted transition-opacity hover:opacity-90 active:bg-danger-active-bg focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:min-h-0"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Porzuć sesję</span>
          </button>
          <button
            onClick={handleComplete}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-success px-5 py-3 font-semibold text-text-inverted transition-colors hover:bg-success-hover active:bg-success-active focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="leading-tight text-center">Zakończ sesję</span>
          </button>
        </div>

        <div>
          <ExercisePicker
            exercises={availableExercises}
            value={selectedExerciseIds}
            onChange={setSelectedExerciseIds}
            onSubmit={handleAddExercises}
            placeholder="Dodaj ćwiczenie do sesji"
            submitLabel="Dodaj"
          />
        </div>
      </section>

      <section className="space-y-4">
        {activeSession.entries.map((entry, index) => {
          const definition = definitionMap.get(entry.exerciseId);
          if (!definition) {
            return null;
          }

          return (
            <div key={entry.id} className="bg-surface-card rounded-2xl border border-border shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-secondary">Ćwiczenie {index + 1}</p>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary leading-tight break-words">{entry.exerciseName}</h3>
                  <p className="text-sm text-text-secondary">
                    Target: {entry.targetSets} serii • {entry.repRange.min}-{entry.repRange.max}{' '}
                    {entry.exerciseType === 'time' ? 'sek.' : 'powt.'}
                  </p>
                </div>
                <button
                  onClick={() => removeEntryFromActiveSession(entry.id)}
                  className="p-2 rounded-lg text-danger-text hover:bg-danger-soft active:bg-danger-hover-bg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <ExerciseLogger
                entry={entry}
                previousEntry={previousEntryMap.get(entry.exerciseId)}
                onSetChange={(setId, patch) => updateSetInActiveSession(entry.id, setId, patch)}
                onAddSet={() => addSetToEntry(entry.id)}
                onNotesChange={(notes) => updateEntryNotes(entry.id, notes)}
              />

              <ProgressIndicator
                definition={definition}
                entry={entry}
                previousEntry={previousEntryMap.get(entry.exerciseId)}
              />

              <RestTimer />
            </div>
          );
        })}
      </section>
    </div>
  );
}
