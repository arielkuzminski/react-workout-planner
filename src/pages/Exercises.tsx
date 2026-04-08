import { useEffect, useMemo, useRef, useState } from 'react';
import { Dumbbell, Eye, EyeOff, FolderPlus, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useWorkoutStore } from '../store';
import { ExerciseDefinition, ExerciseType, MovementGroup } from '../types';

const GROUP_ORDER: MovementGroup[] = ['legs', 'push', 'pull'];
const GROUP_LABELS: Record<MovementGroup, string> = {
  legs: 'Legs',
  push: 'Push',
  pull: 'Pull',
};

interface ExerciseFormState {
  name: string;
  type: ExerciseType;
  movementGroup: MovementGroup;
  targetSets: number;
  repMin: number;
  repMax: number;
  defaultWeight: number;
}

const emptyForm: ExerciseFormState = {
  name: '',
  type: 'weight',
  movementGroup: 'push',
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  defaultWeight: 20,
};

const formatRepRange = (exercise: ExerciseDefinition) =>
  `${exercise.repRange.min}-${exercise.repRange.max} ${exercise.type === 'time' ? 'sek.' : 'powt.'}`;

interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  actions: React.ReactNode;
  highlighted?: boolean;
}

const ExerciseCard = ({ exercise, actions, highlighted }: ExerciseCardProps) => (
  <div
    className={`flex flex-col gap-3 rounded-2xl border bg-surface-card px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
      highlighted ? 'border-brand ring-2 ring-brand-ring' : 'border-border'
    }`}
  >
    <div className="min-w-0">
      <p className="text-sm font-semibold text-text-primary break-words">{exercise.name}</p>
      <p className="text-xs text-text-secondary">
        {exercise.targetSets} serii • {formatRepRange(exercise)}
        {exercise.type === 'weight' ? ` • ${exercise.defaultWeight} kg` : ''}
      </p>
    </div>
    <div className="flex flex-wrap gap-2">{actions}</div>
  </div>
);

