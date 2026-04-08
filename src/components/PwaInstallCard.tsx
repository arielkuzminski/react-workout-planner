import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Plus, Share2, Smartphone } from 'lucide-react';
import { isIosDevice, isStandaloneMode } from '../utils/pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export default function PwaInstallCard() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'dismissed'>('idle');

  useEffect(() => {
    const standalone = isStandaloneMode();
    const iosDevice = isIosDevice();

    setIsInstalled(standalone);
    setIsIos(iosDevice);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setInstallState('idle');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    setInstallState('installing');
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
      return;
    }

    setInstallState('dismissed');
  };

  if (isInstalled) {
    return (
      <section className="rounded-[2rem] border border-success-border bg-success-soft p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-success p-3 text-text-inverted shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-success-text">Aplikacja jest zainstalowana</h3>
            <p className="mt-1 text-sm text-success-text">
              Siłka działa już w trybie pełnoekranowym i zachowuje się jak natywna aplikacja na tym urządzeniu.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-warning-border bg-warning-soft p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-warning-icon p-3 text-white shadow-sm">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-warning-text">Zainstaluj Siłkę na ekranie głównym</h3>
            <p className="mt-1 text-sm text-warning-text">
              Instalacja daje szybsze otwieranie, pełny ekran i wygodniejszy dostęp do treningu.
            </p>
          </div>
        </div>

        {installPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={installState === 'installing'}
            className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-warning-icon px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-warning-icon focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Download className="h-4 w-4" />
            {installState === 'installing' ? 'Otwieram instalację...' : 'Zainstaluj aplikację'}
          </button>
        )}
      </div>

      {isIos && !installPrompt && (
        <div className="mt-4 rounded-2xl border border-warning-border/70 bg-white/50 p-4 text-sm text-warning-text">
          <p className="font-semibold">iPhone / iPad</p>
          <p className="mt-1">W Safari stuknij <span className="inline-flex items-center gap-1 font-semibold"><Share2 className="h-4 w-4" />Udostępnij</span>, a potem wybierz <span className="inline-flex items-center gap-1 font-semibold"><Plus className="h-4 w-4" />Do ekranu początkowego</span>.</p>
        </div>
      )}

      {!isIos && !installPrompt && (
        <div className="mt-4 rounded-2xl border border-warning-border/70 bg-white/50 p-4 text-sm text-warning-text">
          <p className="font-semibold">Instalacja z przeglądarki</p>
          <p className="mt-1">
            Jeśli nie widzisz przycisku instalacji, otwórz menu przeglądarki i wybierz opcję typu
            {' '}„Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.
          </p>
          {installState === 'dismissed' && (
            <p className="mt-2 text-xs">
              Poprzednie okno instalacji zostało zamknięte. Przeglądarka może pokazać je ponownie dopiero po chwili.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
