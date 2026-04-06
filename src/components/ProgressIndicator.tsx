import { ExerciseDefinition, SessionEntry } from '../types';
import { calculateProgressionSuggestion, formatPerformance } from '../utils/progressionLogic';

interface ProgressIndicatorProps {
  definition: ExerciseDefinition;
  entry: SessionEntry;
  previousEntry?: SessionEntry;
}

export default function ProgressIndicator({
  definition,
  entry,
  previousEntry,
}: ProgressIndicatorProps) {
  const suggestion = calculateProgressionSuggestion(definition, entry);

  return (
    <div className="space-y-3">
      {previousEntry && (
        <div className="rounded-lg border border-brand-border bg-brand-soft p-3 text-sm text-brand-text">
          <p className="font-semibold">Ostatni wynik</p>
          <p className="break-words">{formatPerformance(previousEntry)}</p>
        </div>
      )}

      <div
        className={`rounded-lg border p-3 text-sm ${
          suggestion.suggestion === 'increase'
            ? 'border-success-border bg-success-soft text-success-text'
            : 'border-warning-border bg-warning-soft text-warning-text'
        }`}
      >
        <p className="font-semibold">
          {suggestion.suggestion === 'increase'
            ? 'Możesz progresować'
            : 'Zostań na obecnym ustawieniu'}
        </p>
        <p className="break-words">{suggestion.reason}</p>
        {suggestion.newWeight !== undefined && (
          <p className="mt-1 font-medium break-words">
            Następny target: {suggestion.newWeight}
            {definition.unit}
          </p>
        )}
      </div>
    </div>
  );
}
