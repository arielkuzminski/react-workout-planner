import { SessionEntry, WorkoutSession } from '../types';

export interface SessionStats {
  durationMinutes: number;
  totalVolume: number;
  totalSets: number;
  totalExercises: number;
  prs: PersonalRecord[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'volume';
  value: number;
  previousBest: number;
}

export const getEntryVolume = (entry: SessionEntry): number =>
  entry.exerciseType === 'weight'
    ? entry.sets.reduce((sum, set) => sum + (set.weight ?? 0) * (set.reps ?? 0), 0)
    : entry.sets.reduce((sum, set) => sum + (set.durationSec ?? 0), 0);

const getEntryMaxWeight = (entry: SessionEntry): number =>
  Math.max(0, ...entry.sets.map((set) => set.weight ?? 0));

export const calculateSessionStats = (
  session: WorkoutSession,
  previousSessions: WorkoutSession[]
): SessionStats => {
  const startTime = new Date(session.startedAt).getTime();
  const endTime = new Date(session.completedAt ?? session.endedAt ?? session.startedAt).getTime();
  const durationMinutes = Math.round((endTime - startTime) / 60000);

  const totalVolume = session.entries.reduce((sum, entry) => sum + getEntryVolume(entry), 0);
  const totalSets = session.entries.reduce((sum, entry) => sum + entry.sets.length, 0);
  const totalExercises = session.entries.length;

  // PR detection
  const prs: PersonalRecord[] = [];

  for (const entry of session.entries) {
    if (entry.exerciseType !== 'weight') continue;

    const currentMaxWeight = getEntryMaxWeight(entry);
    const currentVolume = getEntryVolume(entry);

    let bestWeight = 0;
    let bestVolume = 0;

    for (const prev of previousSessions) {
      const prevEntry = prev.entries.find((e) => e.exerciseId === entry.exerciseId);
      if (prevEntry) {
        bestWeight = Math.max(bestWeight, getEntryMaxWeight(prevEntry));
        bestVolume = Math.max(bestVolume, getEntryVolume(prevEntry));
      }
    }

    if (currentMaxWeight > bestWeight && bestWeight > 0) {
      prs.push({
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        type: 'weight',
        value: currentMaxWeight,
        previousBest: bestWeight,
      });
    }

    if (currentVolume > bestVolume && bestVolume > 0) {
      prs.push({
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        type: 'volume',
        value: Math.round(currentVolume),
        previousBest: Math.round(bestVolume),
      });
    }
  }

  return { durationMinutes, totalVolume: Math.round(totalVolume), totalSets, totalExercises, prs };
};
