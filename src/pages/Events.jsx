import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  TextField, 
  Chip,
  IconButton,
  useTheme,
  Avatar,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert,
  Skeleton,
  Tooltip
} from '@mui/material';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit,
  AlertCircle
} from 'lucide-react';
import EditEventDialog from '../components/EditEventDialog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

const Events = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: ''
  });

  // --- FETCH DATA ---
  const fetchEvents = useCallback(async () => {
    try {
      // Only show full loading skeleton on first load or refresh
      if (events.length === 0) setLoading(true);
      
      const res = await axios.get(`${API_BASE_URL}/events`);
      // Sort by date (nearest first)
      const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
    } catch (err) {
      console.error("Calendar Sync Error:", err);
      showSnackbar("Failed to sync events.", "error");
    } finally {
      setLoading(false);
    }
  }, [events.length]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- HANDLERS ---
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time) {
      showSnackbar("Please fill in all required fields.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/events`, {
        ...formData,
        location: formData.location || 'Main Auditorium'
      });
      
      // Reset & Refresh
      setFormData({ name: '', date: '', time: '', location: '' });
      await fetchEvents();
      showSnackbar("Event scheduled successfully!", "success");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to schedule event.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Optimistic update (remove from UI immediately for speed)
        const previousEvents = [...events];
        setEvents(events.filter(e => e.id !== id));
        
        await axios.delete(`${API_BASE_URL}/events/${id}`);
        showSnackbar("Event deleted.", "info");
      } catch (err) {
        // Revert if failed
        fetchEvents(); 
        showSnackbar('Failed to delete event.', "error");
      }
    }
  };

  const handleEditEvent = async (id, updatedEvent) => {
    try {
      await axios.put(`${API_BASE_URL}/events/${id}`, updatedEvent);
      fetchEvents();
      setEditingEvent(null);
      showSnackbar("Event updated successfully.", "success");
    } catch (err) {
      showSnackbar('Failed to update event.', "error");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Event Agenda
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Curate and manage upcoming gatherings
          </Typography>
        </Box>
        <Chip 
          icon={<CalendarIcon size={14} />} 
          label={format(new Date(), 'MMMM yyyy')} 
          variant="outlined" 
          sx={{ fontWeight: 600, borderRadius: 2, height: 32 }}
        />
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: CREATOR FORM --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 3, 
            position: { md: 'sticky' }, 
            top: { md: 20 },
            boxShadow: theme.shadows[3],
            borderRadius: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                <Plus size={22} color="#fff" />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Schedule Event</Typography>
            </Box>

            <form onSubmit={handleCreateEvent}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Annual Gala"
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Main Auditorium"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={16} color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    disabled={submitting}
                    sx={{ mt: 1, py: 1.5, borderRadius: 3, fontWeight: 600 }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Publish to Calendar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>

        {/* --- RIGHT COL: AGENDA LIST --- */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading ? (
               // SKELETON LOADING
               Array.from(new Array(3)).map((_, i) => (
                 <Card key={i} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                   <Skeleton variant="rectangular" width={60} height={60} sx={{ mr: 3, borderRadius: 1 }} />
                   <Box sx={{ flexGrow: 1 }}>
                     <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                     <Skeleton width="40%" height={20} />
                   </Box>
                 </Card>
               ))
            ) : events.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6, bgcolor: theme.palette.background.paper, borderRadius: 3 }}>
                <AlertCircle size={48} style={{ marginBottom: 16 }} />
                <Typography variant="h6">No upcoming events found.</Typography>
                <Typography variant="body2">Use the form to create your first event.</Typography>
              </Box>
            ) : (
              events.map((event) => (
                <Card 
                  key={event.id}
                  sx={{ 
                    p: 0, // Reset padding for custom layout
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: theme.shadows[4] },
                    overflow: 'hidden'
                  }}
                >
                  {/* Date Block */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'row', sm: 'column' }, 
                    alignItems: 'center', 
                    justifyContent: { xs: 'flex-start', sm: 'center' },
                    p: { xs: 2, sm: 3 },
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    minWidth: { sm: 100 },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                      {format(new Date(event.date), 'dd')}
                    </Typography>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, opacity: 0.9 }}>
                      {format(new Date(event.date), 'MMM')}
                    </Typography>
                  </Box>

                  {/* Details */}
                  <Box sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: theme.palette.text.primary }}>
                      {event.name}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      flexWrap: 'wrap',
                      mt: 1,
                      color: theme.palette.text.secondary 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Clock size={14} />
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{event.time}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MapPin size={14} />
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{event.location}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    p: 2, 
                    borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
                    justifyContent: { xs: 'flex-end', sm: 'center' }
                  }}>
                    <Tooltip title="Edit Event">
                      <IconButton size="small" onClick={() => setEditingEvent(event)}>
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Event">
                      <IconButton size="small" color="error" onClick={() => handleDelete(event.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              ))
            )}
          </Box>
        </Grid>

      </Grid>
      
      {/* --- DIALOGS & NOTIFICATIONS --- */}
      <EditEventDialog
        open={editingEvent !== null}
        onClose={() => setEditingEvent(null)}
        onEditEvent={handleEditEvent}
        event={editingEvent}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Events;