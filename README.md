# Silka

Silka to local-first dziennik treningowy zbudowany w React + TypeScript. Aplikacja zapisuje dane wyłącznie w przeglądarce, pozwala prowadzić aktywną sesję, przeglądać historię, analizować progres i zarządzać własnymi planami treningowymi bez logowania i bez backendu.

## Najważniejsze funkcje

- Rejestrowanie aktywnej sesji treningowej z ćwiczeniami siłowymi i czasowymi.
- Historia ukończonych sesji oraz dashboard z wykresami progresu.
- Systemowe i własne plany treningowe z edycją kolejności ćwiczeń.
- Import danych z JSON i CSV oraz ręczny eksport do JSON i CSV.
- Automatyczny lokalny backup snapshotu aplikacji do `localStorage`.
- Motywy interfejsu zapisane lokalnie na urządzeniu.
- Obsługa `prefers-reduced-motion` dla timera przerwy.

## Start

### Wymagania

- Node.js 18+
- npm

### Development

```bash
npm install
npm run dev
```

Domyślnie Vite uruchamia aplikację pod `http://localhost:5173`.

### Build produkcyjny

```bash
npm run build
npm run preview
```

## Architektura

### Stack

| Kategoria | Technologia |
|-----------|-------------|
| UI | React 19 + TypeScript |
| Bundler | Vite 7 |
| Routing | React Router 7 |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Wykresy | Recharts |
| Import/Export | Papa Parse |
| Ikony | Lucide React |

### Struktura

```text
src/
├── components/       # Komponenty współdzielone, layout, timer, pickery
├── constants/        # Stałe aplikacyjne, m.in. klucze storage i eventy
├── data/             # Definicje ćwiczeń, planów i sample data
├── pages/            # Ekrany aplikacji
├── store/            # Zustand store główny i store ustawień backupu
├── types/            # Typy domenowe i payloady import/export/backup
├── utils/            # Logika sesji, planów, backupu i analityki
├── App.tsx           # Routing aplikacji
├── index.css         # Motywy i globalne style
└── main.tsx          # Bootstrap aplikacji
```

### Routing i performance

- Routy `/history`, `/progress` i `/settings` są ładowane przez `React.lazy`.
- Strona główna treningu i najczęściej używane widoki pozostają w initial bundle.
- `RestTimer` respektuje ustawienie systemowe `prefers-reduced-motion`.

## Dane i backup

Silka działa w modelu local-first:

- dane sesji, planów i aktywnej sesji są trzymane w `localStorage`,
- motyw aplikacji jest persystowany lokalnie,
- auto-backup zapisuje pełny snapshot aplikacji lokalnie w przeglądarce.

### Co obejmuje auto-backup

- `activeSession`
- `completedSessions`
- `plans`
- ustawienie włączenia backupu

Backup można:

- włączyć lub wyłączyć w ekranie `Konfiguracja`,
- odczytać jako ostatni lokalny snapshot,
- wykorzystać do odzyskania danych z poziomu UI.

Uwaga: auto-backup nie zapisuje plików na dysk. Nadal warto wykonywać ręczny eksport JSON jako zewnętrzną kopię bezpieczeństwa.

## Import / eksport

### Eksport

- JSON: pełny eksport historii ukończonych sesji
- CSV: płaskie dane serii do dalszej analizy

### Import

Obsługiwane formaty:

- aktualny JSON aplikacji (`schemaVersion: 2`)
- starszy JSON legacy
- legacy CSV

## Storage keys

Wspólne klucze storage są zdefiniowane w [src/constants/storage.ts](/R:/repo/silka/src/constants/storage.ts):

- `workout-store`
- `silka-theme`
- `silka-auto-backup`
- `silka-auto-backup-settings`

## Najważniejsze ekrany

- `Trening`: aktywna sesja, logowanie serii, timer przerwy
- `Historia`: przegląd ukończonych sesji
- `Progres`: statystyki i wykresy
- `Plany`: zarządzanie planami systemowymi i własnymi
- `Konfiguracja`: motyw, sample data, backup, import/export

## Troubleshooting

### Dane zniknęły

- sprawdź, czy przeglądarka nie wyczyściła `localStorage`,
- użyj ręcznego importu lub przywracania z automatycznego backupu,
- jeśli quota storage została przekroczona, aplikacja zgłasza ostrzeżenie w UI.

### Wykresy są puste

- potrzebujesz danych historycznych dla co najmniej jednego ćwiczenia,
- użyj sample data w `Konfiguracja`, aby szybko zasilić aplikację.

### Port 5173 jest zajęty

```bash
npm run dev -- --port 3000
```

## Rozwój

Przy dodawaniu nowej funkcji:

1. dodaj lub zaktualizuj typy w `src/types/index.ts`,
2. umieść logikę domenową w `src/store/` lub `src/utils/`,
3. trzymaj klucze storage i eventy w `src/constants/storage.ts`,
4. dodaj UI w `src/components/` lub `src/pages/`,
5. jeśli dotyczy routingu, podepnij ekran w `src/App.tsx`.

## Licencja

MIT
