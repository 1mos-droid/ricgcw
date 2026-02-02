import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Box,
  IconButton,
  Typography,
  useTheme,
  Avatar,
  Grid,
  TextField,
  Slide,
  InputAdornment
} from '@mui/material';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ArrowLeft 
} from 'lucide-react';

// Transition for the Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MemberDetailsDialog = ({ open, onClose, member, onEdit, onDelete }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Error State
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || ''
      });
      setErrors({});
      setIsEditing(false); // Reset edit mode on open
    }
  }, [member, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onEdit(member.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    // Revert changes
    setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || ''
    });
    setIsEditing(false);
    setErrors({});
  };
  
  if (!member) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: 'none',
          boxShadow: theme.shadows[10],
          bgcolor: theme.palette.background.paper
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
        bgcolor: isEditing ? theme.palette.action.hover : 'transparent'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isEditing && (
            <Avatar sx={{ bgcolor: theme.palette.primary.main, color: '#fff', fontWeight: 700, width: 40, height: 40 }}>
              {member.name.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" fontWeight={700}>
                {isEditing ? 'Edit Profile' : member.name}
            </Typography>
            {!isEditing && (
                <Typography variant="caption" color="text.secondary">Member ID: #{member.id}</Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        {isEditing ? (
          // EDIT MODE FORM
          <Box component="form" noValidate autoComplete="off">
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
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><User size={18} color={theme.palette.text.secondary}/></InputAdornment>
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
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Mail size={18} color={theme.palette.text.secondary}/></InputAdornment>
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
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Phone size={18} color={theme.palette.text.secondary}/></InputAdornment>
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
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><MapPin size={18} color={theme.palette.text.secondary}/></InputAdornment>
                    }}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          // VIEW MODE DETAILS
          <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Mail size={18} color={theme.palette.text.secondary} />
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>EMAIL</Typography>
                        <Typography variant="body1">{member.email || 'N/A'}</Typography>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Phone size={18} color={theme.palette.text.secondary} />
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>PHONE</Typography>
                        <Typography variant="body1">{member.phone || 'N/A'}</Typography>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MapPin size={18} color={theme.palette.text.secondary} />
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>ADDRESS</Typography>
                        <Typography variant="body1">{member.address || 'N/A'}</Typography>
                    </Box>
                </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1, justifyContent: 'space-between' }}>
        {isEditing ? (
            // Edit Mode Actions
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
                <Button 
                    onClick={handleCancelEdit} 
                    variant="outlined" 
                    color="inherit" 
                    startIcon={<ArrowLeft size={16}/>}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    startIcon={<Save size={16}/>}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                    Save Changes
                </Button>
            </Box>
        ) : (
            // View Mode Actions
            <>
                <Button 
                    onClick={() => onDelete(member.id)} 
                    variant="outlined" 
                    color="error" 
                    startIcon={<Trash2 size={16} />} 
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, border: `1px solid ${theme.palette.error.main}50` }}
                >
                    Delete Member
                </Button>
                <Button 
                    onClick={() => setIsEditing(true)} 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Edit size={16} />} 
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                    Edit Profile
                </Button>
            </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailsDialog;