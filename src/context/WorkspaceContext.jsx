import React, { createContext, useContext, useState, useMemo } from 'react';
import { Snackbar, Alert } from '@mui/material';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useAuth } from './AuthContext';

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

  const userBranch = useMemo(() => user?.branch || 'all', [user]);
  const userRole = useMemo(() => user?.role || 'guest', [user]);

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
    // This is now mostly handled by AuthContext updates
    const activeWs = localStorage.getItem('activeWorkspace') || 'main';
    setWorkspace(activeWs);
  };

  const switchWorkspace = (id) => {
    setWorkspace(id);
    localStorage.setItem('activeWorkspace', id);
  };

  const filterData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Use the latest branch info from the user object
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
