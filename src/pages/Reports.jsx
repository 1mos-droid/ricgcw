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
  Alert,
  alpha
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
  const { workspace, filterData, showNotification } = workspaceContext;
  
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
        showNotification("Failed to sync dashboard stats.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [workspace, filterData, showNotification]);

  // --- HANDLERS ---
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
        showNotification("No data available to generate report.", "warning");
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
      
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully.`);
    } catch (error) {
      console.error(error);
      showNotification("Failed to generate document.", "error");
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
        <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
          DOCUMENTS
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
          Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate and export official documentation
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            p: 3, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: 3 }}>
                <Users size={20} />
              </Avatar>
              <Chip label="Directory" size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} gutterBottom>Membership Registry</Typography>
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
              startIcon={<Download size={18} />}
              sx={{ borderRadius: 3, py: 1, fontWeight: 600, border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}
            >
              {generating === 'members' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            p: 3, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, borderRadius: 3 }}>
                <DollarSign size={20} />
              </Avatar>
              <Chip label="Finance" size="small" color="success" sx={{ fontWeight: 700, borderRadius: 2 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} gutterBottom>Financial Statement</Typography>
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {loading ? <Skeleton variant="text" width="90%" /> : (
                <Typography variant="body2" color="text.secondary">
                  Total contributions: <strong>GHC{stats.funds.toLocaleString()}</strong>.
                </Typography>
              )}
            </Box>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => downloadReport('financial')}
              disabled={generating === 'financial' || loading}
              startIcon={<Download size={18} />}
              sx={{ borderRadius: 3, py: 1, fontWeight: 600, border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}
            >
              {generating === 'financial' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            p: 3, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, borderRadius: 3 }}>
                <Calendar size={20} />
              </Avatar>
              <Chip label="Activity" size="small" color="warning" sx={{ fontWeight: 700, borderRadius: 2 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} gutterBottom>Attendance Logs</Typography>
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              {loading ? <Skeleton variant="text" width="90%" /> : (
                <Typography variant="body2" color="text.secondary">Historical attendance data.</Typography>
              )}
            </Box>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => downloadReport('attendance')}
              disabled={generating === 'attendance' || loading}
              startIcon={<Download size={18} />}
              sx={{ borderRadius: 3, py: 1, fontWeight: 600, border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}
            >
              {generating === 'attendance' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, mt: 2 }}>Archive</Typography>
          <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <List sx={{ p: 0 }}>
              <ListItem 
                secondaryAction={<IconButton edge="end" sx={{ color: theme.palette.primary.main }}><ArrowRight size={20} /></IconButton>}
                sx={{ 
                  py: 2.5, 
                  px: 3, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } 
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, borderRadius: 3, color: theme.palette.text.secondary }}>
                    <FileText size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Monthly_Report_Jan.pdf" 
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondary="Jan 01, 2026" 
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem 
                secondaryAction={<IconButton edge="end" sx={{ color: theme.palette.primary.main }}><ArrowRight size={20} /></IconButton>}
                sx={{ 
                  py: 2.5, 
                  px: 3, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } 
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.background.default, borderRadius: 3, color: theme.palette.text.secondary }}>
                    <PieChart size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Annual_Review_2025.pdf" 
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondary="Dec 31, 2025" 
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
