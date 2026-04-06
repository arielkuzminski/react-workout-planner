import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/storage';
import { BackupSettings } from '../types';

interface BackupStore extends BackupSettings {
  setEnabled: (enabled: boolean) => void;
  setLastBackupAt: (timestamp?: string) => void;
}

export const useBackupStore = create<BackupStore>()(
  persist(
    (set) => ({
      enabled: false,
      lastBackupAt: undefined,
      setEnabled: (enabled) => set({ enabled }),
      setLastBackupAt: (lastBackupAt) => set({ lastBackupAt }),
    }),
    {
      name: STORAGE_KEYS.autoBackupSettings,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        lastBackupAt: state.lastBackupAt,
      }),
    }
  )
);
