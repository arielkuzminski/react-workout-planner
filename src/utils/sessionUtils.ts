import {
  ExerciseDefinition,
  ExerciseHistorySummary,
  LegacyWorkoutSession,
  PlanId,
  SessionEntry,
  SessionSet,
  WorkoutPlan,
  WorkoutSession,
} from '../types';
import { getExerciseDefinition, getWorkoutPlan } from '../data/workoutPlans';

export const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const createSessionSet = (
  setNumber: number,
  definition: ExerciseDefinition,
  weight?: number
): SessionSet => ({
  id: createId('set'),
  setNumber,
  weight: definition.type === 'weight' ? weight ?? definition.defaultWeight : 0,
  reps: undefined,
  durationSec: definition.type === 'time' ? definition.repRange.min : undefined,
  completed: false,
});

export const createEntryFromDefinition = (
  definition: ExerciseDefinition,
  weight?: number
): SessionEntry => ({
  id: createId('entry'),
  exerciseId: definition.id,
  exerciseName: definition.name,
  exerciseNameSnapshot: definition.name,
  exerciseType: definition.type,
  targetSets: definition.targetSets,
  repRange: definition.repRange,
  unit: definition.unit,
  sets: Array.from({ length: definition.targetSets }).map((_, index) =>
    createSessionSet(index + 1, definition, weight)
  ),
  notes: '',
});

export const createSession = (
  exerciseLibrary: ExerciseDefinition[],
  plans: WorkoutPlan[],
  planId?: PlanId,
  preferredWeights?: Record<string, number>
): WorkoutSession => {
  const plan = planId ? getWorkoutPlan(planId, plans) : undefined;
  const entries = plan
    ? plan.exerciseIds
        .map((exerciseId) => exerciseLibrary.find((exercise) => exercise.id === exerciseId))
        .filter((exercise): exercise is ExerciseDefinition => Boolean(exercise))
        .map((exercise) => createEntryFromDefinition(exercise, preferredWeights?.[exercise.id]))
    : [];

  return {
    id: createId('session'),
    startedAt: new Date().toISOString(),
    status: 'active',
    planId,
    notes: '',
    entries,
  };
};

export const isRecordedSet = (entry: SessionEntry, set: SessionSet) =>
  entry.exerciseType === 'time' ? (set.durationSec ?? 0) > 0 : (set.reps ?? 0) > 0;

export const normalizeCompletedEntry = (entry: SessionEntry): SessionEntry | null => {
  const recordedSets = entry.sets
    .filter((set) => isRecordedSet(entry, set))
    .map((set, index) => ({
      ...set,
      setNumber: index + 1,
      completed: true,
    }));

  if (recordedSets.length === 0) {
    return null;
  }

  return {
    ...entry,
    sets: recordedSets,
  };
};

export const getBestWeight = (entry: SessionEntry) =>
  Math.max(0, ...entry.sets.map((set) => set.weight ?? 0));

export const getBestReps = (entry: SessionEntry) =>
  Math.max(0, ...entry.sets.map((set) => set.reps ?? 0));

export const getBestDuration = (entry: SessionEntry) =>
  Math.max(0, ...entry.sets.map((set) => set.durationSec ?? set.reps ?? 0));

export const getLastTrackedWeight = (entry: SessionEntry) => {
  const weightedSets = [...entry.sets].reverse().find((set) => (set.weight ?? 0) > 0);
  return weightedSets?.weight ?? entry.sets.find((set) => (set.weight ?? 0) > 0)?.weight ?? 0;
};

export const getLastTrackedDuration = (entry: SessionEntry) => {
  const durationSet = [...entry.sets].reverse().find((set) => (set.durationSec ?? 0) > 0);
  return durationSet?.durationSec ?? entry.sets.find((set) => (set.durationSec ?? 0) > 0)?.durationSec ?? 0;
};

export const getLastCompletedSessionForPlan = (
  sessions: WorkoutSession[],
  planId: PlanId
): WorkoutSession | undefined =>
  [...sessions]
    .filter((session) => session.status === 'completed' && session.planId === planId)
    .sort(
      (left, right) =>
        new Date(right.completedAt ?? right.startedAt).getTime() -
        new Date(left.completedAt ?? left.startedAt).getTime()
    )[0];

export const getLastCompletedEntry = (
  sessions: WorkoutSession[],
  exerciseId: string
): SessionEntry | undefined => {
  const completed = [...sessions]
    .filter((session) => session.status === 'completed')
    .sort(
      (left, right) =>
        new Date(right.completedAt ?? right.startedAt).getTime() -
        new Date(left.completedAt ?? left.startedAt).getTime()
    );

  for (const session of completed) {
    const entry = session.entries.find((candidate) => candidate.exerciseId === exerciseId);
    if (entry) {
      return entry;
    }
  }

  return undefined;
};

