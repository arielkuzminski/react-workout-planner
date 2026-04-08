import { isIosDevice, isStandaloneMode } from './pwa';

export const REST_TIMER_NOTIFICATION_TAG = 'silka-rest-timer-finished';

type RestTimerPermission = NotificationPermission | 'unsupported';

interface RestTimerNotificationOptions {
  body?: string;
  title?: string;
}

let audioContextRef: AudioContext | null = null;

const getAudioContextClass = () =>
  window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

const getAudioContext = () => {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContextRef) {
    audioContextRef = new AudioContextClass();
  }

  return audioContextRef;
};

export const getRestTimerNotificationPermission = (): RestTimerPermission => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }

  return Notification.permission;
};

export const isRestTimerNotificationSupported = () =>
  getRestTimerNotificationPermission() !== 'unsupported';

export const requiresInstalledPwaForReliableNotifications = () => isIosDevice() && !isStandaloneMode();

export const prepareRestTimerAudio = async () => {
  try {
    const context = getAudioContext();
    if (!context) {
      return false;
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    return context.state === 'running';
  } catch {
    return false;
  }
};

export const playRestTimerSound = async (soundEnabled: boolean) => {
  if (!soundEnabled) {
    return false;
  }

  try {
    const context = getAudioContext();
    if (!context) {
      return false;
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.36);
    return true;
  } catch {
    return false;
  }
};

export const vibrateRestTimer = (vibrationEnabled: boolean) => {
  if (!vibrationEnabled) {
    return false;
  }

  try {
    return Boolean(navigator.vibrate?.([250, 120, 250, 120, 250]));
  } catch {
    return false;
  }
};

export const closeRestTimerNotifications = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications({ tag: REST_TIMER_NOTIFICATION_TAG });
    notifications.forEach((notification) => notification.close());
  } catch {}
};

export const showRestTimerNotification = async ({
  title = 'Przerwa zakończona',
  body = 'Wracaj do serii. Timer w Siłce dobiegł końca.',
}: RestTimerNotificationOptions = {}) => {
  if (getRestTimerNotificationPermission() !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag: REST_TIMER_NOTIFICATION_TAG,
      requireInteraction: true,
      badge: '/icon-192.png',
      icon: '/icon-192.png',
      data: {
        url: '/',
      },
    });
    return true;
  } catch {
    return false;
  }
};

export const requestRestTimerNotificationPermission = async (): Promise<RestTimerPermission> => {
  const permission = getRestTimerNotificationPermission();
  if (permission === 'unsupported' || permission === 'granted' || permission === 'denied') {
    return permission;
  }

  if (requiresInstalledPwaForReliableNotifications()) {
    return permission;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};
