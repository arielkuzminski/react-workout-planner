import { Exercise, SetResult } from '../types';
import { calculateProgressionSuggestion } from '../utils/progressionLogic';
import { ArrowUp, Pause } from 'lucide-react';

interface ProgressIndicatorProps {
  exercise: Exercise;
  currentWeight: number;
  setResults: SetResult[];
}

export default function ProgressIndicator({
  exercise,
  currentWeight,
  setResults
}: ProgressIndicatorProps) {
  if (setResults.length === 0) {
    return null;
  }

  const suggestion = calculateProgressionSuggestion(exercise, currentWeight, setResults);

  if (suggestion.suggestion === 'increase') {
    return (
      <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <ArrowUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">✅ Zwiększ następnym razem!</p>
            <p className="text-sm text-green-800 mt-1">{suggestion.reason}</p>
            <p className="text-sm text-green-900 font-bold mt-2">
              Nowy ciężar: {suggestion.newWeight}{exercise.type === 'time' ? 's' : ' kg'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
      <div className="flex items-start gap-3">
        <Pause className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-900">⏸️ Zostań na tym samym ciężarze</p>
          <p className="text-sm text-yellow-800 mt-1">{suggestion.reason}</p>
        </div>
      </div>
    </div>
  );
}
