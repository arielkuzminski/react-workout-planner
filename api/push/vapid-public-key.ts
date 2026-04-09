import { getQStashConfig, getWebPushConfig } from '../_lib/restTimerPush';

export default function handler(_req: { method?: string }, res: {
  status: (code: number) => { json: (value: unknown) => void };
}) {
  const webPush = getWebPushConfig();
  const qstash = getQStashConfig();

  res.status(200).json({
    available: webPush.available,
    publicKey: webPush.available ? webPush.publicKey : null,
    schedulerAvailable: qstash.available,
  });
}
