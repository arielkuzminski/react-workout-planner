# TASK-014: Architektura tokenow CSS + @theme

## Cel
Zdefiniowac pelny zestaw semantycznych tokenow kolorystycznych w `src/index.css` przy uzyciu Tailwind v4 `@theme`, z wariantami per motyw via `[data-theme]`.

## Pliki
- **Modyfikuj:** `src/index.css` (rewrite)
- **Usun:** `tailwind.config.js` (TW4 z @tailwindcss/postcss nie potrzebuje configa)

## Implementacja

### 1. Usun `tailwind.config.js`
Tailwind v4 z `@tailwindcss/postcss` automatycznie skanuje pliki. Gdyby auto-detekcja zawiodla, dodaj:
```css
@source "../index.html";
@source "./";
```

### 2. Zdefiniuj tokeny w `@theme` bloku (domyslny = Light)

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-surface: #f9fafb;
  --color-surface-card: #ffffff;
  --color-surface-raised: #f3f4f6;
  --color-surface-inset: #e5e7eb;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-text-inverted: #ffffff;

  /* Borders */
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;

  /* Brand (blue) */
  --color-brand: #1d4ed8;
  --color-brand-hover: #1e40af;
  --color-brand-active: #1e3a8a;
  --color-brand-soft: #eff6ff;
  --color-brand-border: #bfdbfe;
  --color-brand-text: #1d4ed8;
  --color-brand-ring: #60a5fa;

  /* Success (emerald) */
  --color-success: #059669;
  --color-success-hover: #047857;
  --color-success-active: #065f46;
  --color-success-soft: #ecfdf5;
  --color-success-border: #a7f3d0;
  --color-success-text: #065f46;
  --color-success-ring: #34d399;

  /* Warning (amber) */
  --color-warning-soft: #fffbeb;
  --color-warning-border: #fde68a;
  --color-warning-text: #92400e;
  --color-warning-icon: #f59e0b;

  /* Danger (rose) */
  --color-danger: #e11d48;
  --color-danger-soft: #fff1f2;
  --color-danger-hover-bg: #ffe4e6;
  --color-danger-active-bg: #fecdd3;
  --color-danger-text: #be123c;
  --color-danger-ring: #fb7185;

  /* Accents */
  --color-accent-violet: #7c3aed;
  --color-accent-orange: #ea580c;

  /* Chart / SVG */
  --color-chart-line: #10b981;
  --color-chart-track: #e5e7eb;
  --color-chart-fill: #3b82f6;

  /* Scrollbar */
  --color-scrollbar-track: #f3f4f6;
  --color-scrollbar-thumb: #9ca3af;
  --color-scrollbar-hover: #6b7280;

  /* Navigation */
  --color-nav-active: #1d4ed8;
  --color-nav-active-bg: #eff6ff;
  --color-nav-inactive: #4b5563;
  --color-nav-inactive-hover: #111827;
  --color-nav-inactive-hover-bg: #f3f4f6;

  /* Buttons */
  --color-btn-dark: #111827;
  --color-btn-dark-hover: #000000;
  --color-btn-dark-active: #374151;
}
```

### 3. Dark theme override

```css
[data-theme="dark"] {
  --color-surface: #0f172a;
  --color-surface-card: #1e293b;
  --color-surface-raised: #334155;
  --color-surface-inset: #475569;

  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-tertiary: #64748b;
  --color-text-inverted: #0f172a;

  --color-border: #334155;
  --color-border-strong: #475569;

  --color-brand: #3b82f6;
  --color-brand-hover: #60a5fa;
  --color-brand-active: #93c5fd;
  --color-brand-soft: #172554;
  --color-brand-border: #1e40af;
  --color-brand-text: #60a5fa;
  --color-brand-ring: #3b82f6;

  --color-success: #10b981;
  --color-success-hover: #34d399;
  --color-success-active: #6ee7b7;
  --color-success-soft: #022c22;
  --color-success-border: #065f46;
  --color-success-text: #6ee7b7;
  --color-success-ring: #10b981;

  --color-warning-soft: #451a03;
  --color-warning-border: #92400e;
  --color-warning-text: #fde68a;
  --color-warning-icon: #f59e0b;

  --color-danger: #fb7185;
  --color-danger-soft: #4c0519;
  --color-danger-hover-bg: #881337;
  --color-danger-active-bg: #9f1239;
  --color-danger-text: #fda4af;
  --color-danger-ring: #f43f5e;

  --color-accent-violet: #a78bfa;
  --color-accent-orange: #fb923c;

  --color-chart-line: #34d399;
  --color-chart-track: #334155;
  --color-chart-fill: #60a5fa;

  --color-scrollbar-track: #1e293b;
  --color-scrollbar-thumb: #475569;
  --color-scrollbar-hover: #64748b;

  --color-nav-active: #60a5fa;
  --color-nav-active-bg: #172554;
  --color-nav-inactive: #94a3b8;
  --color-nav-inactive-hover: #f1f5f9;
  --color-nav-inactive-hover-bg: #334155;

  --color-btn-dark: #e2e8f0;
  --color-btn-dark-hover: #f8fafc;
  --color-btn-dark-active: #cbd5e1;
}
```

### 4. Pink theme override

```css
[data-theme="pink"] {
  --color-surface: #fdf2f8;
  --color-surface-card: #ffffff;
  --color-surface-raised: #fce7f3;
  --color-surface-inset: #fbcfe8;

  --color-text-primary: #500724;
  --color-text-secondary: #9d174d;
  --color-text-tertiary: #be185d;
  --color-text-inverted: #ffffff;

  --color-border: #fbcfe8;
  --color-border-strong: #f9a8d4;

  --color-brand: #db2777;
  --color-brand-hover: #be185d;
  --color-brand-active: #9d174d;
  --color-brand-soft: #fdf2f8;
  --color-brand-border: #f9a8d4;
  --color-brand-text: #be185d;
  --color-brand-ring: #f472b6;

  --color-success: #059669;
  --color-success-hover: #047857;
  --color-success-active: #065f46;
  --color-success-soft: #ecfdf5;
  --color-success-border: #a7f3d0;
  --color-success-text: #065f46;
  --color-success-ring: #34d399;

  --color-warning-soft: #fffbeb;
  --color-warning-border: #fde68a;
  --color-warning-text: #92400e;
  --color-warning-icon: #f59e0b;

  --color-danger: #e11d48;
  --color-danger-soft: #fff1f2;
  --color-danger-hover-bg: #ffe4e6;
  --color-danger-active-bg: #fecdd3;
  --color-danger-text: #be123c;
  --color-danger-ring: #fb7185;

  --color-accent-violet: #a855f7;
  --color-accent-orange: #f97316;

  --color-chart-line: #ec4899;
  --color-chart-track: #fce7f3;
  --color-chart-fill: #db2777;

  --color-scrollbar-track: #fce7f3;
  --color-scrollbar-thumb: #f9a8d4;
  --color-scrollbar-hover: #ec4899;

  --color-nav-active: #be185d;
  --color-nav-active-bg: #fdf2f8;
  --color-nav-inactive: #9d174d;
  --color-nav-inactive-hover: #500724;
  --color-nav-inactive-hover-bg: #fce7f3;

  --color-btn-dark: #831843;
  --color-btn-dark-hover: #500724;
  --color-btn-dark-active: #9d174d;
}
```

### 5. Globalne style (zachowaj istniejace + tokenizuj)

```css
html { scroll-behavior: smooth; }
body { background-color: var(--color-surface); }

button, [role="button"], select, a { cursor: pointer; }
button:disabled, [aria-disabled="true"] { cursor: not-allowed; }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background-color: var(--color-scrollbar-track); }
::-webkit-scrollbar-thumb { background-color: var(--color-scrollbar-thumb); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background-color: var(--color-scrollbar-hover); }
```

## Weryfikacja
1. `npm run dev` startuje bez bledow
2. Klasy `bg-surface`, `text-brand`, `border-border` itp. sa rozpoznawane przez Tailwind
3. Dodanie `data-theme="dark"` na `<html>` w DevTools zmienia kolory
