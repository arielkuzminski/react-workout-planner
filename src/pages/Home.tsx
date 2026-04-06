import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { useWorkoutStore } from '../store';
import { PlanId } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const plans = useWorkoutStore((state) => state.plans);
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const exerciseLibrary = useWorkoutStore((state) => state.exerciseLibrary);
  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );
  const recentExercises = useMemo(() => {
    const ids = new Set<string>();
    const recent: typeof exerciseLibrary = [];
    for (const session of completedSessions) {
      for (const entry of session.entries) {
        if (!ids.has(entry.exerciseId)) {
          ids.add(entry.exerciseId);
          const def = exerciseLibrary.find((e) => e.id === entry.exerciseId);
          if (def) recent.push(def);
        }
      }
    }
    return recent.slice(0, 6);
  }, [completedSessions, exerciseLibrary]);
  const startSession = useWorkoutStore((state) => state.startSession);

  const suggestedPlanId = useMemo(() => {
    const rotation = activePlans.map((plan) => plan.id);
    const lastPlannedSession = completedSessions.find((s) => s.planId);
    if (!lastPlannedSession?.planId || rotation.length === 0) return activePlans[0]?.id ?? 'A';
    const lastIndex = rotation.indexOf(lastPlannedSession.planId);
    return rotation[(lastIndex + 1) % rotation.length] ?? rotation[0];
  }, [activePlans, completedSessions]);

  const handleStart = (planId?: PlanId) => {
    if (activeSession && !window.confirm('Masz aktywną sesję. Rozpocząć nową? Obecna zostanie utracona.')) {
      return;
    }
    startSession(planId);
    navigate('/session');
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Loguj trening szybciej niż wiadomość do siebie</h2>
          <p className="text-gray-600 mt-2">
            Startuj pustą sesję albo użyj gotowych planów treningowych. Draft zapisuje się automatycznie.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleStart()}
            className="px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Zacznij nową sesję
          </button>
          {activeSession && (
            <button
              onClick={() => navigate('/session')}
              className="px-5 py-3 rounded-xl bg-gray-900 hover:bg-black active:bg-gray-800 text-white font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <RotateCcw className="w-4 h-4" />
              Wróć do aktywnej sesji
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activePlans.map((plan) => {
          const isSuggested = plan.id === suggestedPlanId;
          return (
            <button
              key={plan.id}
              onClick={() => handleStart(plan.id)}
              className={`rounded-2xl border shadow-sm p-5 text-left transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none ${
                isSuggested
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 hover:border-blue-500 hover:shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-blue-700">
                  {plan.source === 'system' ? 'Plan systemowy' : 'Twój plan'}
                </p>
                {isSuggested && (
                  <span className="text-xs font-medium bg-blue-700 text-white px-2 py-0.5 rounded-full">
                    Następny
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-1 break-words">{plan.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{plan.description || 'Brak opisu'}</p>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ostatnio używane ćwiczenia</h3>
          {recentExercises.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentExercises.map((exercise) => (
                <span
                  key={exercise.id}
                  className="px-3 py-2 rounded-full bg-gray-100 text-sm text-gray-700"
                >
                  {exercise.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Brak historii. Załaduj przykładowe sesje w Konfiguracji albo zaloguj pierwszą sesję.</p>
          )}
        </div>
      </section>
    </div>
  );
}
