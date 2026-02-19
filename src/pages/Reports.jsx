import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
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
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import Divider from '@mui/material/Divider';
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

import { API_BASE_URL } from '../config';

const Reports = () => {
  const theme = useTheme();
  const workspaceContext = useWorkspace();
  const workspace = workspaceContext?.workspace || 'main';
  const filterData = workspaceContext?.filterData || ((d) => d);
  
  // --- STATE ---
  const [stats, setStats] = useState({ members: 0, funds: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // Tracks which report is downloading
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- FETCH SUMMARY DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, financeRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/members`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/events`),
        ]);

        const filteredMembers = filterData(membersRes.data);
        const memberIds = new Set(filteredMembers.map(m => String(m.id)));

        const totalFunds = financeRes.data
          .filter(t => {
            if (t.type !== 'contribution') return false;
            if (t.memberId) return memberIds.has(String(t.memberId));
            return workspace === 'main';
          })
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setStats({
          members: filteredMembers.length,
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
  }, [workspace, filterData]);

  // --- HANDLERS ---
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const downloadReport = async (type) => {
    setGenerating(type);
    
    try {
      // 1. Fresh data logic
      let endpoint = '';
      if (type === 'members') endpoint = 'members';
      if (type === 'financial') endpoint = 'transactions';
      if (type === 'attendance') endpoint = 'events';

      const res = await axios.get(`${API_BASE_URL}/${endpoint}`);
      const rawData = res.data;

      // 🟢 Apply Security Filter before generating report
      const data = filterData(rawData);

      if (!data || data.length === 0) {
        showSnackbar("No data available to generate report.", "warning");
        setGenerating(null);
        return;
      }

      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(obj => 
        Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
      );
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
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
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
          Executive Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate and export official documentation
        </Typography>
      </Box>

      <Grid container spacing={4}>
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
              {loading ? <Skeleton variant="text" width="90%" /> : (
                <Typography variant="body2" color="text.secondary">
                  Full export of all <strong>{stats.members}</strong> registered members.
                </Typography>
              )}
            </Box>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => downloadReport('members')}
              disabled={generating === 'members' || loading}
              startIcon={<Download size={16} />}
              sx={{ borderRadius: 2 }}
            >
              {generating === 'members' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: theme.shadows[3], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main }}>
                <DollarSign size={20} />
              </Avatar>
              <Chip label="Finance" size="small" color="success" />
            </Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>Financial Statement</Typography>
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {loading ? <Skeleton variant="text" width="90%" /> : (
                <Typography variant="body2" color="text.secondary">
                  Total contributions: <strong>GHC{stats.funds.toLocaleString()}</strong>.
                </Typography>
              )}
            </Box>
            <Button 
              variant="contained" 
              color="success"
              fullWidth 
              onClick={() => downloadReport('financial')}
              disabled={generating === 'financial' || loading}
              startIcon={<Download size={16} />}
              sx={{ borderRadius: 2 }}
            >
              {generating === 'financial' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: theme.shadows[3], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.main }}>
                <Calendar size={20} />
              </Avatar>
              <Chip label="Activity" size="small" color="warning" />
            </Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>Attendance Logs</Typography>
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {loading ? <Skeleton variant="text" width="90%" /> : (
                <Typography variant="body2" color="text.secondary">Historical attendance data.</Typography>
              )}
            </Box>
            <Button 
              variant="outlined" 
              color="warning"
              fullWidth 
              onClick={() => downloadReport('attendance')}
              disabled={generating === 'attendance' || loading}
              startIcon={<Download size={16} />}
              sx={{ borderRadius: 2 }}
            >
              {generating === 'attendance' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Archive</Typography>
          <Card sx={{ borderRadius: 3 }}>
            <List>
              <ListItem 
                secondaryAction={<IconButton edge="end"><ArrowRight size={18} /></IconButton>}
                sx={{ py: 2 }}
              >
                <ListItemAvatar><Avatar><FileText size={20} /></Avatar></ListItemAvatar>
                <ListItemText primary="Monthly_Report_Jan.pdf" secondary="Jan 01, 2026" />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem 
                secondaryAction={<IconButton edge="end"><ArrowRight size={18} /></IconButton>}
                sx={{ py: 2 }}
              >
                <ListItemAvatar><Avatar><PieChart size={20} /></Avatar></ListItemAvatar>
                <ListItemText primary="Annual_Review_2025.pdf" secondary="Dec 31, 2025" />
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
