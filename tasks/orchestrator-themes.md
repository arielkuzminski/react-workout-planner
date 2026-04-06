# Orchestrator: System motywow (Themes)

## Kontekst

Silka obecnie ma jeden, hardkodowany motyw jasny. Kolory Tailwind (`bg-gray-50`, `text-blue-700`, `border-stone-200` itp.) sa wpisane bezposrednio w className ~12 plikow komponentow. Brak CSS custom properties, brak dark mode, brak mechanizmu przelaczania.

**Cel:** Wdrozyc system 3 motywow (Light, Dark, Pink) oparty na tokenach CSS Tailwind v4, z persystencja w localStorage i plynnym przelaczaniem w UI.

## Podejscie architektoniczne

Tailwind CSS v4 natywnie wspiera `@theme { --color-*: value }` — zdefiniowane tokeny automatycznie generuja klasy utility (`bg-surface`, `text-brand`, itp.). Przelaczanie motywow realizowane przez atrybut `data-theme` na `<html>`, ktory zmienia wartosci CSS custom properties. Dzieki temu **komponenty uzywaja stalych nazw klas** (np. `bg-surface-card` zamiast `bg-white`), a zmiana motywu odbywa sie wylacznie na poziomie CSS.

## Palety kolorow

### Light (domyslny — obecny wyglad)
- Powierzchnie: gray-50, white, gray-100, gray-200
- Tekst: gray-900, gray-500, gray-400, white
- Brand: blue-700/800/900, blue-50, blue-400
- Success: emerald-600/700/800, emerald-50
- Warning: amber-50, amber-200, amber-900
- Danger: rose-600, rose-50/100

### Dark
- Powierzchnie: slate-900, slate-800, slate-700, slate-600
- Tekst: slate-100, slate-400, slate-500, slate-900
- Brand: blue-500/400/300, blue-950, blue-300
- Success: emerald-500, emerald-950, emerald-300
- Warning: amber-950, amber-800, amber-300
- Danger: rose-500, rose-950, rose-400
- Scrollbar: slate-700 track, slate-500 thumb

### Pink
- Powierzchnie: pink-50, white, pink-100, pink-200
- Tekst: pink-950, pink-700, pink-500, white
- Brand: pink-600/700/800, pink-50, pink-400
- Success: emerald (bez zmian — semantyczne)
- Warning: amber (bez zmian)
- Danger: rose (bez zmian)
- Akcenty: pink-500 zamiast blue w chartach

## Plan zadan

| Task | Opis | Zalezy od | Priorytet |
|------|------|-----------|-----------|
| [TASK-014](TASK-014-css-token-architecture.md) | Tokeny CSS + @theme w index.css, usun tailwind.config.js | - | P0 |
| [TASK-015](TASK-015-theme-store.md) | Zustand theme store + persystencja | - | P0 |
| [TASK-016](TASK-016-theme-init-html.md) | Meta tag, early init w main.tsx, data-theme na html | TASK-015 | P0 |
| [TASK-017](TASK-017-theme-switcher-ui.md) | Komponent ThemeSwitcher + integracja w Layout | TASK-015 | P1 |
| [TASK-018](TASK-018-migrate-components.md) | Migracja klas kolorow we wszystkich komponentach | TASK-014 | P0 (najwyzszy) |
| [TASK-019](TASK-019-svg-chart-tokens.md) | Tokeny dla SVG hex i Recharts | TASK-014 | P1 |
| [TASK-020](TASK-020-transitions-polish.md) | Plynne przejscia + QA wizualne | TASK-014..019 | P2 |

## Kolejnosc wykonania

```
Faza 1 (rownolegle):  TASK-014 + TASK-015
Faza 2:               TASK-016
Faza 3 (rownolegle):  TASK-018 + TASK-019
Faza 4 (rownolegle):  TASK-017
Faza 5:               TASK-020 (finalizacja)
```

## Pliki do modyfikacji

| Plik | Akcja | Task |
|------|-------|------|
| `src/index.css` | Gruntowny rewrite | 014, 020 |
| `tailwind.config.js` | USUN | 014 |
| `src/store/themeStore.ts` | NOWY | 015 |
| `index.html` | Dodaj meta theme-color | 016 |
| `src/main.tsx` | Dodaj early theme init | 016 |
| `src/components/ThemeSwitcher.tsx` | NOWY | 017 |
| `src/components/Layout.tsx` | Integracja switcher + migracja | 017, 018 |
| `src/pages/Home.tsx` | Migracja kolorow | 018 |
| `src/pages/Session.tsx` | Migracja kolorow | 018 |
| `src/pages/History.tsx` | Migracja kolorow | 018 |
| `src/pages/Dashboard.tsx` | Migracja + Recharts | 018, 019 |
| `src/pages/SessionRecap.tsx` | Migracja kolorow | 018 |
| `src/pages/Import.tsx` | Migracja kolorow | 018 |
| `src/components/ExerciseLogger.tsx` | Migracja kolorow | 018 |
| `src/components/RestTimer.tsx` | Migracja + SVG hex | 018, 019 |
| `src/components/ProgressIndicator.tsx` | Migracja kolorow | 018 |

## Weryfikacja

1. `npm run dev` — sprawdz czy Vite startuje bez bledow po usunieciu tailwind.config.js
2. Przelacz motyw w UI — Light/Dark/Pink powinny dzialac plynnie
3. Odswierz strone — motyw powinien sie zachowac (localStorage)
4. Sprawdz kontrast tekstu w kazdym motywie (WCAG AA)
5. SVG RestTimer i wykresy Dashboard powinny respektowac motyw
