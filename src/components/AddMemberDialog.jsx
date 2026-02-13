import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Typography,
  useTheme,
  Grid
} from '@mui/material';
import { X, UserPlus } from 'lucide-react';

const AddMemberDialog = ({ open, onClose, onAddMember }) => {
  const theme = useTheme();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onAddMember(formData);
    // Reset form
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3, // Soft corners
          backgroundImage: 'none',
          boxShadow: theme.shadows[10],
          bgcolor: theme.palette.background.paper
        }
      }}
    >
      {/* --- HEADER --- */}
      <Box sx={{ 
        px: 3, 
        py: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UserPlus size={20} color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={700}>Add New Member</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 3 }}>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Full Name"
                name="name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Phone Number"
                name="phone"
                type="tel"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+233 XX XXX XXXX"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Residential Address"
                name="address"
                fullWidth
                variant="outlined"
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street Name, City"
              />
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disableElevation
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Add Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;