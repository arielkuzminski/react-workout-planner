import { useWorkoutStore } from '../store';
import { workoutPlans } from '../data/workoutPlans';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function Dashboard() {
  const sessions = useWorkoutStore(state => state.getSessions());
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Pozbierz wszystkie ćwiczenia z planu treningowego
  const allExercises = workoutPlans
    .flatMap(plan => plan.exercises)
    .reduce((acc, exercise) => {
      if (!acc.find(e => e.id === exercise.id)) {
        acc.push(exercise);
      }
      return acc;
    }, [] as typeof workoutPlans[0]['exercises']);

  // Przygotuj dane dla wykresu wybranego ćwiczenia
  const getExerciseProgressionData = (exerciseId: string) => {
    return sessions
      .filter(session => session.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(session => {
        const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
        const avgReps = exercise && exercise.sets.length > 0
          ? Math.round(exercise.sets.reduce((sum, s) => sum + s.reps, 0) / exercise.sets.length * 10) / 10
          : 0;

        return {
          date: format(new Date(session.date), 'd MMM', { locale: pl }),
          weight: exercise?.weight || 0,
          reps: avgReps,
          fullDate: new Date(session.date).getTime()
        };
      });
  };

  // Statystyki ogólne
  const totalSessions = sessions.length;
  const averageExercises = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.exercises.filter(e => e.sets.length > 0).length, 0) / sessions.length * 10) / 10
    : 0;

  // Najcięższa seria (Personal Record)
  let maxWeight = 0;
  let maxExerciseName = '';
  sessions.forEach(session => {
    session.exercises.forEach(exercise => {
      const exerciseInfo = allExercises.find(e => e.id === exercise.exerciseId);
      if (exercise.weight > maxWeight) {
        maxWeight = exercise.weight;
        maxExerciseName = exerciseInfo?.name || '';
      }
    });
  });

  const selectedExerciseData = selectedExercise ? getExerciseProgressionData(selectedExercise) : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dyaszboard Progresu</h2>
        <p className="text-gray-600">Analiza twoich postępów treningowych</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Razem sesji</p>
          <p className="text-3xl font-bold text-blue-600">{totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Średnia ćwiczeń na sesję</p>
          <p className="text-3xl font-bold text-green-600">{averageExercises}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Osobisty rekord (kg)</p>
          <div>
            <p className="text-3xl font-bold text-purple-600">{maxWeight}</p>
            <p className="text-xs text-gray-600 mt-2 truncate">{maxExerciseName}</p>
          </div>
        </div>
      </div>

      {/* Exercise Selection */}
      {allExercises.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Wybierz ćwiczenie do analizy</h3>
          <select
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Wybierz ćwiczenie --</option>
            {allExercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Charts */}
      {selectedExercise && selectedExerciseData.length > 0 && (
        <div className="space-y-6">
          {/* Weight Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Progres Ciężaru</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedExerciseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="Ciężar (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Reps Average */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Średnia Powtórzeń</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selectedExerciseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="reps"
                  fill="#10b981"
                  name="Średnia powtórzeń"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedExercise && selectedExerciseData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Brak danych dla wybranego ćwiczenia</p>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">Zaloguj kilka treningów aby zobaczyć wykresy</p>
        </div>
      )}
    </div>
  );
}
