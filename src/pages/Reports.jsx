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
  Divider
} from '@mui/material';
import { 
  FileText, 
  Download, 
  Users, 
  DollarSign, 
  Calendar, 
  PieChart, 
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002/api';

const Reports = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [stats, setStats] = useState({ members: 0, funds: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // Tracks which report is downloading

  // --- FETCH SUMMARY DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, financeRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/members`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/events`),
        ]);

        const totalFunds = financeRes.data
          .filter(t => t.type === 'contribution')
          .reduce((acc, curr) => acc + Number(curr.amount), 0);

        setStats({
          members: membersRes.data.length,
          funds: totalFunds,
          events: eventsRes.data.length
        });
      } catch (err) {
        console.error("Stats Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- CSV GENERATOR ---
  const downloadReport = async (type) => {
    setGenerating(type);
    
    try {
      // 1. Fetch Fresh Data
      let endpoint = '';
      if (type === 'members') endpoint = 'members';
      if (type === 'financial') endpoint = 'transactions';
      if (type === 'attendance') endpoint = 'attendance';

      const res = await axios.get(`${API_BASE_URL}/${endpoint}`);
      const data = res.data;

      if (data.length === 0) {
        alert("No data available to generate report.");
        setGenerating(null);
        return;
      }

      // 2. Convert JSON to CSV
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(","));
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

      // 3. Trigger Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${type}_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      alert("Failed to generate document.");
    } finally {
      setTimeout(() => setGenerating(null), 1000); // Small delay for UX
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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
          Executive Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate and export official documentation
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- ROW 1: GENERATORS --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
                <Users size={20} />
              </Avatar>
              <Chip label="Directory" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>Membership Registry</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
              Full export of all {stats.members} registered members, including contact details and addresses.
            </Typography>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => downloadReport('members')}
              disabled={generating === 'members'}
              startIcon={generating === 'members' ? <CircularProgress size={16} /> : <Download size={16} />}
              sx={{ borderRadius: 2 }}
            >
              {generating === 'members' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main }}>
                <DollarSign size={20} />
              </Avatar>
              <Chip label="Finance" size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>Financial Statement</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
              Detailed ledger of all contributions (${stats.funds.toLocaleString()}) and operational expenses.
            </Typography>
            <Button 
              variant="outlined" 
              color="success"
              fullWidth 
              onClick={() => downloadReport('financial')}
              disabled={generating === 'financial'}
              startIcon={generating === 'financial' ? <CircularProgress size={16} /> : <Download size={16} />}
              sx={{ borderRadius: 2 }}
            >
              {generating === 'financial' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.main }}>
                <Calendar size={20} />
              </Avatar>
              <Chip label="Activity" size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>Attendance Logs</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
              Historical data of service attendance records, including headcount and absentee lists.
            </Typography>
            <Button 
              variant="outlined" 
              color="warning"
              fullWidth 
              onClick={() => downloadReport('attendance')}
              disabled={generating === 'attendance'}
              startIcon={generating === 'attendance' ? <CircularProgress size={16} /> : <Download size={16} />}
              sx={{ borderRadius: 2 }}
            >
              {generating === 'attendance' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        {/* --- ROW 2: ARCHIVE --- */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Recent Archive</Typography>
          <Card>
            <List>
              <ListItem 
                secondaryAction={
                  <IconButton edge="end">
                    <ArrowRight size={18} />
                  </IconButton>
                }
                sx={{ '&:hover': { bgcolor: theme.palette.action.hover }, cursor: 'pointer' }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                    <FileText size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Monthly_Tithe_Report_Jan.pdf" 
                  secondary="Generated Jan 01, 2026 • 2.4 MB" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />
              
              <ListItem 
                secondaryAction={
                  <IconButton edge="end">
                    <ArrowRight size={18} />
                  </IconButton>
                }
                sx={{ '&:hover': { bgcolor: theme.palette.action.hover }, cursor: 'pointer' }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                    <PieChart size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Annual_Membership_Review_2025.pdf" 
                  secondary="Generated Dec 31, 2025 • 4.1 MB" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>

              <Divider variant="inset" component="li" />

              <ListItem 
                secondaryAction={
                  <IconButton edge="end">
                    <ArrowRight size={18} />
                  </IconButton>
                }
                sx={{ '&:hover': { bgcolor: theme.palette.action.hover }, cursor: 'pointer' }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                    <FileSpreadsheet size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Event_Attendance_Q4_2025.csv" 
                  secondary="Generated Dec 15, 2025 • 850 KB" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Reports;