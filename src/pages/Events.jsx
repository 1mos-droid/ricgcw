import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useWorkspace } from '../context/WorkspaceContext';
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
  Tooltip,
  Switch, // 🟢 Added
  FormControlLabel // 🟢 Added
} from '@mui/material';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit,
  AlertCircle,
  Video, // 🟢 Added for Online events
  Wifi // 🟢 Added for Online badge
} from 'lucide-react';
import EditEventDialog from '../components/EditEventDialog';

import { API_BASE_URL } from '../config';

const Events = () => {
  const theme = useTheme();
  const { filterData, isBranchRestricted, userBranch } = useWorkspace();
  
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
    location: isBranchRestricted ? `${userBranch} Sanctuary` : '',
    isOnline: false // 🟢 Added default state
  });

  // 🟢 Filtered Data
  const filteredEvents = useMemo(() => filterData(events), [events, filterData]);

  // 🔴 FIX 2: Helper to handle Firebase Timestamp Objects safely
  const parseDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (dateVal._seconds) return new Date(dateVal._seconds * 1000); // Firestore Timestamp
    return new Date(dateVal); // Standard String
  };

  // --- FETCH DATA ---
  const fetchEvents = useCallback(async () => {
    try {
      if (events.length === 0) setLoading(true);
      
      const res = await axios.get(`${API_BASE_URL}/events`);
      
      // 🔴 FIX 3: Sort safely using the parseDate helper
      const sorted = res.data.sort((a, b) => parseDate(a.date) - parseDate(b.date));
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

  // 🟢 UPDATED: Handle Checkbox/Switch logic
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        date: new Date(formData.date).toISOString(), // Ensure ISO format
        // 🟢 Logic: If location is empty, set default based on Online status
        location: formData.location || (formData.isOnline ? 'Zoom / Online' : (isBranchRestricted ? `${userBranch} Sanctuary` : 'Main Auditorium')),
        branch: isBranchRestricted ? userBranch : 'Main', // 🟢 Explicit branch
        createdAt: new Date().toISOString()
      });
      
      // Reset & Refresh
      setFormData({ name: '', date: '', time: '', location: isBranchRestricted ? `${userBranch} Sanctuary` : '', isOnline: false });
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
        // Optimistic update
        const previousEvents = [...events];
        setEvents(events.filter(e => e.id !== id));
        
        await axios.delete(`${API_BASE_URL}/events/${id}`);
        showSnackbar("Event deleted.", "info");
      } catch (err) {
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

                {/* 🟢 NEW: Online Event Switch */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={formData.isOnline} 
                        onChange={handleChange} 
                        name="isOnline" 
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {formData.isOnline ? <Video size={16} /> : <MapPin size={16} />}
                        <Typography variant="body2">{formData.isOnline ? "This is an Online Event" : "This is an In-Person Event"}</Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    // 🟢 Change Label based on switch
                    label={formData.isOnline ? "Meeting Link / Platform" : "Location"}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    // 🟢 Change Placeholder based on switch
                    placeholder={formData.isOnline ? "e.g. Zoom Link or Google Meet" : "Main Auditorium"}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {/* 🟢 Change Icon based on switch */}
                          {formData.isOnline ? (
                            <Video size={16} color={theme.palette.text.secondary} />
                          ) : (
                            <MapPin size={16} color={theme.palette.text.secondary} />
                          )}
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
            ) : filteredEvents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6, bgcolor: theme.palette.background.paper, borderRadius: 3 }}>
                <AlertCircle size={48} style={{ marginBottom: 16 }} />
                <Typography variant="h6">No upcoming events found.</Typography>
                <Typography variant="body2">Use the form to create your first event.</Typography>
              </Box>
            ) : (
              filteredEvents.map((event) => (
                <Card 
                  key={event.id}
                  sx={{ 
                    p: 0, 
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
                      {format(parseDate(event.date), 'dd')}
                    </Typography>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, opacity: 0.9 }}>
                      {format(parseDate(event.date), 'MMM')}
                    </Typography>
                  </Box>

                  {/* Details */}
                  <Box sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: theme.palette.text.primary }}>
                        {event.name}
                      </Typography>
                      {/* 🟢 NEW: Online Badge */}
                      {event.isOnline && (
                        <Chip 
                          icon={<Wifi size={14} />} 
                          label="Online" 
                          size="small" 
                          color="success" 
                          variant="outlined" 
                          sx={{ height: 24 }} 
                        />
                      )}
                    </Box>
                    
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
                        {/* 🟢 Icon changes based on event type */}
                        {event.isOnline ? <Video size={14} /> : <MapPin size={14} />}
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