import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, FolderPlus, RotateCcw, Save, Trash2 } from 'lucide-react';
import ExercisePicker from '../components/ExercisePicker';
import { useWorkoutStore } from '../store';
import { ExerciseDefinition, WorkoutPlan } from '../types';

const ExerciseListEditor = ({
  exerciseIds,
  exerciseMap,
  onRemove,
  onMove,
  editable = true,
}: {
  exerciseIds: string[];
  exerciseMap: Map<string, ExerciseDefinition>;
  onRemove: (exerciseId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  editable?: boolean;
}) => (
  <div className="space-y-2">
    {exerciseIds.length > 0 ? (
      exerciseIds.map((exerciseId, index) => {
        const exercise = exerciseMap.get(exerciseId);
        if (!exercise) {
          return null;
        }

        return (
          <div
            key={`${exerciseId}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface-card px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary break-words">{exercise.name}</p>
              <p className="text-xs text-text-secondary">
                {exercise.targetSets} serii • {exercise.repRange.min}-{exercise.repRange.max}{' '}
                {exercise.type === 'time' ? 'sek.' : 'powt.'}
              </p>
            </div>
            {editable && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(index, index - 1)}
                  disabled={index === 0}
                  className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Przesuń wyżej"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, index + 1)}
                  disabled={index === exerciseIds.length - 1}
                  className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Przesuń niżej"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(exerciseId)}
                  className="rounded-lg p-2 text-danger-text transition-colors hover:bg-danger-soft"
                  aria-label="Usuń ćwiczenie"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        );
      })
    ) : (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-sm text-text-secondary">
        Brak ćwiczeń w planie.
      </div>
    )}
  </div>
);

export default function Plans() {
  const plans = useWorkoutStore((state) => state.plans);
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const exerciseLibrary = useWorkoutStore((state) => state.exerciseLibrary);
  const createCustomPlan = useWorkoutStore((state) => state.createCustomPlan);
  const saveActiveSessionAsPlan = useWorkoutStore((state) => state.saveActiveSessionAsPlan);
  const updatePlanExercises = useWorkoutStore((state) => state.updatePlanExercises);
  const deleteCustomPlan = useWorkoutStore((state) => state.deleteCustomPlan);
  const setPlanActive = useWorkoutStore((state) => state.setPlanActive);

  const exerciseMap = useMemo(() => {
    const map = new Map<string, ExerciseDefinition>();
    exerciseLibrary.forEach((exercise) => map.set(exercise.id, exercise));
    return map;
  }, [exerciseLibrary]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createExerciseIds, setCreateExerciseIds] = useState<string[]>([]);
  const [createPickerSelection, setCreatePickerSelection] = useState<string[]>([]);
  const [showSaveSessionForm, setShowSaveSessionForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingExerciseIds, setEditingExerciseIds] = useState<string[]>([]);
  const [editingPickerSelection, setEditingPickerSelection] = useState<string[]>([]);
  const editorPanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!editingPlanId) {
      return;
    }

    const plan = plans.find((item) => item.id === editingPlanId && item.source === 'custom');
    if (!plan) {
      setEditingPlanId(null);
      setEditingExerciseIds([]);
    }
  }, [editingPlanId, plans]);

  useEffect(() => {
    if (!editingPlanId) {
      return;
    }

    editorPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [editingPlanId]);

  const activeSystemPlans = plans.filter((plan) => plan.source === 'system' && plan.isActive);
  const customPlans = plans.filter((plan) => plan.source === 'custom');
  const inactiveSystemPlans = plans.filter((plan) => plan.source === 'system' && !plan.isActive);

  const createAvailableExercises = exerciseLibrary.filter((exercise) => !createExerciseIds.includes(exercise.id));
  const editingPlan = editingPlanId
    ? plans.find((plan) => plan.id === editingPlanId && plan.source === 'custom')
    : undefined;
  const editingAvailableExercises = exerciseLibrary.filter((exercise) => !editingExerciseIds.includes(exercise.id));

  const handleCreatePlan = () => {
    const planId = createCustomPlan(createName, createDescription, createExerciseIds);
    if (!planId) {
      return;
    }

    setShowCreateForm(false);
    setCreateName('');
    setCreateDescription('');
    setCreateExerciseIds([]);
    setCreatePickerSelection([]);
  };

  const handleSaveActiveSessionPlan = () => {
    const planId = saveActiveSessionAsPlan(saveName, saveDescription);
    if (!planId) {
      return;
    }

    setShowSaveSessionForm(false);
    setSaveName('');
    setSaveDescription('');
  };

  const openEditPlan = (plan: WorkoutPlan) => {
    setEditingPlanId(plan.id);
    setEditingExerciseIds([...plan.exerciseIds]);
    setEditingPickerSelection([]);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-surface-card p-5 sm:p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-text-primary">Plany Treningowe</h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Zarządzaj gotowymi planami treningowymi, twórz własne zestawy ćwiczeń i ukrywaj plany systemowe.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:min-w-[360px]">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm((value) => !value);
                setShowSaveSessionForm(false);
              }}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-brand-hover"
            >
              <FolderPlus className="h-4 w-4" />
              Nowy plan
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSaveSessionForm((value) => !value);
                setShowCreateForm(false);
              }}
              disabled={!activeSession}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-btn-dark px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-btn-dark-hover disabled:cursor-not-allowed disabled:bg-border-strong"
            >
              <Save className="h-4 w-4" />
              Zapisz aktywny plan
            </button>
          </div>
        </div>
      </section>

      {showCreateForm && (
        <section className="rounded-[2rem] border border-border bg-surface-card p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-brand-border bg-brand-soft px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-brand-text">
                Tworzenie planu
              </span>
              <h3 className="mt-3 text-xl font-bold text-text-primary">Nowy plan</h3>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Nazwa jest obowiązkowa. Opis jest opcjonalny i po zapisie pozostanie tylko do odczytu.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary sm:max-w-xs">
              Dodaj nazwę, wybierz ćwiczenia i ustaw ich kolejność przed zapisem.
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-primary">Nazwa</span>
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
                placeholder="Np. Góra - szybki miks"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-primary">Opis</span>
              <input
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
                placeholder="Opcjonalny opis"
              />
            </label>
          </div>
          <ExercisePicker
            exercises={createAvailableExercises}
            value={createPickerSelection}
            onChange={setCreatePickerSelection}
            onSubmit={(exerciseIds) => {
              setCreateExerciseIds((current) => [...current, ...exerciseIds]);
              setCreatePickerSelection([]);
            }}
            placeholder="Dodaj ćwiczenia do planu"
            submitLabel="Dodaj do planu"
          />
          <ExerciseListEditor
            exerciseIds={createExerciseIds}
            exerciseMap={exerciseMap}
            onRemove={(exerciseId) => setCreateExerciseIds((current) => current.filter((id) => id !== exerciseId))}
            onMove={(fromIndex, toIndex) =>
              setCreateExerciseIds((current) => {
                if (toIndex < 0 || toIndex >= current.length) return current;
                const next = [...current];
                const [moved] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, moved);
                return next;
              })
            }
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCreatePlan}
              disabled={!createName.trim() || createExerciseIds.length === 0}
              className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-border-strong"
            >
              Zapisz plan
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setCreateName('');
                setCreateDescription('');
                setCreateExerciseIds([]);
                setCreatePickerSelection([]);
              }}
              className="rounded-xl bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
            >
              Anuluj
            </button>
          </div>
        </section>
      )}

      {showSaveSessionForm && (
        <section className="rounded-[2rem] border border-success-border bg-success-soft p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary">Zapisz aktywną sesję jako plan</h3>
            <p className="text-sm text-text-secondary mt-1">
              Zapisujemy kolejność ćwiczeń z bieżącej sesji. Wyniki serii i ciężary nie są kopiowane.
            </p>
          </div>
          {activeSession ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-text-primary">Nazwa</span>
                  <input
                    value={saveName}
                    onChange={(event) => setSaveName(event.target.value)}
                    className="w-full rounded-xl border border-border-strong px-3 py-3 focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:outline-none"
                    placeholder="Np. Mój plan na pośladki"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-text-primary">Opis</span>
                  <input
                    value={saveDescription}
                    onChange={(event) => setSaveDescription(event.target.value)}
                    className="w-full rounded-xl border border-border-strong px-3 py-3 focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:outline-none"
                    placeholder="Opcjonalny opis"
                  />
                </label>
              </div>
          <ExerciseListEditor
            exerciseIds={activeSession.entries.map((entry) => entry.exerciseId)}
            exerciseMap={exerciseMap}
            onRemove={() => {}}
            onMove={() => {}}
            editable={false}
          />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSaveActiveSessionPlan}
                  disabled={!saveName.trim() || activeSession.entries.length === 0}
                  className="rounded-xl bg-success px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-success-hover disabled:cursor-not-allowed disabled:bg-border-strong"
                >
                  Zapisz z sesji
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveSessionForm(false);
                    setSaveName('');
                    setSaveDescription('');
                  }}
                  className="rounded-xl bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
                >
                  Anuluj
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-secondary">Brak aktywnej sesji do zapisania.</p>
          )}
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] xl:items-start">
        <section className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-text-primary">Aktywne plany systemowe</h3>
            {activeSystemPlans.map((plan) => (
              <article key={plan.id} className="rounded-[2rem] border border-border bg-surface-card p-5 shadow-sm space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-text">Systemowy</span>
                      <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success-text">Aktywny</span>
                    </div>
                    <h4 className="mt-3 text-xl font-bold text-text-primary break-words">{plan.name}</h4>
                    <p className="mt-1 text-sm text-text-secondary">{plan.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlanActive(plan.id, false)}
                    className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger-text transition-colors hover:bg-danger-hover-bg"
                  >
                    Wyłącz
                  </button>
                </div>
                <ExerciseListEditor
                  exerciseIds={plan.exerciseIds}
                  exerciseMap={exerciseMap}
                  onRemove={() => {}}
                  onMove={() => {}}
                  editable={false}
                />
              </article>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-text-primary">Twoje plany treningowe</h3>
            {customPlans.length > 0 ? (
              customPlans.map((plan) => (
                <article key={plan.id} className="rounded-[2rem] border border-border bg-surface-card p-5 shadow-sm space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-semibold text-accent-violet">Własny</span>
                        <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-semibold text-text-secondary">
                          {plan.exerciseIds.length} ćwiczeń
                        </span>
                      </div>
                      <h4 className="mt-3 text-xl font-bold text-text-primary break-words">{plan.name}</h4>
                      <p className="mt-1 text-sm text-text-secondary">{plan.description || 'Brak opisu'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditPlan(plan)}
                        className="rounded-xl bg-btn-dark px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-btn-dark-hover"
                      >
                        Edytuj ćwiczenia
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomPlan(plan.id)}
                        className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger-text transition-colors hover:bg-danger-hover-bg"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                  <ExerciseListEditor
                    exerciseIds={plan.exerciseIds}
                    exerciseMap={exerciseMap}
                    onRemove={() => {}}
                    onMove={() => {}}
                    editable={false}
                  />
                </article>
              ))
            ) : (
              <div className="rounded-[2rem] border border-dashed border-border-strong bg-surface-card p-6 text-sm text-text-secondary">
                Nie masz jeszcze własnych planów treningowych.
              </div>
            )}
          </div>

          {inactiveSystemPlans.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-text-primary">Wyłączone plany systemowe</h3>
              {inactiveSystemPlans.map((plan) => (
                <article key={plan.id} className="rounded-[2rem] border border-border bg-surface-card p-5 shadow-sm space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-text">Systemowy</span>
                        <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-semibold text-text-secondary">Wyłączony</span>
                      </div>
                      <h4 className="mt-3 text-xl font-bold text-text-primary break-words">{plan.name}</h4>
                      <p className="mt-1 text-sm text-text-secondary">{plan.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlanActive(plan.id, true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-success-hover"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Przywróć
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-text-primary">Edycja planu treningowego</h3>
            <section
              ref={editorPanelRef}
              className="rounded-[2rem] border border-border bg-surface-card p-5 shadow-sm xl:sticky xl:top-6"
            >
            {editingPlan ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Własny plan</p>
                  <h4 className="mt-2 text-xl font-bold text-text-primary break-words">{editingPlan.name}</h4>
                  <p className="mt-1 text-sm text-text-secondary">{editingPlan.description || 'Brak opisu'}</p>
                </div>
                <ExercisePicker
                  exercises={editingAvailableExercises}
                  value={editingPickerSelection}
                  onChange={setEditingPickerSelection}
                  onSubmit={(exerciseIds) => {
                    setEditingExerciseIds((current) => [...current, ...exerciseIds]);
                    setEditingPickerSelection([]);
                  }}
                  placeholder="Dodaj ćwiczenia do planu"
                  submitLabel="Dodaj do listy"
                />
                <ExerciseListEditor
                  exerciseIds={editingExerciseIds}
                  exerciseMap={exerciseMap}
                  onRemove={(exerciseId) => setEditingExerciseIds((current) => current.filter((id) => id !== exerciseId))}
                  onMove={(fromIndex, toIndex) =>
                    setEditingExerciseIds((current) => {
                      if (toIndex < 0 || toIndex >= current.length) return current;
                      const next = [...current];
                      const [moved] = next.splice(fromIndex, 1);
                      next.splice(toIndex, 0, moved);
                      return next;
                    })
                  }
                />
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updatePlanExercises(editingPlan.id, editingExerciseIds);
                      setEditingPlanId(null);
                      setEditingExerciseIds([]);
                      setEditingPickerSelection([]);
                    }}
                    disabled={editingExerciseIds.length === 0}
                    className="rounded-xl bg-btn-dark px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-btn-dark-hover disabled:cursor-not-allowed disabled:bg-border-strong"
                  >
                    Zapisz skład planu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlanId(null);
                      setEditingExerciseIds([]);
                      setEditingPickerSelection([]);
                    }}
                    className="rounded-xl bg-surface-raised px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-inset"
                  >
                    Zamknij edycję
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Wybierz własny plan z listy i kliknij „Edytuj ćwiczenia”, żeby zmienić jego skład lub kolejność.
              </p>
            )}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
