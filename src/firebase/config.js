import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Read all required Firebase config values from Vite env variables
const requiredEnvVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID
};

// Identify any missing or empty required environment variables
export const missingFirebaseVars = Object.keys(requiredEnvVars).filter(
  (key) => !requiredEnvVars[key] || requiredEnvVars[key].trim() === ''
);

// Connection Status: 'CONFIG_MISSING' | 'CONNECTING' | 'LIVE' | 'ERROR'
export let firebaseStatus = missingFirebaseVars.length === 0 ? 'CONNECTING' : 'CONFIG_MISSING';
export let firebaseError = null;

let app = null;
let auth = null;
let db = null;

/**
 * Maps Firebase error codes and messages into human-readable messages.
 */
export const formatFirebaseError = (err) => {
  if (!err) return 'Unknown Firebase error occurred.';
  const code = err.code || '';
  const message = err.message || '';

  if (code.includes('invalid-api-key') || message.includes('api-key')) {
    return 'Invalid Firebase API key provided in environment variables.';
  }
  if (code.includes('user-not-found')) {
    return 'No user account found matching this email in Firebase Authentication.';
  }
  if (code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Invalid authentication credentials provided.';
  }
  if (code.includes('permission-denied') || message.includes('permission-denied')) {
    return 'Firestore permission denied. Check your Firestore Security Rules.';
  }
  if (code.includes('unavailable')) {
    return 'Firestore database service is currently unavailable or network is unreachable.';
  }
  if (code.includes('failed-precondition')) {
    return 'Firestore database not initialized. Ensure Firestore database is created in Firebase Console.';
  }
  if (code.includes('not-found')) {
    return 'Requested Firebase project or document not found.';
  }

  return message || 'Firebase operational error.';
};

if (missingFirebaseVars.length === 0) {
  try {
    const firebaseConfig = {
      apiKey: requiredEnvVars.VITE_FIREBASE_API_KEY,
      authDomain: requiredEnvVars.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: requiredEnvVars.VITE_FIREBASE_PROJECT_ID,
      storageBucket: requiredEnvVars.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: requiredEnvVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: requiredEnvVars.VITE_FIREBASE_APP_ID
    };

    app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db   = getFirestore(app);
    console.info('[Firebase] SDK Initialized — Project:', firebaseConfig.projectId);
  } catch (err) {
    firebaseStatus = 'ERROR';
    firebaseError = formatFirebaseError(err);
    console.error('[Firebase] Initialization error:', err);
  }
} else {
  firebaseStatus = 'CONFIG_MISSING';
  console.warn(
    '[Firebase] Configuration missing required variables:', missingFirebaseVars.join(', ')
  );
}

/**
 * Performs a real lightweight Firestore connectivity test.
 */
export const testFirestoreConnection = async () => {
  if (missingFirebaseVars.length > 0) {
    firebaseStatus = 'CONFIG_MISSING';
    return { status: 'CONFIG_MISSING', error: null };
  }
  if (!db) {
    firebaseStatus = 'ERROR';
    firebaseError = 'Firebase app not initialized';
    return { status: 'ERROR', error: firebaseError };
  }

  firebaseStatus = 'CONNECTING';
  try {
    // Perform a lightweight Firestore reachability test
    const pingRef = doc(db, '_connection_test', 'ping');
    await getDoc(pingRef);
    firebaseStatus = 'LIVE';
    firebaseError = null;
    return { status: 'LIVE', error: null };
  } catch (err) {
    // If permission-denied, it proves real network connection and Firestore security rule response
    if (err.code === 'permission-denied' || (err.message && err.message.includes('permission-denied'))) {
      firebaseStatus = 'LIVE';
      firebaseError = null;
      return { status: 'LIVE', error: null };
    }
    firebaseStatus = 'ERROR';
    firebaseError = formatFirebaseError(err);
    console.error('[Firebase] Connectivity verification failed:', err);
    return { status: 'ERROR', error: firebaseError };
  }
};

// Demo Mode is active ONLY when configuration variables are missing.
// When credentials are provided, automatic fallback to demo mode is DISABLED.
export const isDemoMode = missingFirebaseVars.length > 0;

export { app, auth, db };


