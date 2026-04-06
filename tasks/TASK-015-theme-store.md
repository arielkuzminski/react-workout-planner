# TASK-015: Zustand Theme Store

## Cel
Stworzyc dedykowany store Zustand do zarzadzania motywem, oddzielny od workout store.

## Pliki
- **Nowy:** `src/store/themeStore.ts`

## Implementacja

```typescript
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'pink';

const THEME_COLORS: Record<Theme, string> = {
  light: '#1d4ed8',
  dark: '#0f172a',
  pink: '#db2777',
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_COLORS[theme]);
  }
}

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'silka-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrate: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);
```

## Kluczowe decyzje
- **Oddzielny klucz localStorage** (`silka-theme`) — nie koliduje z `workout-store` (wersja 4, skomplikowana migracja)
- **`applyTheme`** ustawia `data-theme` na `<html>` i aktualizuje meta theme-color
- **Light nie ma atrybutu** `data-theme` — domyslne wartosci z `@theme {}` obowiazuja
- **`onRehydrate`** — po odczycie z localStorage natychmiast aplikuje motyw do DOM

## Weryfikacja
- `useThemeStore.getState().setTheme('dark')` w konsoli DevTools — zmienia data-theme
- Refresh strony zachowuje motyw