interface GroupedSectionProps {
  title: string;
  description?: string;
  exercises: ExerciseDefinition[];
  emptyMessage: string;
  renderActions: (exercise: ExerciseDefinition) => React.ReactNode;
  highlightedId?: string | null;
  cardRefs?: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

const GroupedSection = ({
  title,
  description,
  exercises,
  emptyMessage,
  renderActions,
  highlightedId,
  cardRefs,
}: GroupedSectionProps) => {
  const groups = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: exercises.filter((exercise) => exercise.movementGroup === group),
    })).filter((section) => section.items.length > 0);
  }, [exercises]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
      </div>
      {exercises.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border-strong bg-surface-card p-6 text-sm text-text-secondary">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((section) => (
            <section key={section.group} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                {section.label}
              </p>
              <div className="space-y-2">
                {section.items.map((exercise) => (
                  <div
                    key={exercise.id}
                    ref={(node) => {
                      if (cardRefs) {
                        cardRefs.current[exercise.id] = node;
                      }
                    }}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      actions={renderActions(exercise)}
                      highlighted={highlightedId === exercise.id}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

interface ExerciseFormFieldsProps {
  value: ExerciseFormState;
  onChange: (value: ExerciseFormState) => void;
  idPrefix: string;
}

const ExerciseFormFields = ({ value, onChange, idPrefix }: ExerciseFormFieldsProps) => {
  const update = <Key extends keyof ExerciseFormState>(key: Key, next: ExerciseFormState[Key]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-text-primary">Nazwa</span>
        <input
          id={`${idPrefix}-name`}
          value={value.name}
          onChange={(event) => update('name', event.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
          placeholder="Np. Bulgarian Split Squat"
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-text-primary">Kategoria</span>
        <div className="grid grid-cols-3 gap-2">
          {GROUP_ORDER.map((group) => {
            const isActive = value.movementGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => update('movementGroup', group)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand text-text-inverted'
                    : 'bg-surface-raised text-text-primary hover:bg-surface-inset'
                }`}
              >
                {GROUP_LABELS[group]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-text-primary">Typ pomiaru</span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: 'weight', label: 'Powtórzenia' },
              { key: 'time', label: 'Czas' },
            ] as const
          ).map((option) => {
            const isActive = value.type === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => update('type', option.key)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand text-text-inverted'
                    : 'bg-surface-raised text-text-primary hover:bg-surface-inset'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Serie docelowe</span>
          <input
            type="number"
            min={1}
            max={20}
            value={value.targetSets}
            onChange={(event) => update('targetSets', parseInt(event.target.value, 10) || 0)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">
            {value.type === 'time' ? 'Domyślny ciężar (wyłączone)' : 'Domyślny ciężar (kg)'}
          </span>
          <input
            type="number"
            min={0}
            max={1000}
            step={0.25}
            disabled={value.type === 'time'}
            value={value.type === 'time' ? 0 : value.defaultWeight}
            onChange={(event) => update('defaultWeight', parseFloat(event.target.value) || 0)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">
            {value.type === 'time' ? 'Min sek.' : 'Min powt.'}
          </span>
          <input
            type="number"
            min={0}
            max={999}
            value={value.repMin}
            onChange={(event) => update('repMin', parseInt(event.target.value, 10) || 0)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">
            {value.type === 'time' ? 'Max sek.' : 'Max powt.'}
          </span>
          <input
            type="number"
            min={0}
            max={999}
            value={value.repMax}
            onChange={(event) => update('repMax', parseInt(event.target.value, 10) || 0)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
          />
        </label>
      </div>
    </div>
  );
};

const exerciseToForm = (exercise: ExerciseDefinition): ExerciseFormState => ({
  name: exercise.name,
  type: exercise.type,
  movementGroup: exercise.movementGroup,
  targetSets: exercise.targetSets,
  repMin: exercise.repRange.min,
  repMax: exercise.repRange.max,
  defaultWeight: exercise.defaultWeight,
});

const isFormValid = (form: ExerciseFormState) =>
  form.name.trim().length > 0 &&
  form.targetSets >= 1 &&
  form.repMin >= 0 &&
  form.repMax >= form.repMin &&
  form.repMax > 0;

export default function Exercises() {
  const exerciseLibrary = useWorkoutStore((state) => state.exerciseLibrary);
  const plans = useWorkoutStore((state) => state.plans);
  const createCustomExercise = useWorkoutStore((state) => state.createCustomExercise);
  const updateCustomExercise = useWorkoutStore((state) => state.updateCustomExercise);
  const deleteCustomExercise = useWorkoutStore((state) => state.deleteCustomExercise);
  const setExerciseHidden = useWorkoutStore((state) => state.setExerciseHidden);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<ExerciseFormState>(emptyForm);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<ExerciseFormState>(emptyForm);
  const [highlightedExerciseId, setHighlightedExerciseId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const editorPanelRef = useRef<HTMLElement | null>(null);
  const customCardRefs = useRef<Record<string, HTMLElement | null>>({});

  const editingExercise = useMemo(
    () =>
      editingExerciseId
        ? exerciseLibrary.find(
            (exercise) => exercise.id === editingExerciseId && exercise.source === 'custom',
          )
        : undefined,
    [editingExerciseId, exerciseLibrary],
  );

  useEffect(() => {
    if (editingExerciseId && !editingExercise) {
      setEditingExerciseId(null);
    }
  }, [editingExerciseId, editingExercise]);

  useEffect(() => {
    if (!editingExerciseId) {
      return;
    }
    editorPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editingExerciseId]);

  useEffect(() => {
    if (!highlightedExerciseId) {
      return;
    }
    customCardRefs.current[highlightedExerciseId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    const timer = window.setTimeout(() => setHighlightedExerciseId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [highlightedExerciseId]);

  const activeSystemExercises = exerciseLibrary.filter(
    (exercise) => exercise.source === 'system' && !exercise.isHidden,
  );
  const hiddenSystemExercises = exerciseLibrary.filter(
    (exercise) => exercise.source === 'system' && exercise.isHidden,
  );
  const customExercises = exerciseLibrary.filter((exercise) => exercise.source === 'custom');

  const handleCreate = () => {
    if (!isFormValid(createForm)) {
      return;
    }
    const id = createCustomExercise({
      name: createForm.name,
      type: createForm.type,
      movementGroup: createForm.movementGroup,
      targetSets: createForm.targetSets,
      repRange: { min: createForm.repMin, max: createForm.repMax },
      defaultWeight: createForm.defaultWeight,
    });
    if (!id) {
      setMessage('Nie udało się utworzyć ćwiczenia — sprawdź wartości.');
      return;
    }
    setShowCreateForm(false);
    setCreateForm(emptyForm);
    setHighlightedExerciseId(id);
    setMessage('Dodano nowe ćwiczenie.');
  };

  const openEdit = (exercise: ExerciseDefinition) => {
    setEditingExerciseId(exercise.id);
    setEditingForm(exerciseToForm(exercise));
  };

  const handleSaveEdit = () => {
    if (!editingExercise || !isFormValid(editingForm)) {
      return;
    }
    updateCustomExercise(editingExercise.id, {
      name: editingForm.name,
      type: editingForm.type,
      movementGroup: editingForm.movementGroup,
      targetSets: editingForm.targetSets,
      repRange: { min: editingForm.repMin, max: editingForm.repMax },
      defaultWeight: editingForm.defaultWeight,
    });
    setEditingExerciseId(null);
    setMessage('Zapisano zmiany ćwiczenia.');
  };

  const handleDelete = (exercise: ExerciseDefinition) => {
    const affectedPlans = plans.filter(
      (plan) => plan.source === 'custom' && plan.exerciseIds.includes(exercise.id),
    );
    const planList =
      affectedPlans.length > 0
        ? `\n\nZostanie usunięte z planów:\n- ${affectedPlans.map((plan) => plan.name).join('\n- ')}`
        : '';
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć ćwiczenie „${exercise.name}"?${planList}\n\nHistoria ukończonych sesji pozostanie nienaruszona.`,
    );
    if (!confirmed) {
      return;
    }
    deleteCustomExercise(exercise.id);
    if (editingExerciseId === exercise.id) {
      setEditingExerciseId(null);
    }
    setMessage('Usunięto ćwiczenie.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-surface-card p-5 sm:p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-text-primary">
              Biblioteka ćwiczeń
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Dodawaj własne ćwiczenia, edytuj je i ukrywaj te systemowe, których nie potrzebujesz. Historia
              sesji pozostaje nietknięta.
            </p>
          </div>
          <div className="lg:min-w-[240px]">
            <button
              type="button"
              onClick={() => setShowCreateForm((value) => !value)}
              className="inline-flex w-full min-h-14 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-brand-hover"
            >
              <FolderPlus className="h-4 w-4" />
              Nowe ćwiczenie
            </button>
          </div>
        </div>
      </section>

      {showCreateForm && (
        <section className="rounded-[2rem] border border-border bg-surface-card p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-brand-border bg-brand-soft px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-brand-text">
                Tworzenie ćwiczenia
              </span>
              <h3 className="mt-3 text-xl font-bold text-text-primary">Nowe ćwiczenie</h3>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Ustaw kategorię, typ pomiaru oraz domyślne parametry. Wszystkie wartości można później
                edytować.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary sm:max-w-xs">
              <Dumbbell className="mb-1 inline h-4 w-4" /> Własne ćwiczenia pojawią się w pickerze planów i
              sesji razem z systemowymi.
            </div>
          </div>
          <ExerciseFormFields value={createForm} onChange={setCreateForm} idPrefix="create-exercise" />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!isFormValid(createForm)}
              className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-border-strong"
            >
              Zapisz ćwiczenie
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setCreateForm(emptyForm);
              }}
              className="rounded-xl bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
            >
              Anuluj
            </button>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] xl:items-start">
        <section className="space-y-6">
          <GroupedSection
            title="Twoje ćwiczenia"
            description="Własne ćwiczenia — pełna edycja, ukrywanie i usuwanie."
            exercises={customExercises}
            emptyMessage={'Nie masz jeszcze własnych ćwiczeń. Kliknij „Nowe ćwiczenie".'}
            highlightedId={highlightedExerciseId}
            cardRefs={customCardRefs}
            renderActions={(exercise) => (
              <>
                <button
                  type="button"
                  onClick={() => openEdit(exercise)}
                  className="inline-flex items-center gap-2 rounded-xl bg-btn-dark px-3 py-2 text-xs font-semibold text-text-inverted transition-colors hover:bg-btn-dark-hover"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edytuj
                </button>
                <button
                  type="button"
                  onClick={() => setExerciseHidden(exercise.id, !exercise.isHidden)}
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-raised px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-inset"
                >
                  {exercise.isHidden ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Pokaż
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Ukryj
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(exercise)}
                  className="inline-flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-text transition-colors hover:bg-danger-hover-bg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Usuń
                </button>
              </>
            )}
          />

          <GroupedSection
            title="Aktywne ćwiczenia systemowe"
            description="Fabryczne ćwiczenia dostępne w planach i pickerach."
            exercises={activeSystemExercises}
            emptyMessage="Wszystkie ćwiczenia systemowe są ukryte."
            renderActions={(exercise) => (
              <button
                type="button"
                onClick={() => setExerciseHidden(exercise.id, true)}
                className="inline-flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-text transition-colors hover:bg-danger-hover-bg"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Ukryj
              </button>
            )}
          />

          {hiddenSystemExercises.length > 0 && (
            <GroupedSection
              title="Ukryte ćwiczenia systemowe"
              description="Nie pojawiają się w pickerach — możesz je przywrócić w każdej chwili."
              exercises={hiddenSystemExercises}
              emptyMessage=""
              renderActions={(exercise) => (
                <button
                  type="button"
                  onClick={() => setExerciseHidden(exercise.id, false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-success px-3 py-2 text-xs font-semibold text-text-inverted transition-colors hover:bg-success-hover"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Przywróć
                </button>
              )}
            />
          )}
        </section>

        <aside className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-text-primary">Edycja ćwiczenia</h3>
            <section
              ref={editorPanelRef}
              className="rounded-[2rem] border border-border bg-surface-card p-5 shadow-sm xl:sticky xl:top-6"
            >
              {editingExercise ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                      Własne ćwiczenie
                    </p>
                    <h4 className="mt-2 text-xl font-bold text-text-primary break-words">
                      {editingExercise.name}
                    </h4>
                  </div>
                  <ExerciseFormFields
                    value={editingForm}
                    onChange={setEditingForm}
                    idPrefix="edit-exercise"
                  />
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={!isFormValid(editingForm)}
                      className="rounded-xl bg-btn-dark px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-btn-dark-hover disabled:cursor-not-allowed disabled:bg-border-strong"
                    >
                      Zapisz zmiany
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingExerciseId(null)}
                      className="rounded-xl bg-surface-raised px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-inset"
                    >
                      Zamknij edycję
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  Wybierz własne ćwiczenie z listy i kliknij „Edytuj", aby zmienić jego parametry. Ćwiczeń
                  systemowych nie można edytować — można je jedynie ukrywać.
                </p>
              )}
            </section>
          </div>
        </aside>
      </div>

      {message && (
        <div className="rounded-[2rem] border border-success-border bg-success-soft px-4 py-4 text-sm font-medium text-success-text break-words sm:px-5">
          {message}
        </div>
      )}
    </div>
  );
}
