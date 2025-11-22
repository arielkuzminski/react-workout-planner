import { useRef, useState } from 'react';
import { useWorkoutStore } from '../store';
import { WorkoutSession } from '../types';
import Papa from 'papaparse';
import { Upload, Check, AlertCircle } from 'lucide-react';

interface ImportedSession {
  id: string;
  date: Date;
  workoutType: 'A' | 'B' | 'C';
  exercises: any[];
}

export default function Import() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addSession = useWorkoutStore(state => state.addSession);
  const [importedData, setImportedData] = useState<ImportedSession[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setImportedData([]);

    const fileType = file.name.endsWith('.json') ? 'json' : 'csv';

    if (fileType === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const sessions = Array.isArray(json) ? json : json.sessions || [];
          setImportedData(
            sessions.map((s: any) => ({
              ...s,
              date: new Date(s.date)
            }))
          );
        } catch (err) {
          setError('Błąd parsowania JSON: ' + (err instanceof Error ? err.message : 'Nieznany błąd'));
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          try {
            const sessions = results.data
              .filter((row: any) => row.date && row.workoutType)
              .map((row: any) => ({
                id: `imported_${Date.now()}_${Math.random()}`,
                date: new Date(row.date),
                workoutType: row.workoutType as 'A' | 'B' | 'C',
                exercises: [
                  {
                    exerciseId: row.exerciseId || '',
                    weight: parseFloat(row.weight) || 0,
                    sets: row.reps ? [{ setNumber: 1, reps: parseInt(row.reps) }] : []
                  }
                ]
              })) as ImportedSession[];

            setImportedData(sessions);
          } catch (err) {
            setError('Błąd parsowania CSV: ' + (err instanceof Error ? err.message : 'Nieznany błąd'));
          }
        },
        error: (err) => {
          setError('Błąd odczytu pliku: ' + err.message);
        }
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (importedData.length === 0) {
      setError('Brak danych do importu');
      return;
    }

    try {
      importedData.forEach(session => {
        addSession(session as WorkoutSession);
      });
      setSuccess(`✅ Zaimportowano ${importedData.length} sesji!`);
      setImportedData([]);
    } catch (err) {
      setError('Błąd importu: ' + (err instanceof Error ? err.message : 'Nieznany błąd'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Import Danych</h2>
        <p className="text-gray-600">Importuj historię treningów z CSV lub JSON</p>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-lg font-semibold text-gray-700 mb-1">Przeciągnij plik tutaj</p>
        <p className="text-sm text-gray-600">lub kliknij aby wybrać (CSV lub JSON)</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Preview */}
      {importedData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Podgląd ({importedData.length} sesji)
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {importedData.slice(0, 10).map((session, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded">
                <span>{new Date(session.date).toLocaleDateString('pl-PL')}</span>
                <span>Trening {session.workoutType}</span>
                <span>{session.exercises.length} ćwiczeń</span>
              </div>
            ))}
            {importedData.length > 10 && (
              <p className="text-sm text-gray-600 text-center py-2">
                ... i {importedData.length - 10} więcej
              </p>
            )}
          </div>

          <button
            onClick={handleImport}
            className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Importuj dane
          </button>
        </div>
      )}

      {/* Sample Data */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Format CSV:</h3>
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto text-gray-700 mb-4">
{`date,workoutType,exerciseId,weight,reps
2024-01-01,A,A1,30,10
2024-01-01,A,A2,45,12
2024-01-03,B,B1,50,10`}
        </pre>

        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Format JSON:</h3>
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto text-gray-700">
{`[
  {
    "date": "2024-01-01",
    "workoutType": "A",
    "exercises": [
      {
        "exerciseId": "A1",
        "weight": 30,
        "sets": [{"setNumber": 1, "reps": 10}]
      }
    ]
  }
]`}
        </pre>
      </div>
    </div>
  );
}
