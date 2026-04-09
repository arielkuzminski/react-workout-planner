/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<unknown>;
};

const REST_TIMER_NOTIFICATION_TAG = 'silka-rest-timer-finished';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), {
  denylist: [/^\/api/],
}));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil((async () => {
    const targetUrl = typeof event.notification.data?.url === 'string' ? event.notification.data.url : '/';
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    for (const client of windowClients) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) {
          await client.navigate(targetUrl);
        }
        return;
      }
    }

    await self.clients.openWindow(targetUrl);
  })());
});

self.addEventListener('push', (event) => {
  const payload = (() => {
    try {
      return event.data?.json() as Record<string, unknown> | undefined;
    } catch {
      return undefined;
    }
  })();

  const title = typeof payload?.title === 'string' ? payload.title : 'Przerwa zakończona';
  const body = typeof payload?.body === 'string'
    ? payload.body
    : 'Wracaj do serii. Timer w Siłce dobiegł końca.';
  const url = typeof payload?.url === 'string' ? payload.url : '/';

  event.waitUntil(self.registration.showNotification(title, {
    body,
    tag: REST_TIMER_NOTIFICATION_TAG,
    requireInteraction: true,
    badge: '/icon-192.png',
    icon: '/icon-192.png',
    data: {
      url,
    },
  }));
});
