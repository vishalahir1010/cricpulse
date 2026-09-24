import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Avoid re-initializing during Vite HMR
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Messaging (push notifications) isn't supported everywhere — Safari <16,
// non-HTTPS contexts, and browsers with no service worker support all
// return false here. Everything that uses `getMessagingInstance()` must
// handle a null result gracefully rather than assuming push always works.
let messagingInstance = null;
let messagingChecked = false;

export async function getMessagingInstance() {
  if (messagingChecked) return messagingInstance;
  messagingChecked = true;
  if (await isSupported().catch(() => false)) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
}

export default app;
