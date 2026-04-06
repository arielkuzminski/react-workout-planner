# TASK-019: Tokeny SVG i Recharts

## Cel
Zamienic hardkodowane kolory hex w SVG i Recharts na CSS custom properties.

## Pliki
- **Modyfikuj:** `src/components/RestTimer.tsx` — 3 kolory hex w SVG
- **Modyfikuj:** `src/pages/Dashboard.tsx` — 1 kolor hex w Recharts `<Line>`

## Zmiany

### RestTimer.tsx
Obecne hardkodowane wartosci:
- `stroke="#e5e7eb"` (tlo kola) -> `stroke="var(--color-chart-track)"`
- `'#10b981'` (kolo ukonczony timer) -> `'var(--color-chart-line)'`
- `'#3b82f6'` (kolo aktywny timer) -> `'var(--color-chart-fill)'`

### Dashboard.tsx
- Recharts `<Line stroke="#10b981">` -> `<Line stroke="var(--color-chart-line)">`
- Tooltip custom div — tokenizacja klas (jesli nie zrobiono w TASK-018)

## Uwaga techniczna
- SVG atrybut `stroke` akceptuje `var(--*)` jako wartosc
- Recharts `stroke` prop rowniez akceptuje CSS custom properties jako string
- W dark mode wykresy beda uzywac jasniejszych odcieni (emerald-400, blue-400) zdefiniowanych w TASK-014

## Weryfikacja
- RestTimer w kazdym motywie: kolo ma odpowiednie kolory
- Dashboard wykres: linia i tooltip poprawne w dark/pink
