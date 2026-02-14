import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  List, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Divider, 
  useTheme, 
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Calendar, 
  CheckCircle, 
  Save, 
  History, 
  Users, 
  AlertCircle,
  Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:3002/api';

const Attendance = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedAttendees, setSelectedAttendees] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [membersRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/members`),
        axios.get(`${API_BASE_URL}/attendance`)
      ]);
      setMembers(membersRes.data);
      setAttendanceRecords(attendanceRes.data.reverse());
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const handleToggle = (id) => {
    const newSet = new Set(selectedAttendees);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAttendees(newSet);
  };

  const handleSave = async () => {
    if (selectedAttendees.size === 0) return alert("Select at least one member.");
    
    setSubmitting(true);
    const attendeesList = members.filter(m => selectedAttendees.has(m.id));

    try {
      await axios.post(`${API_BASE_URL}/attendance`, {
        date: selectedDate,
        attendees: attendeesList,
      });
      setSelectedAttendees(new Set());
      fetchData();
    } catch (err) {
      alert("Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
            Attendance Register
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Track daily presence & engagement
          </Typography>
        </Box>

        {/* Date Picker Card */}
        <Card sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
          <Box sx={{ p: 1, bgcolor: theme.palette.primary.light, borderRadius: 2, color: theme.palette.primary.contrastText }}>
            <Calendar size={18} />
          </Box>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: '14px',
              color: theme.palette.text.primary,
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </Card>
      </Box>

      <Grid container spacing={3}>
        
        {/* --- LEFT COL: MARK ATTENDANCE --- */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Card Header */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                  <Users size={18} />
                </Avatar>
                <Typography variant="h6">Mark Present</Typography>
              </Box>
              <Chip label={`${selectedAttendees.size} Selected`} color="primary" variant="outlined" size="small" />
            </Box>

            {/* Scrollable List */}
            <List sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1 }}>
              {members.map((member) => {
                const isSelected = selectedAttendees.has(member.id);
                return (
                  <ListItemButton 
                    key={member.id} 
                    onClick={() => handleToggle(member.id)}
                    sx={{ 
                      borderRadius: 2, 
                      mb: 1,
                      border: isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                      bgcolor: isSelected ? theme.palette.action.selected : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: isSelected ? theme.palette.primary.main : theme.palette.action.hover,
                        color: isSelected ? '#FFF' : theme.palette.text.secondary
                      }}>
                        {member.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={member.name} 
                      primaryTypographyProps={{ fontWeight: isSelected ? 600 : 400 }}
                      secondary={member.email}
                    />
                    {isSelected && <CheckCircle size={20} color={theme.palette.primary.main} />}
                  </ListItemButton>
                );
              })}
            </List>

            {/* Footer Action */}
            <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                startIcon={submitting ? <CircularProgress size={20} color="inherit"/> : <Save size={20} />}
                onClick={handleSave}
                disabled={submitting || selectedAttendees.size === 0}
                sx={{ borderRadius: 3, py: 1.5 }}
              >
                {submitting ? 'Saving Register...' : 'Save Attendance Record'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: HISTORY LOG --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                <History size={18} />
              </Avatar>
              <Typography variant="h6">Recent Logs</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {attendanceRecords.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 10, opacity: 0.5 }}>
                  <AlertCircle size={48} style={{ marginBottom: 10 }} />
                  <Typography>No records found</Typography>
                </Box>
              ) : (
                attendanceRecords.map((record) => (
                  <Box 
                    key={record.id} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: theme.palette.text.secondary }}>
                      <Clock size={14} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 0.5 }}>
                      {record.attendees ? record.attendees.length : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Members Present
                    </Typography>

                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                      {record.attendees && record.attendees.slice(0, 3).map(a => a.name).join(', ')}
                      {record.attendees && record.attendees.length > 3 && '...'}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Attendance;