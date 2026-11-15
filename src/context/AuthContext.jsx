import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, provisioningAuth, db } from '../firebase';
import { account } from '../appwrite';
import { verifyLegacyCredentials, LEGACY_AUTH_REASONS } from '../utils/legacyAuth';

// Firebase sign-in failures that can mean "this account has not been moved over
// from Appwrite yet" (the exact code depends on email-enumeration protection).
const LEGACY_FALLBACK_CODES = [
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/user-not-found',
  'auth/wrong-password',
];

// Roles that unlock staff data. Mirrors isStaff() in firestore.rules.
const STAFF_ROLES = ['developer', 'admin', 'branch_admin'];

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

const LEGACY_FAILURE_MESSAGES = {
  [LEGACY_AUTH_REASONS.INVALID]: INVALID_CREDENTIALS_MESSAGE,
  [LEGACY_AUTH_REASONS.BLOCKED]: 'This account has been disabled. Please contact your church administrator.',
  [LEGACY_AUTH_REASONS.RATE_LIMITED]: 'Too many sign-in attempts. Please wait a while and try again, or use "Forgot password?" to set a new password.',
  [LEGACY_AUTH_REASONS.UNAVAILABLE]: 'We could not verify your existing password right now. Please try again in a moment, or use "Forgot password?" to set a new password.',
};

