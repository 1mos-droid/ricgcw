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
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton
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
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      // Don't set loading true here if we want a "silent" background refresh
      // But for initial load, it is necessary.
      if (members.length === 0) setLoading(true); 
      
      const [membersRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/members`),
        axios.get(`${API_BASE_URL}/attendance`)
      ]);
      setMembers(membersRes.data);
      setAttendanceRecords(attendanceRes.data.reverse());
    } catch (err) {
      console.error("Sync Error:", err);
      showSnackbar("Failed to load data. Check connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [members.length]);

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
    if (selectedAttendees.size === 0) {
      showSnackbar("Please select at least one member.", "warning");
      return;
    }
    
    setSubmitting(true);
    const attendeesList = members.filter(m => selectedAttendees.has(m.id));

    try {
      await axios.post(`${API_BASE_URL}/attendance`, {
        date: selectedDate,
        attendees: attendeesList,
      });
      setSelectedAttendees(new Set());
      await fetchData(); // Refresh logs
      showSnackbar("Attendance saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to save attendance.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3, 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Attendance Register
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Track daily presence & engagement
          </Typography>
        </Box>

        {/* Date Picker Card */}
        <Card sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          borderRadius: 3,
          width: { xs: '100%', sm: 'auto' }, // Full width on mobile
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ p: 1, bgcolor: theme.palette.primary.light, borderRadius: 2, color: theme.palette.primary.contrastText, display: 'flex' }}>
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
              cursor: 'pointer',
              width: '100%'
            }}
          />
        </Card>
      </Box>

      {/* --- CONTENT GRID --- */}
      <Grid container spacing={3}>
        
        {/* --- LEFT COL: MARK ATTENDANCE --- */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
            
            {/* Card Header */}
            <Box sx={{ 
              p: { xs: 2, md: 3 }, 
              borderBottom: `1px solid ${theme.palette.divider}`, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                  <Users size={18} />
                </Avatar>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  Mark Present
                </Typography>
              </Box>
              <Chip 
                label={`${selectedAttendees.size} Selected`} 
                color="primary" 
                variant={selectedAttendees.size > 0 ? "filled" : "outlined"} 
                size="small" 
              />
            </Box>

            {/* Scrollable List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: { xs: 1, md: 2 }, py: 1, maxHeight: { xs: '45vh', md: '60vh' }, minHeight: '300px' }}>
              {loading ? (
                 // Loading Skeleton
                 Array.from(new Array(5)).map((_, index) => (
                   <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2 }}>
                     <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                     <Box sx={{ width: '100%' }}>
                       <Skeleton variant="text" width="60%" />
                       <Skeleton variant="text" width="40%" />
                     </Box>
                   </Box>
                 ))
              ) : members.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                  <Users size={48} style={{ marginBottom: 8 }} />
                  <Typography>No members found</Typography>
                </Box>
              ) : (
                <List>
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
                          bgcolor: isSelected ? theme.palette.action.selected : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: isSelected ? theme.palette.action.selected : theme.palette.action.hover,
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: isSelected ? theme.palette.primary.main : theme.palette.grey[200],
                            color: isSelected ? '#FFF' : theme.palette.text.secondary,
                            transition: 'all 0.2s'
                          }}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={member.name} 
                          primaryTypographyProps={{ fontWeight: isSelected ? 600 : 400 }}
                          secondary={member.email}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        {isSelected && 
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle size={20} color={theme.palette.primary.main} />
                          </motion.div>
                        }
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </Box>

            {/* Footer Action */}
            <Box sx={{ p: { xs: 2, md: 3 }, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                disabled={submitting || selectedAttendees.size === 0 || loading}
                onClick={handleSave}
                sx={{ 
                  borderRadius: 3, 
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: theme.shadows[4]
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit"/>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Save size={20} />
                    <span>Save Attendance Record</span>
                  </Box>
                )}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: HISTORY LOG --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 3, maxHeight: '80vh' }}>
            <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                <History size={18} />
              </Avatar>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Recent Logs
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, maxHeight: { xs: '40vh', md: '65vh' } }}>
              {loading ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                   <CircularProgress size={30} />
                 </Box>
              ) : attendanceRecords.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5, px: 2 }}>
                  <AlertCircle size={48} style={{ marginBottom: 10 }} />
                  <Typography variant="body2">No records found for this period.</Typography>
                </Box>
              ) : (
                attendanceRecords.map((record, index) => (
                  <Box 
                    key={record.id || index} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.background.default, // Using theme background
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[2]
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: theme.palette.text.secondary }}>
                      <Clock size={14} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {record.attendees ? record.attendees.length : 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Present
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                    
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', lineHeight: 1.5 }}>
                      {record.attendees && record.attendees.length > 0 
                        ? record.attendees.slice(0, 3).map(a => a.name).join(', ') 
                        : 'No attendees recorded'}
                      {record.attendees && record.attendees.length > 3 && ` +${record.attendees.length - 3} more`}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* --- NOTIFICATIONS --- */}
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

export default Attendance;