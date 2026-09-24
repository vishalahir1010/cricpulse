/* eslint-disable no-undef */
// Firebase Cloud Messaging background handler. Runs as a separate service
// worker from the PWA one (vite-plugin-pwa generates its own sw.js for
// app-shell caching) — the browser supports registering more than one SW
// at different scopes, so this doesn't conflict with it.
//
// This file is a plain static script (not processed by Vite), so it can't
// read import.meta.env. Instead of hardcoding a second copy of the Firebase
// config here, messagingService.js registers it with the config values
// appended as URL query params, which we read back out below — one source
// of truth (the .env values), no duplicate config to keep in sync.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const params = new URL(location.href).searchParams;
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'CricPulse';
  const options = {
    body: payload.notification?.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: payload.data,
  };
  self.registration.showNotification(title, options);
});

// Clicking a notification focuses/opens the relevant match page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const matchId = event.notification.data?.matchId;
  const url = matchId ? `/matches/${matchId}` : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
