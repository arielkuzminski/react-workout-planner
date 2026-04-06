import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface RestTimerProps {
  defaultSeconds?: number;
}

export default function RestTimer({ defaultSeconds = 90 }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        ? 'bg-emerald-50 border border-emerald-200'
        : isRunning
          ? 'bg-blue-50 border border-blue-200'
          : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="16" fill="none"
            stroke={hasFinished ? '#10b981' : '#3b82f6'}
            strokeWidth="3"
            strokeDasharray={`${progress * 100.5} 100.5`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <span className="font-medium text-gray-700 flex-1 min-w-[120px]">
        {hasFinished ? 'Przerwa zakończona!' : isRunning ? 'Odpoczywaj...' : 'Timer przerwy'}
      </span>

      <div className="ml-auto flex gap-1">
        {!isRunning && !hasFinished && (
          <button onClick={start} className="p-2 rounded-lg hover:bg-gray-200" aria-label="Start timer">
            <Play className="w-4 h-4 text-blue-700" />
          </button>
        )}
        {isRunning && (
          <button onClick={stop} className="p-2 rounded-lg hover:bg-gray-200" aria-label="Pause timer">
            <Pause className="w-4 h-4 text-gray-700" />
          </button>
        )}
        <button onClick={reset} className="p-2 rounded-lg hover:bg-gray-200" aria-label="Reset timer">
          <RotateCcw className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
