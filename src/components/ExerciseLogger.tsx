import { Exercise, SetResult } from '../types';

interface ExerciseLoggerProps {
  exercise: Exercise;
  results: SetResult[];
  onSetResult: (exerciseId: string, setNumber: number, reps: number) => void;
}

export default function ExerciseLogger({
  exercise,
  results,
  onSetResult
}: ExerciseLoggerProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: exercise.sets }).map((_, index) => {
        const setNumber = index + 1;
        const currentResult = results.find(r => r.setNumber === setNumber);

        return (
          <div key={`${exercise.id}-set-${setNumber}`} className="flex items-center gap-3">
            <label className="w-20 text-sm font-medium text-gray-700">
              Set {setNumber}:
            </label>
            <input
              type="number"
              min="0"
              value={currentResult?.reps || ''}
              onChange={e => {
                const reps = parseInt(e.target.value) || 0;
                onSetResult(exercise.id, setNumber, reps);
              }}
              placeholder={`${exercise.repRange.min}-${exercise.repRange.max}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <span className="w-16 text-right text-sm text-gray-600">
              {exercise.type === 'time' ? 'sek' : 'powtórzeń'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
