import { Exercise, ProgressionSuggestion, SetResult } from '../types';

/**
 * Sprawdza, czy wszystkie serie osiągnęły górny zakres powtórzeń
 */
export const hasReachedMaxReps = (
  exercise: Exercise,
  setResults: SetResult[]
): boolean => {
  // Jeśli seria nie ma żadnych wyników, zwracaj false
  if (setResults.length === 0) return false;

  // Sprawdzanie dla ćwiczeń siłowych
  if (exercise.type === 'weight') {
    // Wszystkie serie muszą być >= do górnego zakresu
    return setResults.every(set => set.reps >= exercise.repRange.max);
  }

  // Sprawdzanie dla planka (czas)
  if (exercise.type === 'time') {
    // Wszystkie serie muszą być >= do górnego zakresu (w sekundach)
    return setResults.every(set => set.reps >= exercise.repRange.max);
  }

  return false;
};

/**
 * Generuje sugestię progresji dla ćwiczenia
 */
export const calculateProgressionSuggestion = (
  exercise: Exercise,
  currentWeight: number,
  setResults: SetResult[]
): ProgressionSuggestion => {
  const allSetsCompleted = setResults.length === exercise.sets;

  // Jeśli nie wszystkie serie zostały wykonane, nie sugeruj progresji
  if (!allSetsCompleted) {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      currentWeight,
      suggestion: 'maintain',
      reason: 'Nie wszystkie serie zostały wykonane'
    };
  }

  const reachedMax = hasReachedMaxReps(exercise, setResults);

  if (reachedMax) {
    // Sprawdzenie minimalnego zakresu - wszystkie serie powinny być >= max
    const allSetsAboveMin = setResults.every(set => set.reps >= exercise.repRange.min);

    if (allSetsAboveMin) {
      const increment = exercise.type === 'time' ? 5 : 2.5;
      const newWeight = Number((currentWeight + increment).toFixed(2));

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        currentWeight,
        suggestion: 'increase',
        newWeight,
        reason: `Wszystkie serie ${exercise.repRange.min}-${exercise.repRange.max}! Zwiększ o +${increment}${exercise.type === 'time' ? 's' : ' kg'}`
      };
    }
  }

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    currentWeight,
    suggestion: 'maintain',
    reason: `Nie wszystkie serie w górnym zakresie. Pracuj nad tym!`
  };
};

/**
 * Formatuje wagę na string (2 miejsca po przecinku)
 */
export const formatWeight = (weight: number, type: 'weight' | 'time'): string => {
  if (type === 'time') {
    return `${weight}s`;
  }
  return `${weight.toFixed(1)} kg`;
};
