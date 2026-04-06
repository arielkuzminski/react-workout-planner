import { Heart, Moon, Sun } from 'lucide-react';
import { Theme, useThemeStore } from '../store/themeStore';

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Jasny' },
  { value: 'dark', icon: Moon, label: 'Ciemny' },
  { value: 'pink', icon: Heart, label: 'Rozowy' },
];

export default function ThemeSwitcher() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1"
      role="group"
      aria-label="Wybór motywu"
    >
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-label={label}
            aria-pressed={isActive}
            className={`rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${
              isActive
                ? 'bg-surface-card text-brand-text shadow-sm'
                : 'text-text-tertiary hover:bg-surface-card hover:text-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
