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
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Map,
  ArrowRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002/api';

const Events = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/events`);
      // Sort by date (nearest first)
      const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
    } catch (err) {
      console.error("Calendar Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time) return;

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/events`, {
        ...formData,
        location: formData.location || 'Main Auditorium'
      });
      
      // Reset & Refresh
      setFormData({ name: '', date: '', time: '', location: '' });
      fetchEvents();
    } catch (error) {
      alert("Failed to schedule event.");
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
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
          sx={{ fontWeight: 600, borderRadius: 2 }}
        />
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: CREATOR FORM --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                <Plus size={20} color="#fff" />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Schedule Event</Typography>
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
                    sx={{ mt: 1, py: 1.5, borderRadius: 3 }}
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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {events.length === 0 ? (
                <Card sx={{ p: 5, textAlign: 'center', opacity: 0.7 }}>
                  <Typography variant="h6">No upcoming events found.</Typography>
                  <Typography variant="body2">Use the form to create your first event.</Typography>
                </Card>
              ) : (
                events.map((event) => (
                  <Card 
                    key={event.id}
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                  >
                    {/* Date Block */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 2,
                      minWidth: 80,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      mr: 3
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, lineHeight: 1 }}>
                        {format(new Date(event.date), 'dd')}
                      </Typography>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: theme.palette.text.secondary, mt: 0.5 }}>
                        {format(new Date(event.date), 'MMM')}
                      </Typography>
                    </Box>

                    {/* Details */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {event.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
                          <Clock size={14} />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>{event.time}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
                          <MapPin size={14} />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>{event.location}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Action */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <Chip label="Upcoming" size="small" sx={{ bgcolor: theme.palette.action.hover, fontWeight: 600 }} />
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          )}
        </Grid>

      </Grid>
    </Box>
  );
};

export default Events;