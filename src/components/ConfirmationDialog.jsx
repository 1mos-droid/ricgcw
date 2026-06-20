import React from 'react';
import {
  Dialog,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { CupertinoButton } from './Cupertino';

const ConfirmationDialog = ({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onClose, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  severity = "error" 
}) => {
  const theme = useTheme();
  const color = severity === 'error' ? 'var(--system-red)' : 'var(--system-blue)';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }
        }
      }}
      PaperProps={{
        className: 'neo-glass-card',
        sx: { 
          borderRadius: '24px', 
          width: '100%', 
          maxWidth: 400,
          background: 'var(--bg-paper)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--neo-shadow-out), var(--glass-glow)',
          backgroundImage: 'none',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ 
          width: 64, 
          height: 64, 
          borderRadius: '20px', 
          bgcolor: severity === 'error' ? 'rgba(255, 59, 48, 0.12)' : 'rgba(0, 122, 255, 0.12)', 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: 'var(--neo-shadow-in)'
        }}>
          {severity === 'error' ? (
            <AlertTriangle size={32} color={color} />
          ) : (
            <HelpCircle size={32} color={color} />
          )}
        </Box>
        
        <Typography 
          variant="h6" 
          fontWeight={900} 
          gutterBottom
          sx={{ color: 'var(--text-primary)', fontFamily: 'var(--font-stack)', fontSize: '1.25rem' }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ mb: 4, color: 'var(--text-secondary)', fontFamily: 'var(--font-stack)', lineHeight: 1.5 }}
        >
          {message}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <CupertinoButton 
            variant="plain" 
            onClick={onClose}
            sx={{ flex: 1, py: 1.75, borderRadius: '14px', fontWeight: 700 }}
          >
            {cancelText}
          </CupertinoButton>
          <CupertinoButton 
            variant="filled" 
            color={severity === 'error' ? 'destructive' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            sx={{ flex: 1, py: 1.75, borderRadius: '14px', fontWeight: 800 }}
          >
            {confirmText}
          </CupertinoButton>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ConfirmationDialog;
