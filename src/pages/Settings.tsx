import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { ChevronRight, ClipboardList, Download, Loader, PlayCircle, Upload } from 'lucide-react';
import { generateSampleData } from '../data/sampleData';
import { useWorkoutStore } from '../store';
import { LegacyWorkoutSession, PlanId } from '../types';
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

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const importCompletedSessions = useWorkoutStore((state) => state.importCompletedSessions);
  const [message, setMessage] = useState('');
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleLoadSample = async () => {
    setMessage('');
    setIsLoadingSample(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    importCompletedSessions(generateSampleData());
    setIsLoadingSample(false);
    setMessage('Załadowano przykładowe sesje.');
  };

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
          workoutType: session.planId ?? '',
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
                workoutType: row.workoutType as PlanId,
                exercises: [],
              });
            }
            const session = sessionsMap.get(key)!;
            const existingExercise = session.exercises.find((e) => e.exerciseId === row.exerciseId);
            if (existingExercise) {
              if (row.reps) {
                existingExercise.sets.push({
                  setNumber: existingExercise.sets.length + 1,
                  reps: Number(row.reps || 0),
                });
              }
            } else {
              session.exercises.push({
                exerciseId: row.exerciseId || '',
                weight: Number(row.weight || 0),
                sets: row.reps ? [{ setNumber: 1, reps: Number(row.reps || 0) }] : [],
              });
            }
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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-text-primary">Konfiguracja</h2>
        <p className="mt-1 text-text-secondary">Zarządzaj planami treningowymi, danymi pomocniczymi, backupem i importem aplikacji.</p>
      </div>

      <section className="rounded-[2rem] border border-brand-border bg-brand-soft p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-brand p-3 text-text-inverted shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Plany treningowe</h3>
              <p className="mt-1 text-sm text-brand-text">
                Twórz własne splity, zapisuj aktywną sesję jako plan i ustawiaj, które plany mają być aktywne.
              </p>
            </div>
          </div>
          <Link
            to="/plans"
            className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 font-semibold text-text-inverted transition-colors hover:bg-brand-hover active:bg-brand-active focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Otwórz plany
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-success-border bg-success-soft p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-success-text">Dane przykładowe</h3>
            <p className="mt-1 text-sm text-success-text">
              Załaduj przykładowe sesje, jeśli chcesz szybko zobaczyć historię i progres bez ręcznego logowania.
            </p>
          </div>
          <button
            onClick={handleLoadSample}
            disabled={isLoadingSample}
            className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-success px-4 py-3 font-semibold text-text-inverted transition-colors hover:bg-success-hover active:bg-success-active disabled:cursor-not-allowed disabled:bg-success-border focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {isLoadingSample ? <Loader className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            {isLoadingSample ? 'Ładowanie...' : 'Załaduj przykładowe sesje'}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-text-primary">Backup i import</h3>
          <p className="mt-1 text-text-secondary">Local-first znaczy, że backup musi być prosty i szybki.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-text-primary">Eksport</h4>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={handleExportJson}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-btn-dark px-4 py-3 font-semibold text-text-inverted transition-colors hover:bg-btn-dark-hover active:bg-btn-dark-active focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
              <button
                onClick={handleExportCsv}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-surface-raised px-4 py-3 font-semibold text-text-primary transition-colors hover:bg-surface-inset active:bg-surface-inset focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-text-primary">Import</h4>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-success px-4 py-3 font-semibold text-text-inverted transition-colors hover:bg-success-hover active:bg-success-active focus-visible:ring-2 focus-visible:ring-success-ring focus-visible:ring-offset-2 focus-visible:outline-none"
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
            <p className="mt-3 text-sm text-text-secondary">
              Obsługiwane: v2 JSON, legacy JSON, legacy CSV.
            </p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-[2rem] border border-success-border bg-success-soft px-4 py-4 text-sm font-medium text-success-text break-words sm:px-5">
          {message}
        </div>
      )}
    </div>
  );
}
