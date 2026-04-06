# TASK-020: Plynne przejscia + finalizacja

## Cel
Dodac animacje przejsc miedzy motywami i wykonac QA wizualne.

## Pliki
- **Modyfikuj:** `src/index.css` — dodaj reguly transition
- **Modyfikuj:** `src/store/themeStore.ts` — dodaj no-transitions class toggle

## Implementacja

### CSS transitions w index.css
```css
/* Smooth theme transitions */
*,
*::before,
*::after {
  transition: background-color 150ms ease-in-out,
              border-color 150ms ease-in-out,
              color 150ms ease-in-out,
              fill 150ms ease-in-out,
              stroke 150ms ease-in-out;
}

/* Disable transitions on page load */
html.no-transitions,
html.no-transitions *,
html.no-transitions *::before,
html.no-transitions *::after {
  transition: none !important;
}
```

### No-transitions w themeStore
W `applyTheme()`:
```typescript
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add('no-transitions');

  if (theme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }

  // Re-enable after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('no-transitions');
    });
  });

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_COLORS[theme]);
  }
}
```

**Uwaga:** `no-transitions` zapobiega animacji przy ladowaniu strony. Przelaczanie motywem przez uzytkownika — transitions NIE sa blokowane, bo `applyTheme` jest wolane dopiero po kliknieciu (nie przy rehydrate). Trzeba dostosowac logike — `no-transitions` powinno byc dodawane TYLKO przy initial load, nie przy recznym przelaczaniu.

Poprawka: dodaj parametr `skipTransition` do `applyTheme`:
```typescript
function applyTheme(theme: Theme, skipTransition = false) {
  const root = document.documentElement;
  if (skipTransition) root.classList.add('no-transitions');
  // ...set data-theme...
  if (skipTransition) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove('no-transitions'));
    });
  }
}
```

`onRehydrate` wola `applyTheme(theme, true)`, `setTheme` wola `applyTheme(theme, false)`.

## QA Checklist
- [ ] Light -> Dark: plynne przejscie ~150ms
- [ ] Dark -> Pink: plynne przejscie
- [ ] Pink -> Light: plynne przejscie
- [ ] Refresh w dark — brak blysku bialego
- [ ] Kontrast WCAG AA w kazdym motywie (tekst na tle)
- [ ] RestTimer SVG poprawne kolory we wszystkich motywach
- [ ] Dashboard wykres poprawny we wszystkich motywach
- [ ] Scrollbar zmienia kolory
- [ ] Focus rings widoczne w kazdym motywie
- [ ] Mobile bottom nav poprawnie kolorowany
