import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  Box,
  IconButton,
  Typography,
  useTheme,
  Grid,
  Slide,
  InputAdornment
} from '@mui/material';
import { X, UserPlus, User, Mail, Phone, MapPin } from 'lucide-react';

// Transition for the Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddMemberDialog = ({ open, onClose, onAddMember }) => {
  const theme = useTheme();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Error State
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({ name: '', email: '', phone: '', address: '' });
      setErrors({});
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Full Name is required";
    // Optional: Add email/phone validation regex here if needed
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onAddMember(formData);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[10],
          bgcolor: theme.palette.background.paper,
          backgroundImage: 'none'
        }
      }}
    >
      {/* --- HEADER --- */}
      <Box sx={{ 
        px: 3, 
        py: 2.5, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: '#fff'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UserPlus size={22} color="#fff" />
          <Typography variant="h6" fontWeight={700}>Add New Member</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        <Box component="form" noValidate autoComplete="off">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the details below to register a new member into the directory.
          </Typography>

          <Grid container spacing={3}>
            
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Full Name"
                name="name"
                fullWidth
                required
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g. John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                type="tel"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+233 XX XXX XXXX"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Residential Address"
                name="address"
                fullWidth
                variant="outlined"
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street Name, City"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, border: `1px solid ${theme.palette.divider}` }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disableElevation
          disabled={!formData.name}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 4 }}
        >
          Save Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;