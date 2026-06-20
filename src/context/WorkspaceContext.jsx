import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
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

  const filterData = useCallback((data) => {
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
      
      const department = String(item.department || '').trim().toLowerCase();
      if (workspace === 'youth') return department === 'youth';
      if (workspace === 'kids') return department === "children's court";
      return true;
    });
  }, [userBranch, workspace]);

  const canEdit = (itemBranch) => {
    const role = userRole;
    const branch = userBranch;
    
    if (role === 'admin') return true;
    if (role === 'branch_admin' && String(itemBranch).toLowerCase() === String(branch).toLowerCase()) return true;
    return false;
  };

  const currentDepartment = useMemo(() => {
    if (workspace === 'youth') return 'Youth';
    if (workspace === 'kids') return "Children's Court";
    return 'Main';
  }, [workspace]);

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
    currentDepartment,
    isDepartmentRestricted: workspace !== 'main',
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
        sx={{
          zIndex: 99999,
          '&.MuiSnackbar-root': {
            bottom: { xs: 96, sm: 24 },
            right: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 'auto' }
          }
        }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity} 
          iconMapping={{
            error: <AlertCircle size={20} color="var(--system-red)" />,
            warning: <AlertTriangle size={20} color="var(--system-orange)" />,
            success: <CheckCircle2 size={20} color="var(--system-green)" />,
            info: <Info size={20} color="var(--system-blue)" />,
          }}
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 420 },
            borderRadius: '20px',
            background: 'var(--bg-paper)',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--neo-shadow-out), var(--glass-glow)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: 700,
            alignItems: 'center',
            py: 1.5,
            px: 2.5,
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'var(--font-stack)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '6px',
              backgroundColor: 
                notification.severity === 'error' ? 'var(--system-red)' :
                notification.severity === 'warning' ? 'var(--system-orange)' :
                notification.severity === 'success' ? 'var(--system-green)' :
                'var(--system-blue)',
              boxShadow: 
                notification.severity === 'error' ? '0 0 12px var(--system-red)' :
                notification.severity === 'warning' ? '0 0 12px var(--system-orange)' :
                notification.severity === 'success' ? '0 0 12px var(--system-green)' :
                '0 0 12px var(--system-blue)',
            },
            '& .MuiAlert-icon': {
              marginRight: 2,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 
                notification.severity === 'error' ? 'rgba(255, 59, 48, 0.12)' :
                notification.severity === 'warning' ? 'rgba(255, 149, 0, 0.12)' :
                notification.severity === 'success' ? 'rgba(52, 199, 89, 0.12)' :
                'rgba(0, 122, 255, 0.12)',
              borderRadius: '50%',
              p: 0.75,
            },
            '& .MuiAlert-message': {
              padding: '6px 0',
              lineHeight: 1.4,
            },
            '& .MuiAlert-action': {
              paddingLeft: 2,
              '& .MuiIconButton-root': {
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }
              }
            }
          }}
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
