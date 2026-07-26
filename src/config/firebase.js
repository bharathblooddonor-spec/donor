import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase client configuration.
 *
 * These values are not secrets — Firebase web config is designed to ship inside
 * the client, and every Firebase app exposes it. What actually protects your
 * data is firestore.rules, not hiding this config. Read that file before
 * assuming anything here is a security boundary.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  const message =
    `Firebase config is incomplete — missing: ${missingKeys.join(', ')}. ` +
    'Copy .env.example to .env and fill in the values from your Firebase ' +
    'console (Project settings → Your apps → Web app). See DEPLOYMENT.md.';

  // In release builds this is unrecoverable, so fail at startup rather than
  // letting every screen show a confusing "could not connect" error.
  if (!__DEV__) throw new Error(message);
  console.warn(`[firebase] ${message}`);
}

// Expo fast-refresh re-runs this module, so guard against double-initialising.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * The default browser persistence uses localStorage, which does not exist in
 * React Native — without AsyncStorage persistence users are silently signed out
 * every time the app is killed.
 */
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Already initialised by a previous fast-refresh pass.
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
