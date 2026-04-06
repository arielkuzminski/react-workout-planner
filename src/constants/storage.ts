export const STORAGE_KEYS = {
  workoutStore: 'workout-store',
  themeStore: 'silka-theme',
  autoBackup: 'silka-auto-backup',
  autoBackupSettings: 'silka-auto-backup-settings',
} as const;

export const APP_EVENTS = {
  storageFull: 'silka:storage-full',
} as const;
