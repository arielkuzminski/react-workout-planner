# TASK-017: Komponent ThemeSwitcher + integracja w Layout

## Cel
Stworzyc UI do przelaczania motywow i osadzic go w headerze aplikacji.

## Pliki
- **Nowy:** `src/components/ThemeSwitcher.tsx`
- **Modyfikuj:** `src/components/Layout.tsx` — dodaj ThemeSwitcher w headerze

## Implementacja ThemeSwitcher

Pill-shape container z 3 przyciskami ikonowymi (lucide-react juz jest w projekcie):
- `Sun` — Light ("Jasny")
- `Moon` — Dark ("Ciemny")
- `Heart` — Pink ("Rozowy")

```tsx
import { Sun, Moon, Heart } from 'lucide-react';
import { Theme, useThemeStore } from '../store/themeStore';

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Jasny' },
  { value: 'dark', icon: Moon, label: 'Ciemny' },
  { value: 'pink', icon: Heart, label: 'Rozowy' },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-1 rounded-full bg-surface-raised p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          className={`rounded-full p-1.5 transition-colors ${
            theme === value
              ? 'bg-surface-card text-brand-text shadow-sm'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
```

## Integracja w Layout.tsx

W headerze, po bloku z tytulem, przed `<nav>`:
```tsx
<ThemeSwitcher />
```

Dodaj `flex-1` do wrappera tytulu zeby switcher wyrownyal sie w prawo. Na mobile switcher bedzie widoczny w headerze (zawsze dostepny).

## Weryfikacja
- 3 przyciski widoczne w headerze
- Klikniecie zmienia motyw natychmiast
- Aktywny przycisk ma wyrozniony styl
- Dziala na mobile i desktop
