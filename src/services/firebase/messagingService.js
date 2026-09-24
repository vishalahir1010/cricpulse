import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getMessagingInstance, db } from './firebaseConfig';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

async function registerMessagingServiceWorker() {
  const params = new URLSearchParams(firebaseConfig);
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`);
}

/**
 * Requests notification permission, registers the FCM service worker, gets
 * a device token, and saves it under the signed-in user's Firestore doc so
 * the checkFollowedMatches Cloud Function can send that device a push.
 * Returns the token on success, or null if permission was denied / push
 * isn't supported in this browser.
 */
export async function enablePushNotifications(uid) {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    throw new Error("Push notifications aren't supported in this browser");
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const registration = await registerMessagingServiceWorker();
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error('VITE_FIREBASE_VAPID_KEY is not set — see README > Push Notifications Setup');
  }

  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return null;

  await setDoc(doc(db, 'users', uid, 'fcmTokens', token), {
    token,
    createdAt: serverTimestamp(),
    userAgent: navigator.userAgent,
  });

  return token;
}

export async function disablePushNotifications(uid, token) {
  if (!token) return;
  await deleteDoc(doc(db, 'users', uid, 'fcmTokens', token));
}

/** Foreground messages (app open in an active tab) — shown via toast instead of a system notification. */
export async function onForegroundMessage(callback) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
