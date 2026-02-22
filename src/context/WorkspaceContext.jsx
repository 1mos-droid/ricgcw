import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import ConfirmationDialog from '../components/ConfirmationDialog';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(() => {
    return localStorage.getItem('activeWorkspace') || 'main';
  });

  const [userBranch, setUserBranch] = useState(() => {
    const saved = localStorage.getItem('userBranch');
    return (saved && saved !== 'undefined') ? saved : 'all';
  });

  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('userRole');
    return (saved && saved !== 'undefined') ? saved : 'guest';
  });

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
    const branch = localStorage.getItem('userBranch') || 'all';
    const role = localStorage.getItem('userRole') || 'guest';
    const activeWs = localStorage.getItem('activeWorkspace') || 'main';
    setUserBranch(branch);
    setUserRole(role);
    setWorkspace(activeWs);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      refreshUserContext();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const switchWorkspace = (id) => {
    setWorkspace(id);
    localStorage.setItem('activeWorkspace', id);
  };

  const filterData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    const currentBranch = localStorage.getItem('userBranch') || userBranch;

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
      if (workspace === 'main') return true; // Show all in Main Sanctuary
      
      const department = (item.department || '').toLowerCase();
      if (workspace === 'youth') return department === 'youth';
      if (workspace === 'kids') return department === "children's department";
      return true;
    });
  };

  const canEdit = (itemBranch) => {
    if (userRole === 'admin') return true;
    if (userRole === 'branch_admin' && String(itemBranch).toLowerCase() === String(userBranch).toLowerCase()) return true;
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
    showConfirmation
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
      
      {/* Global Notification Component (The "Sandwich") */}
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
