import { isIosDevice, isStandaloneMode } from './pwa';

export const REST_TIMER_NOTIFICATION_TAG = 'silka-rest-timer-finished';

type RestTimerPermission = NotificationPermission | 'unsupported';
export type RestTimerPushStatus =
  | 'unknown'
  | 'unsupported'
  | 'install-required'
  | 'permission-required'
  | 'denied'
  | 'missing-config'
  | 'ready'
  | 'error';

interface RestTimerNotificationOptions {
  body?: string;
  title?: string;
}

interface PushConfigResponse {
  available: boolean;
  publicKey: string | null;
  schedulerAvailable: boolean;
}

interface EnsurePushSubscriptionResult {
  status: RestTimerPushStatus;
  subscription: PushSubscriptionJSON | null;
}

interface SchedulePushResult {
  status: RestTimerPushStatus;
  runId: string | null;
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

export const isRestTimerVibrationSupported = () =>
  !isIosDevice() && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

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

    const sequence = [
      { start: 0.00, duration: 0.22, frequency: 880 },
      { start: 0.28, duration: 0.22, frequency: 1046.5 },
      { start: 0.58, duration: 0.24, frequency: 1318.5 },
      { start: 1.10, duration: 0.24, frequency: 987.8 },
      { start: 1.42, duration: 0.24, frequency: 1174.7 },
      { start: 1.74, duration: 0.30, frequency: 1568 },
      { start: 2.20, duration: 0.26, frequency: 1318.5 },
      { start: 2.54, duration: 0.26, frequency: 1568 },
    ];
    const startedAt = context.currentTime + 0.01;

    sequence.forEach((note) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const noteStart = startedAt + note.start;
      const noteEnd = noteStart + note.duration;

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(note.frequency, noteStart);
      gainNode.gain.setValueAtTime(0.0001, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.02);
    });

    await new Promise((resolve) => window.setTimeout(resolve, 3000));
    return true;
  } catch {
    return false;
  }
};

export const vibrateRestTimer = (vibrationEnabled: boolean) => {
  if (!vibrationEnabled || !isRestTimerVibrationSupported()) {
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

export const getRestTimerPushStatus = async (): Promise<RestTimerPushStatus> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }

  if (requiresInstalledPwaForReliableNotifications()) {
    return 'install-required';
  }

  const permission = getRestTimerNotificationPermission();
  if (permission === 'denied') {
    return 'denied';
  }

  if (permission !== 'granted') {
    return 'permission-required';
  }

  try {
    const config = await fetchPushConfig();
    if (!config.available || !config.publicKey || !config.schedulerAvailable) {
      return 'missing-config';
    }
    return 'ready';
  } catch {
    return 'error';
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

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

const fetchPushConfig = async (): Promise<PushConfigResponse> => {
  const response = await fetch('/api/push/vapid-public-key', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('push-config-unavailable');
  }

  return response.json() as Promise<PushConfigResponse>;
};

export const ensureRestTimerPushSubscription = async (): Promise<EnsurePushSubscriptionResult> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { status: 'unsupported', subscription: null };
  }

  if (requiresInstalledPwaForReliableNotifications()) {
    return { status: 'install-required', subscription: null };
  }

  const permission = getRestTimerNotificationPermission();
  if (permission === 'denied') {
    return { status: 'denied', subscription: null };
  }

  if (permission !== 'granted') {
    return { status: 'permission-required', subscription: null };
  }

  try {
    const config = await fetchPushConfig();
    if (!config.available || !config.publicKey) {
      return { status: 'missing-config', subscription: null };
    }

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
    });

    return {
      status: 'ready',
      subscription: subscription.toJSON(),
    };
  } catch {
    return { status: 'error', subscription: null };
  }
};

export const scheduleRestTimerPush = async (
  timerId: string,
  fireAt: string,
  subscription: PushSubscriptionJSON,
): Promise<SchedulePushResult> => {
  try {
    const response = await fetch('/api/rest-timer/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timerId,
        fireAt,
        subscription,
      }),
    });

    if (response.status === 503) {
      return { status: 'missing-config', runId: null };
    }

    if (!response.ok) {
      return { status: 'error', runId: null };
    }

    const payload = await response.json() as { messageId?: string };
    return {
      status: 'ready',
      runId: payload.messageId ?? null,
    };
  } catch {
    return { status: 'error', runId: null };
  }
};

export const cancelRestTimerPush = async (runId: string) => {
  try {
    await fetch('/api/rest-timer/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ runId }),
    });
    return true;
  } catch {
    return false;
  }
};
