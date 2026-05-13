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
  Avatar,
  CircularProgress
} from '@mui/material';
import { X, Edit, Calendar, Clock, MapPin, Type, Upload, Image as ImageIcon } from 'lucide-react';
import { safeParseDate } from '../utils/dateUtils';
import { uploadToHuggingFace } from '../utils/huggingFaceApi';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditEventDialog = ({ open, onClose, onEditEvent, event }) => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    flierUrl: ''
  });

  const [flierFile, setFlierFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        date: event.date ? safeParseDate(event.date).toISOString().split('T')[0] : '', 
        time: event.time || '',
        location: event.location || '',
        flierUrl: event.flierUrl || ''
      });
      setFlierFile(null);
      setErrors({});
      setSubmitting(false);
    }
  }, [event, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFlierFile(file);
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!String(formData.name || "").trim()) tempErrors.name = "Event title is required";
    if (!formData.date) tempErrors.date = "Date is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setSubmitting(true);
      try {
        let flierUrl = formData.flierUrl;
        if (flierFile) {
          const timestamp = Date.now();
          const fileName = `flier_${timestamp}_${flierFile.name}`;
          flierUrl = await uploadToHuggingFace(flierFile, `fliers/${fileName}`);
        }
        
        const payload = {
          ...formData,
          date: new Date(formData.date).toISOString(),
          flierUrl
        };
        
        await onEditEvent(event.id, payload);
        onClose();
      } catch (err) {
        console.error("Update event error:", err);
      } finally {
        setSubmitting(false);
      }
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
          borderRadius: 2,
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
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40, borderRadius: 1.5 }}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-event-flier"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="edit-event-flier">
                  <Box sx={{
                    border: `2px dashed ${flierFile ? theme.palette.primary.main : theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: flierFile ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.action.hover, 0.3),
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}>
                    {flierFile || formData.flierUrl ? (
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar 
                          src={flierFile ? URL.createObjectURL(flierFile) : formData.flierUrl} 
                          variant="rounded" 
                          sx={{ width: 40, height: 40, borderRadius: 1.5 }} 
                        />
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="caption" fontWeight={700} display="block">
                                {flierFile ? "New Flier Selected" : "Current Flier"}
                            </Typography>
                            <Typography variant="caption" color="primary" fontWeight={700}>
                                Click to Change
                            </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <Upload size={18} color={theme.palette.text.secondary} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Upload Event Flier</Typography>
                      </Stack>
                    )}
                  </Box>
                </label>
              </Box>
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={submitting}
          sx={{ borderRadius: 1.5, fontWeight: 700, px: 3, color: theme.palette.text.secondary }}
        >
          Discard
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || !formData.date || submitting}
          sx={{ borderRadius: 1.5, fontWeight: 800, px: 4, py: 1.2, boxShadow: theme.shadows[4], minWidth: 150 }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Update Calendar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventDialog;