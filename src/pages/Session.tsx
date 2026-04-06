import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Trash2 } from 'lucide-react';
import ExerciseLogger from '../components/ExerciseLogger';
import ExercisePicker from '../components/ExercisePicker';
import ProgressIndicator from '../components/ProgressIndicator';
import RestTimer from '../components/RestTimer';
import { ExerciseDefinition, SessionEntry } from '../types';
import { useWorkoutStore } from '../store';
import { getPlanNameById } from '../utils/templateUtils';

export default function Session() {
  const navigate = useNavigate();

  // Wake Lock — keep screen on during active session
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
    return () => { wakeLockRef.current?.release(); wakeLockRef.current = null; };
  }, []);
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const exerciseLibrary = useWorkoutStore((state) => state.exerciseLibrary);
  const plans = useWorkoutStore((state) => state.plans);
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
          !activeSession?.entries.some((entry) => entry.exerciseId === exercise.id)
      ),
    [activeSession?.entries, exerciseLibrary]
  );

  useEffect(() => {
    const availableIds = new Set(availableExercises.map((exercise) => exercise.id));
    setSelectedExerciseIds((current) => current.filter((exerciseId) => availableIds.has(exerciseId)));
  }, [availableExercises]);

  const definitionMap = useMemo(() => {
    const map = new Map<string, ExerciseDefinition>();
    for (const def of exerciseLibrary) map.set(def.id, def);
    return map;
  }, [exerciseLibrary]);

  const previousEntryMap = useMemo(() => {
    const map = new Map<string, SessionEntry>();
    const completed = [...completedSessions]
      .filter((s) => s.status === 'completed')
      .sort((a, b) =>
        new Date(b.completedAt ?? b.startedAt).getTime() -
        new Date(a.completedAt ?? a.startedAt).getTime()
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
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Brak aktywnej sesji</h2>
        <p className="text-gray-600 mt-2">Wróć na start i zacznij nową sesję albo wybierz plan treningowy.</p>
        <Link
          to="/"
          className="inline-flex mt-4 px-4 py-3 rounded-xl bg-blue-700 text-white font-semibold"
        >
          Wróć do startu
        </Link>
      </div>
    );
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
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-700">
              {getPlanNameById(plans, activeSession.planId, 'Quick log')}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Aktywna sesja</h2>
            <p className="text-gray-600 mt-1">
              Zacznij od gotowego planu albo dynamicznie dodawaj ćwiczenia.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button
              onClick={() => {
                abandonActiveSession();
                navigate('/');
              }}
              className="min-h-14 px-3 sm:px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Porzuć
            </button>
            <button
              onClick={handleComplete}
              className="min-h-14 px-3 sm:px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="leading-tight text-center">Zakończ sesję</span>
            </button>
          </div>
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
            <div key={entry.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Ćwiczenie {index + 1}</p>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight break-words">{entry.exerciseName}</h3>
                  <p className="text-sm text-gray-600">
                    Target: {entry.targetSets} serii • {entry.repRange.min}-{entry.repRange.max}{' '}
                    {entry.exerciseType === 'time' ? 'sek.' : 'powt.'}
                  </p>
                </div>
                <button
                  onClick={() => removeEntryFromActiveSession(entry.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none shrink-0"
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
