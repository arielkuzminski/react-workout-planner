import { useWorkoutStore } from '../store';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { workoutPlans } from '../data/workoutPlans';

export default function History() {
  const sessions = useWorkoutStore(state => state.getSessions());
  const deleteSession = useWorkoutStore(state => state.deleteSession);

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">Brak historii treningów</p>
        <p className="text-gray-500">Zaloguj pierwszy trening aby zobaczyć historię</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Historia Treningów</h2>
        <p className="text-gray-600">Razem: {sortedSessions.length} sesji</p>
      </div>

      <div className="space-y-4">
        {sortedSessions.map(session => {
          const workoutPlan = workoutPlans.find(p => p.id === session.workoutType);
          const completedExercises = session.exercises.filter(e => e.sets.length > 0).length;
          const totalExercises = workoutPlan?.exercises.length || 0;

          return (
            <div key={session.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Trening {session.workoutType}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(session.date), 'd MMMM yyyy HH:mm', { locale: pl })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {completedExercises}/{totalExercises}
                    </p>
                    <p className="text-xs text-gray-600">ćwiczeń</p>
                  </div>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Exercises Summary */}
              <div className="space-y-2 text-sm">
                {session.exercises.map(exercise => {
                  const exerciseInfo = workoutPlan?.exercises.find(e => e.id === exercise.exerciseId);
                  const avgReps =
                    exercise.sets.length > 0
                      ? Math.round(exercise.sets.reduce((sum, s) => sum + s.reps, 0) / exercise.sets.length)
                      : 0;

                  return (
                    <div key={exercise.exerciseId} className="flex justify-between text-gray-700">
                      <span className="font-medium">
                        {exerciseInfo?.name || `Ćwiczenie ${exercise.exerciseId}`}
                      </span>
                      <span className="text-gray-600">
                        {exercise.weight}{exercise.weight === 0 ? 's' : ' kg'} • {avgReps}{exercise.weight === 0 ? 's' : ' r'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
