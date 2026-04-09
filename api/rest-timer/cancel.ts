import { cancelRestTimerDelivery } from '../_lib/restTimerPush';

interface RequestLike {
  method?: string;
  body?: {
    runId?: string;
  };
}

interface ResponseLike {
  status: (code: number) => {
    json: (value: unknown) => void;
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const runId = req.body?.runId;
  if (!runId) {
    res.status(400).json({ error: 'missing-run-id' });
    return;
  }

  try {
    await cancelRestTimerDelivery(runId);
    res.status(200).json({ cancelled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown-error';
    const statusCode = message.includes('missing-scheduler-config') ? 503 : 500;
    res.status(statusCode).json({ error: message });
  }
}
