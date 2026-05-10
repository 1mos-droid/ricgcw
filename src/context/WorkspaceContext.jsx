import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [workspace, setWorkspace] = useState(() => {
    return localStorage.getItem('activeWorkspace') || 'main';
  });

  // --- Developer / Mimic State ---
  const [mimicData, setMimicData] = useState(() => {
    const saved = localStorage.getItem('mimicData');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Maintenance Mode State ---
  const [maintenance, setMaintenance] = useState({ active: false, message: '' });

  useEffect(() => {
    // Listen for maintenance mode changes globally
    const unsub = onSnapshot(doc(db, 'settings', 'maintenance'), (doc) => {
      if (doc.exists()) {
        setMaintenance(doc.data());
      }
    });
    return () => unsub();
  }, []);

  const toggleMaintenance = async (active, message = '') => {
    try {
      await setDoc(doc(db, 'settings', 'maintenance'), { 
        active, 
        message, 
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email
      });
    } catch (err) {
      console.error("Maintenance Toggle Error:", err);
      showNotification("Failed to update maintenance mode.", "error");
    }
  };

  const startMimicking = (targetUser) => {
    const data = {
      role: targetUser.role,
      branch: targetUser.branch,
      name: targetUser.name,
      email: targetUser.email,
      originalName: user.name
    };
    setMimicData(data);
    localStorage.setItem('mimicData', JSON.stringify(data));
    showNotification(`Now mimicking ${targetUser.name}`, "info");
  };

  const stopMimicking = () => {
    setMimicData(null);
    localStorage.removeItem('mimicData');
    showNotification("Identity restored to normal.", "success");
  };

  const userBranch = useMemo(() => mimicData?.branch || user?.branch || 'all', [user, mimicData]);
  const userRole = useMemo(() => mimicData?.role || user?.role || 'guest', [user, mimicData]);

  // --- Global Notification State ---
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [confirmation, setConfirmation] = useState({ open: false, title: '', message: '', onConfirm: () => {}, severity: 'error' });

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const showConfirmation = ({ title, message, onConfirm, severity = 'error' }) => {
    setConfirmation({ open: true, title, message, onConfirm, severity });
  };

  const refreshUserContext = () => {
    const activeWs = localStorage.getItem('activeWorkspace') || 'main';
    setWorkspace(activeWs);
  };

  const switchWorkspace = (id) => {
    setWorkspace(id);
    localStorage.setItem('activeWorkspace', id);
  };

  const filterData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Use the latest branch info from the user object or mimic
    const currentBranch = userBranch;

    let filteredByBranch = data;
    if (currentBranch && currentBranch !== 'all') {
      filteredByBranch = data.filter(item => {
        if (!item) return false;
        const targetBranch = String(currentBranch).trim().toLowerCase();
        const itemBranch = String(item.branch || item.category || item.location || '').trim().toLowerCase();
        return itemBranch === targetBranch;
      });
    }

    return filteredByBranch.filter(item => {
      if (!item) return false;
      if (workspace === 'main') return true; 
      
      const department = (item.department || '').toLowerCase();
      if (workspace === 'youth') return department === 'youth';
      if (workspace === 'kids') return department === "children's department";
      return true;
    });
  };

  const canEdit = (itemBranch) => {
    const role = userRole;
    const branch = userBranch;
    
    if (role === 'admin') return true;
    if (role === 'branch_admin' && String(itemBranch).toLowerCase() === String(branch).toLowerCase()) return true;
    return false;
  };

  const value = {
    workspace,
    switchWorkspace,
    filterData,
    userBranch,
    userRole,
    canEdit,
    isBranchRestricted: userBranch !== 'all',
    refreshUserContext,
    showNotification,
    showConfirmation,
    // Dev Features
    maintenance,
    toggleMaintenance,
    mimicData,
    startMimicking,
    stopMimicking,
    isMimicking: !!mimicData
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
      
      {/* Global Notification Component */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%', borderRadius: 3, boxShadow: 6, fontWeight: 600 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Global Confirmation Dialog */}
      <ConfirmationDialog 
        open={confirmation.open}
        title={confirmation.title}
        message={confirmation.message}
        severity={confirmation.severity}
        onConfirm={confirmation.onConfirm}
        onClose={() => setConfirmation({ ...confirmation, open: false })}
      />
    </WorkspaceContext.Provider>
  );
};
