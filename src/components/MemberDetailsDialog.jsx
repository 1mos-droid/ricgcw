import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Typography,
  useTheme,
  Avatar,
  Grid,
  TextField
} from '@mui/material';
import { X, Edit, Trash } from 'lucide-react';

const MemberDetailsDialog = ({ open, onClose, member, onEdit, onDelete }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        address: member.address
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onEdit(member.id, formData);
    setIsEditing(false);
  };
  
  if (!member) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <Box sx={{
        px: 3,
        py: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, fontWeight: 600 }}>
            {member.name.charAt(0)}
          </Avatar>
          <Typography variant="h6" fontWeight={700}>{isEditing ? 'Edit Member' : member.name}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {isEditing ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField autoFocus margin="dense" label="Full Name" name="name" fullWidth variant="outlined" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" label="Email Address" name="email" type="email" fullWidth variant="outlined" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" label="Phone Number" name="phone" type="tel" fullWidth variant="outlined" value={formData.phone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" label="Residential Address" name="address" fullWidth variant="outlined" value={formData.address} onChange={handleChange} />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{member.email}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Phone</Typography>
              <Typography variant="body1">{member.phone}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Address</Typography>
              <Typography variant="body1">{member.address}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        {isEditing ? (
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Save
          </Button>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)} variant="outlined" color="inherit" startIcon={<Edit size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Edit
            </Button>
            <Button onClick={() => onDelete(member.id)} variant="contained" color="error" startIcon={<Trash size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Delete
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailsDialog;
