import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import {
  cancelRestTimerPush,
  closeRestTimerNotifications,
  ensureRestTimerPushSubscription,
  getRestTimerPushStatus,
  isRestTimerVibrationSupported,
  playRestTimerSound,
  prepareRestTimerAudio,
  requestRestTimerNotificationPermission,
  scheduleRestTimerPush,
  vibrateRestTimer,
} from '../utils/restTimerAlerts';
import { useRestTimerStore } from '../store/restTimerStore';

interface RestTimerProps {
  defaultSeconds?: number;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  notificationsEnabled?: boolean;
  onNotificationPermissionChange?: (permission: NotificationPermission | 'unsupported') => void;
  onPushStatusChange?: (
    status:
      | 'unknown'
      | 'unsupported'
      | 'install-required'
      | 'permission-required'
      | 'denied'
      | 'missing-config'
      | 'ready'
      | 'error'
  ) => void;
  className?: string;
}

export default function RestTimer({
  defaultSeconds = 90,
  soundEnabled = true,
  vibrationEnabled = true,
  notificationsEnabled = true,
  onNotificationPermissionChange,
  onPushStatusChange,
  className = '',
}: RestTimerProps) {
  // Initial seconds come from persisted store if a timer is mid-flight, otherwise from the prop.
  const computeInitialSeconds = () => {
    const snapshot = useRestTimerStore.getState();
    if (snapshot.status === 'running' && snapshot.endTimeMs !== null) {
      return Math.max(0, Math.ceil((snapshot.endTimeMs - Date.now()) / 1000));
    }
    if (snapshot.status === 'paused' && snapshot.pausedRemainingSec !== null) {
      return snapshot.pausedRemainingSec;
    }
    if (snapshot.status === 'finished') {
      return 0;
    }
    return defaultSeconds;
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(computeInitialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);
  const silentFinishRef = useRef(false);

  const cancelScheduledPush = useCallback(() => {
    const runId = useRestTimerStore.getState().pushRunId;
    useRestTimerStore.getState().setPushRunId(null);
    if (runId) {
      void cancelRestTimerPush(runId);
    }
  }, []);

  const clearRuntime = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }

    endTimeRef.current = null;
  }, []);

  const syncSecondsLeft = useCallback(() => {
    if (endTimeRef.current === null) {
      return 0;
    }

    const next = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setSecondsLeft(next);
    return next;
  }, []);

  const finish = useCallback(async () => {
    if (hasFinishedRef.current) {
      return;
    }

    const silent = silentFinishRef.current;
    silentFinishRef.current = false;
    hasFinishedRef.current = true;
    clearRuntime();
    cancelScheduledPush();
    useRestTimerStore.getState().finishTimer();
    setSecondsLeft(0);
    setIsRunning(false);
    setHasFinished(true);

    if (silent) {
      await closeRestTimerNotifications();
      return;
    }

    await Promise.all([
      playRestTimerSound(soundEnabled),
      Promise.resolve(vibrateRestTimer(vibrationEnabled)),
      closeRestTimerNotifications(),
    ]);
  }, [cancelScheduledPush, clearRuntime, soundEnabled, vibrationEnabled]);

  const scheduleRuntime = useCallback((remainingSeconds: number) => {
    clearRuntime();

    if (remainingSeconds <= 0) {
      void finish();
      return;
    }

    endTimeRef.current = Date.now() + remainingSeconds * 1000;
    setSecondsLeft(remainingSeconds);

    finishTimeoutRef.current = window.setTimeout(() => {
      void finish();
    }, remainingSeconds * 1000);

    intervalRef.current = setInterval(() => {
      const next = syncSecondsLeft();
      if (next <= 0) {
        void finish();
      }
    }, 250);
  }, [clearRuntime, finish, syncSecondsLeft]);

  // On mount: restore state from persisted store.
  useEffect(() => {
    const snapshot = useRestTimerStore.getState();

    if (snapshot.status === 'running' && snapshot.endTimeMs !== null) {
      const remaining = Math.max(0, Math.ceil((snapshot.endTimeMs - Date.now()) / 1000));
      if (remaining <= 0) {
        // Timer finished while unmounted — user already got the push. Transition silently.
        silentFinishRef.current = true;
        void finish();
      } else {
        hasFinishedRef.current = false;
        setHasFinished(false);
        setIsRunning(true);
        endTimeRef.current = snapshot.endTimeMs;
        setSecondsLeft(remaining);
        finishTimeoutRef.current = window.setTimeout(() => {
          void finish();
        }, remaining * 1000);
        intervalRef.current = setInterval(() => {
          const next = syncSecondsLeft();
          if (next <= 0) {
            void finish();
          }
        }, 250);
      }
    } else if (snapshot.status === 'paused' && snapshot.pausedRemainingSec !== null) {
      setSecondsLeft(snapshot.pausedRemainingSec);
      setIsRunning(false);
      setHasFinished(false);
      hasFinishedRef.current = false;
    } else if (snapshot.status === 'finished') {
      setSecondsLeft(0);
      setIsRunning(false);
      setHasFinished(true);
      hasFinishedRef.current = true;
    }
    // status === 'idle' → defaults from useState initializer apply
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When `defaultSeconds` changes (user tweaks in Settings):
  // only reset if the timer is idle — don't interrupt a running or paused timer.
  useEffect(() => {
    const snapshot = useRestTimerStore.getState();
    if (snapshot.status === 'idle') {
      setSecondsLeft(defaultSeconds);
      setHasFinished(false);
      setIsRunning(false);
      hasFinishedRef.current = false;
      useRestTimerStore.getState().resetTimer(defaultSeconds);
    }
  }, [defaultSeconds]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    void (async () => {
      onPushStatusChange?.(await getRestTimerPushStatus());
    })();
  }, [onPushStatusChange]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isRunning) {
        return;
      }

      const next = syncSecondsLeft();
      if (next <= 0) {
        void finish();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [finish, isRunning, syncSecondsLeft]);

  // Unmount cleanup — only clear local runtime refs.
  // Do NOT cancel the scheduled push here: the user might have navigated to another
  // screen while the timer is running, and the push notification must still fire.
  useEffect(() => () => {
    clearRuntime();
  }, [clearRuntime]);

  const stop = useCallback(() => {
    const next = syncSecondsLeft();
    clearRuntime();
    cancelScheduledPush();
    setIsRunning(false);
    const remaining = next > 0 ? next : secondsLeft;
    setSecondsLeft(remaining);
    useRestTimerStore.getState().pauseTimer(remaining);
    void closeRestTimerNotifications();
  }, [cancelScheduledPush, clearRuntime, secondsLeft, syncSecondsLeft]);

  const start = useCallback(async () => {
    if (secondsLeft <= 0) {
      return;
    }

    setHasFinished(false);
    hasFinishedRef.current = false;

    await prepareRestTimerAudio();
    scheduleRuntime(secondsLeft);
    setIsRunning(true);
    useRestTimerStore.getState().startTimer(secondsLeft);

    if (!notificationsEnabled) {
      return;
    }

    const permission = await requestRestTimerNotificationPermission();
    onNotificationPermissionChange?.(permission);

    const subscriptionResult = await ensureRestTimerPushSubscription();
    onPushStatusChange?.(subscriptionResult.status);

    if (!subscriptionResult.subscription) {
      return;
    }

    const timerId = crypto.randomUUID();
    const fireAt = new Date(Date.now() + secondsLeft * 1000).toISOString();
    const scheduleResult = await scheduleRestTimerPush(timerId, fireAt, subscriptionResult.subscription);
    useRestTimerStore.getState().setPushRunId(scheduleResult.runId);
    onPushStatusChange?.(scheduleResult.status);
  }, [
    notificationsEnabled,
    onNotificationPermissionChange,
    onPushStatusChange,
    scheduleRuntime,
    secondsLeft,
  ]);

  const reset = useCallback(() => {
    clearRuntime();
    cancelScheduledPush();
    setIsRunning(false);
    setSecondsLeft(defaultSeconds);
    setHasFinished(false);
    hasFinishedRef.current = false;
    useRestTimerStore.getState().resetTimer(defaultSeconds);
    void closeRestTimerNotifications();
  }, [cancelScheduledPush, clearRuntime, defaultSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = defaultSeconds > 0 ? 1 - secondsLeft / defaultSeconds : 1;
  const vibrationSupported = isRestTimerVibrationSupported();

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${className} ${
      hasFinished
        ? 'bg-success-soft border border-success-border'
        : isRunning
          ? 'bg-brand-soft border border-brand-border'
          : 'bg-surface border border-border'
    }`}>
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-chart-track)" strokeWidth="3" />
          {!prefersReducedMotion && (
            <circle
              cx="18" cy="18" r="16" fill="none"
              stroke={hasFinished ? 'var(--color-chart-line)' : 'var(--color-chart-fill)'}
              strokeWidth="3"
              strokeDasharray={`${progress * 100.5} 100.5`}
              strokeLinecap="round"
            />
          )}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="flex min-w-[160px] flex-1 flex-col">
        <span className="font-medium text-text-primary">
          {hasFinished ? 'Przerwa zakończona!' : isRunning ? 'Odpoczywaj...' : 'Timer przerwy'}
        </span>
        {!vibrationSupported && (
          <span className="text-xs text-text-tertiary">Wibracja nie jest obsługiwana na tym urządzeniu.</span>
        )}
      </div>

      <div className="ml-auto flex gap-1">
        {!isRunning && !hasFinished && (
          <button onClick={() => void start()} className="p-2 rounded-lg hover:bg-surface-inset" aria-label="Start timer">
            <Play className="w-4 h-4 text-brand-text" />
          </button>
        )}
        {isRunning && (
          <button onClick={stop} className="p-2 rounded-lg hover:bg-surface-inset" aria-label="Pause timer">
            <Pause className="w-4 h-4 text-text-primary" />
          </button>
        )}
        <button onClick={reset} className="p-2 rounded-lg hover:bg-surface-inset" aria-label="Reset timer">
          <RotateCcw className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
