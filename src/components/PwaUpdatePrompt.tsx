import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export default function PwaUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
    setUpdateSW(() => update);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-brand-border bg-surface-card p-4 shadow-lg md:bottom-6">
      <p className="text-sm font-medium text-text-primary">Dostępna nowa wersja aplikacji.</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => updateSW?.(true)}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-text-inverted transition-colors hover:bg-brand-hover active:bg-brand-active"
        >
          Aktualizuj
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised"
        >
          Później
        </button>
      </div>
    </div>
  );
}
