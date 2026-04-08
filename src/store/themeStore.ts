import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/storage';

export type Theme = 'light' | 'dark' | 'pink';

const THEME_COLORS: Record<Theme, string> = {
  light: '#1d4ed8',
  dark: '#0f172a',
  pink: '#db2777',
};

function applyTheme(theme: Theme, skipTransition = false) {
  const root = document.documentElement;

  if (skipTransition) {
    root.classList.add('no-transitions');
  }

  if (theme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_COLORS[theme]);
  }

  if (skipTransition) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transitions');
      });
    });
  }
}

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: STORAGE_KEYS.themeStore,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme, true);
        }
      },
    }
  )
);
