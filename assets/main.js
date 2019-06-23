async function installServiceWorker () {
  const reg = await navigator.serviceWorker.register('./service-worker.js');
  console.log('[SW] Register', reg);
}

installServiceWorker();

navigator.serviceWorker.addEventListener('message', async (event) => {
  const message = event.data;
  if (message.type === 'ping') {
    console.log(`[main] ${message.text}`);
  }
});

navigator.serviceWorker.addEventListener('message', async (event) => {
  const message = event.data;
  switch (message.type) {
    case 'sw/install': {
      // eslint-disable-next-line no-alert
      const ok = window.confirm('New version is available. Reload now?');
      if (ok) {
        window.location.reload();
      }
      break;
    }

    default: // do nothing
  }
});

/**
 * @param {number} ms
 */
function sleep (ms) {
  return new Promise((f) => setTimeout(f, ms));
}

async function main () {
  const reg = await navigator.serviceWorker.ready;
  if (reg.waiting) {
    await sleep(500); // just in case when infinite loop occurs accidentally

    const message = { type: 'sw/skipWaiting' };
    reg.waiting.postMessage(message);
    window.location.reload();

    return;
  }

  console.log('[main] Ready!');
}

main();

/**
 * @param {HTMLInputElement} el
 * @param {boolean} enabled
 */
function turnNotification (el, enabled) {
  const { permission } = Notification;
  if (permission === 'granted') {
    // eslint-disable-next-line no-param-reassign
    el.checked = enabled;
  } else if (permission === 'denied') {
    // eslint-disable-next-line no-param-reassign
    el.checked = false;

    // eslint-disable-next-line no-alert
    window.alert(
      'You have denied push Notification. You have to update your decision.',
    );
  } else {
    // eslint-disable-next-line no-param-reassign
    el.checked = false;

    Notification.requestPermission((newPermission) => {
      if (newPermission === 'default') {
        // eslint-disable-next-line no-alert
        window.alert(
          'You may have to reload in order to update your decision.',
        );
      } else {
        turnNotification(el, enabled);
      }
    });
  }
}

/** @type {HTMLInputElement} */
const elNotificationEnabled = document.querySelector('#notificationEnabled');
elNotificationEnabled.addEventListener('click', () => {
  const enabled = elNotificationEnabled.checked;
  turnNotification(elNotificationEnabled, enabled);
});

async　function showNotification () {
  if (Notification.permission !== 'granted') {
    return;
  }

  const reg = await navigator.serviceWorker.controller;
  if (reg) {
    const message = { type: 'notification' };
    reg.postMessage(message);
  }
}

/** @type {HTMLButtonElement} */
const elShowNotification = document.querySelector('#showNotification');
elShowNotification.addEventListener('click', () => {
  showNotification();
});

// async function getPushEndpoint () {
//   const reg = await navigator.serviceWorker.ready;
//   const sub = await reg.pushManager.getSubscription();
//   if (sub) {
//     return sub.endpoint;
//   }

//   const newSub = await reg.pushManager.subscribe({
//     userVisibleOnly: true,
//   });
//   // eslint-disable-next-line no-console
//   console.log('End point (new)', newSub.endpoint);
//   return newSub.endpoint;
// }

// getPushEndpoint().then((endpoint) => {
//   const serverKey = 'XXXX';
//   const command = `curl "${endpoint}" \
//   --request POST --header "TTL: 60" --header "Content-Length: 0" \
//   --header "Authorization: key=${serverKey}"`;
//   console.log(command);
// });
