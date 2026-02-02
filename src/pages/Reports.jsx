import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  Chip, 
  Avatar, 
  useTheme, 
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  PieChart, 
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Download
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002/api';

const Reports = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [stats, setStats] = useState({ members: 0, funds: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // Tracks which report is downloading
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- FETCH SUMMARY DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate network delay for smooth skeleton transition
        // await new Promise(resolve => setTimeout(resolve, 800)); 
        
        const [membersRes, financeRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/members`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/events`),
        ]);

        const totalFunds = financeRes.data
          .filter(t => t.type === 'contribution')
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setStats({
          members: membersRes.data.length,
          funds: totalFunds,
          events: eventsRes.data.length
        });
      } catch (err) {
        console.error("Stats Sync Error:", err);
        showSnackbar("Failed to sync dashboard stats.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- HANDLERS ---
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const downloadReport = async (type) => {
    setGenerating(type);
    
    try {
      // 1. Fetch Fresh Data
      let endpoint = '';
      if (type === 'members') endpoint = 'members';
      if (type === 'financial') endpoint = 'transactions';
      if (type === 'attendance') endpoint = 'events'; // Typically attendance is linked to events

      const res = await axios.get(`${API_BASE_URL}/${endpoint}`);
      const data = res.data;

      if (!data || data.length === 0) {
        showSnackbar("No data available to generate report.", "warning");
        setGenerating(null);
        return;
      }

      // 2. Convert JSON to CSV
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(obj => 
        Object.values(obj).map(v => 
          `"${String(v).replace(/"/g, '""')}"` // Handle commas/quotes in data
        ).join(",")
      );
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

      // 3. Trigger Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${type}_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully.`);

    } catch (error) {
      console.error(error);
      showSnackbar("Failed to generate document.", "error");
    } finally {
      setGenerating(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
          Executive Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate and export official documentation
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- ROW 1: GENERATORS --- */}
        
        {/* Members Report */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: theme.shadows[3], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
                <Users size={20} />
              </Avatar>
              <Chip label="Directory" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            
            <Typography variant="h6" fontWeight={700} gutterBottom>Membership Registry</Typography>
            
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {loading ? (
                <Skeleton variant="text" width="90%" />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Full export of all <strong>{stats.members}</strong> registered members, including contact details and addresses.
                </Typography>
              )}
            </Box>

            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => downloadReport('members')}
              disabled={generating === 'members' || loading}
              startIcon={generating === 'members' ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
              sx={{ borderRadius: 2, py: 1, border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}
            >
              {generating === 'members' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        {/* Financial Report */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: theme.shadows[3], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main }}>
                <DollarSign size={20} />
              </Avatar>
              <Chip label="Finance" size="small" color="success" variant="outlined" sx={{ fontWeight: 600, border: 'none', bgcolor: theme.palette.success.light, color: theme.palette.success.dark }} />
            </Box>
            
            <Typography variant="h6" fontWeight={700} gutterBottom>Financial Statement</Typography>
            
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {loading ? (
                 <Skeleton variant="text" width="90%" />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Detailed ledger of all contributions (<strong>${stats.funds.toLocaleString()}</strong>) and operational expenses.
                </Typography>
              )}
            </Box>

            <Button 
              variant="contained" 
              color="success"
              fullWidth 
              onClick={() => downloadReport('financial')}
              disabled={generating === 'financial' || loading}
              startIcon={generating === 'financial' ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
              sx={{ borderRadius: 2, py: 1, boxShadow: 'none' }}
            >
              {generating === 'financial' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        {/* Attendance Report */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: theme.shadows[3], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.main }}>
                <Calendar size={20} />
              </Avatar>
              <Chip label="Activity" size="small" color="warning" variant="outlined" sx={{ fontWeight: 600, border: 'none', bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark }} />
            </Box>
            
            <Typography variant="h6" fontWeight={700} gutterBottom>Attendance Logs</Typography>
            
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {loading ? (
                 <Skeleton variant="text" width="90%" />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Historical data of service attendance records, including headcount and absentee lists.
                </Typography>
              )}
            </Box>

            <Button 
              variant="outlined" 
              color="warning"
              fullWidth 
              onClick={() => downloadReport('attendance')}
              disabled={generating === 'attendance' || loading}
              startIcon={generating === 'attendance' ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
              sx={{ borderRadius: 2, py: 1 }}
            >
              {generating === 'attendance' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        {/* --- ROW 2: ARCHIVE --- */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, px: 1 }}>Recent Archive</Typography>
          <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <List disablePadding>
              
              <ListItem 
                secondaryAction={
                  <IconButton edge="end" onClick={() => showSnackbar("Downloading archived report...", "info")}>
                    <ArrowRight size={18} />
                  </IconButton>
                }
                sx={{ 
                  '&:hover': { bgcolor: theme.palette.action.hover }, 
                  cursor: 'pointer',
                  py: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                    <FileText size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Monthly_Tithe_Report_Jan.pdf" 
                  secondary="Generated Jan 01, 2026 • 2.4 MB" 
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />
              
              <ListItem 
                secondaryAction={
                  <IconButton edge="end" onClick={() => showSnackbar("Downloading archived report...", "info")}>
                    <ArrowRight size={18} />
                  </IconButton>
                }
                sx={{ 
                  '&:hover': { bgcolor: theme.palette.action.hover }, 
                  cursor: 'pointer',
                  py: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                    <PieChart size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Annual_Membership_Review_2025.pdf" 
                  secondary="Generated Dec 31, 2025 • 4.1 MB" 
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                />
              </ListItem>

              <Divider variant="inset" component="li" />

              <ListItem 
                secondaryAction={
                  <IconButton edge="end" onClick={() => showSnackbar("Downloading archived report...", "info")}>
                    <ArrowRight size={18} />
                  </IconButton>
                }
                sx={{ 
                  '&:hover': { bgcolor: theme.palette.action.hover }, 
                  cursor: 'pointer',
                  py: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                    <FileSpreadsheet size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Event_Attendance_Q4_2025.csv" 
                  secondary="Generated Dec 15, 2025 • 850 KB" 
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                />
              </ListItem>
            </List>
          </Card>
        </Grid>

      </Grid>

      {/* --- NOTIFICATIONS --- */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Reports;