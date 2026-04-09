import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/storage';
import { UserPreferences } from '../types';

interface PreferencesStore extends UserPreferences {
  setRestTimerSeconds: (seconds: number) => void;
  setRestTimerSoundEnabled: (enabled: boolean) => void;
  setRestTimerVibrationEnabled: (enabled: boolean) => void;
  setRestTimerNotificationsEnabled: (enabled: boolean) => void;
  setRestTimerNotificationPermission: (permission: NotificationPermission | 'unsupported') => void;
  setRestTimerPushStatus: (status: UserPreferences['restTimerPushStatus']) => void;
  setWeightIncrementKg: (value: number) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  restTimerSeconds: 90,
  restTimerSoundEnabled: true,
  restTimerVibrationEnabled: true,
  restTimerNotificationsEnabled: true,
  restTimerNotificationPermission: 'default',
  restTimerPushStatus: 'unknown',
  weightIncrementKg: 2.5,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setRestTimerSeconds: (restTimerSeconds) =>
        set({ restTimerSeconds: Math.min(3600, Math.max(5, Math.round(restTimerSeconds))) }),
      setRestTimerSoundEnabled: (restTimerSoundEnabled) => set({ restTimerSoundEnabled }),
      setRestTimerVibrationEnabled: (restTimerVibrationEnabled) => set({ restTimerVibrationEnabled }),
      setRestTimerNotificationsEnabled: (restTimerNotificationsEnabled) => set({ restTimerNotificationsEnabled }),
      setRestTimerNotificationPermission: (restTimerNotificationPermission) => set({ restTimerNotificationPermission }),
      setRestTimerPushStatus: (restTimerPushStatus) => set({ restTimerPushStatus }),
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
        restTimerVibrationEnabled: state.restTimerVibrationEnabled,
        restTimerNotificationsEnabled: state.restTimerNotificationsEnabled,
        restTimerNotificationPermission: state.restTimerNotificationPermission,
        restTimerPushStatus: state.restTimerPushStatus,
        weightIncrementKg: state.weightIncrementKg,
      }),
    }
  )
);
