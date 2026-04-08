import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage';
import { useBackupStore } from '../store/backupStore';
import { useWorkoutStore } from '../store';
import {
  AutoBackupPayload,
  ExerciseDefinition,
  ExportPayload,
  WorkoutPlan,
  WorkoutSession,
} from '../types';
import { normalizePersistedSessions } from './sessionUtils';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isWorkoutSessionLike = (value: unknown): value is WorkoutSession =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.startedAt === 'string' &&
  Array.isArray(value.entries);

const isWorkoutPlanLike = (value: unknown): value is WorkoutPlan =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.description === 'string' &&
  Array.isArray(value.exerciseIds);

const isExerciseDefinitionLike = (value: unknown): value is ExerciseDefinition =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  (value.type === 'weight' || value.type === 'time') &&
  (value.movementGroup === 'legs' ||
    value.movementGroup === 'push' ||
    value.movementGroup === 'pull') &&
  typeof value.targetSets === 'number' &&
  isRecord(value.repRange) &&
  typeof (value.repRange as Record<string, unknown>).min === 'number' &&
  typeof (value.repRange as Record<string, unknown>).max === 'number' &&
  typeof value.defaultWeight === 'number';

export const createExportPayload = (completedSessions: WorkoutSession[]): ExportPayload => ({
  schemaVersion: 2,
  exportedAt: new Date().toISOString(),
  activeSession: null,
  completedSessions,
});

export const createAutoBackupPayload = (): AutoBackupPayload => {
  const state = useWorkoutStore.getState();
  const backupSettings = useBackupStore.getState();

  return {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    activeSession: state.activeSession,
    completedSessions: state.completedSessions,
    plans: state.plans,
    exerciseLibrary: state.exerciseLibrary,
    backupSettings: {
      enabled: backupSettings.enabled,
    },
  };
};

export const saveAutoBackupSnapshot = () => {
  const payload = createAutoBackupPayload();
  try {
    localStorage.setItem(STORAGE_KEYS.autoBackup, JSON.stringify(payload));
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      window.dispatchEvent(new CustomEvent(APP_EVENTS.storageFull));
    } else {
      throw e;
    }
  }
  return payload;
};

export const readAutoBackupSnapshot = (): AutoBackupPayload | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.autoBackup);
  if (!raw) {
    return null;
  }

  try {
    return parseAutoBackupPayload(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const parseImportedCompletedSessions = (parsed: unknown): WorkoutSession[] | null => {
  if (isRecord(parsed) && parsed.schemaVersion === 2 && Array.isArray(parsed.completedSessions)) {
    const validSessions = parsed.completedSessions.filter(isWorkoutSessionLike);
    return validSessions.length > 0 ? validSessions : null;
  }

  if (isRecord(parsed)) {
    const normalized = normalizePersistedSessions(parsed.sessions);
    return normalized.length > 0 ? normalized : null;
  }

  if (Array.isArray(parsed)) {
    const normalized = normalizePersistedSessions(parsed);
    return normalized.length > 0 ? normalized : null;
  }

  return null;
};

export const parseAutoBackupPayload = (parsed: unknown): AutoBackupPayload | null => {
  if (!isRecord(parsed)) {
    return null;
  }

  const completedSessions = parseImportedCompletedSessions(parsed);
  if (!completedSessions) {
    return null;
  }

  const activeSession = isWorkoutSessionLike(parsed.activeSession) ? parsed.activeSession : null;
  const plans = Array.isArray(parsed.plans) ? parsed.plans.filter(isWorkoutPlanLike) : [];
  const exerciseLibrary = Array.isArray(parsed.exerciseLibrary)
    ? parsed.exerciseLibrary.filter(isExerciseDefinitionLike)
    : undefined;
  const backupSettings = isRecord(parsed.backupSettings)
    ? {
        enabled: parsed.backupSettings.enabled === true,
      }
    : undefined;

  return {
    schemaVersion: 2,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    activeSession,
    completedSessions,
    plans,
    exerciseLibrary,
    backupSettings,
  };
};
