import { useState } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CheckCircle2, X } from 'lucide-react';
import AppDialog from './AppDialog';
import ExerciseLogger from './ExerciseLogger';
import { SessionEntry, SessionSet, WorkoutSession } from '../types';
import { useWorkoutStore } from '../store';
import { usePreferencesStore } from '../store/preferencesStore';
import { createId } from '../utils/sessionUtils';
import { getPlanLabelBySession } from '../utils/templateUtils';

interface SessionEditorProps {
  session: WorkoutSession;
  onSave: (entries: SessionEntry[]) => void;
  onCancel: () => void;
}

const cloneEntries = (entries: SessionEntry[]): SessionEntry[] =>
  entries.map((entry) => ({
    ...entry,
    sets: entry.sets.map((set) => ({ ...set })),
  }));

export default function SessionEditor({ session, onSave, onCancel }: SessionEditorProps) {
  const plans = useWorkoutStore((state) => state.plans);
  const weightIncrementKg = usePreferencesStore((state) => state.weightIncrementKg);

  const [entries, setEntries] = useState<SessionEntry[]>(() => cloneEntries(session.entries));
  const [showLastSetDialog, setShowLastSetDialog] = useState(false);

  const title = getPlanLabelBySession(plans, session, 'Freestyle session');
  const dateLabel = format(
    new Date(session.endedAt || session.completedAt || session.startedAt),
    "d MMM yyyy, HH:mm",
    { locale: pl },
  );

  const handleSetChange = (
    entryId: string,
    setId: string,
    patch: { weight?: number; reps?: number; durationSec?: number },
  ) => {
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }
        return {
          ...entry,
          sets: entry.sets.map((setEntry) => {
            if (setEntry.id !== setId) {
              return setEntry;
            }
            const nextSet = { ...setEntry, ...patch };
            const completed =
              entry.exerciseType === 'time'
                ? (nextSet.durationSec ?? 0) > 0
                : (nextSet.reps ?? 0) > 0;
            return { ...nextSet, completed };
          }),
        };
      }),
    );
  };

  const handleAddSet = (entryId: string) => {
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }
        const lastSet = entry.sets[entry.sets.length - 1];
        const nextSet: SessionSet = {
          id: createId('set'),
          setNumber: entry.sets.length + 1,
          weight: entry.exerciseType === 'weight' ? lastSet?.weight ?? 0 : 0,
          reps: entry.exerciseType === 'weight' ? lastSet?.reps : undefined,
          durationSec:
            entry.exerciseType === 'time'
              ? lastSet?.durationSec ?? entry.repRange.min
              : undefined,
          completed: false,
        };
        return {
          ...entry,
          sets: [...entry.sets, nextSet],
        };
      }),
    );
  };

  const handleRemoveSet = (entryId: string, setId: string) => {
    const targetEntry = entries.find((entry) => entry.id === entryId);
    if (!targetEntry) {
      return;
    }
    if (targetEntry.sets.length <= 1) {
      setShowLastSetDialog(true);
      return;
    }
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }
        const nextSets = entry.sets
          .filter((setEntry) => setEntry.id !== setId)
          .map((setEntry, index) => ({
            ...setEntry,
            setNumber: index + 1,
          }));
        return {
          ...entry,
          sets: nextSets,
        };
      }),
    );
  };

  const handleNotesChange = (entryId: string, notes: string) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, notes } : entry)),
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-secondary">Edycja sesji</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-text-primary break-words">
              {title}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{dateLabel}</p>
          </div>
          <div className="flex flex-row-reverse items-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised active:bg-surface-inset focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
            >
              <X className="h-4 w-4 shrink-0" />
              <span>Anuluj</span>
            </button>
            <button
              type="button"
              onClick={() => onSave(entries)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-success-hover active:bg-success-active focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Zapisz</span>
            </button>
          </div>
        </div>
      </section>

      {entries.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-surface-card p-6 text-center text-text-secondary shadow-sm">
          Ta sesja nie zawiera żadnych ćwiczeń.
        </div>
      ) : (
        <section className="space-y-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="space-y-4 rounded-2xl border border-border bg-surface-card p-4 shadow-sm sm:p-6"
            >
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">Ćwiczenie {index + 1}</p>
                <h3 className="text-lg sm:text-xl font-bold leading-tight text-text-primary break-words">
                  {entry.exerciseNameSnapshot}
                </h3>
              </div>

              <ExerciseLogger
                entry={entry}
                weightIncrementKg={weightIncrementKg}
                onSetChange={(setId, patch) => handleSetChange(entry.id, setId, patch)}
                onAddSet={() => handleAddSet(entry.id)}
                onRemoveSet={(setId) => handleRemoveSet(entry.id, setId)}
                onNotesChange={(notes) => handleNotesChange(entry.id, notes)}
              />
            </div>
          ))}
        </section>
      )}

      <AppDialog
        open={showLastSetDialog}
        variant="warning"
        title="Nie można usunąć ostatniej serii"
        description="Ćwiczenie musi mieć przynajmniej jedną serię. Jeśli chcesz pozbyć się tego ćwiczenia z sesji, usuń całą sesję z listy historii."
        confirmLabel="Rozumiem"
        showCancel={false}
        onConfirm={() => setShowLastSetDialog(false)}
        onClose={() => setShowLastSetDialog(false)}
      />
    </div>
  );
}
