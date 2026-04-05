# Silka v2 -- Raport z przeglądu kodu

**Data:** 2026-04-05
**Zakres:** Cały refaktor v2 (19 zmienionych plików, ~2400 linii diff)

## 1. Podsumowanie

Silka v2 to stosunkowo dobrze zorganizowana aplikacja typu workout tracker, oparta na solidnym stosie (Vite + React + TypeScript + Zustand + Tailwind). Architektura jest czytelna, typy są dobrze zdefiniowane, a store Zustand pokrywa cały CRUD sesji treningowych. Główne problemy to: zduplikowane pliki stanowiące 100% martwego kodu (`SelectWorkout.tsx` i `Workout.tsx` to aliasy), wywoływanie metod store'a wewnątrz renderowania (grozi nieskończoną pętlą), brak walidacji danych importowych (potencjalne ryzyko crash), oraz niespójność stylistyczna między stronami (mieszanie `gray-*` i `stone-*` kolorów Tailwind).

## 2. Krytyczne problemy

### 2.1 Wywołanie `getLastCompletedEntry` i `getExerciseDefinition` w pętli renderowania
- **Plik:** `src/pages/Session.tsx:120,154`
- Metody pobierane ze store'a są wołane bezpośrednio w ciele renderowania wewnątrz `map()`. Przy złożonych interakcjach może to prowadzić do nadmiarowych re-renderów.
- **Rekomendacja:** Przenieść logikę do `useMemo` lub dedykowanych selektorów.

### 2.2 Brak walidacji importowanego JSON -- crash przy nieprawidłowych danych
- **Plik:** `src/pages/Import.tsx:73-79`
- `JSON.parse` jest w try/catch, ale wynik trafia bezpośrednio do `importCompletedSessions` bez walidacji schematu. Zepsuty JSON z poprawnymi kluczami ale błędnym typem danych spowoduje crash.
- **Rekomendacja:** Dodać walidację schematu (np. Zod) przed importem.

### 2.3 `endedAt` nie jest ustawiane w `completeActiveSession`
- **Plik:** `src/store/index.ts:100-105`
- Przy zamykaniu sesji ustawiane jest `completedAt`, ale NIE `endedAt`. Tymczasem `src/pages/History.tsx:38` używa `session.endedAt || session.startedAt` -- data zakończenia będzie pokazywana jako data rozpoczęcia.
- **Rekomendacja:** Dodać `endedAt: new Date().toISOString()` w `completeActiveSession`.

### 2.4 `handleStart` nadpisuje aktywną sesję bez potwierdzenia
- **Plik:** `src/pages/Home.tsx:31-34`
- Kliknięcie "Zacznij nową sesję" bezwarunkowo nadpisuje `activeSession`. Użytkownik traci niezakończoną sesję bez ostrzeżenia.
- **Rekomendacja:** Dodać dialog potwierdzenia gdy `activeSession !== null`.

## 3. Ważne problemy

### 3.1 Duplikacja logiki `recentExercises`
- **Pliki:** `src/store/index.ts:257-276` vs `src/pages/Home.tsx:13-26`
- Store definiuje `getRecentExercises`, ale `Home.tsx` reimplementuje identyczną logikę w `useMemo`. Zmiana algorytmu wymaga aktualizacji w dwóch miejscach.

### 3.2 `normalizePersistedSessions` -- niebezpieczne castowanie
- **Plik:** `src/utils/sessionUtils.ts:188-211`
- `session as WorkoutSession` i `session as LegacyWorkoutSession` bez rzeczywistej walidacji. Uszkodzone dane w localStorage mogą crashować aplikację.

### 3.3 Hardcoded tekst "plank" dla ćwiczeń czasowych
- **Plik:** `src/components/ExerciseLogger.tsx:43-44`
- Dla każdego ćwiczenia typu `time` wyświetla się "plank". Przy nowych ćwiczeniach czasowych będzie to błędne.

### 3.4 Brak obsługi błędów w CSV parse
- **Plik:** `src/pages/Import.tsx:89-121`
- `Papa.parse` callback nie sprawdza `results.errors`. Błędny CSV zostanie cicho zaimportowany z częściowymi danymi.

### 3.5 `label` bez `htmlFor` / `id` na select
- **Plik:** `src/pages/Dashboard.tsx:83-84`
- Naruszona dostępność -- screen reader nie połączy etykiety z kontrolką.

### 3.6 Brak potwierdzenia przy usuwaniu sesji
- **Plik:** `src/pages/History.tsx:51`
- Kliknięcie kosza natychmiast usuwa sesję bez potwierdzenia.

