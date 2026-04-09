import webpush from 'web-push';

interface RestTimerPushPayload {
  title: string;
  body: string;
  url: string;
}

const QSTASH_BASE_URL = 'https://qstash.upstash.io/v2';

export const getWebPushConfig = () => {
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY ?? '';
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY ?? '';
  const subject = process.env.WEB_PUSH_VAPID_SUBJECT ?? '';

  return {
    available: Boolean(publicKey && privateKey && subject),
    publicKey,
    privateKey,
    subject,
  };
};

export const getQStashConfig = () => {
  const token = process.env.QSTASH_TOKEN ?? '';
  const fireSecret = process.env.REST_TIMER_FIRE_SECRET ?? '';

  return {
    available: Boolean(token && fireSecret),
    token,
    fireSecret,
  };
};

export const configureWebPush = () => {
  const config = getWebPushConfig();
  if (!config.available) {
    throw new Error('missing-web-push-config');
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return config;
};

export const sendRestTimerPush = async (
  subscription: PushSubscriptionJSON,
  payload: RestTimerPushPayload,
) => {
  configureWebPush();
  await webpush.sendNotification(subscription as webpush.PushSubscription, JSON.stringify(payload), {
    TTL: 60,
    urgency: 'high',
    topic: 'silka-rest-timer',
  });
};

export const scheduleRestTimerDelivery = async (
  origin: string,
  timerId: string,
  fireAt: string,
  subscription: PushSubscriptionJSON,
) => {
  const qstash = getQStashConfig();
  const webPush = getWebPushConfig();

  if (!qstash.available || !webPush.available) {
    throw new Error('missing-scheduler-config');
  }

  const fireDate = new Date(fireAt);
  if (Number.isNaN(fireDate.getTime())) {
    throw new Error('invalid-fire-date');
  }

  const notBefore = Math.max(Math.floor(fireDate.getTime() / 1000), Math.floor(Date.now() / 1000));
  const callbackUrl = `${origin.replace(/\/$/, '')}/api/rest-timer/fire`;

  const response = await fetch(`${QSTASH_BASE_URL}/publish/${encodeURIComponent(callbackUrl)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${qstash.token}`,
      'Content-Type': 'application/json',
      'Upstash-Method': 'POST',
      'Upstash-Not-Before': String(notBefore),
      'Upstash-Deduplication-Id': timerId,
      'Upstash-Forward-Authorization': `Bearer ${qstash.fireSecret}`,
      'Upstash-Redact-Fields': 'body,header[Authorization]',
    },
    body: JSON.stringify({
      subscription,
      notification: {
        title: 'Przerwa zakończona',
        body: 'Wracaj do serii. Timer w Siłce dobiegł końca.',
        url: '/',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`qstash-schedule-failed:${response.status}`);
  }

  const payload = await response.json() as { messageId?: string };
  if (!payload.messageId) {
    throw new Error('qstash-missing-message-id');
  }

  return payload.messageId;
};

export const cancelRestTimerDelivery = async (messageId: string) => {
  const qstash = getQStashConfig();
  if (!qstash.available) {
    throw new Error('missing-scheduler-config');
  }

  const response = await fetch(`${QSTASH_BASE_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${qstash.token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`qstash-cancel-failed:${response.status}`);
  }
};
