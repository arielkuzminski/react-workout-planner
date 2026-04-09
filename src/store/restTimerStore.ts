import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/storage';

export type RestTimerStatus = 'idle' | 'running' | 'paused' | 'finished';

interface RestTimerState {
  status: RestTimerStatus;
  endTimeMs: number | null;
  pausedRemainingSec: number | null;
  configuredSeconds: number;
  pushRunId: string | null;
  startTimer: (configuredSeconds: number) => void;
  pauseTimer: (remainingSec: number) => void;
  finishTimer: () => void;
  resetTimer: (defaultSeconds: number) => void;
  setPushRunId: (runId: string | null) => void;
}

export const useRestTimerStore = create<RestTimerState>()(
  persist(
    (set) => ({
      status: 'idle',
      endTimeMs: null,
      pausedRemainingSec: null,
      configuredSeconds: 90,
      pushRunId: null,
      startTimer: (configuredSeconds) =>
        set({
          status: 'running',
          endTimeMs: Date.now() + configuredSeconds * 1000,
          pausedRemainingSec: null,
          configuredSeconds,
          pushRunId: null,
        }),
      pauseTimer: (remainingSec) =>
        set({
          status: 'paused',
          endTimeMs: null,
          pausedRemainingSec: Math.max(0, Math.ceil(remainingSec)),
          pushRunId: null,
        }),
      finishTimer: () =>
        set({
          status: 'finished',
          endTimeMs: null,
          pausedRemainingSec: null,
          pushRunId: null,
        }),
      resetTimer: (defaultSeconds) =>
        set({
          status: 'idle',
          endTimeMs: null,
          pausedRemainingSec: null,
          configuredSeconds: defaultSeconds,
          pushRunId: null,
        }),
      setPushRunId: (runId) => set({ pushRunId: runId }),
    }),
    {
      name: STORAGE_KEYS.restTimer,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
