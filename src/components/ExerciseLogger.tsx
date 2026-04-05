import { SessionEntry } from '../types';

interface ExerciseLoggerProps {
  entry: SessionEntry;
  onSetChange: (setId: string, patch: { weight?: number; reps?: number; durationSec?: number }) => void;
  onAddSet: () => void;
  onNotesChange: (notes: string) => void;
}

export default function ExerciseLogger({
  entry,
  onSetChange,
  onAddSet,
  onNotesChange,
}: ExerciseLoggerProps) {
  return (
    <div className="space-y-3">
      {entry.sets.map((set) => (
        <div key={set.id} className="grid grid-cols-[56px_1fr_1fr] gap-3 items-center">
          <span className="text-sm font-medium text-gray-600">Set {set.setNumber}</span>
          {entry.exerciseType === 'weight' ? (
            <>
              <input
                type="number"
                step="0.5"
                min="0"
                value={set.weight ?? 0}
                onChange={(event) => onSetChange(set.id, { weight: parseFloat(event.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="kg"
              />
              <input
                type="number"
                min="0"
                value={set.reps ?? 0}
                onChange={(event) => onSetChange(set.id, { reps: parseInt(event.target.value, 10) || 0 })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="powt."
              />
            </>
          ) : (
            <>
              <div className="px-3 py-2 border border-gray-100 rounded-lg bg-gray-50 text-sm text-gray-500">
                plank
              </div>
              <input
                type="number"
                min="0"
                value={set.durationSec ?? 0}
                onChange={(event) =>
                  onSetChange(set.id, { durationSec: parseInt(event.target.value, 10) || 0 })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="sek."
              />
            </>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onAddSet}
        className="text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        + Dodaj serię
      </button>

      <textarea
        value={entry.notes ?? ''}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Opcjonalna notatka do ćwiczenia"
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  );
}
