import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { account } from '../appwrite';
import { ID } from 'appwrite';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

  const syncUserProfile = useCallback(async (appwriteUser) => {
    if (!appwriteUser) return null;

    try {
      const email = appwriteUser.email;
      // Priority 1: Check Firestore for detailed profile
      const userDoc = await getDoc(doc(db, 'users', email));
      let userData;

      if (userDoc.exists()) {
        const fireData = userDoc.data();
        userData = {
          email: email,
          role: fireData.role || 'guest',
          branch: fireData.branch || 'all',
          name: fireData.name || appwriteUser.name || '',
        };
      } else {
        // Priority 2: Use Appwrite Metadata (prefs) if Firestore entry missing
        const prefs = appwriteUser.prefs || {};
        userData = {
          email: email,
          role: prefs.role || 'guest',
          branch: prefs.branch || 'all',
          name: appwriteUser.name || '',
        };
        
        // Seed Firestore if it has role info in prefs
        if (prefs.role) {
          await setDoc(doc(db, 'users', email), {
            name: userData.name,
            email: userData.email,
            role: userData.role,
            branch: userData.branch,
            status: 'Active',
            lastActive: new Date().toISOString()
          }, { merge: true });
        }
      }

      setUser(userData);
      saveToLocal(userData);
      return userData;
    } catch (err) {
      console.error("Profile Sync Error:", err);
      const fallbackUser = {
        email: appwriteUser.email,
        role: appwriteUser.prefs?.role || 'guest',
        branch: appwriteUser.prefs?.branch || 'all',
        name: appwriteUser.name || '',
      };
      setUser(fallbackUser);
      saveToLocal(fallbackUser);
      return fallbackUser;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionUser = await account.get();
        if (sessionUser) {
          await syncUserProfile(sessionUser);
        }
      } catch (err) {
        // No active session
        if (localStorage.getItem('isAuthenticated') === 'true') {
          clearLocal();
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [syncUserProfile]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      await account.createEmailPasswordSession(email, password);
      const sessionUser = await account.get();
      const profile = await syncUserProfile(sessionUser);
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
    try {
      const role = branch === 'Overseer' ? 'admin' : 'branch_admin';
      const actualBranch = branch === 'Overseer' ? 'all' : branch;

      // 1. Create Appwrite Account
      const userId = ID.unique();
      await account.create(userId, email, password, name);
      
      // 2. Login to set session
      await account.createEmailPasswordSession(email, password);
      
      // 3. Set Appwrite Prefs for role/branch
      await account.updatePrefs({
        role: role,
        branch: actualBranch
      });

      // 4. Seed into Firestore
      await setDoc(doc(db, 'users', email), {
        name,
        email,
        role,
        branch: actualBranch,
        status: 'Active',
        lastActive: new Date().toISOString()
      });

      const sessionUser = await account.get();
      const profile = await syncUserProfile(sessionUser);
      return profile;
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
    } catch (_) {}
    clearLocal();
    setUser(null);
  }, []);

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
    hasRole,
    isAdmin: user?.role === 'admin',
    isDeveloper: user?.role === 'developer',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

