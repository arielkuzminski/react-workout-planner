import { ExerciseDefinition, SessionEntry, SessionSet, TemplateId, WorkoutTemplate } from '../types';
import { createId } from '../utils/sessionUtils';

export const exerciseLibrary: ExerciseDefinition[] = [
  { id: 'A1', name: 'Decline Chest Press Machine (Matrix)', type: 'weight', targetSets: 4, repRange: { min: 6, max: 10 }, defaultWeight: 30, unit: 'kg' },
  { id: 'A2', name: 'Seated Cable Row (Neutral Grip)', type: 'weight', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 55, unit: 'kg' },
  { id: 'A3', name: 'Leg Press', type: 'weight', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 100, unit: 'kg' },
  { id: 'A4', name: 'Dumbbell Shoulder Press', type: 'weight', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 15, unit: 'kg' },
  { id: 'A5', name: 'Lat Pulldown (Medium Grip)', type: 'weight', targetSets: 3, repRange: { min: 10, max: 12 }, defaultWeight: 55, unit: 'kg' },
  { id: 'A6', name: 'Cable Triceps Extension (Overhead)', type: 'weight', targetSets: 3, repRange: { min: 12, max: 15 }, defaultWeight: 29.3, unit: 'kg' },
  { id: 'A7', name: 'Cable Biceps Curl (Facing Away, Low Pulley)', type: 'weight', targetSets: 3, repRange: { min: 10, max: 15 }, defaultWeight: 47.3, unit: 'kg' },
  { id: 'B1', name: 'Dumbbell Romanian Deadlift', type: 'weight', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 50, unit: 'kg' },
  { id: 'B2', name: 'Lat Pulldown (Wide Grip)', type: 'weight', targetSets: 4, repRange: { min: 8, max: 12 }, defaultWeight: 60, unit: 'kg' },
  { id: 'B3', name: 'Walking Lunges', type: 'weight', targetSets: 3, repRange: { min: 10, max: 10 }, defaultWeight: 14, unit: 'kg' },
  { id: 'B4', name: 'Flat Dumbbell Bench Press', type: 'weight', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 22.5, unit: 'kg' },
  { id: 'B5', name: 'Face Pull (Cable)', type: 'weight', targetSets: 3, repRange: { min: 15, max: 20 }, defaultWeight: 17.5, unit: 'kg' },
  { id: 'B6', name: 'Triceps Press Machine (Matrix)', type: 'weight', targetSets: 3, repRange: { min: 10, max: 12 }, defaultWeight: 84, unit: 'kg' },
  { id: 'B7', name: 'EZ-Bar Biceps Curl', type: 'weight', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 30, unit: 'kg' },
  { id: 'C1', name: 'Decline Chest Press Machine (Matrix)', type: 'weight', targetSets: 4, repRange: { min: 6, max: 8 }, defaultWeight: 32.5, unit: 'kg' },
  { id: 'C2', name: 'Seated Cable Row (Neutral Grip)', type: 'weight', targetSets: 4, repRange: { min: 6, max: 8 }, defaultWeight: 64, unit: 'kg' },
  { id: 'C3', name: 'Hip Thrust (Barbell or Smith Machine)', type: 'weight', targetSets: 4, repRange: { min: 10, max: 12 }, defaultWeight: 80, unit: 'kg' },
  { id: 'C4', name: 'Dumbbell Shoulder Press', type: 'weight', targetSets: 3, repRange: { min: 8, max: 12 }, defaultWeight: 15, unit: 'kg' },
  { id: 'C5', name: 'Dumbbell Lateral Raise', type: 'weight', targetSets: 3, repRange: { min: 12, max: 15 }, defaultWeight: 10, unit: 'kg' },
  { id: 'C6', name: 'Plank', type: 'time', targetSets: 3, repRange: { min: 45, max: 60 }, defaultWeight: 0, unit: 'sec' },
];

export const workoutTemplates: WorkoutTemplate[] = [
  { id: 'A', name: 'Trening A', description: 'Siła + Klatka/Plecy', exerciseIds: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'] },
  { id: 'B', name: 'Trening B', description: 'Nogi + Plecy + Ramiona', exerciseIds: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'] },
  { id: 'C', name: 'Trening C', description: 'Klatka + Siła Całościowa', exerciseIds: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] },
];

export const getExerciseDefinition = (exerciseId: string) =>
  exerciseLibrary.find((exercise) => exercise.id === exerciseId);

export const getWorkoutTemplate = (templateId: TemplateId) =>
  workoutTemplates.find((template) => template.id === templateId);

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

export const createEntriesFromTemplate = (templateId: TemplateId) => {
  const template = getWorkoutTemplate(templateId);
  return template ? template.exerciseIds.map(createEntryFromExercise) : [];
};

export const migrateLegacySession = (legacySession: {
  id?: string;
  date: string | Date;
  workoutType?: TemplateId;
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
    templateId: legacySession.workoutType,
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
