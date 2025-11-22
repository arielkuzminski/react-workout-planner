import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Loader } from 'lucide-react';
import { useWorkoutStore } from '../store';
import { generateSampleData } from '../data/sampleData';
import { useState } from 'react';

export default function SelectWorkout() {
  const addSession = useWorkoutStore(state => state.addSession);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleLoadSampleData = async () => {
    setIsLoadingSample(true);
    // Symulacja ładowania
    await new Promise(resolve => setTimeout(resolve, 1000));

    const sampleData = generateSampleData();
    sampleData.forEach(session => addSession(session));

    setIsLoadingSample(false);
    alert(`✅ Załadowano ${sampleData.length} przykładowych sesji treningowych!`);
  };
  const workouts = [
    {
      id: 'A',
      name: 'Trening A',
      description: 'Siła + Klatka/Plecy',
      color: 'bg-blue-500'
    },
    {
      id: 'B',
      name: 'Trening B',
      description: 'Nogi + Plecy + Ramiona',
      color: 'bg-green-500'
    },
    {
      id: 'C',
      name: 'Trening C',
      description: 'Klatka + Siła Całościowa',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Wybierz swój trening</h2>
        <p className="text-gray-600">Przygotuj się na sesję i zaloguj swoje wyniki</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workouts.map(workout => (
          <Link
            key={workout.id}
            to={`/workout/${workout.id}`}
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className={`${workout.color} h-32 flex items-center justify-center relative`}>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              <Zap className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="bg-white p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{workout.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{workout.description}</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                <span>Rozpocznij</span>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Jak to działa?</h3>
        <ul className="text-blue-800 space-y-2 text-sm">
          <li>• Wybierz trening A, B lub C</li>
          <li>• Wpisz liczbę powtórzeń (lub czas dla planka)</li>
          <li>• Aplikacja automatycznie zasugeruje progresję</li>
          <li>• Twoje dane zapisują się w localStorage</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleLoadSampleData}
          disabled={isLoadingSample}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isLoadingSample ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Ładowanie...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Załaduj dane przykładowe
            </>
          )}
        </button>
      </div>
    </div>
  );
}
