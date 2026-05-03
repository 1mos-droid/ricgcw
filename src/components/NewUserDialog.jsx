import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
  MenuItem,
  Avatar
} from '@mui/material';
import { X, UserPlus, Mail, Shield, User, Building } from 'lucide-react';

import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const NewUserDialog = ({ open, onClose, onUserAdded }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'guest',
    branch: 'all',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError('Please provide both a name and email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use email as document ID for users collection
      const userRef = doc(db, "users", formData.email);
      const userData = {
        ...formData,
        createdAt: new Date().toISOString(),
        lastActive: 'Never'
      };

      await setDoc(userRef, userData);
      
      onUserAdded({ id: formData.email, ...userData });
      handleClose();
    } catch (err) {
      console.error('Firestore save error:', err);
      setError('Failed to create user record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'guest',
      branch: 'all',
      status: 'Active'
    });
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: 4 }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.02)
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40, borderRadius: 2.5 }}>
                <UserPlus size={20} />
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight={800}>System Access</Typography>
                <Typography variant="caption" color="text.secondary">Grant administrative privileges</Typography>
            </Box>
        </Stack>
        <IconButton onClick={handleClose} size="small" sx={{ bgcolor: theme.palette.action.hover }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Display Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            required
            variant="outlined"
            InputProps={{ startAdornment: <User size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@ricgcw.com"
            required
            variant="outlined"
            InputProps={{ startAdornment: <Mail size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            select
            label="System Role"
            name="role"
            fullWidth
            value={formData.role}
            onChange={handleChange}
            variant="outlined"
            InputProps={{ startAdornment: <Shield size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            <MenuItem value="admin">System Admin</MenuItem>
            <MenuItem value="branch_admin">Branch Admin</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="guest">Guest / Viewer</MenuItem>
          </TextField>

          <TextField
            select
            label="Branch Access"
            name="branch"
            fullWidth
            value={formData.branch}
            onChange={handleChange}
            variant="outlined"
            InputProps={{ startAdornment: <Building size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            <MenuItem value="all">Global Access (Overseer)</MenuItem>
            <MenuItem value="Langma">Langma</MenuItem>
            <MenuItem value="Mallam">Mallam</MenuItem>
            <MenuItem value="Kokrobitey">Kokrobitey</MenuItem>
            <MenuItem value="Diaspora">Diaspora</MenuItem>
          </TextField>

          {error && (
            <Typography color="error" variant="caption" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.error.main, 0.05), p: 1, borderRadius: 2 }}>
              {error}
            </Typography>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
            User will need to sign up using this email address after access is granted here.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700, borderRadius: 2.5 }}>
          Discard
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.name || !formData.email}
          sx={{ 
            borderRadius: 2.5, 
            fontWeight: 800, 
            px: 4,
            minWidth: 140,
            boxShadow: theme.shadows[4]
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Grant Access'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDialog;
