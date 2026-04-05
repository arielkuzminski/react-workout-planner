import { getExerciseDefinition, workoutTemplates } from './workoutPlans';
import { SessionEntry, SessionSet, TemplateId, WorkoutSession } from '../types';
import { createId } from '../utils/sessionUtils';

const createSet = (
  setNumber: number,
  weight: number,
  reps: number,
  durationSec?: number
): SessionSet => ({
  id: createId('set'),
  setNumber,
  weight,
  reps,
  durationSec,
  completed: true,
});

const buildEntry = (exerciseId: string, multiplier: number): SessionEntry => {
  const definition = getExerciseDefinition(exerciseId);

  if (!definition) {
    throw new Error(`Missing exercise definition for ${exerciseId}`);
  }

  const sets = Array.from({ length: definition.targetSets }).map((_, index) => {
    const setNumber = index + 1;

    if (definition.type === 'time') {
      const duration = Math.round(definition.repRange.min + 2 + Math.random() * 8);
      return createSet(setNumber, 0, duration, duration);
    }

    const reps = Math.round(
      definition.repRange.min + Math.random() * (definition.repRange.max - definition.repRange.min)
    );
    const weight = Math.round(definition.defaultWeight * multiplier * 2) / 2;
    return createSet(setNumber, weight, reps);
  });

  return {
    id: createId('entry'),
    exerciseId: definition.id,
    exerciseName: definition.name,
    exerciseNameSnapshot: definition.name,
    exerciseType: definition.type,
    targetSets: definition.targetSets,
    repRange: definition.repRange,
    unit: definition.unit,
    sets,
    notes: '',
  };
};

export const generateSampleData = (): WorkoutSession[] => {
  const sessions: WorkoutSession[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 42);

  for (let i = 0; i < 18; i += 1) {
    const template = workoutTemplates[i % workoutTemplates.length];
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + i * 2);
    const multiplier = 1 + i * 0.02;

    sessions.push({
      id: createId('sample'),
      startedAt: sessionDate.toISOString(),
      completedAt: new Date(sessionDate.getTime() + 45 * 60 * 1000).toISOString(),
      status: 'completed',
      templateId: template.id as TemplateId,
      notes: '',
      entries: template.exerciseIds.map((exerciseId) => buildEntry(exerciseId, multiplier)),
    });
  }

  return sessions;
};
