import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ open, title, message, onConfirm, onClose, confirmText = "Confirm", cancelText = "Cancel", severity = "error" }) => {
  const theme = useTheme();
  
  const color = severity === 'error' ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, width: '100%', maxWidth: 400 }
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ 
          width: 64, 
          height: 64, 
          borderRadius: '20px', 
          bgcolor: alpha(color, 0.1), 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2
        }}>
          <AlertTriangle size={32} />
        </Box>
        
        <Typography variant="h6" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={onClose}
            sx={{ borderRadius: 3, fontWeight: 700, color: theme.palette.text.secondary, border: `1px solid ${theme.palette.divider}` }}
          >
            {cancelText}
          </Button>
          <Button 
            fullWidth 
            variant="contained" 
            color={severity === 'error' ? 'error' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            sx={{ borderRadius: 3, fontWeight: 800, boxShadow: severity === 'error' ? theme.shadows[4] : 'none' }}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ConfirmationDialog;
