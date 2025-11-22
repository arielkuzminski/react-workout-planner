import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { workoutPlans } from '../data/workoutPlans';
import { useWorkoutStore } from '../store';
import { WorkoutSession, SetResult } from '../types';
import ExerciseLogger from '../components/ExerciseLogger';
import ProgressIndicator from '../components/ProgressIndicator';
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function Workout() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const addSession = useWorkoutStore(state => state.addSession);

  const workoutPlan = workoutPlans.find(p => p.id === type as 'A' | 'B' | 'C');
  const [results, setResults] = useState<{ [key: string]: SetResult[] }>({});
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Inicjalizacja wag z startowych wartości
  if (Object.keys(weights).length === 0 && workoutPlan) {
    const initialWeights: { [key: string]: number } = {};
    workoutPlan.exercises.forEach(exercise => {
      initialWeights[exercise.id] = exercise.startWeight;
    });
    setWeights(initialWeights);
  }

  if (!workoutPlan) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-lg">Nieznany typ treningu: {type}</p>
      </div>
    );
  }

  const handleSetResult = (exerciseId: string, setNumber: number, reps: number) => {
    setResults(prev => {
      const currentResults = prev[exerciseId] || [];
      const updated = [...currentResults];
      updated[setNumber - 1] = { setNumber, reps };
      return { ...prev, [exerciseId]: updated };
    });
  };

  const handleWeightChange = (exerciseId: string, newWeight: number) => {
    setWeights(prev => ({ ...prev, [exerciseId]: newWeight }));
  };

  const handleSaveSession = async () => {
    setIsSaving(true);

    // Tworzenie sesji treningowej
    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      date: new Date(),
      workoutType: type as 'A' | 'B' | 'C',
      exercises: workoutPlan.exercises.map(exercise => ({
        exerciseId: exercise.id,
        weight: weights[exercise.id] || exercise.startWeight,
        sets: results[exercise.id] || [],
        notes: ''
      }))
    };

    // Zapis do store
    addSession(session);

    // Krótkie opóźnienie dla UX
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsSaving(false);

    // Powrót do strony głównej
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Trening {type}</h2>
          <p className="text-gray-600 text-sm">{workoutPlan.name}</p>
          <p className="text-gray-500 text-xs">{format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        {workoutPlan.exercises.map((exercise, index) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {index + 1}. {exercise.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {exercise.sets} serie • {exercise.repRange.min}-{exercise.repRange.max}{' '}
                  {exercise.type === 'time' ? 'sekund' : 'powtórzeń'}
                </p>
              </div>
              <div className="text-right">
                <label className="block text-xs text-gray-600 mb-1">Ciężar</label>
                <input
                  type="number"
                  step="0.5"
                  value={weights[exercise.id] || ''}
                  onChange={e => handleWeightChange(exercise.id, parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">{exercise.type === 'time' ? 's' : 'kg'}</p>
              </div>
            </div>

            {/* Series */}
            <ExerciseLogger
              exercise={exercise}
              results={results[exercise.id] || []}
              onSetResult={handleSetResult}
            />

            {/* Progression Indicator */}
            <ProgressIndicator
              exercise={exercise}
              currentWeight={weights[exercise.id] || exercise.startWeight}
              setResults={results[exercise.id] || []}
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="sticky bottom-20 md:bottom-0 bg-white p-4 rounded-lg shadow-lg">
        <button
          onClick={handleSaveSession}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Zapisywanie...' : 'Zapisz trening'}
        </button>
      </div>
    </div>
  );
}
