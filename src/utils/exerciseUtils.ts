import { exerciseLibrary as seedExerciseLibrary } from '../data/workoutPlans';
import { ExerciseDefinition, MovementGroup, RepRange } from '../types';
import { createId } from './sessionUtils';

export const getSeedExercises = (): ExerciseDefinition[] =>
  seedExerciseLibrary.map((exercise) => ({
    ...exercise,
    repRange: { ...exercise.repRange },
    source: 'system',
    isHidden: false,
  }));

export const mergeExerciseLibraryWithSeeds = (
  persisted: ExerciseDefinition[] | undefined,
): ExerciseDefinition[] => {
  const seeds = getSeedExercises();
  const persistedArr = Array.isArray(persisted) ? persisted : [];
  const persistedById = new Map(persistedArr.map((exercise) => [exercise.id, exercise]));

  const mergedSeeds: ExerciseDefinition[] = seeds.map((seed) => {
    const existing = persistedById.get(seed.id);
    if (!existing) {
      return seed;
    }
    return {
      ...seed,
      isHidden: existing.isHidden === true,
    };
  });

  const customExercises = persistedArr
    .filter((exercise) => exercise.source === 'custom')
    .map((exercise) => ({
      ...exercise,
      repRange: { ...exercise.repRange },
      source: 'custom' as const,
      isHidden: exercise.isHidden === true,
    }));

  return [...mergedSeeds, ...customExercises];
};

interface CustomExerciseInput {
  name: string;
  type: 'weight' | 'time';
  movementGroup: MovementGroup;
  targetSets: number;
  repRange: RepRange;
  defaultWeight: number;
}

export const createCustomExerciseRecord = (
  input: CustomExerciseInput,
): ExerciseDefinition => ({
  id: createId('ex'),
  name: input.name.trim(),
  type: input.type,
  movementGroup: input.movementGroup,
  targetSets: input.targetSets,
  repRange: { ...input.repRange },
  defaultWeight: input.type === 'time' ? 0 : input.defaultWeight,
  unit: input.type === 'time' ? 'sec' : 'kg',
  source: 'custom',
  isHidden: false,
});
