import { ExerciseDefinition, PlanId, SessionEntry, SessionSet, WorkoutPlan } from '../types';
import { createId } from '../utils/sessionUtils';

const SYSTEM_PLAN_CREATED_AT = '2026-04-06T00:00:00.000Z';

export const exerciseLibrary: ExerciseDefinition[] = [
  { id: 'A1', name: 'Decline Chest Press Machine (Matrix)', type: 'weight', movementGroup: 'push', targetSets: 4, repRange: { min: 6, max: 10 }, defaultWeight: 30, unit: 'kg', source: 'system', isHidden: false },
  { id: 'A2', name: 'Seated Cable Row (Neutral Grip)', type: 'weight', movementGroup: 'pull', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 55, unit: 'kg', source: 'system', isHidden: false },
  { id: 'A3', name: 'Leg Press', type: 'weight', movementGroup: 'legs', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 100, unit: 'kg', source: 'system', isHidden: false },
  { id: 'A4', name: 'Dumbbell Shoulder Press', type: 'weight', movementGroup: 'push', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 15, unit: 'kg', source: 'system', isHidden: false },
  { id: 'A5', name: 'Lat Pulldown (Medium Grip)', type: 'weight', movementGroup: 'pull', targetSets: 3, repRange: { min: 10, max: 12 }, defaultWeight: 55, unit: 'kg', source: 'system', isHidden: false },
  { id: 'A6', name: 'Cable Triceps Extension (Overhead)', type: 'weight', movementGroup: 'push', targetSets: 3, repRange: { min: 12, max: 15 }, defaultWeight: 29.3, unit: 'kg', source: 'system', isHidden: false },
  { id: 'A7', name: 'Cable Biceps Curl (Facing Away, Low Pulley)', type: 'weight', movementGroup: 'pull', targetSets: 3, repRange: { min: 10, max: 15 }, defaultWeight: 47.3, unit: 'kg', source: 'system', isHidden: false },
  { id: 'B1', name: 'Dumbbell Romanian Deadlift', type: 'weight', movementGroup: 'legs', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 50, unit: 'kg', source: 'system', isHidden: false },
  { id: 'B2', name: 'Lat Pulldown (Wide Grip)', type: 'weight', movementGroup: 'pull', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 60, unit: 'kg', source: 'system', isHidden: false },
  { id: 'B3', name: 'Walking Lunges', type: 'weight', movementGroup: 'legs', targetSets: 3, repRange: { min: 10, max: 10 }, defaultWeight: 14, unit: 'kg', source: 'system', isHidden: false },
  { id: 'B4', name: 'Flat Dumbbell Bench Press', type: 'weight', movementGroup: 'push', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 22.5, unit: 'kg', source: 'system', isHidden: false },
  { id: 'B5', name: 'Face Pull (Cable)', type: 'weight', movementGroup: 'pull', targetSets: 3, repRange: { min: 15, max: 20 }, defaultWeight: 17.5, unit: 'kg', source: 'system', isHidden: false },
  { id: 'B6', name: 'Triceps Press Machine (Matrix)', type: 'weight', movementGroup: 'push', targetSets: 3, repRange: { min: 10, max: 12 }, defaultWeight: 84, unit: 'kg', source: 'system', isHidden: false },
  { id: 'B7', name: 'EZ-Bar Biceps Curl', type: 'weight', movementGroup: 'pull', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 30, unit: 'kg', source: 'system', isHidden: false },
  { id: 'C1', name: 'Decline Chest Press Machine (Matrix)', type: 'weight', movementGroup: 'push', targetSets: 4, repRange: { min: 6, max: 8 }, defaultWeight: 32.5, unit: 'kg', source: 'system', isHidden: false },
  { id: 'C2', name: 'Seated Cable Row (Neutral Grip)', type: 'weight', movementGroup: 'pull', targetSets: 4, repRange: { min: 6, max: 8 }, defaultWeight: 64, unit: 'kg', source: 'system', isHidden: false },
  { id: 'C3', name: 'Hip Thrust (Barbell or Smith Machine)', type: 'weight', movementGroup: 'legs', targetSets: 4, repRange: { min: 10, max: 12 }, defaultWeight: 80, unit: 'kg', source: 'system', isHidden: false },
  { id: 'C4', name: 'Dumbbell Shoulder Press', type: 'weight', movementGroup: 'push', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 15, unit: 'kg', source: 'system', isHidden: false },
  { id: 'C5', name: 'Dumbbell Lateral Raise', type: 'weight', movementGroup: 'push', targetSets: 3, repRange: { min: 12, max: 15 }, defaultWeight: 10, unit: 'kg', source: 'system', isHidden: false },
  { id: 'C6', name: 'Plank', type: 'time', movementGroup: 'legs', targetSets: 3, repRange: { min: 45, max: 60 }, defaultWeight: 0, unit: 'sec', source: 'system', isHidden: false },
  { id: 'D1', name: 'Hip Thrust', type: 'weight', movementGroup: 'legs', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 80, unit: 'kg', source: 'system', isHidden: false },
  { id: 'D2', name: 'Cable Kickback', type: 'weight', movementGroup: 'legs', targetSets: 3, repRange: { min: 12, max: 15 }, defaultWeight: 18, unit: 'kg', source: 'system', isHidden: false },
  { id: 'D3', name: 'Cable Side Kickback', type: 'weight', movementGroup: 'legs', targetSets: 3, repRange: { min: 12, max: 15 }, defaultWeight: 18, unit: 'kg', source: 'system', isHidden: false },
  { id: 'D4', name: 'Leg Curl', type: 'weight', movementGroup: 'legs', targetSets: 3, repRange: { min: 10, max: 15 }, defaultWeight: 35, unit: 'kg', source: 'system', isHidden: false },
  { id: 'D5', name: 'Leg Extension', type: 'weight', movementGroup: 'legs', targetSets: 3, repRange: { min: 10, max: 15 }, defaultWeight: 35, unit: 'kg', source: 'system', isHidden: false },
  { id: 'E1', name: 'Romanian Deadlift', type: 'weight', movementGroup: 'legs', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 50, unit: 'kg', source: 'system', isHidden: false },
  { id: 'E2', name: 'Hip Abduction', type: 'weight', movementGroup: 'legs', targetSets: 3, repRange: { min: 15, max: 20 }, defaultWeight: 50, unit: 'kg', source: 'system', isHidden: false },
  { id: 'E3', name: 'Cable Step Up', type: 'weight', movementGroup: 'legs', targetSets: 3, repRange: { min: 10, max: 12 }, defaultWeight: 20, unit: 'kg', source: 'system', isHidden: false },
  { id: 'E4', name: 'Sumo Squat', type: 'weight', movementGroup: 'legs', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 30, unit: 'kg', source: 'system', isHidden: false },
];

