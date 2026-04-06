import { ExerciseDefinition, ProgressionSuggestion, SessionEntry } from '../types';

export const formatPerformance = (entry: SessionEntry) => {
  const completedSets = entry.sets.filter((set) => set.completed);
  const sourceSets = completedSets.length > 0 ? completedSets : entry.sets;

  return sourceSets
    .map((set) => {
      if (entry.exerciseType === 'time') {
        return `${set.durationSec ?? 0}s`;
      }
      return `${set.weight ?? 0}kg x ${set.reps ?? 0}`;
    })
    .join(' • ');
};

export const calculateProgressionSuggestion = (
  definition: ExerciseDefinition,
  entry: SessionEntry,
  weightIncrementKg = 2.5
): ProgressionSuggestion => {
  const completedSets = entry.sets.filter((set) =>
    definition.type === 'time' ? (set.durationSec ?? 0) > 0 : (set.reps ?? 0) > 0
  );

  const currentWeight = completedSets[0]?.weight ?? definition.defaultWeight;

  if (completedSets.length < definition.targetSets) {
    return {
      exerciseId: definition.id,
      exerciseName: definition.name,
      currentWeight,
      suggestion: 'maintain',
      reason: 'Dokończ wszystkie serie zanim podbijesz obciążenie.',
    };
  }

  const reachedTopRange = completedSets.every((set) => {
    const metric = definition.type === 'time' ? set.durationSec ?? 0 : set.reps ?? 0;
    return metric >= definition.repRange.max;
  });

  if (reachedTopRange) {
    const increment = definition.type === 'time' ? 5 : weightIncrementKg;
    return {
      exerciseId: definition.id,
      exerciseName: definition.name,
      currentWeight,
      suggestion: 'increase',
      newWeight: Number((currentWeight + increment).toFixed(1)),
      reason:
        definition.type === 'time'
          ? 'Wszystkie serie są na górze zakresu. Dodaj 5 sekund.'
          : `Wszystkie serie są na górze zakresu. Dodaj ${increment} kg.`,
    };
  }

  return {
    exerciseId: definition.id,
    exerciseName: definition.name,
    currentWeight,
    suggestion: 'maintain',
    reason: 'Zostań przy tym ustawieniu i dobij pełny zakres powtórzeń.',
  };
};
