import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import {
  closeRestTimerNotifications,
  playRestTimerSound,
  prepareRestTimerAudio,
  requestRestTimerNotificationPermission,
  showRestTimerNotification,
  vibrateRestTimer,
} from '../utils/restTimerAlerts';

interface RestTimerProps {
  defaultSeconds?: number;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  notificationsEnabled?: boolean;
  onNotificationPermissionChange?: (permission: NotificationPermission | 'unsupported') => void;
  className?: string;
}

export default function RestTimer({
  defaultSeconds = 90,
  soundEnabled = true,
  vibrationEnabled = true,
  notificationsEnabled = true,
  onNotificationPermissionChange,
  className = '',
}: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);

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

    hasFinishedRef.current = true;
    clearRuntime();
    setSecondsLeft(0);
    setIsRunning(false);
    setHasFinished(true);

    const isBackgrounded = document.visibilityState !== 'visible' || !document.hasFocus();

    await Promise.all([
      playRestTimerSound(soundEnabled),
      Promise.resolve(vibrateRestTimer(vibrationEnabled)),
      notificationsEnabled && isBackgrounded
        ? showRestTimerNotification()
        : closeRestTimerNotifications(),
    ]);
  }, [clearRuntime, notificationsEnabled, soundEnabled, vibrationEnabled]);

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

  useEffect(() => {
    setSecondsLeft(defaultSeconds);
    setHasFinished(false);
    setIsRunning(false);
    hasFinishedRef.current = false;
    clearRuntime();
    void closeRestTimerNotifications();
  }, [clearRuntime, defaultSeconds]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isRunning) {
        return;
      }

      const next = syncSecondsLeft();
      if (next <= 0) {
        void finish();
        return;
      }

      if (document.visibilityState === 'visible') {
        void closeRestTimerNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [finish, isRunning, syncSecondsLeft]);

  useEffect(() => () => {
    clearRuntime();
    void closeRestTimerNotifications();
  }, [clearRuntime]);

  const stop = useCallback(() => {
    const next = syncSecondsLeft();
    clearRuntime();
    setIsRunning(false);
    setSecondsLeft((current) => (next > 0 ? next : current));
    void closeRestTimerNotifications();
  }, [clearRuntime, syncSecondsLeft]);

  const start = useCallback(async () => {
    if (secondsLeft <= 0) {
      return;
    }

    setHasFinished(false);
    hasFinishedRef.current = false;

    await prepareRestTimerAudio();

    if (notificationsEnabled) {
      const permission = await requestRestTimerNotificationPermission();
      onNotificationPermissionChange?.(permission);
    }

    scheduleRuntime(secondsLeft);
    setIsRunning(true);
  }, [notificationsEnabled, onNotificationPermissionChange, scheduleRuntime, secondsLeft]);

  const reset = useCallback(() => {
    clearRuntime();
    setIsRunning(false);
    setSecondsLeft(defaultSeconds);
    setHasFinished(false);
    hasFinishedRef.current = false;
    void closeRestTimerNotifications();
  }, [clearRuntime, defaultSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = defaultSeconds > 0 ? 1 - secondsLeft / defaultSeconds : 1;

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

      <span className="font-medium text-text-primary flex-1 min-w-[120px]">
        {hasFinished ? 'Przerwa zakończona!' : isRunning ? 'Odpoczywaj...' : 'Timer przerwy'}
      </span>

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