export const workoutPlans: WorkoutPlan[] = [
  { id: 'A', name: 'Trening A', description: 'Siła + Klatka/Plecy', exerciseIds: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'], source: 'system', isActive: true, createdAt: SYSTEM_PLAN_CREATED_AT },
  { id: 'B', name: 'Trening B', description: 'Nogi + Plecy + Ramiona', exerciseIds: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'], source: 'system', isActive: true, createdAt: SYSTEM_PLAN_CREATED_AT },
  { id: 'C', name: 'Trening C', description: 'Klatka + Siła Całościowa', exerciseIds: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'], source: 'system', isActive: true, createdAt: SYSTEM_PLAN_CREATED_AT },
  { id: 'D', name: 'Trening D', description: 'Nogi + Pośladki', exerciseIds: ['D1', 'D2', 'D3', 'D4', 'D5'], source: 'system', isActive: true, createdAt: SYSTEM_PLAN_CREATED_AT },
  { id: 'E', name: 'Trening E', description: 'Tył uda + Pośladki', exerciseIds: ['E1', 'E2', 'E3', 'E4'], source: 'system', isActive: true, createdAt: SYSTEM_PLAN_CREATED_AT },
];

export const getExerciseDefinition = (exerciseId: string) =>
  exerciseLibrary.find((exercise) => exercise.id === exerciseId);

export const getWorkoutPlan = (planId: PlanId, plans = workoutPlans) =>
  plans.find((plan) => plan.id === planId);

export const createDefaultSet = (exerciseId: string, setNumber: number): SessionSet => {
  const definition = getExerciseDefinition(exerciseId);
  return {
    id: createId('set'),
    setNumber,
    weight: definition?.type === 'weight' ? definition.defaultWeight : 0,
    reps: definition?.type === 'weight' ? definition.repRange.min : undefined,
    durationSec: definition?.type === 'time' ? definition.repRange.min : undefined,
    completed: false,
  };
};

export const createEntryFromExercise = (exerciseId: string): SessionEntry => {
  const definition = getExerciseDefinition(exerciseId);
  if (!definition) {
    throw new Error(`Unknown exercise ${exerciseId}`);
  }

  return {
    id: createId('entry'),
    exerciseId: definition.id,
    exerciseName: definition.name,
    exerciseNameSnapshot: definition.name,
    exerciseType: definition.type,
    targetSets: definition.targetSets,
    repRange: definition.repRange,
    unit: definition.unit,
    sets: Array.from({ length: definition.targetSets }, (_, index) =>
      createDefaultSet(definition.id, index + 1)
    ),
    notes: '',
  };
};

export const createEntriesFromPlan = (planId: PlanId, plans = workoutPlans) => {
  const plan = getWorkoutPlan(planId, plans);
  return plan ? plan.exerciseIds.map(createEntryFromExercise) : [];
};

export const migrateLegacySession = (legacySession: {
  id?: string;
  date: string | Date;
  workoutType?: PlanId;
  exercises: Array<{
    exerciseId: string;
    weight: number;
    sets: Array<{ setNumber: number; reps: number }>;
    notes?: string;
  }>;
}) => {
  const startedAt = new Date(legacySession.date).toISOString();

  return {
    id: legacySession.id ?? createId('legacy'),
    startedAt,
    completedAt: startedAt,
    endedAt: startedAt,
    status: 'completed' as const,
    planId: legacySession.workoutType,
    notes: '',
    entries: legacySession.exercises.map((exercise) => {
      const definition = getExerciseDefinition(exercise.exerciseId);
      return {
        id: createId('entry'),
        exerciseId: exercise.exerciseId,
        exerciseName: definition?.name || exercise.exerciseId,
        exerciseNameSnapshot: definition?.name || exercise.exerciseId,
        exerciseType: definition?.type || (exercise.weight === 0 ? 'time' : 'weight'),
        targetSets: definition?.targetSets || Math.max(1, exercise.sets.length),
        repRange: definition?.repRange || { min: 0, max: 0 },
        unit: definition?.unit || (exercise.weight === 0 ? 'sec' : 'kg'),
        notes: exercise.notes || '',
        sets: exercise.sets.map((set) => ({
          id: createId('set'),
          setNumber: set.setNumber,
          weight: definition?.type === 'time' ? 0 : exercise.weight,
          reps: definition?.type === 'time' ? undefined : set.reps,
          durationSec: definition?.type === 'time' ? set.reps : undefined,
          completed: true,
        })),
      };
    }),
  };
};
