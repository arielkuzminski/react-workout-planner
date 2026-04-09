import { getQStashConfig, sendRestTimerPush } from '../_lib/restTimerPush';

interface RequestLike {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: {
    subscription?: PushSubscriptionJSON;
    notification?: {
      title?: string;
      body?: string;
      url?: string;
    };
  };
}

interface ResponseLike {
  status: (code: number) => {
    json: (value: unknown) => void;
  };
}

const getHeader = (headers: RequestLike['headers'], key: string) => {
  const value = headers?.[key] ?? headers?.[key.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const qstash = getQStashConfig();
  const authorization = getHeader(req.headers, 'authorization');
  if (!qstash.fireSecret || authorization !== `Bearer ${qstash.fireSecret}`) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const subscription = req.body?.subscription;
  if (!subscription) {
    res.status(400).json({ error: 'missing-subscription' });
    return;
  }

  try {
    await sendRestTimerPush(subscription, {
      title: req.body?.notification?.title ?? 'Przerwa zakończona',
      body: req.body?.notification?.body ?? 'Wracaj do serii. Timer w Siłce dobiegł końca.',
      url: req.body?.notification?.url ?? '/',
    });
    res.status(200).json({ delivered: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown-error';
    res.status(500).json({ error: message });
  }
}
