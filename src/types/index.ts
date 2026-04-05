export type ExerciseType = 'weight' | 'time';
export type TemplateId = 'A' | 'B' | 'C';
export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type ExerciseUnit = 'kg' | 'sec';

export interface RepRange {
  min: number;
  max: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  type: ExerciseType;
  targetSets: number;
  repRange: RepRange;
  defaultWeight: number;
  unit: ExerciseUnit;
  tags?: string[];
}

export type ExerciseLibraryItem = ExerciseDefinition;

export interface WorkoutTemplate {
  id: TemplateId;
  name: string;
  description: string;
  exerciseIds: string[];
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
  templateId?: TemplateId;
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
  workoutType?: TemplateId;
  exercises: LegacyExerciseResult[];
}
