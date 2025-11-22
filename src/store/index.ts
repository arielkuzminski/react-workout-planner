import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WorkoutSession, ExerciseResult } from '../types';

interface WorkoutStore {
  // Stan
  sessions: WorkoutSession[];
  currentSession: WorkoutSession | null;

  // Akcje
  addSession: (session: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;
  getSessions: () => WorkoutSession[];
  getSessionsByType: (type: 'A' | 'B' | 'C') => WorkoutSession[];
  getLastSessionForExercise: (exerciseId: string) => ExerciseResult | undefined;
  setCurrentSession: (session: WorkoutSession | null) => void;
  updateSession: (sessionId: string, session: WorkoutSession) => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,

      addSession: (session) => {
        set((state) => ({
          sessions: [...state.sessions, session]
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId)
        }));
      },

      getSessions: () => {
        return get().sessions;
      },

      getSessionsByType: (type) => {
        return get().sessions.filter(s => s.workoutType === type);
      },

      getLastSessionForExercise: (exerciseId) => {
        const sessions = get().sessions;
        for (let i = sessions.length - 1; i >= 0; i--) {
          const exercise = sessions[i].exercises.find(e => e.exerciseId === exerciseId);
          if (exercise) {
            return exercise;
          }
        }
        return undefined;
      },

      setCurrentSession: (session) => {
        set({ currentSession: session });
      },

      updateSession: (sessionId, session) => {
        set((state) => ({
          sessions: state.sessions.map(s => s.id === sessionId ? session : s)
        }));
      }
    }),
    {
      name: 'workout-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
