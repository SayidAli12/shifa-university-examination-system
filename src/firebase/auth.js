import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db, isDemoMode, firebaseStatus, firebaseError } from './config';
import { doc, getDoc } from 'firebase/firestore';
import { initialSeedData } from '../utils/seedData';

/**
 * Login user via Firebase Authentication.
 * In Live Mode: signs in via Firebase, then reads role from Firestore users/{uid}.
 * In Demo Mode: matches email/password against seed data.
 */
export const loginWithEmailPassword = async (email, password) => {
  if (firebaseStatus === 'ERROR') {
    throw new Error(`Firebase connection error: ${firebaseError || 'Initialization failed'}`);
  }

  if (isDemoMode) {
    // Demo Mode: match against seed credentials
    const demoUser = initialSeedData.users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!demoUser) throw new Error('No account found with that email in Demo Mode.');
    if (password !== 'demo123' && password !== 'password') {
      throw new Error('Demo Mode password: use "demo123" or "password".');
    }
    if (demoUser.status === 'Inactive') {
      throw new Error('Your user account has been deactivated. Access denied.');
    }
    return {
      uid: demoUser.uid,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      status: demoUser.status
    };
  }

  // Live Mode
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUser = userCredential.user;

    // Retrieve user role from Firestore users/{uid}
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      await signOut(auth);
      throw new Error('User profile document missing in Firestore "users" collection. Access denied.');
    }

    const userData = userSnapshot.data();
    if (userData.status === 'Inactive') {
      await signOut(auth);
      throw new Error('Your user account has been deactivated. Access denied.');
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: userData.name || firebaseUser.displayName || 'User',
      role: userData.role || 'teacher',
      status: userData.status || 'Active'
    };
  } catch (err) {
    console.error('[Firebase Auth] Login error:', err);
    throw err;
  }
};

/**
 * Helper to call Vercel Serverless API endpoints with Admin ID token authorization header
 */
const callServerlessApi = async (url, options = {}) => {
  if (!auth?.currentUser) {
    throw new Error('Unauthorized: No logged-in admin user session found.');
  }

  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `API error (${res.status})`);
  }
  return data;
};

/**
 * Serverless User Creation (Firebase Admin SDK via Vercel Functions).
 * Performs atomic Auth + Firestore creation with automatic rollback on failure.
 */
export const createFirebaseUser = async (email, password, extraData = {}) => {
  if (isDemoMode || !auth) {
    return `demo_uid_${Date.now()}`;
  }

  const payload = {
    action: 'create',
    email,
    password,
    name: extraData.name || '',
    role: extraData.role || 'Teacher',
    status: extraData.status || 'Active'
  };

  const response = await callServerlessApi('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return response.uid;
};

/**
 * Serverless API User Management Helpers
 */
export const apiCreateUser = async ({ name, email, password, role, status }) => {
  if (isDemoMode || !auth) {
    return {
      uid: `demo_uid_${Date.now()}`,
      user: { name, email, role, status, createdAt: new Date().toISOString() }
    };
  }
  return callServerlessApi('/api/users', {
    method: 'POST',
    body: JSON.stringify({ action: 'create', name, email, password, role, status })
  });
};

export const apiUpdateUser = async ({ uid, name, email, role, status }) => {
  if (isDemoMode || !auth) return { success: true };
  return callServerlessApi('/api/users', {
    method: 'PUT',
    body: JSON.stringify({ action: 'update', uid, name, email, role, status })
  });
};

export const apiToggleUserStatus = async (uid, status) => {
  if (isDemoMode || !auth) return { success: true };
  return callServerlessApi('/api/users', {
    method: 'PUT',
    body: JSON.stringify({ action: 'toggleStatus', uid, status })
  });
};

export const apiDeleteUser = async (uid) => {
  if (isDemoMode || !auth) return { success: true };
  return callServerlessApi('/api/users', {
    method: 'DELETE',
    body: JSON.stringify({ uid })
  });
};

export const apiResetPassword = async ({ uid, email, newPassword }) => {
  if (isDemoMode || !auth) return { success: true, resetLink: '#' };
  return callServerlessApi('/api/users', {
    method: 'POST',
    body: JSON.stringify({ action: 'resetPassword', uid, email, newPassword })
  });
};


/**
 * Sign out current user
 */
export const logoutUser = async () => {
  if (!isDemoMode && auth) {
    return signOut(auth);
  }
};

/**
 * Listen to Firebase Auth state changes (Live Mode only).
 * In Demo Mode the callback is called once with null — AuthContext handles session.
 */
export const subscribeToAuthChanges = (callback) => {
  if (isDemoMode || !auth) {
    // In Demo Mode, check sessionStorage for a persisted demo session
    const saved = sessionStorage.getItem('university_demo_user');
    if (saved) {
      try { callback(JSON.parse(saved)); }
      catch { sessionStorage.removeItem('university_demo_user'); callback(null); }
    } else {
      callback(null);
    }
    // Return a no-op unsubscribe
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) { callback(null); return; }

    console.info('[Firebase Auth] Signed in — UID present:', !!firebaseUser.uid, '| Email present:', !!firebaseUser.email);

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (userData.status === 'Inactive') {
          console.warn('[Firebase Auth] Account status is Inactive — immediately signing out UID:', firebaseUser.uid);
          await signOut(auth);
          callback(null);
          return;
        }
        console.info('[Firebase Auth] users/{uid} document found — Role:', userData.role, '| Status:', userData.status);
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: userData.name || 'User',
          role: userData.role || 'teacher',
          status: userData.status || 'Active'
        });
      } else {
        // The authenticated user has no Firestore profile document
        console.warn('[Firebase Auth] users/{uid} document NOT FOUND for uid:', firebaseUser.uid);
        console.warn('[Firebase Auth] ACTION REQUIRED: Create a document at Firestore > users >', firebaseUser.uid);
        console.warn('[Firebase Auth] Required fields: { name, email, role: "admin" or "teacher", status: "Active" }');
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          role: null,
          status: 'Active',
          _profileMissing: true
        });
      }
    } catch (err) {
      console.error('[Firebase Auth] Error reading users/{uid}:', err.code, err.message);
      if (err.code === 'permission-denied') {
        console.error('[Firebase Auth] PERMISSION DENIED reading users/' + firebaseUser.uid);
        console.error('[Firebase Auth] ROOT CAUSE: Firestore Security Rules are blocking users/{uid} read.');
        console.error('[Firebase Auth] FIX: Deploy updated firestore.rules to Firebase Console.');
      }
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email,
        role: null,
        status: 'Active',
        _permissionError: err.code,
        _permissionMessage: err.message
      });
    }
  });
};


