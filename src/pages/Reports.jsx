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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Skeleton,
  alpha,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  CircularProgress,
  ButtonGroup
} from '@mui/material';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  PieChart, 
  FileText,
  Download,
  BarChart2,
  Clock,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const theme = useTheme();
  const { workspace, filterData, showNotification } = useWorkspace();
  
  // --- STATE ---
  const [stats, setStats] = useState({ members: 0, funds: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // Tracks which report/format is downloading

  // --- FETCH SUMMARY DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [membersRes, financeRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/members`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/events`),
        ]);

        const filteredMembers = filterData(membersRes.data || []);
        const memberIds = new Set(filteredMembers.map(m => String(m.id)));

        const totalFunds = (financeRes.data || [])
          .filter(t => {
            if (t.type !== 'contribution') return false;
            if (t.memberId) return memberIds.has(String(t.memberId));
            return workspace === 'main';
          })
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setStats({
          members: filteredMembers.length,
          funds: totalFunds,
          events: (eventsRes.data || []).length
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

  const downloadReport = async (type, format) => {
    const genKey = `${type}-${format}`;
    setGenerating(genKey);
    
    try {
      let endpoint = '';
      if (type === 'members') endpoint = 'members';
      if (type === 'financial') endpoint = 'transactions';
      if (type === 'attendance') endpoint = 'attendance';

      const res = await axios.get(`${API_BASE_URL}/${endpoint}`);
      const rawData = res.data;
      const data = filterData(rawData);

      if (!data || data.length === 0) {
        showNotification("No data available to generate report.", "warning");
        setGenerating(null);
        return;
      }

      const fileName = `${type}_report_${new Date().toISOString().slice(0,10)}`;

      if (format === 'pdf') {
        generatePDF(data, type, fileName);
      } else if (format === 'excel') {
        generateExcel(data, type, fileName);
      }
      
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} ${format.toUpperCase()} report downloaded successfully.`);
    } catch (error) {
      console.error(error);
      showNotification("Failed to generate document.", "error");
    } finally {
      setGenerating(null);
    }
  };

  const generatePDF = (data, type, fileName) => {
    const doc = new jsPDF();
    const title = `${type.toUpperCase()} REPORT`;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => Object.values(row).map(v => v === null || v === undefined ? '' : String(v)));

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 }
    });

    doc.save(`${fileName}.pdf`);
  };

  const generateExcel = (data, type, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const reportTypes = [
    { id: 'members', title: 'Membership', icon: Users, color: theme.palette.primary.main, desc: `Full registry export of ${stats.members} members.` },
    { id: 'financial', title: 'Financial', icon: DollarSign, color: theme.palette.success.main, desc: `Balance sheets and transactions (GHC ${stats.funds.toLocaleString()}).` },
    { id: 'attendance', title: 'Attendance', icon: Calendar, color: theme.palette.warning.main, desc: 'Participation trends and logs.' }
  ];

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 6, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 8,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`
           : alpha(theme.palette.primary.main, 0.05),
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Chip icon={<BarChart2 size={14} />} label="Data & Insights" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                Executive Reports
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Generate detailed audits and summaries of your church operations.
            </Typography>
        </Container>
      </Box>

      <Grid container spacing={4}>
        {/* Report Category Cards */}
        {reportTypes.map((report, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={report.id}>
                <Card sx={{ 
                    p: 4, height: '100%', borderRadius: 6, border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[10], borderColor: report.color }
                }}>
                    <Avatar sx={{ bgcolor: alpha(report.color, 0.1), color: report.color, borderRadius: 3, width: 56, height: 56, mb: 3 }}>
                        <report.icon size={28} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={800} gutterBottom>{report.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, minHeight: 40 }}>
                        {loading ? <Skeleton /> : report.desc}
                    </Typography>
                    
                    <Stack spacing={2}>
                        <Button 
                            fullWidth variant="contained" 
                            startIcon={generating === `${report.id}-pdf` ? <CircularProgress size={18} color="inherit" /> : <FileText size={18} />}
                            onClick={() => downloadReport(report.id, 'pdf')}
                            disabled={generating !== null || loading}
                            sx={{ borderRadius: 3, fontWeight: 700, py: 1.2 }}
                        >
                            {generating === `${report.id}-pdf` ? 'Preparing PDF...' : 'Download PDF'}
                        </Button>
                        <Button 
                            fullWidth variant="outlined" 
                            startIcon={generating === `${report.id}-excel` ? <CircularProgress size={18} /> : <FileSpreadsheet size={18} />}
                            onClick={() => downloadReport(report.id, 'excel')}
                            disabled={generating !== null || loading}
                            sx={{ borderRadius: 3, fontWeight: 700, py: 1.2 }}
                        >
                            {generating === `${report.id}-excel` ? 'Preparing Excel...' : 'Download Excel'}
                        </Button>
                    </Stack>
                </Card>
            </Grid>
        ))}

        {/* Archive Table */}
        <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={20} color={theme.palette.text.secondary} /> Recent Archive
                    </Typography>
                    <Button size="small" endIcon={<ChevronRight size={16} />} sx={{ fontWeight: 700 }}>Full Archive</Button>
                </Stack>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 5, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                                {['Report Name', 'Type', 'Generated On', 'Status', 'Actions'].map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { name: 'Monthly_Audit_Jan.pdf', type: 'Financial', date: 'Feb 01, 2026', status: 'Final' },
                                { name: 'Member_Demographics_Q4.xlsx', type: 'Membership', date: 'Jan 15, 2026', status: 'Final' },
                                { name: 'Annual_Giving_Statement.pdf', type: 'Financial', date: 'Dec 31, 2025', status: 'Archived' }
                            ].map((row, idx) => (
                                <TableRow key={idx} hover sx={{ cursor: 'pointer' }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                                <FileText size={16} />
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={700}>{row.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={row.type} size="small" sx={{ fontWeight: 700, borderRadius: 1 }} /></TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{row.date}</TableCell>
                                    <TableCell><Chip label={row.status} size="small" color="success" variant="outlined" sx={{ fontWeight: 800, height: 20, fontSize: '0.6rem' }} /></TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="primary">
                                            <Download size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Grid>
      </Grid>

    </Box>
  );
};

export default Reports;