export const getLastCompletedEntryForPlan = (
  sessions: WorkoutSession[],
  planId: PlanId,
  exerciseId: string
): SessionEntry | undefined => {
  const lastPlanSession = getLastCompletedSessionForPlan(sessions, planId);
  return lastPlanSession?.entries.find((candidate) => candidate.exerciseId === exerciseId);
};

export const getExerciseHistorySummary = (
  sessions: WorkoutSession[],
  exerciseId: string
): ExerciseHistorySummary | undefined => {
  const entry = getLastCompletedEntry(sessions, exerciseId);
  if (!entry) {
    return undefined;
  }

  return {
    exerciseId,
    exerciseName: entry.exerciseName,
    lastWeight: getBestWeight(entry),
    lastReps: getBestReps(entry),
    lastDurationSec: getBestDuration(entry),
    lastCompletedAt: [...sessions]
      .filter((session) => session.entries.some((candidate) => candidate.exerciseId === exerciseId))
      .sort(
        (left, right) =>
          new Date(right.completedAt ?? right.startedAt).getTime() -
          new Date(left.completedAt ?? left.startedAt).getTime()
      )[0]?.completedAt,
  };
};

export const legacySessionToV2 = (legacySession: LegacyWorkoutSession): WorkoutSession => {
  const startedAt = new Date(legacySession.date).toISOString();
  return {
    id: legacySession.id ?? createId('legacy'),
    startedAt,
    completedAt: startedAt,
    status: 'completed',
    planId: legacySession.workoutType,
    notes: '',
    entries: legacySession.exercises.map((legacyExercise) => {
      const definition = getExerciseDefinition(legacyExercise.exerciseId);
      const fallbackWeight = legacyExercise.weight;

      if (definition) {
        return {
          id: createId('entry'),
          exerciseId: definition.id,
          exerciseName: definition.name,
          exerciseNameSnapshot: definition.name,
          exerciseType: definition.type,
          targetSets: definition.targetSets,
          repRange: definition.repRange,
          unit: definition.unit,
          notes: legacyExercise.notes || '',
          sets: legacyExercise.sets.map((legacySet) => ({
            id: createId('set'),
            setNumber: legacySet.setNumber,
            weight: definition.type === 'weight' ? fallbackWeight : 0,
            reps: definition.type === 'weight' ? legacySet.reps : undefined,
            durationSec: definition.type === 'time' ? legacySet.reps : undefined,
            completed: true,
          })),
        };
      }

      return {
        id: createId('entry'),
        exerciseId: legacyExercise.exerciseId,
        exerciseName: legacyExercise.exerciseId,
        exerciseNameSnapshot: legacyExercise.exerciseId,
        exerciseType: fallbackWeight === 0 ? 'time' : 'weight',
        targetSets: Math.max(legacyExercise.sets.length, 1),
        repRange: { min: 0, max: 0 },
        unit: fallbackWeight === 0 ? 'sec' : 'kg',
        notes: legacyExercise.notes || '',
        sets: legacyExercise.sets.map((legacySet) => ({
          id: createId('set'),
          setNumber: legacySet.setNumber,
          weight: fallbackWeight === 0 ? 0 : fallbackWeight,
          reps: fallbackWeight === 0 ? undefined : legacySet.reps,
          durationSec: fallbackWeight === 0 ? legacySet.reps : undefined,
          completed: true,
        })),
      };
    }),
  };
};

export const normalizePersistedSessions = (sessions: unknown): WorkoutSession[] => {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions.map((session) => {
    if (session && typeof session === 'object' && 'entries' in session) {
      const typed = session as WorkoutSession;
      return {
        ...typed,
        notes: typed.notes || '',
        entries: (typed.entries ?? []).map((entry) => ({
          ...entry,
          exerciseNameSnapshot: entry.exerciseNameSnapshot || entry.exerciseName,
          notes: entry.notes || '',
          sets: (entry.sets ?? []).map((setEntry) => ({
            ...setEntry,
            completed:
              setEntry.completed ??
              ((entry.exerciseType === 'time'
                ? (setEntry.durationSec ?? 0)
                : (setEntry.reps ?? 0)) > 0),
          })),
        })),
      };
    }

    return legacySessionToV2(session as LegacyWorkoutSession);
  });
};