const FIREBASE_AUTH_MESSAGES = {
  'auth/too-many-requests': 'Too many sign-in attempts. Please wait a few minutes and try again, or use "Forgot password?" to set a new password.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact your church administrator.',
  'auth/invalid-email': 'Please enter a valid email address.',
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const saveToLocal = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userBranch', userData.branch);
  };

  const clearLocal = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userBranch');
  };

  const syncUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return null;

    try {
      const email = firebaseUser.email;
      const now = new Date().toISOString();

      const userDoc = await getDoc(doc(db, 'users', email));
      let userData;

      // Only fields a user is allowed to change on their own profile
      // (see users/{email} in firestore.rules). Roles are never written here.
      const activity = {
        verified: firebaseUser.emailVerified || false,
        accessedAt: now,
        lastActive: now
      };

      if (userDoc.exists()) {
        const fireData = userDoc.data();
        const grantedRole = fireData.role || 'guest';

        // A staff role only applies once this login is tied to the profile:
        // linked before the rules were tightened, or email verified since.
        // Until then the security rules treat the account as a guest too.
        const trusted = firebaseUser.emailVerified || fireData.firebaseUid === firebaseUser.uid;
        const needsEmailVerification = STAFF_ROLES.includes(grantedRole) && !trusted;

        userData = {
          registration: fireData.createdAt || now,
          appwriteId: '',
          ...fireData,
          email,
          role: needsEmailVerification ? 'guest' : grantedRole,
          pendingRole: needsEmailVerification ? grantedRole : null,
          needsEmailVerification,
          branch: fireData.branch || 'all',
          name: fireData.name || firebaseUser.displayName || '',
          labels: fireData.labels || [],
          status: fireData.status || 'Active',
          firebaseUid: firebaseUser.uid,
          ...activity
        };

        try {
          await setDoc(doc(db, 'users', email), activity, { merge: true });
        } catch (activityErr) {
          console.warn('Profile activity sync note:', activityErr?.code || activityErr?.message);
        }
      } else {
        // No registry entry yet: seed an unprivileged one. An administrator
        // grants roles from User Management.
        const seed = {
          email,
          role: 'guest',
          branch: 'all',
          name: firebaseUser.displayName || '',
          labels: [],
          status: 'Pending',
          registration: now,
          createdAt: now,
          ...activity
        };
        await setDoc(doc(db, 'users', email), seed, { merge: true });
        userData = { ...seed, firebaseUid: firebaseUser.uid, needsEmailVerification: false, pendingRole: null };
      }

      setUser(userData);
      saveToLocal(userData);
      return userData;
    } catch (err) {
      console.error('Profile Sync Error:', err?.code || err?.message);
      const fallbackUser = {
        email: firebaseUser.email,
        role: 'guest',
        branch: 'all',
        name: firebaseUser.displayName || '',
        firebaseUid: firebaseUser.uid
      };
      setUser(fallbackUser);
      saveToLocal(fallbackUser);
      return fallbackUser;
    }
  }, []);

  // login/signup sync the profile themselves; the auth listener must not race
  // them (it would seed a blank profile before signup writes the real one).
  const authFlowActive = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!authFlowActive.current) {
          await syncUserProfile(firebaseUser);
        }
      } else {
        if (localStorage.getItem('isAuthenticated') === 'true') {
          clearLocal();
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserProfile]);

  const sendVerificationQuietly = async (firebaseUser) => {
    try {
      await sendEmailVerification(firebaseUser);
    } catch (verifyErr) {
      console.warn('Verification email note:', verifyErr?.code || verifyErr?.message);
    }
  };

  /**
   * Verifies the password against Appwrite and, if it is correct, creates the
   * matching Firebase Auth account so every later sign-in is native.
   */
  const migrateLegacyUser = async (cleanEmail, password) => {
    const legacy = await verifyLegacyCredentials(cleanEmail, password);
    if (!legacy.success) {
      throw new Error(LEGACY_FAILURE_MESSAGES[legacy.reason] || INVALID_CREDENTIALS_MESSAGE);
    }

    let firebaseUser;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUser = userCred.user;
    } catch (createErr) {
      if (createErr.code !== 'auth/email-already-in-use') throw createErr;
      // A Firebase account already exists with a different password (typically
      // created by a "Forgot password?" request that was never completed). The
      // old password is correct but cannot be attached from the browser, so
      // finish the move with a reset link instead of a bare rejection.
      let sent = true;
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch (resetErr) {
        sent = false;
        console.warn('Legacy migration reset email note:', resetErr?.code || resetErr?.message);
      }
      throw new Error(sent
        ? `Your account has moved to our new sign-in system and needs a new password. We have emailed a reset link to ${cleanEmail}. Open it to choose a password, then sign in here.`
        : 'Your account has moved to our new sign-in system and needs a new password. Please use "Forgot password?" below to set one.');
    }

    // The account now exists; nothing below may block the sign-in.
    try {
      const existingDoc = await getDoc(doc(db, 'users', cleanEmail));
      const displayName = (existingDoc.exists() ? existingDoc.data().name : '') || legacy.name;
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }
      if (existingDoc.exists()) {
        await setDoc(doc(db, 'users', cleanEmail), {
          migratedToFirebase: true,
          migratedAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        }, { merge: true });
      }
    } catch (syncErr) {
      console.warn('Legacy migration profile sync note:', syncErr?.message);
    }
    await sendVerificationQuietly(firebaseUser);

    return firebaseUser;
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    const cleanEmail = email.trim().toLowerCase();

    // Restricted Test Emails Check
    const restrictedEmails = ['kokrobitey@ricgcw.com', 'admin@ricgcw.com'];
    if (restrictedEmails.includes(cleanEmail)) {
      const message = 'Please use your own personal email to sign up. This email has been restricted for test users only and you do not have access.';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }

    authFlowActive.current = true;
    try {
      let firebaseUser = null;

      // 1. First, attempt native Firebase Authentication
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        firebaseUser = userCredential.user;
      } catch (fbErr) {
        if (!LEGACY_FALLBACK_CODES.includes(fbErr.code)) throw fbErr;
        // 2. Not (yet) valid in Firebase Auth: check the legacy Appwrite directory
        firebaseUser = await migrateLegacyUser(cleanEmail, password);
      }

      const profile = await syncUserProfile(firebaseUser);
      return profile;
    } catch (err) {
      console.error('Login Error:', err?.code || err?.message);
      const message = FIREBASE_AUTH_MESSAGES[err.code] || err.message || INVALID_CREDENTIALS_MESSAGE;
      setError(message);
      throw new Error(message);
    } finally {
      authFlowActive.current = false;
      setLoading(false);
    }
  };

  const signup = async (email, password, name, branch) => {
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Restricted Test Emails Check
    const restrictedEmails = ['kokrobitey@ricgcw.com', 'admin@ricgcw.com'];
    if (restrictedEmails.includes(cleanEmail)) {
      const message = 'Please use your own personal email to sign up. This email has been restricted for test users only and you do not have access.';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }

    authFlowActive.current = true;
    try {
      // Self-registration never grants staff access: the chosen branch is
      // recorded as a request for an administrator to approve.
      const requestedRole = branch === 'Overseer' ? 'admin' : 'branch_admin';
      const actualBranch = branch === 'Overseer' ? 'all' : branch;
      const now = new Date().toISOString();

      // 1. Create Firebase Auth Account
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(userCred.user, { displayName: name });
      await sendVerificationQuietly(userCred.user);

      // 2. Seed the registry entry, unless an administrator (or the legacy
      //    system) already created one for this email. That entry keeps its
      //    role and takes effect once the email address is verified.
      const existing = await getDoc(doc(db, 'users', cleanEmail));
      if (!existing.exists()) {
        await setDoc(doc(db, 'users', cleanEmail), {
          name,
          email: cleanEmail,
          role: 'guest',
          labels: [],
          branch: actualBranch,
          requestedRole,
          requestedBranch: actualBranch,
          status: 'Pending',
          migratedToFirebase: true,
          lastActive: now,
          createdAt: now
        });
      }

      const profile = await syncUserProfile(userCred.user);
      return profile;
    } catch (err) {
      console.error('Signup Error:', err?.code || err?.message);
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in instead, or use "Forgot password?" to set a new password.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      setError(message);
      throw new Error(message);
    } finally {
      authFlowActive.current = false;
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("SignOut Error:", err);
    }
    try {
      await account.deleteSession('current');
    } catch (sessionErr) {
      console.warn("Appwrite session cleanup note:", sessionErr?.message);
    }
    clearLocal();
    setUser(null);
  }, []);

  const resetPassword = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }

    try {
      // 1. Make sure a Firebase account exists, otherwise no email is sent for
      //    people who have not signed in since the move from Appwrite. The
      //    placeholder gets a random password nobody knows and is created on
      //    the separate provisioning instance so this browser is never signed
      //    in as that person. Completing the reset link also verifies the
      //    email address, which is what activates their existing role.
      try {
        const tempPassword = `${crypto.randomUUID()}Aa1!`;
        await createUserWithEmailAndPassword(provisioningAuth, cleanEmail, tempPassword);
        await signOut(provisioningAuth);
      } catch (provisionErr) {
        if (provisionErr?.code !== 'auth/email-already-in-use') {
          console.warn('User provision check note:', provisionErr?.code || provisionErr?.message);
        }
      }

      // 2. Send the password reset email now that the account is guaranteed to exist
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true, message: 'Password reset link sent! Please check your email inbox.' };
    } catch (err) {
      console.error("Reset Password Error:", err);
      let message = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      }
      throw new Error(message);
    }
  };

  /** Re-sends the email verification link to the signed-in account. */
  const resendVerification = async () => {
    if (!auth.currentUser) throw new Error('Please sign in again.');
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err) {
      console.error('Verification Email Error:', err?.code || err?.message);
      throw new Error(FIREBASE_AUTH_MESSAGES[err.code] || 'Could not send the verification email. Please try again in a few minutes.');
    }
  };

  /** Reloads the account and its token (e.g. after the email was verified). */
  const refreshSession = async () => {
    const current = auth.currentUser;
    if (!current) return null;
    await current.reload();
    await current.getIdToken(true);
    return syncUserProfile(auth.currentUser);
  };

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }, [user]);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    resendVerification,
    refreshSession,
    hasRole,
    isAdmin: user?.role === 'admin',
    isDeveloper: user?.role === 'developer',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

