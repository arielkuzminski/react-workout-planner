import { Minus, Plus } from 'lucide-react';
import { SessionEntry, SessionSet } from '../types';

interface ExerciseLoggerProps {
  entry: SessionEntry;
  previousEntry?: SessionEntry;
  onSetChange: (setId: string, patch: { weight?: number; reps?: number; durationSec?: number }) => void;
  onAddSet: () => void;
  onNotesChange: (notes: string) => void;
}

const StepButton = ({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 transition-colors shrink-0"
  >
    {children}
  </button>
);

const WeightSetRow = ({
  set,
  previousSet,
  onChange,
}: {
  set: SessionSet;
  previousSet?: SessionSet;
  onChange: (patch: { weight?: number; reps?: number }) => void;
}) => {
  const weight = set.weight ?? previousSet?.weight ?? 0;
  const reps = set.reps ?? previousSet?.reps ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[56px_1fr_1fr] gap-2 sm:gap-3 items-start sm:items-center">
      <span className="text-sm font-medium text-gray-600">Set {set.setNumber}</span>

      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide sm:hidden">kg</span>
        <div className="flex items-center gap-1 min-w-0">
          <StepButton onClick={() => onChange({ weight: Math.max(0, weight - 2.5) })} label="-2.5kg">
            <Minus className="w-3.5 h-3.5" />
          </StepButton>
          <input
            type="number"
            step="0.5"
            min="0"
            value={weight}
            onChange={(e) => onChange({ weight: parseFloat(e.target.value) || 0 })}
            className="w-full min-w-0 px-2 py-2 border border-gray-300 rounded-lg text-center text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            aria-label={`Ciężar set ${set.setNumber}`}
          />
          <StepButton onClick={() => onChange({ weight: weight + 2.5 })} label="+2.5kg">
            <Plus className="w-3.5 h-3.5" />
          </StepButton>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide sm:hidden">powt.</span>
        <div className="flex items-center gap-1 min-w-0">
          <StepButton onClick={() => onChange({ reps: Math.max(0, reps - 1) })} label="-1 rep">
            <Minus className="w-3.5 h-3.5" />
          </StepButton>
          <input
            type="number"
            min="0"
            value={reps}
            onChange={(e) => onChange({ reps: parseInt(e.target.value, 10) || 0 })}
            className="w-full min-w-0 px-2 py-2 border border-gray-300 rounded-lg text-center text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            aria-label={`Powtórzenia set ${set.setNumber}`}
          />
          <StepButton onClick={() => onChange({ reps: reps + 1 })} label="+1 rep">
            <Plus className="w-3.5 h-3.5" />
          </StepButton>
        </div>
      </div>
    </div>
  );
};

const TimeSetRow = ({
  set,
  previousSet,
  exerciseName,
  onChange,
}: {
  set: SessionSet;
  previousSet?: SessionSet;
  exerciseName: string;
  onChange: (patch: { durationSec?: number }) => void;
}) => {
  const duration = set.durationSec ?? previousSet?.durationSec ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[56px_1fr_1fr] gap-2 sm:gap-3 items-start sm:items-center">
      <span className="text-sm font-medium text-gray-600">Set {set.setNumber}</span>
      <div className="px-3 py-2 border border-gray-100 rounded-lg bg-gray-50 text-sm text-gray-500 break-words">
        {exerciseName}
      </div>
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide sm:hidden">sek.</span>
        <div className="flex items-center gap-1 min-w-0">
          <StepButton onClick={() => onChange({ durationSec: Math.max(0, duration - 5) })} label="-5s">
            <Minus className="w-3.5 h-3.5" />
          </StepButton>
          <input
            type="number"
            min="0"
            value={duration}
            onChange={(e) => onChange({ durationSec: parseInt(e.target.value, 10) || 0 })}
            className="w-full min-w-0 px-2 py-2 border border-gray-300 rounded-lg text-center text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            aria-label={`Czas set ${set.setNumber}`}
          />
          <StepButton onClick={() => onChange({ durationSec: duration + 5 })} label="+5s">
            <Plus className="w-3.5 h-3.5" />
          </StepButton>
        </div>
      </div>
    </div>
  );
};

export default function ExerciseLogger({
  entry,
  previousEntry,
  onSetChange,
  onAddSet,
  onNotesChange,
}: ExerciseLoggerProps) {
  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-[56px_1fr_1fr] gap-2 items-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
        <span />
        <span>{entry.exerciseType === 'weight' ? 'kg' : ''}</span>
        <span>{entry.exerciseType === 'weight' ? 'powt.' : 'sek.'}</span>
      </div>

      {entry.sets.map((set, index) => {
        const prevSet = previousEntry?.sets[index];
        return entry.exerciseType === 'weight' ? (
          <WeightSetRow
            key={set.id}
            set={set}
            previousSet={prevSet}
            onChange={(patch) => onSetChange(set.id, patch)}
          />
        ) : (
          <TimeSetRow
            key={set.id}
            set={set}
            previousSet={prevSet}
            exerciseName={entry.exerciseNameSnapshot}
            onChange={(patch) => onSetChange(set.id, patch)}
          />
        );
      })}

      <button
        type="button"
        onClick={onAddSet}
        className="text-sm font-medium text-blue-700 hover:text-blue-900 active:opacity-80 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        + Dodaj serię
      </button>

      <textarea
        value={entry.notes ?? ''}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Opcjonalna notatka do ćwiczenia"
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
      />
    </div>
  );
}
