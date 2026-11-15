import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail
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
      const cleanEmail = (email || '').toLowerCase();

      // Priority 1: Check Firestore for detailed profile
      const userDoc = await getDoc(doc(db, 'users', email));
      let userData;

      const firebaseMetadata = {
        firebaseUid: firebaseUser.uid,
        verified: firebaseUser.emailVerified || false,
        accessedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      if (userDoc.exists()) {
        const fireData = userDoc.data();
        let role = fireData.role || 'guest';
        const labels = fireData.labels || [];
        const isDev = labels.includes('developer') || cleanEmail === 'isemuk8@gmail.com';
        const isAdminLabel = labels.includes('admin') || cleanEmail === 'innercourtch@gmail.com';
        
        // Developer / Admin overrides
        if (isDev) role = 'developer';
        else if (isAdminLabel && role !== 'developer') role = 'admin';

        userData = {
          email: email,
          role: role,
          branch: fireData.branch || 'all',
          name: fireData.name || firebaseUser.displayName || '',
          labels: labels,
          status: fireData.status || 'Active',
          registration: fireData.registration || fireData.createdAt || new Date().toISOString(),
          appwriteId: fireData.appwriteId || '',
          ...fireData,
          ...firebaseMetadata
        };

        // Sync back to Firestore with fresh metadata
        await setDoc(doc(db, 'users', email), { 
          role: userData.role,
          name: userData.name,
          ...firebaseMetadata,
          status: userData.status
        }, { merge: true });
      } else {
        // Priority 2: Use defaults if Firestore entry missing
        userData = {
          email: email,
          role: cleanEmail === 'isemuk8@gmail.com' ? 'developer' : (cleanEmail === 'innercourtch@gmail.com' ? 'admin' : 'guest'),
          branch: 'all',
          name: firebaseUser.displayName || '',
          labels: cleanEmail === 'isemuk8@gmail.com' ? ['developer'] : [],
          status: 'Active',
          registration: new Date().toISOString(),
          ...firebaseMetadata
        };
        
        // Seed Firestore
        await setDoc(doc(db, 'users', email), {
          ...userData,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      setUser(userData);
      saveToLocal(userData);
      return userData;
    } catch (err) {
      console.error("Profile Sync Error:", err);
      const fallbackUser = {
        email: firebaseUser.email,
        role: firebaseUser.email?.toLowerCase() === 'isemuk8@gmail.com' ? 'developer' : 'guest',
        branch: 'all',
        name: firebaseUser.displayName || '',
        firebaseUid: firebaseUser.uid
      };
      setUser(fallbackUser);
      saveToLocal(fallbackUser);
      return fallbackUser;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncUserProfile(firebaseUser);
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
      await setDoc(doc(db, 'users', cleanEmail), {
        firebaseUid: firebaseUser.uid,
        migratedToFirebase: true,
        migratedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      }, { merge: true });
    } catch (syncErr) {
      console.warn('Legacy migration profile sync note:', syncErr?.message);
    }

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

    try {
      const role = branch === 'Overseer' ? 'admin' : 'branch_admin';
      const actualBranch = branch === 'Overseer' ? 'all' : branch;

      // 1. Create Firebase Auth Account
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(userCred.user, { displayName: name });

      // 2. Seed into Firestore
      await setDoc(doc(db, 'users', cleanEmail), {
        name,
        email: cleanEmail,
        role,
        branch: actualBranch,
        status: 'Active',
        firebaseUid: userCred.user.uid,
        migratedToFirebase: true,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      const profile = await syncUserProfile(userCred.user);
      return profile;
    } catch (err) {
      console.error("Signup Error:", err);
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      setError(message);
      throw new Error(message);
    } finally {
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
      // 1. Check if user exists in the church Firestore registry
      const userDoc = await getDoc(doc(db, 'users', cleanEmail));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // If user is not yet provisioned in Firebase Auth, provision them first
        // so sendPasswordResetEmail actually sends the email despite email enumeration protection
        if (!userData.firebaseUid || !userData.migratedToFirebase) {
          try {
            const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!' + Math.random().toString(36).slice(-8);
            const userCred = await createUserWithEmailAndPassword(provisioningAuth, cleanEmail, tempPassword);
            
            if (userData.name) {
              await updateProfile(userCred.user, { displayName: userData.name });
            }

            await setDoc(doc(db, 'users', cleanEmail), {
              firebaseUid: userCred.user.uid,
              migratedToFirebase: true,
              migratedAt: new Date().toISOString()
            }, { merge: true });

            await signOut(provisioningAuth);
          } catch (provisionErr) {
            console.warn("User provision check note:", provisionErr?.message);
          }
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
    hasRole,
    isAdmin: user?.role === 'admin',
    isDeveloper: user?.role === 'developer',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

