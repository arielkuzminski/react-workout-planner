import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { exerciseLibrary, workoutTemplates } from '../data/workoutPlans';
import {
  ExerciseDefinition,
  ExerciseHistorySummary,
  SessionEntry,
  SessionSet,
  TemplateId,
  WorkoutSession,
} from '../types';
import {
  createEntryFromDefinition,
  createId,
  createSession,
  getExerciseHistorySummary,
  getLastCompletedEntry,
  normalizePersistedSessions,
} from '../utils/sessionUtils';

interface WorkoutStoreState {
  schemaVersion: number;
  activeSession: WorkoutSession | null;
  completedSessions: WorkoutSession[];
  exerciseLibrary: ExerciseDefinition[];
  templates: typeof workoutTemplates;
}

interface WorkoutStoreActions {
  startSession: (templateId?: TemplateId) => void;
  abandonActiveSession: () => void;
  completeActiveSession: () => void;
  addExerciseToActiveSession: (exerciseId: string) => void;
  removeEntryFromActiveSession: (entryId: string) => void;
  updateSetInActiveSession: (
    entryId: string,
    setId: string,
    patch: Partial<Pick<SessionSet, 'weight' | 'reps' | 'durationSec'>>
  ) => void;
  addSetToEntry: (entryId: string) => void;
  updateEntryNotes: (entryId: string, notes: string) => void;
  deleteCompletedSession: (sessionId: string) => void;
  importCompletedSessions: (sessions: WorkoutSession[]) => void;
  getCompletedSessions: () => WorkoutSession[];
  getExerciseDefinition: (exerciseId: string) => ExerciseDefinition | undefined;
  getRecentExercises: (limit?: number) => ExerciseDefinition[];
  getLastCompletedEntry: (exerciseId: string) => SessionEntry | undefined;
  getExerciseHistorySummary: (exerciseId: string) => ExerciseHistorySummary | undefined;
}

type WorkoutStore = WorkoutStoreState & WorkoutStoreActions;

const getPreferredWeights = (sessions: WorkoutSession[]) =>
  sessions.reduce<Record<string, number>>((acc, session) => {
    session.entries.forEach((entry) => {
      const bestWeight = Math.max(0, ...entry.sets.map((set) => set.weight ?? 0));
      if (bestWeight > 0) {
        acc[entry.exerciseId] = bestWeight;
      }
    });
    return acc;
  }, {});

