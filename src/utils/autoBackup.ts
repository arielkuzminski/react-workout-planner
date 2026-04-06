import { useBackupStore } from '../store/backupStore';
import { useWorkoutStore } from '../store';
import { saveAutoBackupSnapshot } from './backup';

let initialized = false;
let backupTimer: ReturnType<typeof setTimeout> | null = null;

const scheduleBackup = () => {
  if (backupTimer) {
    clearTimeout(backupTimer);
  }

  backupTimer = setTimeout(() => {
    backupTimer = null;

    if (!useBackupStore.getState().enabled) {
      return;
    }

    const payload = saveAutoBackupSnapshot();
    useBackupStore.getState().setLastBackupAt(payload.exportedAt);
  }, 800);
};

export const initializeAutoBackup = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  let previousSnapshot = JSON.stringify({
    activeSession: useWorkoutStore.getState().activeSession,
    completedSessions: useWorkoutStore.getState().completedSessions,
    plans: useWorkoutStore.getState().plans,
  });

  useWorkoutStore.subscribe((state) => {
    const nextSnapshot = JSON.stringify({
      activeSession: state.activeSession,
      completedSessions: state.completedSessions,
      plans: state.plans,
    });

    if (nextSnapshot === previousSnapshot) {
      return;
    }

    previousSnapshot = nextSnapshot;
    scheduleBackup();
  });

  useBackupStore.subscribe((state, previousState) => {
    if (state.enabled && !previousState.enabled) {
      scheduleBackup();
    }
  });
};
