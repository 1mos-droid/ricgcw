import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  IconButton, 
  useTheme, 
  Avatar, 
  Stack, 
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Tooltip,
  alpha,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  Menu
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download,
  Wallet,
  FileText,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  MoreHorizontal,
  FileSpreadsheet,
  Edit2
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, subValue, icon: Icon, color, delay }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card sx={{ 
        p: 3, 
        borderRadius: 8, 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: `1px solid ${alpha(color, 0.1)}`,
        boxShadow: `0 4px 20px -5px ${alpha(color, 0.15)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: theme.palette.text.primary }}>{value}</Typography>
          </Box>
          <Box sx={{ 
            p: 1.5, borderRadius: 6, 
            bgcolor: alpha(color, 0.1), color: color 
          }}>
            <Icon size={24} />
          </Box>
        </Box>
        {subValue && (
          <Chip 
            label={subValue} 
            size="small" 
            sx={{ 
              alignSelf: 'flex-start', 
              bgcolor: alpha(color, 0.05), 
              color: color, 
              fontWeight: 700, 
              borderRadius: 4 
            }} 
          />
        )}
      </Card>
    </motion.div>
  );
};

const Financials = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { filterData, showNotification, showConfirmation, workspace, userBranch, isBranchRestricted } = useWorkspace();
  
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(isBranchRestricted ? userBranch : null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('contribution');
  const [category, setCategory] = useState(isBranchRestricted ? userBranch : 'Mallam');

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [txRes, memRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions/`),
        axios.get(`${API_BASE_URL}/members/`)
      ]);
      setTransactions((txRes.data || []).reverse()); // Newest first
      setMembers(memRes.data || []);
    } catch (err) {
      console.error("Finance Sync Error:", err);
      showNotification("Failed to sync financial data.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTransaction = async () => {
    if (!amount || !description || !category) {
      showNotification("Please fill in all fields.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const txData = {
        amount: Number(amount),
        description,
        type,
        category,
        date: editingTransaction ? editingTransaction.date : new Date().toISOString()
      };
      
      if (editingTransaction) {
        await axios.put(`${API_BASE_URL}/transactions/${editingTransaction.id}/`, txData);
        showNotification("Transaction updated successfully.", "success");
      } else {
        await axios.post(`${API_BASE_URL}/transactions/`, txData);
        showNotification("Transaction recorded successfully.", "success");
      }
      
      resetForm();
      await fetchData();
      setOpenLogDialog(false);
    } catch (error) {
      console.error("Transaction Error:", error);
      showNotification(editingTransaction ? "Failed to update transaction." : "Failed to log transaction.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setType('contribution');
    setCategory(isBranchRestricted ? userBranch : 'Mallam');
    setEditingTransaction(null);
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setAmount(tx.amount);
    setDescription(tx.description);
    setType(tx.type);
    setCategory(tx.category);
    setOpenLogDialog(true);
  };

  const handleDeleteTransaction = async (id) => {
    showConfirmation({
      title: "Delete Transaction",
      message: "Permanently delete this record?",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/transactions/${id}/`);
          await fetchData();
          showNotification("Deleted.", "success");
        } catch (error) {
          console.error("Delete Transaction Error:", error);
          showNotification("Delete failed.", "error");
        }
      }
    });
  };

  const filteredTx = useMemo(() => {
    let filtered = filterData(transactions);
    if (selectedLocation) filtered = filtered.filter(t => t.category === selectedLocation);
    if (activeTab === 'income') filtered = filtered.filter(t => t.type === 'contribution');
    if (activeTab === 'expense') filtered = filtered.filter(t => t.type === 'expense');
    return filtered;
  }, [transactions, selectedLocation, activeTab, filterData]);

  const stats = useMemo(() => {
    const income = filteredTx.filter(t => t.type === 'contribution').reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const expense = filteredTx.filter(t => t.type === 'expense').reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    return { income, expense, balance: income - expense };
  }, [filteredTx]);

  const chartData = useMemo(() => {
    return filteredTx.slice(0, 15).reverse().map(t => ({
      name: format(new Date(t.date), 'MMM dd'),
      amt: Number(t.amount)
    }));
  }, [filteredTx]);

  const handleExport = (formatType) => {
    setExportAnchorEl(null);
    const data = filteredTx;
    if (data.length === 0) return;

    const fileName = `financial_report_${new Date().toISOString().slice(0,10)}`;

    if (formatType === 'pdf') {
      const doc = new jsPDF();
      doc.text("FINANCIAL REPORT", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);
      
      const headers = [["Date", "Description", "Type", "Location", "Amount"]];
      const rows = data.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.description,
        t.type,
        t.category,
        `GHC ${t.amount}`
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
      doc.save(`${fileName}.pdf`);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
    showNotification(`Financial report exported as ${formatType.toUpperCase()}`);
  };

  return (
    <Box sx={{ pb: 6 }}>
      
      {/* --- HEADER --- */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 5 }}>
        <Box>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={1.5}>FINANCIAL OVERVIEW</Typography>
            <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>Treasury</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
            {!isBranchRestricted && (
                <Paper elevation={0} sx={{ p: 0.5, borderRadius: 6, border: `1px solid ${theme.palette.divider}`, display: { xs: 'none', md: 'flex' } }}>
                    {['All', 'Mallam', 'Langma', 'Kokrobetey'].map((loc) => (
                        <Button 
                            key={loc}
                            size="small"
                            variant={selectedLocation === (loc === 'All' ? null : loc) ? 'contained' : 'text'}
                            onClick={() => setSelectedLocation(loc === 'All' ? null : loc)}
                            sx={{ borderRadius: 4, px: 2, fontWeight: 700, minWidth: 'auto' }}
                        >
                            {loc}
                        </Button>
                    ))}
                </Paper>
            )}
            
            <Button 
                variant="outlined" 
                startIcon={<Download size={18} />} 
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                sx={{ borderRadius: 6, px: 3, fontWeight: 700 }}
            >
                Export
            </Button>
            <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                <MenuItem onClick={() => handleExport('pdf')} sx={{ gap: 1 }}><FileText size={18} /> Export as PDF</MenuItem>
                <MenuItem onClick={() => handleExport('excel')} sx={{ gap: 1 }}><FileSpreadsheet size={18} /> Export as Excel</MenuItem>
            </Menu>

            <Button 
                variant="contained" 
                startIcon={<Plus size={18} />} 
                onClick={() => { resetForm(); setOpenLogDialog(true); }}
                sx={{ borderRadius: 6, px: 3, fontWeight: 800, boxShadow: `0 8px 20px -4px ${alpha(theme.palette.primary.main, 0.4)}` }}
            >
                New Entry
            </Button>
        </Stack>
      </Stack>

      {/* --- STATS GRID --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
            <StatCard 
                title="Total Balance" 
                value={`GHC ${stats.balance.toLocaleString()}`} 
                subValue="+12% vs last month"
                icon={Wallet} 
                color={theme.palette.primary.main} 
                delay={0}
            />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <StatCard 
                title="Total Income" 
                value={`GHC ${stats.income.toLocaleString()}`} 
                subValue={`${filteredTx.filter(t => t.type === 'contribution').length} Transactions`}
                icon={TrendingUp} 
                color={theme.palette.success.main} 
                delay={0.1}
            />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <StatCard 
                title="Total Expenses" 
                value={`GHC ${stats.expense.toLocaleString()}`} 
                subValue="Within Budget"
                icon={TrendingDown} 
                color={theme.palette.error.main} 
                delay={0.2}
            />
        </Grid>
      </Grid>

      {/* --- MAIN CONTENT: CHART & LEDGER --- */}
      <Grid container spacing={4}>
        
        {/* CHART (Full width on small, 2/3 on large) */}
        <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ p: 3, borderRadius: 8, height: 400, mb: { xs: 4, lg: 0 }, boxShadow: theme.shadows[4] }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant="h6" fontWeight={800}>Cash Flow Analysis</Typography>
                    <Chip label="Real-time" size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>
                <Box sx={{ height: '80%', width: '100%', minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[8], backgroundColor: theme.palette.background.paper }}
                            itemStyle={{ fontWeight: 700, color: theme.palette.text.primary }}
                        />
                        <Area type="monotone" dataKey="amt" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorFlow)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    </Grid>

        {/* RECENT TRANSACTIONS (1/3 on large) */}
        <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', minHeight: 400, borderRadius: 8, display: 'flex', flexDirection: 'column', boxShadow: theme.shadows[4] }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>Activity</Typography>
                    <IconButton size="small"><Filter size={18} /></IconButton>
                </Box>
                
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                    <List disablePadding>
                        {loading ? (
                            <Box sx={{ p: 3 }}><CircularProgress /></Box>
                        ) : filteredTx.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                <FileText size={40} />
                                <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>No activity yet</Typography>
                            </Box>
                        ) : (
                            filteredTx.slice(0, 10).map((tx, idx) => (
                                <React.Fragment key={tx.id}>
                                    <ListItem alignItems="center" sx={{ py: 2, px: 3, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ 
                                                bgcolor: tx.type === 'contribution' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                                color: tx.type === 'contribution' ? theme.palette.success.main : theme.palette.error.main,
                                                borderRadius: 6
                                            }}>
                                                {tx.type === 'contribution' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={<Typography variant="body2" fontWeight={700}>{tx.description}</Typography>}
                                            secondary={<Typography variant="caption" color="text.secondary">{format(new Date(tx.date), 'MMM dd • HH:mm')}</Typography>}
                                        />
                                        <Typography variant="body2" fontWeight={800} sx={{ color: tx.type === 'contribution' ? 'success.main' : 'text.primary' }}>
                                            {tx.type === 'contribution' ? '+' : '-'} {Number(tx.amount).toLocaleString()}
                                        </Typography>
                                    </ListItem>
                                    {idx < Math.min(filteredTx.length, 10) - 1 && <Divider component="li" variant="inset" />}
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Box>
                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                    <Button size="small" sx={{ fontWeight: 700 }} onClick={() => setActiveTab('all')}>View All Transactions</Button>
                </Box>
            </Card>
        </Grid>

        {/* DESKTOP LEDGER TABLE (Full Width) */}
        <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 8, overflow: 'hidden', boxShadow: theme.shadows[4] }}>
                <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>Transaction Ledger</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant={activeTab === 'all' ? 'contained' : 'outlined'} onClick={() => setActiveTab('all')} sx={{ borderRadius: 4 }}>All</Button>
                        <Button size="small" variant={activeTab === 'income' ? 'contained' : 'outlined'} onClick={() => setActiveTab('income')} sx={{ borderRadius: 4 }}>Income</Button>
                        <Button size="small" variant={activeTab === 'expense' ? 'contained' : 'outlined'} onClick={() => setActiveTab('expense')} sx={{ borderRadius: 4 }}>Expenses</Button>
                    </Box>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Date', 'Description', 'Category', 'Location', 'Amount', 'Actions'].map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredTx.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No transactions found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredTx.map((tx) => (
                                    <TableRow key={tx.id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{format(new Date(tx.date), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{tx.description}</TableCell>
                                        <TableCell><Chip label={tx.type} size="small" color={tx.type === 'contribution' ? 'success' : 'error'} variant="outlined" sx={{ fontWeight: 700, height: 24, borderRadius: 2 }} /></TableCell>
                                        <TableCell>{tx.category}</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace' }}>GHC {Number(tx.amount).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary" onClick={() => handleEditClick(tx)} sx={{ mr: 1 }}>
                                                <Edit2 size={18} />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteTransaction(tx.id)}>
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Grid>

      </Grid>

      {/* --- LOG/EDIT TRANSACTION DIALOG --- */}
      <Dialog 
        open={openLogDialog} 
        onClose={() => setOpenLogDialog(false)}
        PaperProps={{ sx: { borderRadius: 8, width: '100%', maxWidth: 450, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 1 }}>
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        </DialogTitle>
        <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
                <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 6, display: 'flex', bgcolor: theme.palette.action.hover }}>
                    {['contribution', 'expense'].map((t) => (
                        <Button 
                            key={t}
                            fullWidth
                            variant={type === t ? 'contained' : 'text'}
                            color={t === 'contribution' ? 'success' : 'error'}
                            onClick={() => setType(t)}
                            sx={{ borderRadius: 4, fontWeight: 800, textTransform: 'capitalize', boxShadow: type === t ? 4 : 0 }}
                        >
                            {t === 'contribution' ? 'Income' : 'Expense'}
                        </Button>
                    ))}
                </Paper>
                <TextField 
                    fullWidth label="Amount" type="number" 
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">GHC</InputAdornment> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
                />
                <TextField 
                    fullWidth label="Description" 
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
                />
                <TextField 
                    fullWidth select label="Location" 
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    disabled={isBranchRestricted}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
                >
                    <MenuItem value="Mallam">Mallam</MenuItem>
                    <MenuItem value="Langma">Langma</MenuItem>
                    <MenuItem value="Kokrobetey">Kokrobetey</MenuItem>
                </TextField>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenLogDialog(false)} sx={{ fontWeight: 700, borderRadius: 6, color: 'text.secondary' }}>Cancel</Button>
            <Button variant="contained" onClick={handleTransaction} disabled={submitting} sx={{ fontWeight: 800, borderRadius: 6, px: 4 }}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : (editingTransaction ? 'Update Record' : 'Confirm Log')}
            </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Financials;