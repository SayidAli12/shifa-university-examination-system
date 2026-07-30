import { adminAuth, adminDb, verifyAdminRequest, recordAuditLog } from '../_lib/adminInit.js';

export default async function handler(req, res) {
  // Set CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify Admin credentials for all endpoints
  const adminInfo = await verifyAdminRequest(req, res);
  if (!adminInfo) return; // Response already sent by verifyAdminRequest if unauthorized

  const { adminUid, adminEmail } = adminInfo;

  try {
    const action = req.body?.action || req.query?.action || (
      req.method === 'POST' ? 'create' :
      req.method === 'PUT' ? 'update' :
      req.method === 'DELETE' ? 'delete' : null
    );

    // ──────────────────────────────────────────────────────────────────────────
    // 1. CREATE USER (Atomic Operation with Rollback)
    // ──────────────────────────────────────────────────────────────────────────
    if (req.method === 'POST' && action === 'create') {
      const { name, email, password, role, status } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Bad Request: Missing required fields (name, email, password, role).' });
      }

      const userStatus = status || 'Active';
      const isAccountDisabled = userStatus === 'Inactive';

      let newAuthUser = null;
      try {
        // Step 1: Create Firebase Authentication Account
        newAuthUser = await adminAuth.createUser({
          email: email.trim().toLowerCase(),
          password: password,
          displayName: name.trim(),
          disabled: isAccountDisabled
        });
        console.info(`[Serverless API] Auth user created — UID: ${newAuthUser.uid}`);
      } catch (authErr) {
        console.error('[Serverless API] Auth creation failed:', authErr.code, authErr.message);
        const code = authErr.code || '';
        if (code === 'auth/email-already-exists' || authErr.message.includes('email')) {
          return res.status(400).json({ error: 'This email is already registered in Firebase Authentication.' });
        }
        return res.status(400).json({ error: authErr.message || 'Failed to create Authentication user.' });
      }

      // Step 2: Create Firestore users/{uid} Document with UID as doc ID
      const newUid = newAuthUser.uid;
      const timestamp = new Date().toISOString();

      const userDocPayload = {
        uid: newUid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        status: userStatus,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: adminUid
      };

      try {
        await adminDb.collection('users').doc(newUid).set(userDocPayload);
        console.info(`[Serverless API] Firestore users/${newUid} document created successfully.`);
      } catch (dbErr) {
        console.error('[Serverless API] Firestore document creation failed. Initiating atomic rollback...', dbErr);

        // Atomic Rollback: Delete the newly created Auth account
        try {
          await adminAuth.deleteUser(newUid);
          console.info(`[Serverless API] Rollback successful: Auth account ${newUid} deleted.`);
        } catch (rollbackErr) {
          console.error(`[Serverless API] CRITICAL: Rollback failed for UID ${newUid}:`, rollbackErr.message);
        }

        return res.status(500).json({
          error: `Firestore user profile creation failed: ${dbErr.message}. The Authentication account was automatically rolled back.`
        });
      }

      // Record Audit Log
      await recordAuditLog({
        action: 'CREATE_USER',
        adminUid,
        adminEmail,
        targetUid: newUid,
        details: { name: userDocPayload.name, email: userDocPayload.email, role: userDocPayload.role, status: userDocPayload.status }
      });

      return res.status(201).json({
        success: true,
        message: `User "${name.trim()}" created successfully.`,
        uid: newUid,
        user: userDocPayload
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. UPDATE USER (Name, Email, Role, Status)
    // ──────────────────────────────────────────────────────────────────────────
    if (req.method === 'PUT' && action === 'update') {
      const { uid, name, email, role, status } = req.body;

      if (!uid) {
        return res.status(400).json({ error: 'Bad Request: Target user UID is required.' });
      }

      const timestamp = new Date().toISOString();
      const updates = { updatedAt: timestamp };
      const authUpdates = {};

      if (name) {
        updates.name = name.trim();
        authUpdates.displayName = name.trim();
      }
      if (email) {
        updates.email = email.trim().toLowerCase();
        authUpdates.email = email.trim().toLowerCase();
      }
      if (role) {
        updates.role = role;
      }
      if (status) {
        updates.status = status;
        authUpdates.disabled = (status === 'Inactive');
      }

      // Update Firebase Auth if email, name, or status changed
      if (Object.keys(authUpdates).length > 0) {
        try {
          await adminAuth.updateUser(uid, authUpdates);
        } catch (authErr) {
          console.error(`[Serverless API] Failed to update Auth user ${uid}:`, authErr.message);
          return res.status(400).json({ error: `Auth update failed: ${authErr.message}` });
        }
      }

      // Update Firestore document
      await adminDb.collection('users').doc(uid).update(updates);

      // Record Audit Log
      await recordAuditLog({
        action: 'UPDATE_USER',
        adminUid,
        adminEmail,
        targetUid: uid,
        details: updates
      });

      return res.status(200).json({
        success: true,
        message: 'User profile updated successfully.',
        updates
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. TOGGLE STATUS (Enable / Disable)
    // ──────────────────────────────────────────────────────────────────────────
    if (req.method === 'PUT' && action === 'toggleStatus') {
      const { uid, status } = req.body;

      if (!uid || !status) {
        return res.status(400).json({ error: 'Bad Request: UID and status are required.' });
      }

      if (uid === adminUid) {
        return res.status(400).json({ error: 'Bad Request: Admin cannot deactivate their own account.' });
      }

      const isAccountDisabled = status === 'Inactive';
      const timestamp = new Date().toISOString();

      // Synchronize Firebase Authentication disabled state
      await adminAuth.updateUser(uid, { disabled: isAccountDisabled });

      // Synchronize Firestore status
      await adminDb.collection('users').doc(uid).update({
        status,
        updatedAt: timestamp
      });

      // Record Audit Log
      await recordAuditLog({
        action: 'TOGGLE_STATUS',
        adminUid,
        adminEmail,
        targetUid: uid,
        details: { status, disabled: isAccountDisabled }
      });

      return res.status(200).json({
        success: true,
        message: `User status set to ${status}.`
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. RESET PASSWORD (Generate Link or Direct Reset)
    // ──────────────────────────────────────────────────────────────────────────
    if (req.method === 'POST' && action === 'resetPassword') {
      const { email, uid, newPassword } = req.body;

      if (!email && !uid) {
        return res.status(400).json({ error: 'Bad Request: User email or UID is required.' });
      }

      let targetEmail = email;
      let targetUid = uid;

      if (!targetEmail && targetUid) {
        const userRec = await adminAuth.getUser(targetUid);
        targetEmail = userRec.email;
      }

      if (newPassword) {
        // Direct password reset
        await adminAuth.updateUser(targetUid, { password: newPassword });
        await recordAuditLog({
          action: 'PASSWORD_RESET',
          adminUid,
          adminEmail,
          targetUid,
          details: { method: 'DIRECT_SET' }
        });
        return res.status(200).json({
          success: true,
          message: 'Password updated successfully.'
        });
      } else {
        // Generate secure reset link
        const resetLink = await adminAuth.generatePasswordResetLink(targetEmail);
        await recordAuditLog({
          action: 'PASSWORD_RESET',
          adminUid,
          adminEmail,
          targetUid,
          details: { method: 'RESET_LINK_GENERATED', email: targetEmail }
        });
        return res.status(200).json({
          success: true,
          message: `Password reset link generated for ${targetEmail}.`,
          resetLink
        });
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. DELETE USER (Auth + Firestore)
    // ──────────────────────────────────────────────────────────────────────────
    if ((req.method === 'DELETE' || (req.method === 'POST' && action === 'delete'))) {
      const uid = req.body?.uid || req.query?.uid;

      if (!uid) {
        return res.status(400).json({ error: 'Bad Request: UID is required for deletion.' });
      }

      if (uid === adminUid) {
        return res.status(400).json({ error: 'Bad Request: Admin cannot delete their own account.' });
      }

      // Step 1: Delete Firebase Auth User
      try {
        await adminAuth.deleteUser(uid);
        console.info(`[Serverless API] Auth user ${uid} deleted.`);
      } catch (authErr) {
        if (authErr.code !== 'auth/user-not-found') {
          console.warn(`[Serverless API] Auth user delete warning for ${uid}:`, authErr.message);
        }
      }

      // Step 2: Delete Firestore Document
      await adminDb.collection('users').doc(uid).delete();

      // Record Audit Log
      await recordAuditLog({
        action: 'DELETE_USER',
        adminUid,
        adminEmail,
        targetUid: uid,
        details: { deletedAt: new Date().toISOString() }
      });

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully.'
      });
    }

    return res.status(405).json({ error: `Method ${req.method} or action "${action}" not allowed.` });

  } catch (err) {
    console.error('[Serverless API Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error.' });
  }
}
