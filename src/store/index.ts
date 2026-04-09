import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage';
import { workoutPlans } from '../data/workoutPlans';
import {
  AutoBackupPayload,
  ExerciseDefinition,
  ExerciseHistorySummary,
  MovementGroup,
  PlanId,
  RepRange,
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
  getLastCompletedEntryForPlan,
  getLastCompletedSessionForPlan,
  getLastTrackedWeight,
  normalizeCompletedEntry,
  normalizePersistedSessions,
} from '../utils/sessionUtils';
import {
  createCustomPlanRecord,
  mergePlansWithSeeds,
} from '../utils/templateUtils';
import {
  createCustomExerciseRecord,
  mergeExerciseLibraryWithSeeds,
} from '../utils/exerciseUtils';

interface WorkoutStoreState {
  schemaVersion: number;
  activeSession: WorkoutSession | null;
  completedSessions: WorkoutSession[];
  exerciseLibrary: ExerciseDefinition[];
  plans: typeof workoutPlans;
}

export interface CustomExerciseInput {
  name: string;
  type: 'weight' | 'time';
  movementGroup: MovementGroup;
  targetSets: number;
  repRange: RepRange;
  defaultWeight: number;
}

export type CustomExercisePatch = Partial<CustomExerciseInput>;

interface WorkoutStoreActions {
  startSession: (planId?: PlanId) => void;
  abandonActiveSession: () => void;
  completeActiveSession: () => boolean;
  createCustomPlan: (name: string, description: string, exerciseIds: string[]) => string | null;
  saveActiveSessionAsPlan: (name: string, description: string) => string | null;
  updatePlanExercises: (planId: string, exerciseIds: string[]) => void;
  updatePlanDetails: (planId: string, name: string, description: string) => void;
  moveExerciseInPlan: (planId: string, fromIndex: number, toIndex: number) => void;
  deleteCustomPlan: (planId: string) => void;
  setPlanActive: (planId: string, isActive: boolean) => void;
  createCustomExercise: (input: CustomExerciseInput) => string | null;
  updateCustomExercise: (exerciseId: string, patch: CustomExercisePatch) => void;
  deleteCustomExercise: (exerciseId: string) => void;
  setExerciseHidden: (exerciseId: string, hidden: boolean) => void;
  addExerciseToActiveSession: (exerciseId: string) => void;
  removeEntryFromActiveSession: (entryId: string) => void;
  updateSetInActiveSession: (
    entryId: string,
    setId: string,
    patch: Partial<Pick<SessionSet, 'weight' | 'reps' | 'durationSec'>>
  ) => void;
  addSetToEntry: (entryId: string) => void;
  removeSetFromEntry: (entryId: string, setId: string) => 'removed' | 'confirm-remove-entry' | 'not-found';
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

const getRecentPreferredWeights = (sessions: WorkoutSession[]) => {
  const weights: Record<string, number> = {};
  const completed = [...sessions]
    .filter((session) => session.status === 'completed')
    .sort(
      (left, right) =>
        new Date(right.completedAt ?? right.startedAt).getTime() -
        new Date(left.completedAt ?? left.startedAt).getTime()
    );

  completed.forEach((session) => {
    session.entries.forEach((entry) => {
      if (weights[entry.exerciseId] !== undefined) {
        return;
      }

      const lastTrackedWeight = getLastTrackedWeight(entry);
      if (lastTrackedWeight > 0) {
        weights[entry.exerciseId] = lastTrackedWeight;
      }
    });
  });

  return weights;
};

const getPreferredWeightsForPlan = (sessions: WorkoutSession[], planId?: PlanId) => {
  if (!planId) {
    return getRecentPreferredWeights(sessions);
  }

  const lastPlanSession = getLastCompletedSessionForPlan(sessions, planId);
  if (!lastPlanSession) {
    return getRecentPreferredWeights(sessions);
  }

  const planWeights: Record<string, number> = {};
  lastPlanSession.entries.forEach((entry) => {
    const lastTrackedWeight = getLastTrackedWeight(entry);
    if (lastTrackedWeight > 0) {
      planWeights[entry.exerciseId] = lastTrackedWeight;
    }
  });

  return {
    ...getRecentPreferredWeights(sessions),
    ...planWeights,
  };
};

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
      schemaVersion: 5,
      activeSession: null,
      completedSessions: [],
      exerciseLibrary: mergeExerciseLibraryWithSeeds(undefined),
      plans: mergePlansWithSeeds(undefined),

