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
  InputAdornment,
  alpha,
  Stack,
  Avatar
} from '@mui/material';
import { X, Edit, Calendar, Clock, MapPin, Type } from 'lucide-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditEventDialog = ({ open, onClose, onEditEvent, event }) => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '', 
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
          borderRadius: 4,
          backgroundImage: 'none',
          overflow: 'hidden'
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
        bgcolor: alpha(theme.palette.primary.main, 0.03)
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40, borderRadius: 2.5 }}>
            <Edit size={20} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800}>Modify Event</Typography>
            <Typography variant="caption" color="text.secondary">Update scheduled details</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: theme.palette.action.hover }}>
          <X size={18} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2.5}>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                autoFocus
                label="Event Title"
                name="name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Type size={18} color={theme.palette.primary.main} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date"
                name="date"
                type="date"
                fullWidth
                required
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Time"
                name="time"
                type="time"
                fullWidth
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Location"
                name="location"
                fullWidth
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose} 
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 3, color: theme.palette.text.secondary }}
        >
          Discard
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || !formData.date}
          sx={{ borderRadius: 2.5, fontWeight: 800, px: 4, py: 1.2, boxShadow: theme.shadows[4] }}
        >
          Update Calendar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventDialog;