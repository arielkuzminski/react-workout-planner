import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Trash2, X } from 'lucide-react';
import ExerciseLogger from './ExerciseLogger';
import ExercisePicker from './ExercisePicker';
import ProgressIndicator from './ProgressIndicator';
import RestTimer from './RestTimer';
import { ExerciseDefinition, SessionEntry } from '../types';
import { useWorkoutStore } from '../store';
import { usePreferencesStore } from '../store/preferencesStore';
import { getLastCompletedEntry, getLastCompletedEntryForPlan } from '../utils/sessionUtils';

export default function ActiveTrainingView() {
  const navigate = useNavigate();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [entryPendingRemoval, setEntryPendingRemoval] = useState<SessionEntry | null>(null);
  const [removeEntryReason, setRemoveEntryReason] = useState<'trash' | 'last-set' | null>(null);

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
  const removeSetFromEntry = useWorkoutStore((state) => state.removeSetFromEntry);
  const updateEntryNotes = useWorkoutStore((state) => state.updateEntryNotes);
  const removeEntryFromActiveSession = useWorkoutStore((state) => state.removeEntryFromActiveSession);
  const completeActiveSession = useWorkoutStore((state) => state.completeActiveSession);
  const abandonActiveSession = useWorkoutStore((state) => state.abandonActiveSession);
  const restTimerSeconds = usePreferencesStore((state) => state.restTimerSeconds);
  const restTimerSoundEnabled = usePreferencesStore((state) => state.restTimerSoundEnabled);
  const weightIncrementKg = usePreferencesStore((state) => state.weightIncrementKg);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const availableExercises = useMemo(
    () =>
      exerciseLibrary.filter(
        (exercise) =>
          !exercise.isHidden &&
          !activeSession?.entries.some((entry) => entry.exerciseId === exercise.id),
      ),
    [activeSession?.entries, exerciseLibrary],
  );

  useEffect(() => {
    const availableIds = new Set(availableExercises.map((exercise) => exercise.id));
    setSelectedExerciseIds((current) => current.filter((exerciseId) => availableIds.has(exerciseId)));
  }, [availableExercises]);

  useEffect(() => {
    if (!entryPendingRemoval || !activeSession?.entries.some((entry) => entry.id === entryPendingRemoval.id)) {
      setEntryPendingRemoval(null);
      setRemoveEntryReason(null);
    }
  }, [activeSession?.entries, entryPendingRemoval]);

  const definitionMap = useMemo(() => {
    const map = new Map<string, ExerciseDefinition>();
    for (const def of exerciseLibrary) {
      map.set(def.id, def);
    }
    return map;
  }, [exerciseLibrary]);

  const previousEntryMap = useMemo(() => {
    const map = new Map<string, SessionEntry>();
    const exerciseIds = activeSession?.entries.map((entry) => entry.exerciseId) ?? [];

    exerciseIds.forEach((exerciseId) => {
      const entry = activeSession?.planId
        ? getLastCompletedEntryForPlan(completedSessions, activeSession.planId, exerciseId) ??
          getLastCompletedEntry(completedSessions, exerciseId)
        : getLastCompletedEntry(completedSessions, exerciseId);

      if (entry) {
        map.set(exerciseId, entry);
      }
    });

    return map;
  }, [activeSession?.entries, activeSession?.planId, completedSessions]);

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
    const completed = completeActiveSession();
    if (!completed) {
      window.alert('Uzupełnij przynajmniej jedną serię z wynikiem, zanim zakończysz sesję.');
      return;
    }
    navigate('/recap');
  };

  const openRemoveEntryModal = (entry: SessionEntry, reason: 'trash' | 'last-set') => {
    setEntryPendingRemoval(entry);
    setRemoveEntryReason(reason);
  };

  const handleRemoveSet = (entry: SessionEntry, setId: string) => {
    const result = removeSetFromEntry(entry.id, setId);
    if (result === 'confirm-remove-entry') {
      openRemoveEntryModal(entry, 'last-set');
    }
  };

  const handleConfirmRemoveEntry = () => {
    if (!entryPendingRemoval) {
      return;
    }

    removeEntryFromActiveSession(entryPendingRemoval.id);
    setEntryPendingRemoval(null);
    setRemoveEntryReason(null);
  };

  const handleCloseRemoveEntryModal = () => {
    setEntryPendingRemoval(null);
    setRemoveEntryReason(null);
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
                  onClick={() => openRemoveEntryModal(entry, 'trash')}
                  className="p-2 rounded-lg text-danger-text hover:bg-danger-soft active:bg-danger-hover-bg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none shrink-0"
                  aria-label={`Usuń ćwiczenie ${entry.exerciseName}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <ExerciseLogger
                entry={entry}
                previousEntry={previousEntryMap.get(entry.exerciseId)}
                weightIncrementKg={weightIncrementKg}
                onSetChange={(setId, patch) => updateSetInActiveSession(entry.id, setId, patch)}
                onAddSet={() => addSetToEntry(entry.id)}
                onRemoveSet={(setId) => handleRemoveSet(entry, setId)}
                onNotesChange={(notes) => updateEntryNotes(entry.id, notes)}
              />

              <ProgressIndicator
                definition={definition}
                entry={entry}
                previousEntry={previousEntryMap.get(entry.exerciseId)}
                weightIncrementKg={weightIncrementKg}
              />
            </div>
          );
        })}
      </section>

      <div className="sticky bottom-[4.75rem] z-20 md:bottom-4">
        <RestTimer
          defaultSeconds={restTimerSeconds}
          soundEnabled={restTimerSoundEnabled}
          className="shadow-lg backdrop-blur supports-[backdrop-filter]:bg-surface-card/95"
        />
      </div>

      {entryPendingRemoval && removeEntryReason && (
        <>
          <div
            className="fixed inset-0 z-40 bg-overlay"
            aria-hidden="true"
            onClick={handleCloseRemoveEntryModal}
          />
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-entry-title"
              aria-describedby="remove-entry-description"
              className="w-full max-w-md rounded-[28px] border border-border bg-surface-card p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger-text">
                    Ostrzeżenie
                  </p>
                  <h3 id="remove-entry-title" className="mt-2 text-xl font-bold text-text-primary break-words">
                    Usunąć ćwiczenie?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseRemoveEntryModal}
                  className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                  aria-label="Zamknij okno"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p id="remove-entry-description" className="mt-4 text-sm leading-6 text-text-secondary">
                {removeEntryReason === 'last-set'
                  ? `To była ostatnia seria ćwiczenia "${entryPendingRemoval.exerciseName}". Czy chcesz usunąć całe ćwiczenie z bieżącej sesji?`
                  : `Czy na pewno chcesz usunąć ćwiczenie "${entryPendingRemoval.exerciseName}" z bieżącej sesji?`}
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseRemoveEntryModal}
                  className="rounded-xl bg-surface-raised px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-inset"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoveEntry}
                  className="rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-text-inverted transition-opacity hover:opacity-90"
                >
                  Usuń ćwiczenie
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
