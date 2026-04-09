import { useEffect, useState } from 'react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { pl } from 'date-fns/locale';
import { BookmarkPlus, Pencil, Trash2 } from 'lucide-react';
import AppDialog from '../components/AppDialog';
import SessionEditor from '../components/SessionEditor';
import { useWorkoutStore } from '../store';
import { SessionEntry, WorkoutSession } from '../types';
import { getPlanLabelBySession } from '../utils/templateUtils';

export default function History() {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const plans = useWorkoutStore((state) => state.plans);
  const deleteCompletedSession = useWorkoutStore((state) => state.deleteCompletedSession);
  const updateCompletedSession = useWorkoutStore((state) => state.updateCompletedSession);
  const createCustomPlan = useWorkoutStore((state) => state.createCustomPlan);

  const [savingSession, setSavingSession] = useState<WorkoutSession | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedPlanName, setSavedPlanName] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const editingSession = editingSessionId
    ? completedSessions.find((session) => session.id === editingSessionId) ?? null
    : null;

  useEffect(() => {
    if (editingSessionId && !editingSession) {
      setEditingSessionId(null);
    }
  }, [editingSessionId, editingSession]);

  const handleSaveEditedSession = (entries: SessionEntry[]) => {
    if (!editingSessionId) {
      return;
    }
    updateCompletedSession(editingSessionId, entries);
    setEditingSessionId(null);
  };

  if (editingSession) {
    return (
      <SessionEditor
        session={editingSession}
        onSave={handleSaveEditedSession}
        onCancel={() => setEditingSessionId(null)}
      />
    );
  }

  const openSaveDialog = (session: WorkoutSession) => {
    const baseDate = new Date(session.endedAt || session.completedAt || session.startedAt);
    const defaultName = `Freestyle session — ${format(baseDate, 'd MMM yyyy', { locale: pl })}`;
    setSavingSession(session);
    setPlanName(defaultName);
    setPlanDescription('');
    setSaveError(null);
  };

  const closeSaveDialog = () => {
    setSavingSession(null);
    setPlanName('');
    setPlanDescription('');
    setSaveError(null);
  };

  const handleConfirmSave = () => {
    if (!savingSession) {
      return;
    }

    const trimmedName = planName.trim();
    if (!trimmedName) {
      setSaveError('Podaj nazwę planu.');
      return;
    }

    const exerciseIds = Array.from(
      new Set(savingSession.entries.map((entry) => entry.exerciseId))
    );

    if (exerciseIds.length === 0) {
      setSaveError('Sesja nie zawiera żadnych ćwiczeń.');
      return;
    }

    const planId = createCustomPlan(trimmedName, planDescription.trim(), exerciseIds);
    if (!planId) {
      setSaveError('Nie udało się zapisać planu. Sprawdź, czy ćwiczenia nadal istnieją w bibliotece.');
      return;
    }

    closeSaveDialog();
    setSavedPlanName(trimmedName);
  };

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

      {completedSessions.map((session) => {
        const isFreestyle = !session.planId;
        const hasEntries = session.entries.length > 0;
        return (
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
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setEditingSessionId(session.id)}
                  disabled={!hasEntries}
                  className="rounded-xl p-2 text-text-tertiary transition-colors hover:bg-brand-soft hover:text-brand-text active:bg-brand-soft cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-tertiary"
                  aria-label="Edytuj sesję"
                  title="Edytuj sesję"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                {isFreestyle && (
                  <button
                    onClick={() => openSaveDialog(session)}
                    disabled={!hasEntries}
                    className="rounded-xl p-2 text-text-tertiary transition-colors hover:bg-success-soft hover:text-success-text active:bg-success-soft cursor-pointer focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-tertiary"
                    aria-label="Zapisz sesję jako plan treningowy"
                    title="Zapisz jako plan"
                  >
                    <BookmarkPlus className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteCompletedSession(session.id)}
                  className="rounded-xl p-2 text-text-tertiary transition-colors hover:bg-danger-soft hover:text-danger-text active:bg-danger-hover-bg cursor-pointer focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none"
                  aria-label="Usuń sesję"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
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
        );
      })}

      <AppDialog
        open={savingSession !== null}
        title="Zapisz sesję jako plan"
        description="Tworzymy nowy plan treningowy na podstawie ćwiczeń z tej sesji. Ciężary i liczba powtórzeń nie są kopiowane."
        variant="success"
        confirmTone="success"
        confirmLabel="Zapisz plan"
        cancelLabel="Anuluj"
        onConfirm={handleConfirmSave}
        onClose={closeSaveDialog}
      >
        <div className="space-y-3 text-text-primary">
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Nazwa planu</span>
            <input
              value={planName}
              onChange={(event) => {
                setPlanName(event.target.value);
                if (saveError) setSaveError(null);
              }}
              className="w-full rounded-xl border border-border-strong bg-surface-card px-3 py-3 text-sm focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:outline-none"
              placeholder="Np. Freestyle push day"
              autoFocus
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Opis (opcjonalny)</span>
            <input
              value={planDescription}
              onChange={(event) => setPlanDescription(event.target.value)}
              className="w-full rounded-xl border border-border-strong bg-surface-card px-3 py-3 text-sm focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:outline-none"
              placeholder="Krótki opis"
            />
          </label>
          {savingSession && (
            <p className="text-xs text-text-secondary">
              Ćwiczenia w planie:{' '}
              {Array.from(new Set(savingSession.entries.map((entry) => entry.exerciseNameSnapshot))).join(', ')}
            </p>
          )}
          {saveError && (
            <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-text">
              {saveError}
            </p>
          )}
        </div>
      </AppDialog>

      <AppDialog
        open={savedPlanName !== null}
        title="Plan zapisany"
        description={savedPlanName ? `Plan "${savedPlanName}" pojawił się w zakładce Plany Treningowe.` : undefined}
        variant="success"
        confirmTone="success"
        confirmLabel="OK"
        showCancel={false}
        onConfirm={() => setSavedPlanName(null)}
        onClose={() => setSavedPlanName(null)}
      />
    </div>
  );
}
