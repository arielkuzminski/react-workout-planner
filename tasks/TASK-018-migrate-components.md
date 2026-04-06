# TASK-018: Migracja klas kolorow w komponentach

## Cel
Zamienic wszystkie hardkodowane klasy kolorow Tailwind na semantyczne tokeny zdefiniowane w TASK-014.

## Pliki do modyfikacji (10 plikow, ~135 zamian)

### Tabela mapowania (glowne wzorce)

| Stara klasa | Nowa klasa | Kontekst |
|-------------|-----------|----------|
| `bg-white` | `bg-surface-card` | karty, header, nav |
| `bg-gray-50` | `bg-surface` | tlo strony |
| `bg-gray-100` / `bg-stone-100` | `bg-surface-raised` | chipy, panele |
| `bg-gray-200` | `bg-surface-inset` | hover na neutralnych |
| `text-gray-900` / `text-stone-900` | `text-text-primary` | naglowki |
| `text-gray-600` / `text-gray-500` / `text-stone-500` / `text-stone-600` | `text-text-secondary` | opisy |
| `text-gray-400` / `text-stone-400` | `text-text-tertiary` | muted labels |
| `text-white` | `text-text-inverted` | tekst na przyciskach |
| `border-gray-200` / `border-stone-200` | `border-border` | domyslne obramowania |
| `border-gray-300` / `border-stone-300` | `border-border-strong` | inputy |
| `bg-blue-700` | `bg-brand` | primary button |
| `hover:bg-blue-800` | `hover:bg-brand-hover` | primary hover |
| `active:bg-blue-900` | `active:bg-brand-active` | primary active |
| `bg-blue-50` | `bg-brand-soft` | soft brand bg |
| `border-blue-100` / `border-blue-200` | `border-brand-border` | brand borders |
| `text-blue-700` / `text-blue-900` | `text-brand-text` | brand tekst |
| `focus-visible:ring-blue-400` / `ring-blue-700` | `focus-visible:ring-brand-ring` | focus rings |
| `bg-emerald-600` | `bg-success` | success button |
| `hover:bg-emerald-700` | `hover:bg-success-hover` | success hover |
| `bg-emerald-50` / `bg-green-50` | `bg-success-soft` | success soft bg |
| `border-emerald-200` / `border-green-200` | `border-success-border` | success border |
| `text-emerald-800` / `text-green-900` | `text-success-text` | success tekst |
| `focus-visible:ring-emerald-400` | `focus-visible:ring-success-ring` | success focus |
| `bg-amber-50` / `bg-yellow-50` | `bg-warning-soft` | warning bg |
| `border-amber-200` / `border-yellow-200` | `border-warning-border` | warning border |
| `text-amber-900` / `text-yellow-900` | `text-warning-text` | warning tekst |
| `hover:bg-rose-50` | `hover:bg-danger-soft` | danger hover bg |
| `hover:text-rose-600` | `hover:text-danger-text` | danger hover tekst |
| `active:bg-rose-100` | `active:bg-danger-hover-bg` | danger active |
| `focus-visible:ring-rose-400` | `focus-visible:ring-danger-ring` | danger focus |
| `text-violet-600` | `text-accent-violet` | ikona violet |
| `text-orange-600` | `text-accent-orange` | ikona orange |
| `bg-gray-900` / `bg-stone-900` (button) | `bg-btn-dark` | ciemne przyciski |
| `hover:bg-black` | `hover:bg-btn-dark-hover` | ciemny hover |
| `active:bg-gray-800` | `active:bg-btn-dark-active` | ciemny active |

### Pliki i szacunkowa liczba zmian

1. **`src/components/Layout.tsx`** (~13 zmian)
   - header bg, nav bg, link colors, active states, border, shadow

2. **`src/pages/Home.tsx`** (~25 zmian)
   - przyciski, karty szablonow, tekst, obramowania, focus rings

3. **`src/pages/Session.tsx`** (~20 zmian)
   - formularz cwiczen, przyciski success/danger, inputy, tekst

4. **`src/pages/History.tsx`** (~12 zmian)
   - karty sesji, tekst, delete hover, obramowania

5. **`src/pages/Dashboard.tsx`** (~15 zmian)
   - karty statystyk, tekst stone->text-primary/secondary, obramowania

6. **`src/pages/SessionRecap.tsx`** (~18 zmian)
   - sekcja PR, trophy amber, ikony kolorowe, tekst, obramowania

7. **`src/pages/Import.tsx`** (~10 zmian)
   - przyciski, success box, tekst, obramowania

8. **`src/components/ExerciseLogger.tsx`** (~8 zmian)
   - inputy, przyciski, tekst, focus rings

9. **`src/components/RestTimer.tsx`** (~8 zmian)
   - tekst, przyciski, obramowania (SVG hex -> TASK-019)

10. **`src/components/ProgressIndicator.tsx`** (~6 zmian)
    - info box blue, suggestion boxes green/yellow

## Strategia
- Uzywaj Edit tool z replace_all=false (kazda zamiana unikalna w kontekscie)
- Zaczynaj od plikow z najwieksza iloscia zmian (Home, Session, SessionRecap)
- Po kazdym pliku sprawdz ze nie zostaly zadne hardkodowane gray-/blue-/stone- klasy

## Weryfikacja
- `grep -r "bg-gray-\|bg-stone-\|bg-blue-\|text-gray-\|text-stone-\|text-blue-\|border-gray-\|border-stone-" src/` — powinno zwrocic 0 wynikow (poza ewentualnymi komentarzami)
- Aplikacja wyglada identycznie jak przed migracj w motywie Light
