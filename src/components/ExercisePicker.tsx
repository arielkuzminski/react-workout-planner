import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { ExerciseDefinition, MovementGroup } from '../types';

interface ExercisePickerProps {
  exercises: ExerciseDefinition[];
  value: string[];
  onChange: (exerciseIds: string[]) => void;
  onSubmit: (exerciseIds: string[]) => void;
  placeholder?: string;
  submitLabel?: string;
  selectionMode?: 'single' | 'multiple';
  showSelectionIndicator?: boolean;
  showFooter?: boolean;
  autoSubmitOnSelect?: boolean;
  title?: string;
  subtitle?: string;
}

const GROUP_ORDER: MovementGroup[] = ['legs', 'push', 'pull'];

const GROUP_LABELS: Record<MovementGroup, string> = {
  legs: 'Legs',
  push: 'Push',
  pull: 'Pull',
};

export default function ExercisePicker({
  exercises,
  value,
  onChange,
  onSubmit,
  placeholder = 'Dodaj ćwiczenie do sesji',
  submitLabel = 'Dodaj',
  selectionMode = 'multiple',
  showSelectionIndicator = true,
  showFooter = true,
  autoSubmitOnSelect = false,
  title = 'Dodaj ćwiczenia',
  subtitle = 'Zaznacz jedną albo kilka pozycji i zatwierdź na dole.',
}: ExercisePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedExercises = exercises.filter((exercise) => value.includes(exercise.id));

  const groupedExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? exercises.filter((exercise) => exercise.name.toLowerCase().includes(query))
      : exercises;

    return GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: filtered.filter((exercise) => exercise.movementGroup === group),
    })).filter((section) => section.items.length > 0);
  }, [exercises, search]);

  useEffect(() => {
    const availableIds = new Set(exercises.map((exercise) => exercise.id));
    const filteredValue = value.filter((exerciseId) => availableIds.has(exerciseId));
    if (filteredValue.length !== value.length) {
      onChange(filteredValue);
    }
  }, [exercises, onChange, value]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      return;
    }

    const focusTimer = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 10);

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = (exerciseId: string) => {
    if (selectionMode === 'single') {
      const nextValue = value.includes(exerciseId) ? [] : [exerciseId];
      onChange(nextValue);
      if (autoSubmitOnSelect && nextValue.length > 0) {
        onSubmit(nextValue);
        setIsOpen(false);
      }
      return;
    }

    if (value.includes(exerciseId)) {
      onChange(value.filter((id) => id !== exerciseId));
      return;
    }

    onChange([...value, exerciseId]);
  };

  const handleSubmit = () => {
    if (value.length === 0) {
      return;
    }

    onSubmit(value);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange([]);
  };

  const triggerLabel = (() => {
    if (selectedExercises.length === 0) {
      return placeholder;
    }
    if (selectedExercises.length === 1) {
      return selectedExercises[0].name;
    }
    return `${selectedExercises.length} ćwiczenia wybrane`;
  })();

  const selectedCountLabel = value.length === 1 ? '1 ćwiczenie zaznaczone' : `${value.length} ćwiczenia zaznaczone`;

  const panelBody = (
    <div className="mx-auto flex max-h-[78vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-border bg-surface-card shadow-2xl sm:max-h-[32rem] sm:rounded-[28px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:hidden">
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="text-xs text-text-secondary">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
          aria-label="Zamknij wybór ćwiczeń"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-border px-4 py-3">
        <div className="mb-3 hidden items-center justify-between sm:flex">
          <div>
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="text-xs text-text-secondary">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            aria-label="Zamknij wybór ćwiczeń"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="sr-only" htmlFor="exercise-picker-search">
          Szukaj ćwiczenia
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-text-tertiary" />
          <input
            ref={searchRef}
            id="exercise-picker-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj ćwiczenia"
            className="w-full min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="rounded-full p-1 text-text-tertiary transition-colors hover:bg-surface-inset hover:text-text-secondary"
              aria-label="Wyczyść wyszukiwanie"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto px-3 py-3 sm:px-2">
        {groupedExercises.length > 0 ? (
          <div className="space-y-4">
            {groupedExercises.map((section) => (
              <section key={section.group} className="space-y-2">
                <div className="px-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                    {section.label}
                  </p>
                </div>
                <div className="space-y-1">
                  {section.items.map((exercise) => {
                    const isSelected = value.includes(exercise.id);
                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => handleToggle(exercise.id)}
                        className={`flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none ${
                          isSelected
                            ? 'bg-brand-soft text-brand-text ring-1 ring-brand-border'
                            : 'bg-surface-card text-text-primary hover:bg-surface'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium">{exercise.name}</p>
                          <p className="mt-1 text-xs text-text-secondary">
                            {exercise.targetSets} serii • {exercise.repRange.min}-{exercise.repRange.max}{' '}
                            {exercise.type === 'time' ? 'sek.' : 'powt.'}
                          </p>
                        </div>
                        {showSelectionIndicator && (
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              isSelected ? 'bg-brand text-text-inverted' : 'bg-surface-raised text-transparent'
                            }`}
                            aria-hidden="true"
                          >
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-text-secondary">
            Brak pasujących ćwiczeń.
          </div>
        )}
      </div>

      {showFooter && (
        <div className="border-t border-border bg-surface-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface-card/80">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {value.length > 0 ? selectedCountLabel : 'Nic nie zaznaczono'}
              </p>
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Wyczyść wybór
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={value.length === 0}
              className="min-w-28 rounded-xl bg-btn-dark px-4 py-3 text-sm font-semibold text-text-inverted transition-colors hover:bg-btn-dark-hover active:bg-btn-dark-active disabled:cursor-not-allowed disabled:bg-border-strong"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none ${
          isOpen ? 'border-brand bg-brand-soft' : 'border-border-strong bg-surface-card'
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className={selectedExercises.length > 0 ? 'text-text-primary' : 'text-text-secondary'}>
          {triggerLabel}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-overlay sm:bg-transparent" aria-hidden="true" />

          <div className="fixed inset-x-0 bottom-0 z-40 sm:absolute sm:inset-x-0 sm:top-[calc(100%+0.5rem)] sm:bottom-auto">
            {panelBody}
          </div>
        </>
      )}
    </div>
  );
}
