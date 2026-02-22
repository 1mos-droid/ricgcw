import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  TextField, 
  IconButton, 
  useTheme, 
  Avatar, 
  Stack, 
  LinearProgress,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip,
  alpha,
  MenuItem
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  CreditCard, 
  Download,
  Wallet,
  FileText,
  Trash2,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config';

const Financials = () => {
  const theme = useTheme();
  const workspaceContext = useWorkspace();
  const { filterData, showNotification, showConfirmation, workspace, userBranch, isBranchRestricted } = workspaceContext;
  
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Income, 2: Expense
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(isBranchRestricted ? userBranch : null);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('contribution'); // or 'expense'
  const [category, setCategory] = useState(isBranchRestricted ? userBranch : '');

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [txRes, memRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions/`),
        axios.get(`${API_BASE_URL}/members/`)
      ]);
      setTransactions(txRes.data.reverse()); // Newest first
      setMembers(memRes.data);
    } catch (err) {
      console.error("Finance Sync Error:", err.response?.data || err.message);
      showNotification("Failed to sync financial data.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const headers = "ID,Type,Description,Amount,Date\n";
    const csv = getFilteredTransactions().map(tx => {
      // Escape description to prevent CSV breakage if it contains commas
      const safeDesc = `"${tx.description.replace(/"/g, '""')}"`;
      return `${tx.id},${tx.type},${safeDesc},${tx.amount},${tx.date}`;
    }).join('\n');

    const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `financial_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Report downloaded successfully.", "success");
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description || !category) {
      showNotification("Please fill in all fields, including location.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const newTx = {
        amount: Number(amount),
        description,
        type,
        category,
        date: new Date().toISOString()
      };
      
      await axios.post(`${API_BASE_URL}/transactions/`, newTx);
      
      // Reset Form & Refresh
      setAmount('');
      setDescription('');
      setCategory(isBranchRestricted ? userBranch : '');
      await fetchData(); 
      showNotification("Transaction logged successfully!", "success");
    } catch (error) {
      console.error("Transaction Error:", error.response?.data || error.message);
      showNotification("Failed to log transaction.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    showConfirmation({
      title: "Delete Transaction",
      message: "Are you sure you want to delete this transaction record? This action is permanent.",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/transactions/${id}/`);
          setTransactions(transactions.filter(t => t.id !== id));
          showNotification("Transaction deleted successfully.", "success");
        } catch (error) {
          console.error("Delete Transaction Error:", error.response?.data || error.message);
          showNotification("Failed to delete transaction.", "error");
        }
      }
    });
  };

  const workspaceFilteredTransactions = useMemo(() => {
    const filteredMembers = filterData(members);
    const memberIds = new Set(filteredMembers.map(m => String(m.id)));

    return transactions.filter(t => {
      if (t.memberId) {
        return memberIds.has(String(t.memberId));
      }
      return workspace === 'main'; // General entries only in Main Sanctuary
    });
  }, [transactions, members, workspace, filterData]);

  const getFilteredTransactions = useCallback(() => {
    let filtered = workspaceFilteredTransactions;
    if (selectedLocation) {
      filtered = filtered.filter(t => t.category === selectedLocation);
    }

    if (activeTab === 1) return filtered.filter(t => t.type === 'contribution');
    if (activeTab === 2) return filtered.filter(t => t.type === 'expense');
    return filtered;
  }, [workspaceFilteredTransactions, selectedLocation, activeTab]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // --- CALCULATIONS ---
  const filteredTx = getFilteredTransactions();
  const totalIncome = filteredTx
    .filter(t => t.type === 'contribution')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalExpense = filteredTx
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const balance = totalIncome - totalExpense;
  
  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
            FINANCE
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Treasury
          </Typography>
        </Box>
        
        {/* Responsive Export Button */}
        <Box>
            <Button 
                variant="outlined" 
                startIcon={<Download size={18} />} 
                sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}
                onClick={handleExport}
                disabled={transactions.length === 0 || loading}
            >
                Export CSV
            </Button>
        </Box>
      </Box>

      {/* --- LOCATION FILTER --- */}
      {!isBranchRestricted && (
        <Box sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button 
              variant={selectedLocation === null ? 'contained' : 'text'} 
              onClick={() => setSelectedLocation(null)}
              sx={{ borderRadius: 3, px: 3 }}
            >
              All
            </Button>
            {['Mallam', 'Kokrobetey', 'Langma'].map((loc) => (
              <Button 
                key={loc}
                variant={selectedLocation === loc ? 'contained' : 'text'}
                onClick={() => setSelectedLocation(loc)}
                sx={{ borderRadius: 3, px: 3, color: selectedLocation === loc ? '#fff' : theme.palette.text.secondary }}
              >
                {loc}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {/* --- STATS CARD --- */}
      <Card sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
        <Grid container>
          {/* NET BALANCE HERO */}
          <Grid size={{ xs: 12, md: 4 }} 
            sx={{ 
              p: 4, 
              background: theme.palette.mode === 'light' 
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, opacity: 0.9 }}>
              <Wallet size={20} />
              <Typography variant="subtitle2" fontWeight={700} letterSpacing={1}>NET BALANCE</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                GHC{balance.toLocaleString()}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
                <span>Budget Utilization</span>
                <span>{totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}%</span>
              </Box>
              <LinearProgress 
                  variant="determinate" 
                  value={totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0} 
                  sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} 
              />
            </Box>
          </Grid>

          {/* INCOME VS EXPENSE */}
          <Grid size={{ xs: 12, md: 8 }} sx={{ bgcolor: theme.palette.background.paper }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ height: '100%' }} divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}>
              <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, borderRadius: '12px', width: 48, height: 48 }}>
                      <TrendingUp size={24} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.5}>TOTAL INCOME</Typography>
                    <Typography variant="h4" fontWeight={800} color="text.primary">GHC{totalIncome.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />

              <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, borderRadius: '12px', width: 48, height: 48 }}>
                      <TrendingDown size={24} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.5}>TOTAL EXPENSES</Typography>
                    <Typography variant="h4" fontWeight={800} color="text.primary">GHC{totalExpense.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: FORM --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 0, position: { md: 'sticky' }, top: 20, borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight={800}>Log Transaction</Typography>
              <Typography variant="caption" color="text.secondary">Record a new contribution or expense</Typography>
            </Box>

            <Box component="form" onSubmit={handleTransaction} sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                  <Button 
                    fullWidth 
                    variant={type === 'contribution' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => setType('contribution')}
                    startIcon={<Plus size={18} />}
                    sx={{ 
                      borderRadius: 3, 
                      py: 1, 
                      fontWeight: 700, 
                      boxShadow: 'none',
                      border: type === 'contribution' ? 'none' : `1px solid ${theme.palette.divider}` 
                    }}
                  >
                    Income
                  </Button>
                  <Button 
                    fullWidth 
                    variant={type === 'expense' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => setType('expense')}
                    startIcon={<Minus size={18} />}
                    sx={{ 
                      borderRadius: 3, 
                      py: 1, 
                      fontWeight: 700, 
                      boxShadow: 'none',
                      border: type === 'expense' ? 'none' : `1px solid ${theme.palette.divider}` 
                    }}
                  >
                    Expense
                  </Button>
                </Stack>

                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">GHC</InputAdornment>,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Utility Bill"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                <TextField
                  fullWidth
                  select
                  label="Location"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isBranchRestricted}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                >
                  <MenuItem value="Mallam">Mallam</MenuItem>
                  <MenuItem value="Kokrobetey">Kokrobetey</MenuItem>
                  <MenuItem value="Langma">Langma</MenuItem>
                </TextField>

                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  disabled={submitting}
                  sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, boxShadow: theme.shadows[4] }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : 'Log Transaction'}
                </Button>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: LEDGER --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', minHeight: 600, display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, v) => setActiveTab(v)} 
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { fontWeight: 600, minHeight: 64 } }}
              >
                <Tab label="All Transactions" />
                <Tab label="Income Only" />
                <Tab label="Expenses Only" />
              </Tabs>
            </Box>

            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0, maxHeight: 600 }}>
              {loading ? (
                Array.from(new Array(5)).map((_, i) => (
                    <Box key={i} sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="rounded" width={48} height={48} sx={{ mr: 2, borderRadius: 3 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
                            <Skeleton width="30%" height={20} />
                        </Box>
                        <Skeleton width={80} height={32} />
                    </Box>
                ))
              ) : filteredTx.length === 0 ? (
                <Box sx={{ p: 8, textAlign: 'center', color: 'text.secondary' }}>
                  <Box sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.1), width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <FileText size={40} />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>No transactions found</Typography>
                  <Typography variant="body2">Use the form to add your first entry.</Typography>
                </Box>
              ) : (
                filteredTx.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <ListItem 
                        sx={{ 
                            py: 2.5, 
                            px: 3,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                        }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: tx.type === 'contribution' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                          color: tx.type === 'contribution' ? theme.palette.success.main : theme.palette.error.main,
                          borderRadius: '12px',
                          width: 48, 
                          height: 48
                        }}>
                          {tx.type === 'contribution' ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={tx.description}
                        primaryTypographyProps={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '1rem' }}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              {format(new Date(tx.date || Date.now()), 'MMM dd, yyyy • p')}
                            </Typography>
                            {tx.category && <Typography variant="caption" color="primary" fontWeight={600} sx={{ mt: 0.5 }}>{tx.category}</Typography>}
                          </Box>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="body1" 
                          fontWeight={800}
                          sx={{ 
                            color: tx.type === 'contribution' ? theme.palette.success.main : theme.palette.error.main,
                            fontFamily: 'monospace',
                            fontSize: '1.1rem' 
                          }}
                        >
                          {tx.type === 'contribution' ? '+' : '-'}GHC{Number(tx.amount).toLocaleString()}
                        </Typography>
                      </Box>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          sx={{ ml: 2, color: theme.palette.action.active, '&:hover': { color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    {index < filteredTx.length - 1 && <Divider component="li" sx={{ opacity: 0.5 }} />}
                  </motion.div>
                ))
              )}
            </List>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
};

export default Financials;