      startSession: (planId) => {
        const preferredWeights = getPreferredWeightsForPlan(get().completedSessions, planId);
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

      updatePlanDetails: (planId, name, description) => {
        const normalizedName = name.trim();
        if (!normalizedName) {
          return;
        }

        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId || plan.source !== 'custom') {
              return plan;
            }

            return {
              ...plan,
              name: normalizedName,
              description: description.trim(),
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

      createCustomExercise: (input) => {
        const normalizedName = input.name.trim();
        const targetSets = Math.max(1, Math.floor(input.targetSets || 0));
        const min = Math.max(0, Math.floor(input.repRange.min || 0));
        const max = Math.max(min, Math.floor(input.repRange.max || 0));
        const defaultWeight = Math.max(0, Number(input.defaultWeight) || 0);

        if (!normalizedName || !targetSets || max <= 0) {
          return null;
        }

        const record = createCustomExerciseRecord({
          name: normalizedName,
          type: input.type,
          movementGroup: input.movementGroup,
          targetSets,
          repRange: { min, max },
          defaultWeight,
        });

        set((state) => ({
          exerciseLibrary: [...state.exerciseLibrary, record],
        }));

        return record.id;
      },

      updateCustomExercise: (exerciseId, patch) => {
        set((state) => ({
          exerciseLibrary: state.exerciseLibrary.map((exercise) => {
            if (exercise.id !== exerciseId || exercise.source !== 'custom') {
              return exercise;
            }

            const nextType = patch.type ?? exercise.type;
            const nextName = patch.name !== undefined ? patch.name.trim() : exercise.name;
            const nextTargetSets =
              patch.targetSets !== undefined
                ? Math.max(1, Math.floor(patch.targetSets || 0))
                : exercise.targetSets;
            const nextMin =
              patch.repRange?.min !== undefined
                ? Math.max(0, Math.floor(patch.repRange.min || 0))
                : exercise.repRange.min;
            const nextMaxRaw =
              patch.repRange?.max !== undefined
                ? Math.max(0, Math.floor(patch.repRange.max || 0))
                : exercise.repRange.max;
            const nextMax = Math.max(nextMin, nextMaxRaw);
            const nextDefaultWeight =
              patch.defaultWeight !== undefined
                ? Math.max(0, Number(patch.defaultWeight) || 0)
                : exercise.defaultWeight;

            if (!nextName) {
              return exercise;
            }

            return {
              ...exercise,
              name: nextName,
              type: nextType,
              unit: nextType === 'time' ? 'sec' : 'kg',
              movementGroup: patch.movementGroup ?? exercise.movementGroup,
              targetSets: nextTargetSets,
              repRange: { min: nextMin, max: nextMax },
              defaultWeight: nextType === 'time' ? 0 : nextDefaultWeight,
            };
          }),
        }));
      },

      deleteCustomExercise: (exerciseId) => {
        set((state) => {
          const target = state.exerciseLibrary.find((exercise) => exercise.id === exerciseId);
          if (!target || target.source !== 'custom') {
            return {};
          }

          return {
            exerciseLibrary: state.exerciseLibrary.filter((exercise) => exercise.id !== exerciseId),
            plans: state.plans.map((plan) => {
              if (plan.source !== 'custom' || !plan.exerciseIds.includes(exerciseId)) {
                return plan;
              }
              return {
                ...plan,
                exerciseIds: plan.exerciseIds.filter((id) => id !== exerciseId),
              };
            }),
          };
        });
      },

      setExerciseHidden: (exerciseId, hidden) => {
        set((state) => ({
          exerciseLibrary: state.exerciseLibrary.map((exercise) =>
            exercise.id === exerciseId ? { ...exercise, isHidden: hidden } : exercise,
          ),
        }));
      },

      completeActiveSession: () => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return false;
        }

        const normalizedEntries = activeSession.entries
          .map((entry) => normalizeCompletedEntry(entry))
          .filter((entry): entry is SessionEntry => Boolean(entry));

        if (normalizedEntries.length === 0) {
          return false;
        }

        const now = new Date().toISOString();
        const completedSession: WorkoutSession = {
          ...activeSession,
          entries: normalizedEntries,
          status: 'completed',
          completedAt: now,
          endedAt: now,
        };

        set((state) => ({
          activeSession: null,
          completedSessions: dedupeCompleted([completedSession, ...state.completedSessions]),
        }));

        return true;
      },

      addExerciseToActiveSession: (exerciseId) => {
        const definition = get().exerciseLibrary.find((exercise) => exercise.id === exerciseId);
        const activeSession = get().activeSession;
        if (!definition || !activeSession) {
          return;
        }

        const previous = activeSession.planId
          ? getLastCompletedEntryForPlan(get().completedSessions, activeSession.planId, exerciseId) ??
            getLastCompletedEntry(get().completedSessions, exerciseId)
          : getLastCompletedEntry(get().completedSessions, exerciseId);
        const preferredWeight = previous
          ? getLastTrackedWeight(previous)
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

      removeSetFromEntry: (entryId, setId) => {
        const activeSession = get().activeSession;
        if (!activeSession) {
          return 'not-found';
        }

        const targetEntry = activeSession.entries.find((entry) => entry.id === entryId);
        if (!targetEntry || !targetEntry.sets.some((setEntry) => setEntry.id === setId)) {
          return 'not-found';
        }

        if (targetEntry.sets.length === 1) {
          return 'confirm-remove-entry';
        }

        set({
          activeSession: {
            ...activeSession,
            entries: activeSession.entries.map((entry) => {
              if (entry.id !== entryId) {
                return entry;
              }

              const nextSets = entry.sets
                .filter((setEntry) => setEntry.id !== setId)
                .map((setEntry, index) => ({
                  ...setEntry,
                  setNumber: index + 1,
                }));

              return {
                ...entry,
                sets: nextSets,
              };
            }),
          },
        });

        return 'removed';
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

        set((state) => ({
          activeSession: payload.activeSession ?? null,
          completedSessions,
          plans: mergePlansWithSeeds(payload.plans),
          exerciseLibrary: payload.exerciseLibrary
            ? mergeExerciseLibraryWithSeeds(payload.exerciseLibrary)
            : state.exerciseLibrary,
        }));

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
      version: 5,
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
          exerciseLibrary?: ExerciseDefinition[];
          sessions?: unknown;
        };

        return {
          schemaVersion: 5,
          activeSession: persisted.activeSession ?? null,
          completedSessions: persisted.completedSessions ?? normalizePersistedSessions(persisted.sessions),
          exerciseLibrary: mergeExerciseLibraryWithSeeds(persisted.exerciseLibrary),
          plans: mergePlansWithSeeds(persisted.plans ?? persisted.legacyTemplates),
        };
      },
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        activeSession: state.activeSession,
        completedSessions: state.completedSessions,
        plans: state.plans,
        exerciseLibrary: state.exerciseLibrary,
      }),
    }
  )
);
