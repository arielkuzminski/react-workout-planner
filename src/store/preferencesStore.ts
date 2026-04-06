import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/storage';
import { UserPreferences } from '../types';

interface PreferencesStore extends UserPreferences {
  setRestTimerSeconds: (seconds: number) => void;
  setRestTimerSoundEnabled: (enabled: boolean) => void;
  setWeightIncrementKg: (value: number) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  restTimerSeconds: 90,
  restTimerSoundEnabled: true,
  weightIncrementKg: 2.5,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setRestTimerSeconds: (restTimerSeconds) =>
        set({ restTimerSeconds: Math.min(3600, Math.max(5, Math.round(restTimerSeconds))) }),
      setRestTimerSoundEnabled: (restTimerSoundEnabled) => set({ restTimerSoundEnabled }),
      setWeightIncrementKg: (weightIncrementKg) =>
        set({
          weightIncrementKg: Math.min(20, Math.max(0.25, Number(weightIncrementKg.toFixed(2)))),
        }),
    }),
    {
      name: STORAGE_KEYS.userPreferences,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        restTimerSeconds: state.restTimerSeconds,
        restTimerSoundEnabled: state.restTimerSoundEnabled,
        weightIncrementKg: state.weightIncrementKg,
      }),
    }
  )
);
