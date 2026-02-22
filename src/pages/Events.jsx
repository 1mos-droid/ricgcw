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
  Switch, 
  FormControlLabel,
  alpha,
  Stack
} from '@mui/material';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit,
  AlertCircle,
  Video, 
  Wifi,
  Globe
} from 'lucide-react';
import EditEventDialog from '../components/EditEventDialog';

import { API_BASE_URL } from '../config';

const Events = () => {
  const theme = useTheme();
  const { filterData, isBranchRestricted, userBranch, showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: isBranchRestricted ? `${userBranch} Sanctuary` : '',
    isOnline: false 
  });

  const filteredEvents = useMemo(() => filterData(events), [events, filterData]);

  const parseDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (dateVal._seconds) return new Date(dateVal._seconds * 1000); 
    return new Date(dateVal); 
  };

  const fetchEvents = useCallback(async () => {
    try {
      if (events.length === 0) setLoading(true);
      console.log("Fetching events from:", `${API_BASE_URL}/events/`);
      const res = await axios.get(`${API_BASE_URL}/events/`);
      
      const sorted = res.data.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      setEvents(sorted);
    } catch (err) {
      console.error("Calendar Sync Error:", err.response?.data || err.message);
      showNotification("Failed to sync events.", "error");
    } finally {
      setLoading(false);
    }
  }, [events.length, showNotification]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
      showNotification("Please fill in all required fields.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/events/`, {
        ...formData,
        date: new Date(formData.date).toISOString(), 
        location: formData.location || (formData.isOnline ? 'Zoom / Online' : (isBranchRestricted ? `${userBranch} Sanctuary` : 'Main Auditorium')),
        branch: isBranchRestricted ? userBranch : 'Main', 
        createdAt: new Date().toISOString()
      });
      
      setFormData({ name: '', date: '', time: '', location: isBranchRestricted ? `${userBranch} Sanctuary` : '', isOnline: false });
      await fetchEvents();
      showNotification("Event scheduled successfully!", "success");
    } catch (error) {
      console.error("Schedule Event Error:", error.response?.data || error.message);
      showNotification("Failed to schedule event.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirmation({
      title: "Delete Event",
      message: "Are you sure you want to delete this event? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/events/${id}/`);
          await fetchEvents(); 
          showNotification("Event deleted.", "info");
        } catch (err) {
          console.error("Delete Event Error:", err.response?.data || err.message);
          showNotification('Failed to delete event.', "error");
        }
      }
    });
  };

  const handleEditEvent = async (id, updatedEvent) => {
    try {
      await axios.put(`${API_BASE_URL}/events/${id}/`, updatedEvent);
      fetchEvents();
      setEditingEvent(null);
      showNotification("Event updated successfully.", "success");
    } catch (err) {
      console.error("Update Event Error:", err.response?.data || err.message);
      showNotification('Failed to update event.', "error");
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
        alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
            CALENDAR
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Events
          </Typography>
        </Box>
        <Chip 
          icon={<CalendarIcon size={14} />} 
          label={format(new Date(), 'MMMM yyyy')} 
          sx={{ fontWeight: 700, borderRadius: 3, height: 40, px: 1, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
        />
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: CREATOR FORM --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            p: 3, 
            position: { md: 'sticky' }, 
            top: { md: 20 },
            boxShadow: theme.shadows[3],
            borderRadius: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 48, height: 48, borderRadius: 3 }}>
                <Plus size={24} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>New Event</Typography>
                <Typography variant="caption" color="text.secondary">Add to schedule</Typography>
              </Box>
            </Box>

            <form onSubmit={handleCreateEvent}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Annual Gala"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: formData.isOnline ? theme.palette.success.main : theme.palette.grey[300] }}>
                             {formData.isOnline ? <Globe size={16} color="#fff" /> : <MapPin size={16} color="#fff" />}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{formData.isOnline ? "Online / Virtual" : "In-Person Event"}</Typography>
                        </Box>
                      }
                    />
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label={formData.isOnline ? "Meeting Link / Platform" : "Location"}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={formData.isOnline ? "e.g. Zoom Link or Google Meet" : "Main Auditorium"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {formData.isOnline ? (
                            <Video size={18} color={theme.palette.text.secondary} />
                          ) : (
                            <MapPin size={18} color={theme.palette.text.secondary} />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    disabled={submitting}
                    sx={{ mt: 1, py: 1.8, borderRadius: 3, fontWeight: 700, boxShadow: theme.shadows[4] }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Publish Event'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>

        {/* --- RIGHT COL: AGENDA LIST --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {loading ? (
               Array.from(new Array(3)).map((_, i) => (
                 <Card key={i} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
                   <Skeleton variant="rounded" width={80} height={80} sx={{ mr: 3, borderRadius: 3 }} />
                   <Box sx={{ flexGrow: 1 }}>
                     <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                     <Skeleton width="40%" height={20} />
                   </Box>
                 </Card>
               ))
            ) : filteredEvents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6, bgcolor: theme.palette.background.paper, borderRadius: 4 }}>
                <Box sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.1), width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <CalendarIcon size={40} />
                </Box>
                <Typography variant="h6" fontWeight={700}>No upcoming events</Typography>
                <Typography variant="body2">Use the form to create your first event.</Typography>
              </Box>
            ) : (
              filteredEvents.map((event) => {
                const eventDate = parseDate(event.date);
                return (
                <Card 
                  key={event.id}
                  sx={{ 
                    p: 0, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: theme.shadows[8] },
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {/* Date Block */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'row', sm: 'column' }, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: { xs: 2, sm: 3 },
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    minWidth: { sm: 120 },
                    gap: { xs: 2, sm: 0 },
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                      {format(eventDate, 'dd')}
                    </Typography>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, opacity: 0.8, letterSpacing: 1, mt: { sm: 0.5 } }}>
                      {format(eventDate, 'MMM')}
                    </Typography>
                  </Box>

                  {/* Details */}
                  <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                        {event.name}
                      </Typography>
                      {event.isOnline && (
                        <Chip 
                          icon={<Wifi size={12} />} 
                          label="Online" 
                          size="small" 
                          color="success" 
                          sx={{ height: 24, fontWeight: 700, borderRadius: '6px' }} 
                        />
                      )}
                    </Box>
                    
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2, color: theme.palette.text.secondary }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: theme.palette.action.hover, py: 0.5, px: 1.5, borderRadius: 2 }}>
                        <Clock size={16} color={theme.palette.primary.main} />
                        <Typography variant="body2" fontWeight={600}>{event.time}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: theme.palette.action.hover, py: 0.5, px: 1.5, borderRadius: 2 }}>
                        {event.isOnline ? <Video size={16} color={theme.palette.primary.main} /> : <MapPin size={16} color={theme.palette.primary.main} />}
                        <Typography variant="body2" fontWeight={600}>{event.location}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'row', sm: 'column' },
                    gap: 1, 
                    p: 2, 
                    borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
                    borderLeft: { sm: `1px solid ${theme.palette.divider}` },
                    justifyContent: { xs: 'flex-end', sm: 'center' },
                    bgcolor: theme.palette.background.default
                  }}>
                    <Tooltip title="Edit Event">
                      <IconButton size="small" onClick={() => setEditingEvent(event)} sx={{ color: theme.palette.primary.main }}>
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Event">
                      <IconButton size="small" onClick={() => handleDelete(event.id)} sx={{ color: theme.palette.error.main, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
                );
              })
            )}
          </Stack>
        </Grid>

      </Grid>
      
      <EditEventDialog
        open={editingEvent !== null}
        onClose={() => setEditingEvent(null)}
        onEditEvent={handleEditEvent}
        event={editingEvent}
      />

    </Box>
  );
};

export default Events;