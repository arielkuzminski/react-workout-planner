# Post-first-test UX fixes

**Data:** 2026-04-09
**Kontekst:** Pierwsza sesja testowa aplikacji na prawdziwym treningu. Trzy rzeczy do poprawy zgłoszone przez użytkownika i jego dziewczynę.

---

## 1. Zapisz sesję freestyle jako plan treningowy

**Problem:** Po ukończonej sesji freestyle (bez wybranego planu) nie da się jej zapisać jako własnego planu do powtórzenia.

**Rozwiązanie:** Na karcie sesji w `/history`, dla sesji bez `planId`, dodać przycisk "Zapisz jako plan" (ikonka obok kosza). Po kliknięciu — modal z polem nazwy i opcjonalnym opisem, po zatwierdzeniu tworzy custom plan.

**Co reużywamy (nic nowego nie piszemy):**
- `useWorkoutStore().createCustomPlan(name, description, exerciseIds)` — `src/store/index.ts:193-207`. Już waliduje istnienie ćwiczeń, tworzy rekord przez `createCustomPlanRecord`, pushuje do `plans`.
- Wzorzec modalu: sprawdzić `src/pages/Templates.tsx` (używa `saveActiveSessionAsPlan`) lub `AppDialog` z `ActiveTrainingView.tsx:266`.

**Pliki:**
- `src/pages/History.tsx` — dodać przycisk (warunkowany `!session.planId`), handler, modal z lokalnym stanem (`savingSessionId`, `planName`, `planDescription`).

**Extraction exerciseIds z sesji:**
```ts
const exerciseIds = Array.from(new Set(session.entries.map((e) => e.exerciseId)));
```

**Domyślna nazwa planu:** `Freestyle session — {data sesji}`.

**Edge cases:**
- Pusta sesja → przycisk disabled.
- Wszystkie ćwiczenia z sesji usunięte z biblioteki → `createCustomPlan` zwróci `null`, pokazać błąd.
- Pusta nazwa → walidacja w store już blokuje.

**Acceptance:**
- [ ] Przycisk "Zapisz jako plan" widoczny tylko przy sesjach freestyle (bez `planId`).
- [ ] Modal pozwala wprowadzić nazwę + opcjonalny opis.
- [ ] Po zapisie nowy custom plan pojawia się w `/plans` z właściwymi ćwiczeniami.
- [ ] Sesja w historii pozostaje nietknięta.

---

## 2. Panel akcji na dole ActiveTrainingView

**Problem:** Przyciski Zakończ/Porzuć/Dodaj ćwiczenie są u góry widoku. Podczas treningu user scrolluje w dół przez listę ćwiczeń, a gdy chce użyć tych akcji — musi scrollować z powrotem w górę. Zły UX.

**Rozwiązanie:** Nagłówek "Aktywna sesja" + opis zostają u góry. Przyciski Porzuć/Zakończ + ExercisePicker trafiają pod listę ćwiczeń, nad sticky RestTimer.

**Docelowa struktura `src/components/ActiveTrainingView.tsx` (return):**
```
<div space-y-6>
  <section>         ← nagłówek + opis (tylko)
  <section>         ← lista ćwiczeń (bez zmian)
  <section>         ← NOWA pozycja: Porzuć/Zakończ + ExercisePicker
  <div sticky>      ← RestTimer (bez zmian)
</div>
```

**Pliki:**
- `src/components/ActiveTrainingView.tsx` — tylko reorganizacja JSX w `return` (linie 162-264). Brak zmian w handlerach ani stanie. Handler `setShowAbandonDialog`, `handleComplete`, `availableExercises`, `selectedExerciseIds`, `handleAddExercises` — wszystkie bez zmian.

**Uwagi:**
- `flex-col-reverse gap-3 sm:flex-row` — responsywny układ przycisków zachowany.
- Sticky offset RestTimera (`bottom-[4.75rem] md:bottom-4`) pozostaje bez zmian — RestTimer nadal jest ostatnim elementem w DOM.
- `AppDialog` dla "Porzuć sesję" pozostaje bez zmian.

**Acceptance:**
- [ ] Nagłówek "Aktywna sesja" + opis u góry.
- [ ] Pod listą ćwiczeń widać Porzuć/Zakończ + ExercisePicker.
- [ ] RestTimer nadal sticky na dole, nie zachodzi na bottom nav.
- [ ] Mobile layout działa (DevTools emulation).

---

## 3. RestTimer traci stan przy zmianie widoku

**Problem:** Uruchamiam timer → przechodzę na `/settings` → wracam → timer zresetowany do wartości domyślnej. Błąd.

**Root cause:**
- `RestTimer.tsx:45-53` trzyma cały stan w lokalnym `useState` i `useRef` (`secondsLeft`, `isRunning`, `hasFinished`, `endTimeRef`, `pushRunIdRef`).
- `ActiveTrainingView` jest dzieckiem `<Outlet>` — nawigacja do `/settings` odmontowuje cały komponent, RestTimer znika z DOM, stan ginie.
- Unmount cleanup w `RestTimer.tsx:176-180` dodatkowo anuluje scheduled push notification — więc nawet push server-side nie przeżywa.

**Rozwiązanie:** Nowy Zustand store z `persist` dla stanu runtime timera. Przeżywa zmianę karty ORAZ reload strony.

### A) Nowy plik: `src/store/restTimerStore.ts`

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type RestTimerStatus = 'idle' | 'running' | 'paused' | 'finished';

