// Typ ćwiczenia
export type ExerciseType = 'weight' | 'time';

// Zakres powtórzeń
export interface RepRange {
  min: number;
  max: number;
}

// Ćwiczenie
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  repRange: RepRange;
  startWeight: number;
  type: ExerciseType; // 'weight' lub 'time' (dla planka)
}

// Plan treningowy (A, B lub C)
export interface WorkoutPlan {
  id: 'A' | 'B' | 'C';
  name: string;
  exercises: Exercise[];
}

// Seria w treningu
export interface SetResult {
  setNumber: number;
  reps: number; // albo liczba powtórzeń, albo liczba sekund dla planka
}

// Wynik ćwiczenia
export interface ExerciseResult {
  exerciseId: string;
  weight: number;
  sets: SetResult[];
  notes?: string;
}

// Sesja treningowa
export interface WorkoutSession {
  id: string;
  date: Date;
  workoutType: 'A' | 'B' | 'C';
  exercises: ExerciseResult[];
}

// Rekomendacja progresji
export interface ProgressionSuggestion {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestion: 'increase' | 'maintain';
  newWeight?: number;
  reason: string;
}
