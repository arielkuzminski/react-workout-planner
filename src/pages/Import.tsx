import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Download, Upload } from 'lucide-react';
import { useWorkoutStore } from '../store';
import { LegacyWorkoutSession } from '../types';
import { createId, legacySessionToV2 } from '../utils/sessionUtils';

const downloadBlob = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function Import() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const importCompletedSessions = useWorkoutStore((state) => state.importCompletedSessions);
  const [message, setMessage] = useState('');

  const handleExportJson = () => {
    downloadBlob(
      `silka-export-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(
        {
          schemaVersion: 2,
          completedSessions,
        },
        null,
        2
      ),
      'application/json'
    );
    setMessage('Wyeksportowano JSON backup.');
  };

  const handleExportCsv = () => {
    const rows = completedSessions.flatMap((session) =>
      session.entries.flatMap((entry) =>
        entry.sets.map((set) => ({
          date: session.completedAt ?? session.startedAt,
          workoutType: session.templateId ?? '',
          exerciseId: entry.exerciseId,
          weight: set.weight ?? 0,
          reps: entry.exerciseType === 'time' ? set.durationSec ?? 0 : set.reps ?? 0,
        }))
      )
    );

    downloadBlob(
      `silka-export-${new Date().toISOString().slice(0, 10)}.csv`,
      Papa.unparse(rows),
      'text/csv'
    );
    setMessage('Wyeksportowano CSV backup.');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setMessage('');

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const parsed = JSON.parse(String(loadEvent.target?.result || '{}'));

          if (parsed.schemaVersion === 2 && Array.isArray(parsed.completedSessions)) {
            const valid = parsed.completedSessions.filter(
              (s: unknown) =>
                s && typeof s === 'object' &&
                'id' in s && 'startedAt' in s && 'entries' in s &&
                Array.isArray((s as { entries: unknown }).entries)
            );
            if (valid.length === 0) {
              setMessage('Plik JSON nie zawiera prawidłowych sesji.');
              return;
            }
            importCompletedSessions(valid);
          } else {
            const sessions = (Array.isArray(parsed) ? parsed : parsed.sessions || []) as LegacyWorkoutSession[];
            importCompletedSessions(sessions.map((session) => legacySessionToV2(session)));
          }

          setMessage('Zaimportowano dane z JSON.');
        } catch (error) {
          setMessage(`Błąd JSON: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const rows = results.data as Array<Record<string, string>>;
          const sessionsMap = new Map<string, LegacyWorkoutSession>();

          rows.forEach((row) => {
            if (!row.date || !row.workoutType) {
              return;
            }
            const key = `${row.date}-${row.workoutType}`;
            if (!sessionsMap.has(key)) {
              sessionsMap.set(key, {
                id: createId('legacy'),
                date: row.date,
                workoutType: row.workoutType as 'A' | 'B' | 'C',
                exercises: [],
              });
            }
            sessionsMap.get(key)?.exercises.push({
              exerciseId: row.exerciseId || '',
              weight: Number(row.weight || 0),
              sets: row.reps ? [{ setNumber: 1, reps: Number(row.reps || 0) }] : [],
            });
          });

          importCompletedSessions(
            Array.from(sessionsMap.values()).map((session) => legacySessionToV2(session))
          );
          setMessage('Zaimportowano dane z CSV.');
        },
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Backup i import</h2>
        <p className="mt-1 text-stone-500">Local-first znaczy, że backup musi być prosty i szybki.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Eksport</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white transition hover:bg-stone-700"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-200"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Import</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600"
          >
            <Upload className="h-4 w-4" />
            Wybierz plik
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="mt-3 text-sm text-stone-500">
            Obsługiwane: v2 JSON, legacy JSON, legacy CSV.
          </p>
        </div>
      </section>

      {message && (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          {message}
        </div>
      )}
    </div>
  );
}
