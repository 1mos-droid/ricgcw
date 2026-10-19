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
import { auth, db } from '../firebase';
import { account } from '../appwrite';

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
        // 2. If user is not yet migrated to Firebase Auth (invalid-credential or user-not-found)
        if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/user-not-found') {
          let appwriteUser = null;

          try {
            await account.createEmailPasswordSession(cleanEmail, password);
            appwriteUser = await account.get();
          } catch (appwriteErr) {
            console.warn("Appwrite legacy migration check failed:", appwriteErr);
            if (appwriteErr.code === 401 || appwriteErr.type === 'user_invalid_credentials') {
              throw new Error('Invalid email or password.');
            }
            if (appwriteErr.code === 503 || appwriteErr.message?.includes('Network') || appwriteErr.message?.includes('Failed to fetch')) {
              throw new Error('Legacy authentication server is currently paused. Please use "Forgot Password" to set a direct Firebase password, or contact an administrator.');
            }
            throw new Error('Invalid email or password.');
          }

          if (appwriteUser) {
            // Credentials verified via Appwrite! Seamlessly migrate to Firebase Auth
            const existingDoc = await getDoc(doc(db, 'users', cleanEmail));
            const existingData = existingDoc.exists() ? existingDoc.data() : {};
            const displayName = existingData.name || appwriteUser.name || '';

            const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            firebaseUser = userCred.user;

            if (displayName) {
              await updateProfile(firebaseUser, { displayName });
            }

            // Sync migration status to Firestore
            await setDoc(doc(db, 'users', cleanEmail), {
              firebaseUid: firebaseUser.uid,
              migratedToFirebase: true,
              migratedAt: new Date().toISOString(),
              lastActive: new Date().toISOString()
            }, { merge: true });

            // Clean up temporary Appwrite session
            try {
              await account.deleteSession('current');
            } catch (cleanErr) {
              console.warn("Appwrite session cleanup note:", cleanErr?.message);
            }
          }
        } else {
          throw fbErr;
        }
      }

      const profile = await syncUserProfile(firebaseUser);
      return profile;
    } catch (err) {
      console.error("Login Error:", err);
      let message = err.message || 'Invalid email or password.';
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
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return { success: true, message: 'Password reset link sent! Please check your email inbox.' };
      } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          const userDoc = await getDoc(doc(db, 'users', cleanEmail));
          if (userDoc.exists()) {
            // User exists in registry but not yet in Firebase Auth; provision and send reset email
            const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!' + Math.random().toString(36).slice(-8);
            const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, tempPassword);
            
            const userData = userDoc.data();
            if (userData.name) {
              await updateProfile(userCred.user, { displayName: userData.name });
            }

            await sendPasswordResetEmail(auth, cleanEmail);
            await signOut(auth);

            await setDoc(doc(db, 'users', cleanEmail), {
              firebaseUid: userCred.user.uid,
              migratedToFirebase: true,
              migratedAt: new Date().toISOString()
            }, { merge: true });

            return { success: true, message: 'Password reset link sent! Please check your email inbox to activate your account.' };
          }
        }
        throw err;
      }
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

