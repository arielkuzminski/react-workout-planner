import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import ExerciseLogger from '../components/ExerciseLogger';
import ProgressIndicator from '../components/ProgressIndicator';
import RestTimer from '../components/RestTimer';
import { ExerciseDefinition, SessionEntry } from '../types';
import { useWorkoutStore } from '../store';

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
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const addExerciseToActiveSession = useWorkoutStore((state) => state.addExerciseToActiveSession);
  const updateSetInActiveSession = useWorkoutStore((state) => state.updateSetInActiveSession);
  const addSetToEntry = useWorkoutStore((state) => state.addSetToEntry);
  const updateEntryNotes = useWorkoutStore((state) => state.updateEntryNotes);
  const removeEntryFromActiveSession = useWorkoutStore((state) => state.removeEntryFromActiveSession);
  const completeActiveSession = useWorkoutStore((state) => state.completeActiveSession);
  const abandonActiveSession = useWorkoutStore((state) => state.abandonActiveSession);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  const availableExercises = useMemo(
    () =>
      exerciseLibrary.filter(
        (exercise) =>
          !activeSession?.entries.some((entry) => entry.exerciseId === exercise.id)
      ),
    [activeSession?.entries, exerciseLibrary]
  );

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
        <p className="text-gray-600 mt-2">Wróć na start i zacznij nową sesję albo wybierz template.</p>
        <Link
          to="/"
          className="inline-flex mt-4 px-4 py-3 rounded-xl bg-blue-700 text-white font-semibold"
        >
          Wróć do startu
        </Link>
      </div>
    );
  }

  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      return;
    }

    addExerciseToActiveSession(selectedExerciseId);
    setSelectedExerciseId('');
  };

  const handleComplete = () => {
    completeActiveSession();
    navigate('/recap');
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {activeSession.templateId ? `Template ${activeSession.templateId}` : 'Quick log'}
            </p>
            <h2 className="text-3xl font-bold text-gray-900">Aktywna sesja</h2>
            <p className="text-gray-600 mt-1">
              Zacznij od gotowego template&apos;u albo dynamicznie dodawaj ćwiczenia.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                abandonActiveSession();
                navigate('/');
              }}
              className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
            >
              Porzuć
            </button>
            <button
              onClick={handleComplete}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Zakończ sesję
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <select
            value={selectedExerciseId}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            className="px-3 py-3 rounded-xl border border-gray-300"
          >
            <option value="">Dodaj ćwiczenie do sesji</option>
            {availableExercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddExercise}
            disabled={!selectedExerciseId}
            className="px-4 py-3 rounded-xl bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {activeSession.entries.map((entry, index) => {
          const definition = definitionMap.get(entry.exerciseId);
          if (!definition) {
            return null;
          }

          return (
            <div key={entry.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ćwiczenie {index + 1}</p>
                  <h3 className="text-xl font-bold text-gray-900">{entry.exerciseName}</h3>
                  <p className="text-sm text-gray-600">
                    Target: {entry.targetSets} serii • {entry.repRange.min}-{entry.repRange.max}{' '}
                    {entry.exerciseType === 'time' ? 'sek.' : 'powt.'}
                  </p>
                </div>
                <button
                  onClick={() => removeEntryFromActiveSession(entry.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"
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
