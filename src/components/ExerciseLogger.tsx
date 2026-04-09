import { Minus, Plus, Trash2 } from 'lucide-react';
import NumberField from './NumberField';
import { SessionEntry, SessionSet } from '../types';

interface ExerciseLoggerProps {
  entry: SessionEntry;
  previousEntry?: SessionEntry;
  onSetChange: (setId: string, patch: { weight?: number; reps?: number; durationSec?: number }) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onNotesChange: (notes: string) => void;
  weightIncrementKg?: number;
}

const StepButton = ({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-surface-raised hover:bg-surface-inset active:bg-surface-inset text-text-primary transition-colors shrink-0"
  >
    {children}
  </button>
);

const RemoveSetButton = ({ onClick, setNumber }: { onClick: () => void; setNumber: number }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Usuń serię ${setNumber}`}
    className="h-10 w-10 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg bg-danger-soft text-danger-text hover:bg-danger-hover-bg active:bg-danger-hover-bg transition-colors shrink-0"
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
);

const WeightSetRow = ({
  set,
  previousSet,
  onChange,
  onRemove,
  weightIncrementKg,
}: {
  set: SessionSet;
  previousSet?: SessionSet;
  onChange: (patch: { weight?: number; reps?: number }) => void;
  onRemove: () => void;
  weightIncrementKg: number;
}) => {
  const weight = set.weight ?? 0;
  const reps = set.reps;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[56px_1fr_1fr_auto] gap-2 sm:gap-3 items-start sm:items-center">
      <span className="text-sm font-medium text-text-secondary">Set {set.setNumber}</span>

      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide sm:hidden">kg</span>
        <div className="flex items-center gap-1 min-w-0">
          <StepButton onClick={() => onChange({ weight: Math.max(0, Number((weight - weightIncrementKg).toFixed(2))) })} label={`-${weightIncrementKg}kg`}>
            <Minus className="w-3.5 h-3.5" />
          </StepButton>
          <NumberField
            step={weightIncrementKg}
            min={0}
            max={9999}
            value={weight}
            onCommit={(value) => onChange({ weight: Number((value ?? 0).toFixed(2)) })}
            inputMode="decimal"
            normalize={(value) => Number(value.toFixed(2))}
            fallbackValue={weight}
            className="w-full min-w-0 px-2 py-2 border border-border-strong rounded-lg bg-surface-card text-center text-base text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
            ariaLabel={`Ciężar set ${set.setNumber}`}
          />
          <StepButton onClick={() => onChange({ weight: Number((weight + weightIncrementKg).toFixed(2)) })} label={`+${weightIncrementKg}kg`}>
            <Plus className="w-3.5 h-3.5" />
          </StepButton>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide sm:hidden">powt.</span>
        <div className="flex items-center gap-1 min-w-0">
          <StepButton onClick={() => onChange({ reps: Math.max(0, (reps ?? 0) - 1) })} label="-1 rep">
            <Minus className="w-3.5 h-3.5" />
          </StepButton>
          <NumberField
            min={0}
            max={9999}
            value={reps}
            placeholder={previousSet?.reps?.toString() ?? '0'}
            onCommit={(value) => onChange({ reps: value === undefined ? undefined : Math.round(value) })}
            inputMode="numeric"
            allowEmpty
            normalize={(value) => Math.round(value)}
            className="w-full min-w-0 px-2 py-2 border border-border-strong rounded-lg bg-surface-card text-center text-base text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
            ariaLabel={`Powtórzenia set ${set.setNumber}`}
          />
          <StepButton onClick={() => onChange({ reps: (reps ?? 0) + 1 })} label="+1 rep">
            <Plus className="w-3.5 h-3.5" />
          </StepButton>
        </div>
      </div>

      <div className="flex justify-end sm:justify-start">
        <RemoveSetButton onClick={onRemove} setNumber={set.setNumber} />
      </div>
    </div>
  );
};

const TimeSetRow = ({
  set,
  previousSet,
  exerciseName,
  onChange,
  onRemove,
}: {
  set: SessionSet;
  previousSet?: SessionSet;
  exerciseName: string;
  onChange: (patch: { durationSec?: number }) => void;
  onRemove: () => void;
}) => {
  const duration = set.durationSec;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[56px_1fr_1fr_auto] gap-2 sm:gap-3 items-start sm:items-center">
      <span className="text-sm font-medium text-text-secondary">Set {set.setNumber}</span>
      <div className="px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-secondary break-words">
        {exerciseName}
      </div>
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide sm:hidden">sek.</span>
        <div className="flex items-center gap-1 min-w-0">
          <StepButton onClick={() => onChange({ durationSec: Math.max(0, (duration ?? 0) - 5) })} label="-5s">
            <Minus className="w-3.5 h-3.5" />
          </StepButton>
          <NumberField
            min={0}
            max={99999}
            value={duration}
            placeholder={previousSet?.durationSec?.toString() ?? '0'}
            onCommit={(value) => onChange({ durationSec: value === undefined ? undefined : Math.round(value) })}
            inputMode="numeric"
            allowEmpty
            normalize={(value) => Math.round(value)}
            className="w-full min-w-0 px-2 py-2 border border-border-strong rounded-lg bg-surface-card text-center text-base text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
            ariaLabel={`Czas set ${set.setNumber}`}
          />
          <StepButton onClick={() => onChange({ durationSec: (duration ?? 0) + 5 })} label="+5s">
            <Plus className="w-3.5 h-3.5" />
          </StepButton>
        </div>
      </div>

      <div className="flex justify-end sm:justify-start">
        <RemoveSetButton onClick={onRemove} setNumber={set.setNumber} />
      </div>
    </div>
  );
};

export default function ExerciseLogger({
  entry,
  previousEntry,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onNotesChange,
  weightIncrementKg = 2.5,
}: ExerciseLoggerProps) {
  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-[56px_1fr_1fr_auto] gap-2 items-center text-xs font-semibold text-text-tertiary uppercase tracking-wide">
        <span />
        <span>{entry.exerciseType === 'weight' ? 'kg' : ''}</span>
        <span>{entry.exerciseType === 'weight' ? 'powt.' : 'sek.'}</span>
        <span className="sr-only">Usuń serię</span>
      </div>

      {entry.sets.map((set, index) => {
        const prevSet = previousEntry?.sets[index];
        return entry.exerciseType === 'weight' ? (
          <WeightSetRow
            key={set.id}
            set={set}
            previousSet={prevSet}
            weightIncrementKg={weightIncrementKg}
            onChange={(patch) => onSetChange(set.id, patch)}
            onRemove={() => onRemoveSet(set.id)}
          />
        ) : (
          <TimeSetRow
            key={set.id}
            set={set}
            previousSet={prevSet}
            exerciseName={entry.exerciseNameSnapshot}
            onChange={(patch) => onSetChange(set.id, patch)}
            onRemove={() => onRemoveSet(set.id)}
          />
        );
      })}

      <button
        type="button"
        onClick={onAddSet}
        className="text-sm font-medium text-brand-text hover:text-brand-text active:opacity-80 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        + Dodaj serię
      </button>

      <textarea
        value={entry.notes ?? ''}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Opcjonalna notatka do ćwiczenia"
        rows={2}
        className="w-full px-3 py-2 border border-border-strong rounded-lg bg-surface-card text-base text-text-primary placeholder:text-text-tertiary transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
      />
    </div>
  );
}
