import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface RestTimerProps {
  defaultSeconds?: number;
}

export default function RestTimer({ defaultSeconds = 90 }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (secondsLeft <= 0) return;
    setHasFinished(false);
    setIsRunning(true);
  }, [secondsLeft]);

  const reset = useCallback(() => {
    stop();
    setSecondsLeft(defaultSeconds);
    setHasFinished(false);
  }, [stop, defaultSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stop();
          setHasFinished(true);
          try { navigator.vibrate?.([200, 100, 200, 100, 200]); } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, stop]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / defaultSeconds;

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
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
          <button onClick={start} className="p-2 rounded-lg hover:bg-surface-inset" aria-label="Start timer">
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
