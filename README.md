# 💪 Silka - Dziennik Treningowy

Minimalistyczna aplikacja webowa do śledzenia postępów treningowych. Stworzona dla indywidualnego użytkownika z fokusem na **prostotę**, **szybkość** i **lokalny storage**.

## 🎯 Cechy

- ✅ **3 plany treningowe** (A, B, C) - gotowe do użycia
- ✅ **Automatyczna logika progresji** - sugeruje zwiększenie wagi +2.5kg lub +5s
- ✅ **Historia wszystkich sesji** - zapisana w localStorage
- ✅ **Wykresy progresu** - wizualizacja postępów za pomocą Recharts
- ✅ **Import/Export** - CSV i JSON dla kopii zapasowych
- ✅ **Responsywny design** - mobilne + desktop
- ✅ **Brak logowania** - prywatne, tylko dla Ciebie
- ✅ **Zero zewnętrznych zależności** dla danych - wszystko lokalnie

## 🚀 Start

### Wymagania

- Node.js 16+ (preferably 18+)
- npm lub yarn

### Instalacja

```bash
# Klonuj/pobierz projekt
cd silka

# Zainstaluj zależności
npm install

# Uruchom development server
npm run dev

# Aplikacja otworzy się automatycznie na http://localhost:5173
```

### Build produkcyjny

```bash
npm run build
npm run preview
```

## 📱 Struktura projektu

```
silka/
├── src/
│   ├── components/           # Komponenty React
│   │   ├── Layout.tsx        # Główny layout z nawigacją
│   │   ├── ExerciseLogger.tsx # Formularz do wpisywania wyników
│   │   └── ProgressIndicator.tsx # Wskaźnik progresji
│   ├── pages/                # Strony aplikacji
│   │   ├── SelectWorkout.tsx # Strona wyboru treningu
│   │   ├── Workout.tsx       # Logging treningu
│   │   ├── History.tsx       # Historia sesji
│   │   ├── Dashboard.tsx     # Wykresy i statystyki
│   │   └── Import.tsx        # Import danych
│   ├── store/                # Zustand store (state management)
│   ├── types/                # TypeScript typy
│   ├── utils/                # Funkcje pomocnicze
│   ├── data/                 # Dane aplikacji
│   │   ├── workoutPlans.ts  # Definicja treningów A/B/C
│   │   └── sampleData.ts    # Generatory danych przykładowych
│   ├── index.css             # Tailwind CSS
│   ├── main.tsx              # Entry point
│   └── App.tsx               # Routing
├── index.html                # HTML entry
├── vite.config.ts            # Vite config
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind CSS config
└── package.json
```

## 🏋️ Plan treningowy

### Trening A - Siła + Klatka/Plecy
1. Hantle skos + (główne) - 4×6-10
2. Wiosłowanie hantlem/bramą - 4×8-12
3. Przysiad goblet - 4×8-12
4. OHP hantlami - 3×8-12
5. Ściąganie drążka/brama na plecy - 3×10-12
6. Triceps brama - 3×12-15
7. Biceps linka - 3×10-15

### Trening B - Nogi + Plecy + Ramiona
1. Rumuński martwy na hantlach - 4×8-12
2. Ściąganie drążka szeroko - 4×8-12
3. Wykroki chodzone - 3×10/10
4. Ławka płaska hantel - 3×8-12
5. Face pull - 3×15-20
6. Triceps maszyna - 3×10-12
7. Biceps stojąc - 3×8-12

### Trening C - Klatka + Siła Całościowa
1. Hantle skos ciężej niż w A - 4×6-8
2. Wiosło brama ciężej - 4×6-8
3. Hip thrust / glute bridge - 4×10-12
4. Maszyna na barki / Arnold press - 3×8-12
5. Unoszenie bokiem - 3×12-15
6. Core: plank - 3×45-60s

## 🧠 Logika progresji

Aplikacja automatycznie analizuje Twoje wyniki i sugeruje progresję:

### ✅ Zwiększ ciężar (+2.5 kg)
Gdy **wszystkie serie** ćwiczenia osiągną górny zakres powtórzeń:
- Przykład: Hantle skos 4×6-10 → jeśli wszystkie serie miały 10 powtórzeń → zwiększ do 32.5 kg

### ⏸️ Zostań na tym samym ciężarze
Gdy nie wszystkie serie osiągły maksimum:
- Pracuj nad tym, by osiągnąć pełny zakres powtórzeń
- Następnie zwiększaj wagę