interface RestTimerState {
  status: RestTimerStatus;
  endTimeMs: number | null;          // absolute timestamp when running
  pausedRemainingSec: number | null; // seconds remaining when paused
  configuredSeconds: number;
  pushRunId: string | null;
  startTimer: (configuredSeconds: number, pushRunId: string | null) => void;
  pauseTimer: (remainingSec: number) => void;
  resumeTimer: (remainingSec: number, pushRunId: string | null) => void;
  finishTimer: () => void;
  resetTimer: (defaultSeconds: number) => void;
  setPushRunId: (runId: string | null) => void;
}

export const useRestTimerStore = create<RestTimerState>()(
  persist(
    (set) => ({
      status: 'idle',
      endTimeMs: null,
      pausedRemainingSec: null,
      configuredSeconds: 90,
      pushRunId: null,
      startTimer: (configuredSeconds, pushRunId) =>
        set({
          status: 'running',
          endTimeMs: Date.now() + configuredSeconds * 1000,
          pausedRemainingSec: null,
          configuredSeconds,
          pushRunId,
        }),
      pauseTimer: (remainingSec) =>
        set({ status: 'paused', endTimeMs: null, pausedRemainingSec: remainingSec, pushRunId: null }),
      resumeTimer: (remainingSec, pushRunId) =>
        set({
          status: 'running',
          endTimeMs: Date.now() + remainingSec * 1000,
          pausedRemainingSec: null,
          pushRunId,
        }),
      finishTimer: () =>
        set({ status: 'finished', endTimeMs: null, pausedRemainingSec: null, pushRunId: null }),
      resetTimer: (defaultSeconds) =>
        set({
          status: 'idle',
          endTimeMs: null,
          pausedRemainingSec: null,
          configuredSeconds: defaultSeconds,
          pushRunId: null,
        }),
      setPushRunId: (runId) => set({ pushRunId: runId }),
    }),
    {
      name: 'silka-rest-timer',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
```

### B) Przebudowa `src/components/RestTimer.tsx`

1. **Na mount:** czytać `status`, `endTimeMs`, `pausedRemainingSec` ze store.
   - Jeśli `status === 'running'` i `endTimeMs > Date.now()` → obliczyć remaining, restartować runtime (interval + finishTimeout) z tą wartością, `setIsRunning(true)`.
   - Jeśli `status === 'running'` i `endTimeMs <= Date.now()` → stan `finished` bez ponownego sound/vibration (user już dostał push gdy był nieobecny).
   - Jeśli `status === 'paused'` → `setSecondsLeft(pausedRemainingSec)`, bez startu runtime.
   - Jeśli `status === 'idle'` lub `finished` → zachowanie jak dotąd.

2. **`start()`:** po `scheduleRuntime(secondsLeft)` → wywołać `useRestTimerStore.getState().startTimer(secondsLeft, null)`. Po otrzymaniu `scheduleResult.runId` → `setPushRunId(runId)` w store (oraz zachować lokalny ref dla zgodności).

3. **`stop()` (pause):** wywołać `pauseTimer(remainingSec)` w store.

4. **`finish()`:** wywołać `finishTimer()` w store.

5. **`reset()`:** wywołać `resetTimer(defaultSeconds)` w store.

6. **Unmount cleanup (linie 176-180):** **USUNĄĆ** `cancelScheduledPush()` i `closeRestTimerNotifications()`. Zostawić tylko `clearRuntime()`. Push notification MA przeżyć unmount — to feature, nie bug. Właśnie po to schedulujemy push server-side, żeby user dostał alert nawet gdy nawigował na inną kartę.

7. **`useEffect` resetujący stan na zmianę `defaultSeconds` (linie 129-137):** nie nadpisywać stanu jeśli `status !== 'idle'`. Podczas biegu timera zmiana prefa w Settings nie powinna go przerywać.

8. **`pushRunIdRef`:** pozostawić jako optymalizację lokalną, ale źródłem prawdy jest store. Synchronizować w `setPushRunId`.

### Pliki:
- **NOWY:** `src/store/restTimerStore.ts`
- `src/components/RestTimer.tsx` — przebudowa state management, JSX bez zmian
- `src/components/ActiveTrainingView.tsx` — bez zmian (propsy RestTimera identyczne)

### Edge cases:
- Timer skończył się w tle → mount z `endTimeMs <= Date.now()` → `finished` bez re-alertu.
- F5 podczas biegu → persist w localStorage → po reload kontynuuje.
- F5 po skończeniu w tle → stan `finished` zachowany.
- User wciśnie "Reset" po nawigacji → `pushRunId` ze store pozwala anulować server push.
- Zmiana `defaultSeconds` w Settings podczas biegu → `configuredSeconds` nie nadpisywane.

**Acceptance:**
- [ ] Start timer → nawigacja `/settings` → powrót → timer kontynuuje z właściwym czasem.
- [ ] Start → pause → nawigacja → powrót → stan paused zachowany.
- [ ] Start → F5 reload → timer kontynuuje.
- [ ] Start → nawigacja → poczekaj aż minie czas → powrót → stan "Przerwa zakończona".
- [ ] Push notification fire'uje mimo nawigacji.
- [ ] Reset po nawigacji prawidłowo anuluje server push.

---

## Kolejność implementacji (od najbezpieczniejszego)

1. **#2** — reorganizacja JSX, zero logiki, najłatwiej zweryfikować.
2. **#1** — History + modal + wywołanie istniejącej akcji store.
3. **#3** — nowy store + przebudowa RestTimer, najwięcej edge cases.

## Weryfikacja (end-to-end, `npm run dev`)

Szczegóły w sekcjach Acceptance każdego feature'a. Smoke test: pełny cykl sesji freestyle → zakończenie → zapis jako plan → uruchomienie nowego planu → timer przetrwa nawigację i reload.

**Nie uruchamiać `tsc`/`npm run build`** po edycji — per trwała preferencja użytkownika.
