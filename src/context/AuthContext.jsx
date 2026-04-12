import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { account } from '../appwrite';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();

// --- BUILT-IN ACCOUNTS (Emergency Mock Auth) ---
const BUILT_IN_USERS = [
  { email: 'admin@ricgcw.com', passwordHash: '$2b$10$506aHGJtQf6sAxDHZIG89.RkQMSGfm.qP0fms17jZ4x.fkcsbmnL.', role: 'admin', branch: 'all' },
  { email: 'langma@ricgcw.com', passwordHash: '$2b$10$foOYurLFRryLSOOk63W7Hu//ZjCYmvpDaw3JjNQbqpiKvdy0wFgM6', role: 'branch_admin', branch: 'Langma' },
  { email: 'mallam@ricgcw.com', passwordHash: '$2b$10$9Rto.mRvVrPBn189gKWDtenjwwhzfdsf9i/76eLWFfGLMM.qoHwmW', role: 'branch_admin', branch: 'Mallam' },
  { email: 'kokrobetey@ricgcw.com', passwordHash: '$2b$10$fkyfOZTS0LNTGqlcDLbH9e6atNoVsC8oxot57NlOncw/D3KJSCT7a', role: 'branch_admin', branch: 'Kokrobetey' },
];

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

  const refreshUser = useCallback(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      const storedEmail = localStorage.getItem('userEmail');
      const storedRole = localStorage.getItem('userRole');
      const storedBranch = localStorage.getItem('userBranch');
      
      setUser({
        email: storedEmail,
        role: storedRole,
        branch: storedBranch,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await account.get();
        if (sessionUser) {
          try {
            // Fetch user metadata (role/branch) from Firestore
            const userDoc = await getDoc(doc(db, 'users', sessionUser.email));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const combinedUser = {
                email: sessionUser.email,
                role: userData.role || 'guest',
                branch: userData.branch || 'all',
              };
              setUser(combinedUser);
              saveToLocal(combinedUser);
            } else {
              setUser({ email: sessionUser.email, role: 'guest', branch: 'all' });
            }
          } catch (_) {
            setUser({ email: sessionUser.email, role: 'guest', branch: 'all' });
          }
        } else {
          refreshUser();
        }
      } catch (_) {
        refreshUser();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [refreshUser]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    // --- Step 1: Check Built-in Mock Auth ---
    const builtInUser = BUILT_IN_USERS.find(u => u.email === email);
    if (builtInUser) {
      try {
        const isMatch = await bcrypt.compare(password, builtInUser.passwordHash);
        if (isMatch) {
          const userData = {
            email: builtInUser.email,
            role: builtInUser.role,
            branch: builtInUser.branch
          };
          setUser(userData);
          saveToLocal(userData);
          setLoading(false);
          return userData;
        }
      } catch (err) {
        console.error("Bcrypt Error:", err);
      }
    }

    // --- Step 2: Appwrite Authentication ---
    try {
      await account.createEmailPasswordSession(email, password);
      const sessionUser = await account.get();
      
      let userData;
      try {
        // Fetch metadata from Firestore
        const userDoc = await getDoc(doc(db, 'users', sessionUser.email));
        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            email: sessionUser.email,
            role: data.role || 'guest',
            branch: data.branch || 'all',
          };
        } else {
          userData = { email: sessionUser.email, role: 'guest', branch: 'all' };
        }
      } catch (_) {
        userData = { email: sessionUser.email, role: 'guest', branch: 'all' };
      }
      
      setUser(userData);
      saveToLocal(userData);
      return userData;
    } catch (err) {
      console.error("Appwrite Auth Error:", err);
      let message = err.message || 'Invalid email or password.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
    } catch (_) {
      // Ignore session delete errors on logout
    }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userBranch');
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
    logout,
    refreshUser,
    hasRole,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
