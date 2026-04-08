export type ExerciseType = 'weight' | 'time';
export type PlanId = string;
export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type ExerciseUnit = 'kg' | 'sec';
export type MovementGroup = 'legs' | 'push' | 'pull';
export type PlanSource = 'system' | 'custom';
export type ExerciseSource = 'system' | 'custom';

export interface RepRange {
  min: number;
  max: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  type: ExerciseType;
  movementGroup: MovementGroup;
  targetSets: number;
  repRange: RepRange;
  defaultWeight: number;
  unit: ExerciseUnit;
  tags?: string[];
  source: ExerciseSource;
  isHidden: boolean;
}

export type ExerciseLibraryItem = ExerciseDefinition;

export interface WorkoutPlan {
  id: PlanId;
  name: string;
  description: string;
  exerciseIds: string[];
  source: PlanSource;
  isActive: boolean;
  createdAt?: string;
}

export interface SessionSet {
  id: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  durationSec?: number;
  completed: boolean;
}

export type SetEntry = SessionSet;

export interface SessionEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseNameSnapshot: string;
  exerciseType: ExerciseType;
  targetSets: number;
  repRange: RepRange;
  unit: ExerciseUnit;
  sets: SessionSet[];
  notes: string;
}

export interface WorkoutSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  endedAt?: string;
  status: SessionStatus;
  planId?: PlanId;
  notes: string;
  entries: SessionEntry[];
}

export type Session = WorkoutSession;

export interface ExerciseHistorySummary {
  exerciseId: string;
  exerciseName: string;
  lastWeight?: number;
  lastReps?: number;
  lastDurationSec?: number;
  lastCompletedAt?: string;
}

export interface ExercisePerformanceSummary {
  exerciseId: string;
  exerciseName: string;
  lastWeight?: number;
  lastReps?: number;
  lastDurationSec?: number;
  completedAt: string;
}

export interface ExerciseHistoryPoint {
  sessionId: string;
  completedAt: string;
  entry: SessionEntry;
}

export interface ProgressionSuggestion {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestion: 'increase' | 'maintain';
  newWeight?: number;
  reason: string;
}

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  activeSession: Session | null;
  completedSessions: Session[];
}

export interface BackupSettings {
  enabled: boolean;
  lastBackupAt?: string;
}

export interface UserPreferences {
  restTimerSeconds: number;
  restTimerSoundEnabled: boolean;
  restTimerVibrationEnabled: boolean;
  restTimerNotificationsEnabled: boolean;
  restTimerNotificationPermission: NotificationPermission | 'unsupported';
  weightIncrementKg: number;
}

export interface AutoBackupPayload extends ExportPayload {
  plans: WorkoutPlan[];
  exerciseLibrary?: ExerciseDefinition[];
  backupSettings?: Pick<BackupSettings, 'enabled'>;
}

export interface LegacySetResult {
  setNumber: number;
  reps: number;
}

export interface LegacyExerciseResult {
  exerciseId: string;
  weight: number;
  sets: LegacySetResult[];
  notes?: string;
}

export interface LegacyWorkoutSession {
  id?: string;
  date: string | Date;
  workoutType?: PlanId;
  exercises: LegacyExerciseResult[];
}
