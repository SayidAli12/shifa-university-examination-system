import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Safely initialize Firebase Admin SDK singleton in Vercel Serverless Function environment
 */
const initAdminApp = () => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId   = process.env.FIREBASE_PROJECT_ID   || process.env.VITE_FIREBASE_PROJECT_ID   || 'shifa-university';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.VITE_FIREBASE_CLIENT_EMAIL;
  let privateKey    = process.env.FIREBASE_PRIVATE_KEY  || process.env.VITE_FIREBASE_PRIVATE_KEY;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return initializeApp({ credential: cert(sa) });
    } catch (e) {
      console.error('[Firebase Admin] Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  }

  if (clientEmail && privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
  }

  // Application Default Credentials or Project ID fallback
  return initializeApp({ projectId });
};

const adminApp  = initAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb   = getFirestore(adminApp);

/**
 * Verify incoming Request ID token and ensure requesting user is an active Admin.
 * Returns { adminUid, adminEmail, adminName } or sends appropriate error HTTP response.
 */
export const verifyAdminRequest = async (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    return null;
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  if (!idToken) {
    res.status(401).json({ error: 'Unauthorized: Bearer token empty' });
    return null;
  }

  try {
    // 1. Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminUid = decoded.uid;

    // 2. Fetch requester's Firestore document
    const adminDocSnap = await adminDb.collection('users').doc(adminUid).get();
    if (!adminDocSnap.exists) {
      res.status(403).json({ error: 'Forbidden: Admin user document not found in Firestore' });
      return null;
    }

    const adminData = adminDocSnap.data();
    const role = (adminData.role || '').toLowerCase();
    const status = adminData.status;

    // 3. Verify role = "Admin" and status = "Active"
    if (role !== 'admin' || status !== 'Active') {
      res.status(403).json({ error: 'Forbidden: Requester does not have an active Admin role' });
      return null;
    }

    return {
      adminUid,
      adminEmail: decoded.email || adminData.email,
      adminName: adminData.name || 'Admin'
    };
  } catch (err) {
    console.error('[Admin Verification Error]:', err.code, err.message);
    res.status(401).json({ error: `Unauthorized: ${err.message}` });
    return null;
  }
};

/**
 * Write audit log record to Firestore auditLogs collection
 */
export const recordAuditLog = async ({ action, adminUid, adminEmail, targetUid, details }) => {
  try {
    await adminDb.collection('auditLogs').add({
      action,
      adminUid,
      adminEmail,
      targetUid,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Audit Log Error]: Failed to write log:', err.message);
  }
};

export { adminApp, adminAuth, adminDb };
