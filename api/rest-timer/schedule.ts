import { scheduleRestTimerDelivery } from '../_lib/restTimerPush';

interface RequestLike {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: {
    timerId?: string;
    fireAt?: string;
    subscription?: PushSubscriptionJSON;
  };
}

interface ResponseLike {
  status: (code: number) => {
    json: (value: unknown) => void;
  };
}

const getOrigin = (request: RequestLike) => {
  const forwardedHost = request.headers?.['x-forwarded-host'];
  const forwardedProto = request.headers?.['x-forwarded-proto'];
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;

  if (host) {
    return `${proto ?? 'https'}://${host}`;
  }

  return process.env.APP_BASE_URL ?? '';
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const timerId = req.body?.timerId;
  const fireAt = req.body?.fireAt;
  const subscription = req.body?.subscription;
  const origin = getOrigin(req);

  if (!timerId || !fireAt || !subscription || !origin) {
    res.status(400).json({ error: 'invalid-request' });
    return;
  }

  try {
    const messageId = await scheduleRestTimerDelivery(origin, timerId, fireAt, subscription);
    res.status(200).json({ messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown-error';
    const statusCode = message.includes('missing-scheduler-config') ? 503 : 500;
    res.status(statusCode).json({ error: message });
  }
}
