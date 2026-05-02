import React, { useState, useEffect, useMemo } from 'react';
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
  ButtonGroup,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  FileCode,
  Filter
} from 'lucide-react';

import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { safeParseDate } from '../utils/dateUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
];

const Reports = () => {
  const theme = useTheme();
  const { filterData, showNotification, isBranchRestricted, userBranch } = useWorkspace();
  
  // --- STATE ---
  const [stats, setStats] = useState({ members: 0, funds: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [reportPeriod, setReportPeriod] = useState('overall'); // 'overall' or 'monthly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedBranch, setSelectedBranch] = useState(isBranchRestricted ? userBranch : 'all');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'general',
    format: 'pdf'
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // --- FETCH SUMMARY DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [membersSnapshot, financeSnapshot, eventsSnapshot] = await Promise.all([
          getDocs(collection(db, "members")),
          getDocs(collection(db, "transactions")),
          getDocs(collection(db, "events")),
        ]);

        const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const financeData = financeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Apply local report filters
        const branchFilter = (data) => {
          if (selectedBranch === 'all') return data;
          return data.filter(item => 
            String(item.branch || item.category || '').toLowerCase() === selectedBranch.toLowerCase()
          );
        };

        const filteredMembers = branchFilter(membersData);
        const memberIds = new Set(filteredMembers.map(m => String(m.id)));

        const totalFunds = (financeData || [])
          .filter(t => {
            if (t.type !== 'contribution') return false;
            const itemBranch = String(t.category || '').toLowerCase();
            if (selectedBranch !== 'all' && itemBranch !== selectedBranch.toLowerCase()) return false;
            return true;
          })
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setStats({
          members: filteredMembers.length,
          funds: totalFunds,
          events: (eventsData || []).length
        });
      } catch (err) {
        console.error("Stats Sync Error:", err);
        showNotification("Failed to sync dashboard stats.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedBranch, showNotification]);

  const handleOpenDialog = (type) => {
    setReportConfig({ ...reportConfig, type });
    setOpenDialog(true);
  };

  const downloadReport = async () => {
    const { type, format } = reportConfig;
    setGenerating(true);
    
    try {
      let data = {};
      const dateStr = reportPeriod === 'monthly' 
        ? `${MONTHS[selectedMonth].label}_${selectedYear}`
        : new Date().toISOString().slice(0,10);
      const fileName = `${type}_report_${selectedBranch}_${dateStr}`;

      const branchFilter = (items) => {
        if (selectedBranch === 'all') return items;
        return items.filter(item => 
          String(item.branch || item.category || '').toLowerCase() === selectedBranch.toLowerCase()
        );
      };

      const periodFilter = (items) => {
        if (reportPeriod === 'overall') return items;
        return items.filter(item => {
          const itemDate = safeParseDate(item.date || item.createdAt || 0);
          return itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === selectedYear;
        });
      };

      if (type === 'general' || type === 'members') {
        const snap = await getDocs(collection(db, "members"));
        data.members = periodFilter(branchFilter(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      }
      if (type === 'general' || type === 'financial') {
        const snap = await getDocs(collection(db, "transactions"));
        data.financial = periodFilter(branchFilter(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      }
      if (type === 'general' || type === 'attendance') {
        const snap = await getDocs(collection(db, "attendance"));
        data.attendance = periodFilter(branchFilter(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      }

      // Check if any data exists
      const hasData = Object.values(data).some(arr => arr && arr.length > 0);
      if (!hasData) {
        showNotification("No data found for the selected criteria.", "warning");
        setGenerating(false);
        return;
      }

      if (format === 'pdf') {
        generateCategorizedPDF(data, type, fileName);
      } else {
        // Simple excel for now, combining if general
        const workbook = XLSX.utils.book_new();
        Object.keys(data).forEach(key => {
          if (data[key] && data[key].length > 0) {
            const ws = XLSX.utils.json_to_sheet(data[key]);
            XLSX.utils.book_append_sheet(workbook, ws, key.charAt(0).toUpperCase() + key.slice(1));
          }
        });
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      }
      
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated.`);
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      showNotification("Failed to generate report.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const generateCategorizedPDF = (data, type, fileName) => {
    const doc = new jsPDF();
    const periodTitle = reportPeriod === 'monthly' 
      ? `${MONTHS[selectedMonth].label.toUpperCase()} ${selectedYear}` 
      : 'OVERALL';
    const branchTitle = selectedBranch === 'all' ? 'OVERALL SYSTEM' : selectedBranch.toUpperCase();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text("EXECUTIVE REPORT", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Scope: ${branchTitle}`, 14, 30);
    doc.text(`Period: ${periodTitle}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);
    
    let currentY = 55;

    // --- FINANCIAL SECTION (Split Layout) ---
    if (data.financial && data.financial.length > 0) {
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text("Financial Statement", 14, currentY);
      currentY += 10;

      const income = data.financial.filter(t => t.type === 'contribution');
      const expenses = data.financial.filter(t => t.type === 'expense');

      const incomeTotal = income.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const expenseTotal = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Summary Table
      autoTable(doc, {
        head: [['Category', 'Total Amount']],
        body: [
          ['Total Income (Contributions)', `GHC ${incomeTotal.toLocaleString()}`],
          ['Total Expenses', `GHC ${expenseTotal.toLocaleString()}`],
          ['Net Balance', `GHC ${(incomeTotal - expenseTotal).toLocaleString()}`]
        ],
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontStyle: 'bold' }
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // side-by-side effectively means separate tables for Income and Expenses
      doc.setFontSize(14);
      doc.setTextColor(34, 197, 94); // Success Green
      doc.text("Income Details", 14, currentY);
      currentY += 5;

      if (income.length > 0) {
        autoTable(doc, {
          head: [['Date', 'Description', 'Branch', 'Amount']],
          body: income.sort((a,b) => safeParseDate(b.date) - safeParseDate(a.date)).map(t => [
            safeParseDate(t.date).toLocaleDateString(),
            t.description,
            t.category,
            `GHC ${Number(t.amount).toLocaleString()}`
          ]),
          startY: currentY,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [34, 197, 94] }
        });
        currentY = doc.lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("No income records found for this period.", 14, currentY + 5);
        currentY += 15;
      }

      if (currentY > 240) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setTextColor(239, 68, 68); // Error Red
      doc.text("Expense Details", 14, currentY);
      currentY += 5;

      if (expenses.length > 0) {
        autoTable(doc, {
          head: [['Date', 'Description', 'Branch', 'Amount']],
          body: expenses.sort((a,b) => safeParseDate(b.date) - safeParseDate(a.date)).map(t => [
            safeParseDate(t.date).toLocaleDateString(),
            t.description,
            t.category,
            `GHC ${Number(t.amount).toLocaleString()}`
          ]),
          startY: currentY,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] }
        });
        currentY = doc.lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("No expense records found for this period.", 14, currentY + 5);
        currentY += 15;
      }
    }

    // --- MEMBERSHIP SECTION ---
    if (data.members && data.members.length > 0) {
      if (currentY > 220) { doc.addPage(); currentY = 20; }
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("Membership Registry", 14, currentY);
      currentY += 10;

      autoTable(doc, {
        head: [['Name', 'Branch', 'Phone', 'Status']],
        body: data.members.map(m => [m.name, m.branch, m.phone, m.status]),
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      currentY = doc.lastAutoTable.finalY + 20;
    }

    // --- ATTENDANCE SECTION ---
    if (data.attendance && data.attendance.length > 0) {
      if (currentY > 220) { doc.addPage(); currentY = 20; }
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("Attendance Logs", 14, currentY);
      currentY += 10;

      autoTable(doc, {
        head: [['Date', 'Branch', 'Attendees']],
        body: data.attendance.map(a => [
            safeParseDate(a.date).toLocaleDateString(),
            a.branch,
            a.attendees?.length || 0
        ]),
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11] }
      });
    }

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
    { id: 'general', title: 'General Report', icon: BarChart2, color: theme.palette.info.main, desc: 'Aggregated summary of finances, members, and attendance.' },
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

      {/* --- FILTER BAR --- */}
      <Paper sx={{ p: 3, mb: 6, borderRadius: 6, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Filter size={16} /> BRANCH SCOPE
            </Typography>
            <FormControl fullWidth size="medium">
                <Select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    disabled={isBranchRestricted}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                    <MenuItem value="all">All Branches</MenuItem>
                    <MenuItem value="Mallam">Mallam</MenuItem>
                    <MenuItem value="Langma">Langma</MenuItem>
                    <MenuItem value="Kokrobitey">Kokrobitey</MenuItem>
                </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={16} /> REPORT PERIOD
            </Typography>
            <ButtonGroup fullWidth sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Button 
                variant={reportPeriod === 'overall' ? 'contained' : 'outlined'}
                onClick={() => setReportPeriod('overall')}
                sx={{ fontWeight: 700 }}
              >
                Overall
              </Button>
              <Button 
                variant={reportPeriod === 'monthly' ? 'contained' : 'outlined'}
                onClick={() => setReportPeriod('monthly')}
                sx={{ fontWeight: 700 }}
              >
                Monthly
              </Button>
            </ButtonGroup>
          </Grid>
          
          {reportPeriod === 'monthly' && (
            <>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>MONTH</Typography>
                <FormControl fullWidth size="medium">
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    sx={{ borderRadius: 3 }}
                  >
                    {MONTHS.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>YEAR</Typography>
                <FormControl fullWidth size="medium">
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    sx={{ borderRadius: 3 }}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Report Category Cards */}
        {reportTypes.map((report) => (
            <Grid size={{ xs: 12, md: report.id === 'general' ? 6 : 4 }} key={report.id}>
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
                    
                    <Button 
                        fullWidth variant="contained" 
                        startIcon={<FileText size={18} />}
                        onClick={() => handleOpenDialog(report.id)}
                        disabled={loading}
                        sx={{ borderRadius: 3, fontWeight: 700, py: 1.5, bgcolor: report.color, '&:hover': { bgcolor: alpha(report.color, 0.8) } }}
                    >
                        Configure & Generate
                    </Button>
                </Card>
            </Grid>
        ))}
      </Grid>

      {/* --- GENERATION DIALOG --- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { borderRadius: 6, width: '100%', maxWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
            Generate {reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} Report
        </DialogTitle>
        <DialogContent>
            <Box sx={{ py: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>EXPORT FORMAT</Typography>
                <ButtonGroup fullWidth sx={{ mb: 4 }}>
                    <Button 
                        variant={reportConfig.format === 'pdf' ? 'contained' : 'outlined'}
                        onClick={() => setReportConfig({ ...reportConfig, format: 'pdf' })}
                        startIcon={<FileText size={18} />}
                    >PDF</Button>
                    <Button 
                        variant={reportConfig.format === 'excel' ? 'contained' : 'outlined'}
                        onClick={() => setReportConfig({ ...reportConfig, format: 'excel' })}
                        startIcon={<FileSpreadsheet size={18} />}
                    >Excel</Button>
                </ButtonGroup>

                <Box sx={{ p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px dashed ${theme.palette.primary.main}` }}>
                    <Typography variant="caption" fontWeight={700} color="primary" display="block" gutterBottom>SUMMARY OF SELECTION:</Typography>
                    <Typography variant="body2" fontWeight={600}>• Branch: {selectedBranch === 'all' ? 'All Branches' : selectedBranch}</Typography>
                    <Typography variant="body2" fontWeight={600}>• Period: {reportPeriod === 'overall' ? 'Overall' : `${MONTHS[selectedMonth].label} ${selectedYear}`}</Typography>
                </Box>
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 700, borderRadius: 3 }}>Cancel</Button>
            <Button 
                variant="contained" 
                onClick={downloadReport} 
                disabled={generating}
                sx={{ fontWeight: 800, borderRadius: 3, px: 4 }}
            >
                {generating ? <CircularProgress size={24} color="inherit" /> : 'Download Report'}
            </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Reports;