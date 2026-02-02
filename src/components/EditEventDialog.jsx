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
import { X, Edit, Calendar, Clock, MapPin, Type } from 'lucide-react';

// Transition for the Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditEventDialog = ({ open, onClose, onEditEvent, event }) => {
  const theme = useTheme();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: ''
  });

  // Error State
  const [errors, setErrors] = useState({});

  // Populate form when event data changes
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '', // Format for date input
        time: event.time || '',
        location: event.location || ''
      });
      setErrors({});
    }
  }, [event, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Event title is required";
    if (!formData.date) tempErrors.date = "Date is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onEditEvent(event.id, formData);
      onClose();
    }
  };

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
        bgcolor: theme.palette.primary.main,
        color: '#fff'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Edit size={20} color="#fff" />
          <Typography variant="h6" fontWeight={700}>Edit Event Details</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        <Box component="form" noValidate autoComplete="off">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update the schedule details below. Changes will be reflected immediately.
          </Typography>

          <Grid container spacing={3}>
            
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Event Title"
                name="name"
                fullWidth
                required
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Type size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                fullWidth
                required
                variant="outlined"
                value={formData.date}
                onChange={handleChange}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Calendar size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                name="time"
                type="time"
                fullWidth
                variant="outlined"
                value={formData.time}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Clock size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Location"
                name="location"
                fullWidth
                variant="outlined"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Main Hall"
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
          Discard
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disableElevation
          disabled={!formData.name || !formData.date}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventDialog;