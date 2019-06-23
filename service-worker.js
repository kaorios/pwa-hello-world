/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
// eslint-disable-next-line no-restricted-globals
const sw = self;

async function updateCache () {
  const cache = await sw.caches.open('pwa-hello-world');
  await cache.addAll([
    '/pwa-hello-world/',
  ]);
}

sw.addEventListener('install', (event) => {
  console.log('[SW] Install!');
  const p = updateCache()
    .then(async () => {
      const clients = await sw.clients.matchAll({ includeUncontrolled: true });
      clients.forEach((client) => {
        const message = { type: 'sw/install' };
        client.postMessage(message);
      });
    });
  event.waitUntil(p);
});

/**
 * @param {string} body
 */
function showNotification (body) {
  const title = 'PWA';
  /** @type {NotificationOptions} */
  const options = {
    actions: [
      {
        action: 'explore',
        title: 'Explore this new world',
      },
      {
        action: 'close',
        title: 'Close notification',
      },
    ],
    body,
    icon: '/pwa-hello-world/assets/gpui/icon-512.png',
  };
  sw.registration.showNotification(title, options);
}

sw.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  sw.clients.claim();
  showNotification('Activated!');
});

sw.addEventListener('notificationclick', (event) => {
  const { action, notification } = event;

  if (action === 'close') {
    notification.close();
  } else {
    sw.clients.openWindow('http://www.example.com');
    notification.close();
  }
});

/**
 * @param {RequestInfo} key
 */
async function loadCache (key) {
  const cache = await sw.caches.open('pwa-hello-world');
  return await cache.match(key) || new Response('', { status: 404 });
}

sw.addEventListener('fetch', (event) => {
  const sUrl = event.request.url;
  // console.log('[SW] Fetch', sUrl);

  const url = new URL(sUrl);
  if (url.pathname === '/pwa-hello-world/') {
    const p = loadCache(url.pathname);
    event.respondWith(p);
  }
});

sw.addEventListener('message', async (event) => {
  const message = event.data;

  switch (message.type) {
    case 'sw/skipWaiting': {
      sw.skipWaiting();
      break;
    }
    case 'notification': {
      showNotification('Notification!');
      break;
    }

    default: // do nothing;
  }
});

// sw.addEventListener('push', (event) => {
//   const p = showNotification('Pushed!');
//   event.waitUntil(p);
// });
