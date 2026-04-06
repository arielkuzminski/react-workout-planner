import { workoutPlans } from '../data/workoutPlans';
import { PlanId, WorkoutPlan, WorkoutSession } from '../types';
import { createId } from './sessionUtils';

export const getSeedPlans = (): WorkoutPlan[] =>
  workoutPlans.map((plan) => ({ ...plan, exerciseIds: [...plan.exerciseIds] }));

export const mergePlansWithSeeds = (persistedPlans: WorkoutPlan[] | undefined): WorkoutPlan[] => {
  const seeds = getSeedPlans();
  const persisted = Array.isArray(persistedPlans) ? persistedPlans : [];
  const persistedById = new Map(persisted.map((plan) => [plan.id, plan]));

  const mergedSeeds = seeds.map((seed) => {
    const existing = persistedById.get(seed.id);
    if (!existing) {
      return seed;
    }

    return {
      ...seed,
      ...existing,
      id: seed.id,
      source: 'system' as const,
      exerciseIds: [...seed.exerciseIds],
      name: seed.name,
      description: seed.description,
    };
  });

  const customPlans = persisted
    .filter((plan) => plan.source === 'custom')
    .map((plan) => ({ ...plan, exerciseIds: [...plan.exerciseIds] }));

  return [...mergedSeeds, ...customPlans];
};

export const createCustomPlanRecord = (
  name: string,
  description: string,
  exerciseIds: string[],
): WorkoutPlan => ({
  id: createId('plan'),
  name: name.trim(),
  description: description.trim(),
  exerciseIds: [...exerciseIds],
  source: 'custom',
  isActive: true,
  createdAt: new Date().toISOString(),
});

export const getPlanNameById = (
  plans: WorkoutPlan[],
  planId?: PlanId,
  fallback = 'Quick log',
): string => {
  if (!planId) {
    return fallback;
  }

  return plans.find((plan) => plan.id === planId)?.name ?? `Plan ${planId}`;
};

export const getPlanLabelBySession = (
  plans: WorkoutPlan[],
  session: WorkoutSession,
  fallback = 'Quick log',
): string => getPlanNameById(plans, session.planId, fallback);
