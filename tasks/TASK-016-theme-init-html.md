# TASK-016: Early Theme Init + Meta Tag

## Cel
Zapobiec "flash" jasnego motywu przy ladowaniu strony gdy uzytkownik ma ustawiony dark/pink.

## Pliki
- **Modyfikuj:** `index.html` — dodaj meta theme-color
- **Modyfikuj:** `src/main.tsx` — dodaj synchroniczny odczyt motywu przed renderem React

## Implementacja

### index.html — dodaj w `<head>`:
```html
<meta name="theme-color" content="#1d4ed8" />
```

### main.tsx — dodaj PRZED `ReactDOM.createRoot`:
```typescript
// Synchronous theme init — prevents flash of light theme
try {
  const stored = localStorage.getItem('silka-theme');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.theme && state.theme !== 'light') {
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  }
} catch {
  // noop — fallback to light
}
```

## Dlaczego synchronicznie?
Zustand `onRehydrate` odpalany jest asynchronicznie po renderze React. Bez synchronicznego odczytu uzytkownik widzi blysk jasnego motywu zanim React zamontuje store. Ten blok (~6 linii) czyta surowy JSON z localStorage i ustawia atrybut jeszcze przed `createRoot`.

## Weryfikacja
- Ustaw motyw na dark, odswierz strone — brak blysku bialego tla
- Usun `silka-theme` z localStorage — strona laduje normalnie w jasnym motywie