### ⏱️ Dla planka
- +5 sekund gdy wszystkie serie ≥ 60 sekund

## 📊 Funkcje

### 1. **Logging Treningu**
- Wybierz trening (A/B/C)
- Wpisz powtórzenia dla każdej serii
- Zmień wagę jeśli potrzebujesz
- Zapisz sesję

### 2. **Historia**
- Przegląd wszystkich sesji z datami
- Liczba wykonanych ćwiczeń
- Usuwanie sesji (jeśli się pomyliłeś)

### 3. **Dashboard**
- Statystyki ogólne (razem sesji, średnia ćwiczeń)
- Osobisty rekord (max waga)
- Wykresy liniowe: progres ciężaru i powtórzeń
- Filtrowanie po ćwiczeniu

### 4. **Import Danych**
Zaimportuj historię z CSV lub JSON:

**Format CSV:**
```csv
date,workoutType,exerciseId,weight,reps
2024-01-01,A,A1,30,10
2024-01-01,A,A2,45,12
```

**Format JSON:**
```json
[
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
]
```

## 💾 Dane

Wszystkie dane zapisują się w **localStorage** przeglądarki:
- ✅ Brak serwera
- ✅ Brak wysyłania danych
- ✅ Brak logowania
- ✅ 100% prywatne

**⚠️ Backup:**
- Regularnie eksportuj swoje dane (Historia → CSV/JSON)
- Czyszczenie cache przeglądarki usunie wszystkie dane

## 🛠️ Architektura

### Stack techniczny

| Kategoria | Technologia |
|-----------|-------------|
| **UI Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 5 |
| **State Management** | Zustand |
| **Styling** | TailwindCSS 4 |
| **Charts** | Recharts |
| **Routing** | React Router 7 |
| **Utilities** | date-fns, papaparse |
| **Icons** | Lucide React |

### Dlaczego te wybory?

1. **Zustand** - minimalistyczne, szybkie, idealny dla localStorage
2. **Vite** - ultra szybki build, hot reload
3. **TailwindCSS** - szybkie stylowanie, responsywne
4. **Recharts** - proste wykresy, dobrze zintegrowane z React
5. **React Router** - lekkie routing dla SPA

## 🚀 Pomysły na przyszłość

### Krótkoterminowe
- [ ] Dark mode (toggle w ustawieniach)
- [ ] Eksport PDF raportu treningowego
- [ ] PWA (installable app na telefon)
- [ ] Backup do chmury (Supabase/Firebase)

### Długoterminowe
- [ ] Synchronizacja między urządzeniami
- [ ] Udostępnianie postępów (read-only link)
- [ ] Integracja z Apple Health / Google Fit
- [ ] Training program builder (customowe treningi)
- [ ] Social features (porównanie z przyjaciółmi)
- [ ] Form tracking (foto/video?)

## 📝 Notatki techniczne

### State Flow
```
App
├── Layout (routing context)
└── useWorkoutStore (Zustand)
    ├── sessions: WorkoutSession[]
    ├── addSession()
    ├── deleteSession()
    └── getLastSessionForExercise()
```

### localStorage Schema
```javascript
{
  "workout-store": {
    "state": {
      "sessions": [WorkoutSession[]],
      "currentSession": WorkoutSession | null
    }
  }
}
```

## 🐛 Troubleshooting

### "Moje dane zniknęły!"
- localStorage został wyczyszczony
- Rozwiązanie: Import z pliku CSV/JSON (jeśli masz backup)

### "Wykresy się nie wyświetlają"
- Potrzebujesz co najmniej 2 sesji tego samego ćwiczenia
- Załaduj przykładowe dane: "Załaduj dane przykładowe"

### "Port 5173 jest zajęty"
```bash
npm run dev -- --port 3000
```

## 📄 Licencja

MIT - Możesz użyć i modyfikować jak chcesz.

## 👨‍💻 Desarrollo

Chceć dodać funkcję? Struktura projektu jest prosta:

1. Dodaj typ w `src/types/index.ts`
2. Dodaj logikę do store w `src/store/index.ts`
3. Stwórz komponent w `src/components/`
4. Dodaj stronę w `src/pages/`
5. Podłącz routing w `src/App.tsx`

## 📞 Support

Jeśli coś się zepsuło:
1. Sprawdź console (F12 → Console tab)
2. Wyłącz/włącz aplikację
3. Wyczyść cache localStorage (DevTools → Application → localStorage)

---

**Powodzenia w treningach! 💪**