### 3.7 Duplikacja kodu migracji legacy sesji
- **Pliki:** `src/data/workoutPlans.ts:78-122` (`migrateLegacySession`) vs `src/utils/sessionUtils.ts:125-181` (`legacySessionToV2`)
- Dwie niemal identyczne funkcje. `migrateLegacySession` w `workoutPlans.ts` nie jest nigdzie importowana.

## 4. Drobne uwagi

| Problem | Lokalizacja |
|---------|-------------|
| Niespójność kolorów Tailwind (`gray-*` vs `stone-*`) | Home.tsx, Session.tsx vs History.tsx, Dashboard.tsx |
| Niespójność border-radius (`rounded-2xl` vs `rounded-[2rem]`) | j.w. |
| Sztuczny delay 500ms w `handleLoadSample` | `src/pages/Home.tsx:38` |
| Aliasy typów bez wartości dodanej (`ExerciseLibraryItem`, `SetEntry`, `Session`) | `src/types/index.ts:22,40,66` |
| Brak 404/catch-all route | `src/App.tsx` |
| Brak `aria-label` na inputach numerycznych | `src/components/ExerciseLogger.tsx:23-39` |
| `downloadBlob` -- brak `appendChild` przed `click()` (problem w Safari) | `src/pages/Import.tsx:8-16` |

## 5. Martwy kod

| Plik | Opis |
|------|------|
| `src/pages/SelectWorkout.tsx` | Re-eksportuje `Home` -- nie jest importowany, brak route |
| `src/pages/Workout.tsx` | Re-eksportuje `Session` -- nie jest importowany, brak route |
| `src/data/workoutPlans.ts:78-122` | `migrateLegacySession` -- duplikuje `legacySessionToV2`, nie jest importowana |
| `src/utils/id.ts` | Re-eksportuje `createId` z `sessionUtils`, nieużywany |
| `src/types/index.ts:22` | `ExerciseLibraryItem` -- alias nieużywany |
| `src/types/index.ts:40` | `SetEntry` -- alias nieużywany |
| `src/types/index.ts:77-84` | `ExercisePerformanceSummary` -- interfejs nieużywany |
| `src/types/index.ts:86-90` | `ExerciseHistoryPoint` -- interfejs nieużywany |
| `src/store/index.ts:252-253` | `getCompletedSessions` -- redundantna metoda |
| `src/store/index.ts:257-276` | `getRecentExercises` -- nieużywana (Home.tsx reimplementuje) |

## 6. Architektura

**Mocne strony:**
- Jasny podział na warstwy: typy, utils, data, store, komponenty, strony
- Zustand z `persist` middleware -- stan przetrwa odświeżenie przeglądarki
- Immutable updates w store -- każdy `set()` tworzy nowe obiekty
- Migracja legacy danych dobrze przemyślana
- Selektory Zustand są atomowe -- minimalizuje re-rendery

**Słabe strony:**
- Mieszanie "getterów" (metod zwracających wartość) z akcjami w jednym interfejsie store'a. Gettery jak `getExerciseDefinition`, `getLastCompletedEntry` powinny być osobnymi selektorami/hookami
- Brak warstwy walidacji danych wejściowych (import JSON/CSV)
- `workoutPlans.ts` pełni podwójną rolę -- deklaracja danych + logika tworzenia sesji
- Brak 404 route
- `sampleData.ts` importuje `createId` z `sessionUtils` -- architektonicznie wątpliwa zależność data -> utils

## 7. Rekomendacje (priorytet malejący)

1. **Naprawić `endedAt` w `completeActiveSession`** (`src/store/index.ts:100-105`) -- jednolinijkowa poprawka z natychmiastowym efektem na wyświetlanie dat w historii.

2. **Dodać walidację danych przy imporcie** (`src/pages/Import.tsx`) -- zaimportowanie zepsutego JSON crashuje aplikację. Minimalne podejście: sprawdzić że `completedSessions` jest tablicą obiektów z wymaganymi polami.

3. **Wynieść gettery ze store'a do selektorów/hooków** -- `getExerciseDefinition`, `getLastCompletedEntry`, `getRecentExercises` powinny być custom hookami. Eliminuje ryzyko nieskończonej pętli i jest idiomatyczne dla Zustand.

4. **Usunąć martwy kod** -- `SelectWorkout.tsx`, `Workout.tsx`, `migrateLegacySession` w `workoutPlans.ts`, nieużywane typy, `id.ts`.

5. **Ujednolicić styl wizualny** -- wybrać jedną paletę kolorów (`gray-*` albo `stone-*`) i jeden system zaokrągleń.
