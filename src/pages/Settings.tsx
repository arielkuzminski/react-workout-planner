import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { ChevronRight, ClipboardList, Download, Dumbbell, Loader, PlayCircle, RefreshCw, Upload } from 'lucide-react';
import PwaInstallCard from '../components/PwaInstallCard';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { generateSampleData } from '../data/sampleData';
import { useWorkoutStore } from '../store';
import { useBackupStore } from '../store/backupStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { LegacyWorkoutSession, PlanId } from '../types';
import { createExportPayload, parseImportedCompletedSessions, readAutoBackupSnapshot } from '../utils/backup';
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
  const restoreFromBackup = useWorkoutStore((state) => state.restoreFromBackup);
  const backupEnabled = useBackupStore((state) => state.enabled);
  const lastBackupAt = useBackupStore((state) => state.lastBackupAt);
  const setBackupEnabled = useBackupStore((state) => state.setEnabled);
  const restTimerSeconds = usePreferencesStore((state) => state.restTimerSeconds);
  const restTimerSoundEnabled = usePreferencesStore((state) => state.restTimerSoundEnabled);
  const weightIncrementKg = usePreferencesStore((state) => state.weightIncrementKg);
  const setRestTimerSeconds = usePreferencesStore((state) => state.setRestTimerSeconds);
  const setRestTimerSoundEnabled = usePreferencesStore((state) => state.setRestTimerSoundEnabled);
  const setWeightIncrementKg = usePreferencesStore((state) => state.setWeightIncrementKg);
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
      JSON.stringify(createExportPayload(completedSessions), null, 2),
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

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      setMessage('Plik jest za duży (maks. 10 MB).');
      return;
    }

    setMessage('');

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onerror = () => {
        setMessage('Nie udało się odczytać pliku.');
      };
      reader.onload = (loadEvent) => {
        try {
          const parsed = JSON.parse(String(loadEvent.target?.result || '{}'));
          const normalizedSessions = parseImportedCompletedSessions(parsed);
          if (normalizedSessions) {
            importCompletedSessions(normalizedSessions);
          } else {
            const sessions = (Array.isArray(parsed) ? parsed : parsed.sessions || []) as LegacyWorkoutSession[];
            if (sessions.length === 0) {
              setMessage('Plik JSON nie zawiera sesji do importu.');
              return;
            }
            importCompletedSessions(sessions.map((session) => legacySessionToV2(session)));
          }

          setMessage('Zaimportowano dane z JSON.');
        } catch {
          setMessage('Błąd importu: plik JSON ma nieprawidłowy format.');
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
            const weight = Number(row.weight || 0);
            const reps = Number(row.reps || 0);
            if (weight < 0 || weight > 9999 || reps < 0 || reps > 9999) {
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
                  reps,
                });
              }
            } else {
              session.exercises.push({
                exerciseId: row.exerciseId || '',
                weight,
                sets: row.reps ? [{ setNumber: 1, reps }] : [],
              });
            }
          });

          if (sessionsMap.size === 0) {
            setMessage('Plik CSV nie zawiera prawidłowych danych.');
            return;
          }

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

  const handleRestoreFromAutoBackup = () => {
    const snapshot = readAutoBackupSnapshot();
    if (!snapshot) {
      setMessage('Brak poprawnego automatycznego backupu do odzyskania.');
      return;
    }

    restoreFromBackup(snapshot);
    if (snapshot.backupSettings) {
      setBackupEnabled(snapshot.backupSettings.enabled);
    }
    setMessage('Przywrócono dane z automatycznego backupu.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-text-primary">Konfiguracja</h2>
        <p className="mt-1 text-text-secondary">Zarządzaj planami treningowymi, danymi pomocniczymi, backupem i importem aplikacji.</p>
      </div>

      <section className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Motyw aplikacji</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Wybierz wygląd interfejsu. Ustawienie zapisuje się lokalnie na tym urządzeniu.
            </p>
          </div>
          <ThemeSwitcher />
        </div>
      </section>

      <PwaInstallCard />

      <section className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Preferencje treningu</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Ustaw domyślny czas przerwy, sygnał zakończenia timera i krok zmiany ciężaru.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-text-primary">Timer przerwy (sekundy)</span>
            <input
              type="number"
              min="5"
              max="3600"
              step="5"
              value={restTimerSeconds}
              onChange={(event) => setRestTimerSeconds(parseInt(event.target.value, 10) || 90)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-text-primary">Krok ciężaru (kg)</span>
            <input
              type="number"
              min="0.25"
              max="20"
              step="0.25"
              value={weightIncrementKg}
              onChange={(event) => setWeightIncrementKg(parseFloat(event.target.value) || 2.5)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text-primary focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary">
            <input
              type="checkbox"
              checked={restTimerSoundEnabled}
              onChange={(event) => setRestTimerSoundEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand-ring"
            />
            Włącz dźwięk timera
          </label>
        </div>
      </section>

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

      <section className="rounded-[2rem] border border-brand-border bg-brand-soft p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-brand p-3 text-text-inverted shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Biblioteka ćwiczeń</h3>
              <p className="mt-1 text-sm text-brand-text">
                Twórz, edytuj i ukrywaj ćwiczenia dostępne w planach i sesjach treningowych.
              </p>
            </div>
          </div>
          <Link
            to="/exercises"
            className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 font-semibold text-text-inverted transition-colors hover:bg-brand-hover active:bg-brand-active focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Otwórz bibliotekę
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

        <div className="rounded-[2rem] border border-border bg-surface-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Automatyczny backup lokalny</h4>
              <p className="mt-1 text-sm text-text-secondary">
                Zapisuje pełny snapshot aplikacji w tej przeglądarce po zmianach danych treningowych.
              </p>
              <p className="mt-2 text-xs text-text-tertiary">
                Zakres: aktywna sesja, historia, plany i ustawienia backupu.
              </p>
            </div>
            <label className="inline-flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary">
              <input
                type="checkbox"
                checked={backupEnabled}
                onChange={(event) => setBackupEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand-ring"
              />
              Włącz auto-backup
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              {lastBackupAt
                ? `Ostatni backup: ${new Date(lastBackupAt).toLocaleString('pl-PL')}`
                : 'Backup nie został jeszcze zapisany.'}
            </p>
            <button
              type="button"
              onClick={handleRestoreFromAutoBackup}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-surface-raised px-4 py-3 font-semibold text-text-primary transition-colors hover:bg-surface-inset active:bg-surface-inset focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <RefreshCw className="h-4 w-4" />
              Odzyskaj z backupu
            </button>
          </div>
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