const dedupeCompleted = (sessions: WorkoutSession[]) => {
  const seen = new Set<string>();
  return sessions.filter((session) => {
    if (seen.has(session.id)) {
      return false;
    }
    seen.add(session.id);
    return true;
  });
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      schemaVersion: 2,
      activeSession: null,
      completedSessions: [],
      exerciseLibrary,
      templates: workoutTemplates,

      startSession: (templateId) => {
        const preferredWeights = getPreferredWeights(get().completedSessions);
        set({
          activeSession: createSession(get().exerciseLibrary, templateId, preferredWeights),
        });
      },

      abandonActiveSession: () => {
        set({ activeSession: null });
      },

      completeActiveSession: () => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return;
        }

        const now = new Date().toISOString();
        const completedSession: WorkoutSession = {
          ...activeSession,
          status: 'completed',
          completedAt: now,
          endedAt: now,
        };

        set((state) => ({
          activeSession: null,
          completedSessions: dedupeCompleted([completedSession, ...state.completedSessions]),
        }));
      },

      addExerciseToActiveSession: (exerciseId) => {
        const definition = get().exerciseLibrary.find((exercise) => exercise.id === exerciseId);
        const activeSession = get().activeSession;
        if (!definition || !activeSession) {
          return;
        }

        const previous = getLastCompletedEntry(get().completedSessions, exerciseId);
        const preferredWeight = previous
          ? Math.max(0, ...previous.sets.map((set) => set.weight ?? 0))
          : undefined;

        set({
          activeSession: {
            ...activeSession,
            entries: [...activeSession.entries, createEntryFromDefinition(definition, preferredWeight)],
          },
        });
      },

      removeEntryFromActiveSession: (entryId) => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return;
        }

        set({
          activeSession: {
            ...activeSession,
            entries: activeSession.entries.filter((entry) => entry.id !== entryId),
          },
        });
      },

      updateSetInActiveSession: (entryId, setId, patch) => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return;
        }

        set({
          activeSession: {
            ...activeSession,
            entries: activeSession.entries.map((entry) => {
              if (entry.id !== entryId) {
                return entry;
              }

              return {
                ...entry,
                sets: entry.sets.map((setEntry) => {
                  if (setEntry.id !== setId) {
                    return setEntry;
                  }

                  const nextSet = { ...setEntry, ...patch };
                  const completed =
                    entry.exerciseType === 'time'
                      ? (nextSet.durationSec ?? 0) > 0
                      : (nextSet.reps ?? 0) > 0;

                  return {
                    ...nextSet,
                    completed,
                  };
                }),
              };
            }),
          },
        });
      },

      addSetToEntry: (entryId) => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return;
        }

        set({
          activeSession: {
            ...activeSession,
            entries: activeSession.entries.map((entry) => {
              if (entry.id !== entryId) {
                return entry;
              }

              const lastSet = entry.sets[entry.sets.length - 1];
              const nextSet: SessionSet = {
                id: createId('set'),
                setNumber: entry.sets.length + 1,
                weight: entry.exerciseType === 'weight' ? lastSet?.weight ?? 0 : 0,
                reps: entry.exerciseType === 'weight' ? lastSet?.reps : undefined,
                durationSec:
                  entry.exerciseType === 'time'
                    ? lastSet?.durationSec ?? entry.repRange.min
                    : undefined,
                completed: false,
              };

              return {
                ...entry,
                sets: [...entry.sets, nextSet],
              };
            }),
          },
        });
      },

      updateEntryNotes: (entryId, notes) => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return;
        }

        set({
          activeSession: {
            ...activeSession,
            entries: activeSession.entries.map((entry) =>
              entry.id === entryId ? { ...entry, notes } : entry
            ),
          },
        });
      },

      deleteCompletedSession: (sessionId) => {
        set((state) => ({
          completedSessions: state.completedSessions.filter((session) => session.id !== sessionId),
        }));
      },

      importCompletedSessions: (sessions) => {
        set((state) => {
          const merged = dedupeCompleted([
            ...sessions.filter((session) => session.status === 'completed'),
            ...state.completedSessions,
          ]);
          merged.sort((a, b) =>
            new Date(b.completedAt ?? b.startedAt).getTime() -
            new Date(a.completedAt ?? a.startedAt).getTime(),
          );
          return { completedSessions: merged };
        });
      },

      getCompletedSessions: () => get().completedSessions,

      getExerciseDefinition: (exerciseId) =>
        get().exerciseLibrary.find((exercise) => exercise.id === exerciseId),

      getRecentExercises: (limit = 6) => {
        const ids = new Set<string>();
        const recent: ExerciseDefinition[] = [];

        get().completedSessions.forEach((session) => {
          session.entries.forEach((entry) => {
            if (!ids.has(entry.exerciseId)) {
              ids.add(entry.exerciseId);
              const definition = get().exerciseLibrary.find(
                (exercise) => exercise.id === entry.exerciseId
              );
              if (definition) {
                recent.push(definition);
              }
            }
          });
        });

        return recent.slice(0, limit);
      },

      getLastCompletedEntry: (exerciseId) => getLastCompletedEntry(get().completedSessions, exerciseId),

      getExerciseHistorySummary: (exerciseId) =>
        getExerciseHistorySummary(get().completedSessions, exerciseId),
    }),
    {
      name: 'workout-store',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const persisted = persistedState as {
          activeSession?: WorkoutSession | null;
          completedSessions?: WorkoutSession[];
          sessions?: unknown;
        };

        return {
          schemaVersion: 2,
          activeSession: persisted.activeSession ?? null,
          completedSessions: persisted.completedSessions ?? normalizePersistedSessions(persisted.sessions),
          exerciseLibrary,
          templates: workoutTemplates,
        };
      },
    }
  )
);
