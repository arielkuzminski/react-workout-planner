import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage';
import { exerciseLibrary, workoutPlans } from '../data/workoutPlans';
import {
  AutoBackupPayload,
  ExerciseDefinition,
  ExerciseHistorySummary,
  PlanId,
  WorkoutPlan,
  SessionEntry,
  SessionSet,
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
import {
  createCustomPlanRecord,
  mergePlansWithSeeds,
} from '../utils/templateUtils';

interface WorkoutStoreState {
  schemaVersion: number;
  activeSession: WorkoutSession | null;
  completedSessions: WorkoutSession[];
  exerciseLibrary: ExerciseDefinition[];
  plans: typeof workoutPlans;
}

interface WorkoutStoreActions {
  startSession: (planId?: PlanId) => void;
  abandonActiveSession: () => void;
  completeActiveSession: () => void;
  createCustomPlan: (name: string, description: string, exerciseIds: string[]) => string | null;
  saveActiveSessionAsPlan: (name: string, description: string) => string | null;
  updatePlanExercises: (planId: string, exerciseIds: string[]) => void;
  moveExerciseInPlan: (planId: string, fromIndex: number, toIndex: number) => void;
  deleteCustomPlan: (planId: string) => void;
  setPlanActive: (planId: string, isActive: boolean) => void;
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
  restoreFromBackup: (payload: AutoBackupPayload) => boolean;
  getCompletedSessions: () => WorkoutSession[];
  getExerciseDefinition: (exerciseId: string) => ExerciseDefinition | undefined;
  getPlanById: (planId: string) => WorkoutPlan | undefined;
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

const normalizeTemplateExerciseIds = (exerciseIds: string[], availableIds: Set<string>) => {
  const seen = new Set<string>();
  return exerciseIds.filter((exerciseId) => {
    if (!availableIds.has(exerciseId) || seen.has(exerciseId)) {
      return false;
    }
    seen.add(exerciseId);
    return true;
  });
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      schemaVersion: 4,
      activeSession: null,
      completedSessions: [],
      exerciseLibrary,
      plans: mergePlansWithSeeds(undefined),

      startSession: (planId) => {
        const preferredWeights = getPreferredWeights(get().completedSessions);
        const plans = get().plans;
        const plan = planId ? plans.find((item) => item.id === planId && item.isActive) : undefined;
        set({
          activeSession: createSession(
            get().exerciseLibrary,
            plans,
            plan?.id,
            preferredWeights,
          ),
        });
      },

      abandonActiveSession: () => {
        set({ activeSession: null });
      },

      createCustomPlan: (name, description, exerciseIds) => {
        const availableIds = new Set(get().exerciseLibrary.map((exercise) => exercise.id));
        const normalizedExerciseIds = normalizeTemplateExerciseIds(exerciseIds, availableIds);
        const normalizedName = name.trim();

        if (!normalizedName || normalizedExerciseIds.length === 0) {
          return null;
        }

        const plan = createCustomPlanRecord(normalizedName, description, normalizedExerciseIds);
        set((state) => ({
          plans: [...state.plans, plan],
        }));
        return plan.id;
      },

      saveActiveSessionAsPlan: (name, description) => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return null;
        }

        return get().createCustomPlan(
          name,
          description,
          activeSession.entries.map((entry) => entry.exerciseId),
        );
      },

      updatePlanExercises: (planId, exerciseIds) => {
        const availableIds = new Set(get().exerciseLibrary.map((exercise) => exercise.id));
        const normalizedExerciseIds = normalizeTemplateExerciseIds(exerciseIds, availableIds);

        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId || plan.source !== 'custom') {
              return plan;
            }

            return {
              ...plan,
              exerciseIds: normalizedExerciseIds,
            };
          }),
        }));
      },

      moveExerciseInPlan: (planId, fromIndex, toIndex) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId || plan.source !== 'custom') {
              return plan;
            }

            if (
              fromIndex < 0 ||
              toIndex < 0 ||
              fromIndex >= plan.exerciseIds.length ||
              toIndex >= plan.exerciseIds.length ||
              fromIndex === toIndex
            ) {
              return plan;
            }

            const exerciseIds = [...plan.exerciseIds];
            const [movedId] = exerciseIds.splice(fromIndex, 1);
            exerciseIds.splice(toIndex, 0, movedId);

            return {
              ...plan,
              exerciseIds,
            };
          }),
        }));
      },

      deleteCustomPlan: (planId) => {
        set((state) => ({
          plans: state.plans.filter((plan) => !(plan.id === planId && plan.source === 'custom')),
        }));
      },

      setPlanActive: (planId, isActive) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId || plan.source !== 'system') {
              return plan;
            }

            return {
              ...plan,
              isActive,
            };
          }),
        }));
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

      restoreFromBackup: (payload) => {
        const completedSessions = dedupeCompleted(
          payload.completedSessions.filter((session) => session.status === 'completed')
        );
        completedSessions.sort((a, b) =>
          new Date(b.completedAt ?? b.startedAt).getTime() -
          new Date(a.completedAt ?? a.startedAt).getTime(),
        );

        set({
          activeSession: payload.activeSession ?? null,
          completedSessions,
          plans: mergePlansWithSeeds(payload.plans),
        });

        return true;
      },

      getCompletedSessions: () => get().completedSessions,

      getExerciseDefinition: (exerciseId) =>
        get().exerciseLibrary.find((exercise) => exercise.id === exerciseId),

      getPlanById: (planId) => get().plans.find((plan) => plan.id === planId),

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
      name: STORAGE_KEYS.workoutStore,
      version: 4,
      storage: createJSONStorage(() => {
        const safeStorage: Storage = {
          ...localStorage,
          setItem(key: string, value: string) {
            try {
              localStorage.setItem(key, value);
            } catch (e) {
              if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
                console.error('[Siłka] localStorage quota exceeded — data may not be saved');
                window.dispatchEvent(new CustomEvent(APP_EVENTS.storageFull));
              } else {
                throw e;
              }
            }
          },
          getItem: (key: string) => localStorage.getItem(key),
          removeItem: (key: string) => localStorage.removeItem(key),
        };
        return safeStorage;
      }),
      migrate: (persistedState) => {
        const persisted = persistedState as {
          activeSession?: WorkoutSession | null;
          completedSessions?: WorkoutSession[];
          plans?: WorkoutPlan[];
          legacyTemplates?: WorkoutPlan[];
          sessions?: unknown;
        };

        return {
          schemaVersion: 4,
          activeSession: persisted.activeSession ?? null,
          completedSessions: persisted.completedSessions ?? normalizePersistedSessions(persisted.sessions),
          exerciseLibrary,
          plans: mergePlansWithSeeds(persisted.plans ?? persisted.legacyTemplates),
        };
      },
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        activeSession: state.activeSession,
        completedSessions: state.completedSessions,
        plans: state.plans,
      }),
    }
  )
);
