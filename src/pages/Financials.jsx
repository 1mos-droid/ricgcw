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
  Tooltip
} from '@mui/material';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  CreditCard, 
  Download,
  Wallet,
  FileText,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config';

const Financials = () => {
  const theme = useTheme();
  const workspaceContext = useWorkspace();
  const workspace = workspaceContext?.workspace || 'main';
  const filterData = workspaceContext?.filterData || ((d) => d);
  const isBranchRestricted = workspaceContext?.isBranchRestricted;
  const userBranch = workspaceContext?.userBranch;
  
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Income, 2: Expense
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(isBranchRestricted ? userBranch : null);
  
  // Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
        axios.get(`${API_BASE_URL}/transactions`),
        axios.get(`${API_BASE_URL}/members`)
      ]);
      setTransactions(txRes.data.reverse()); // Newest first
      setMembers(memRes.data);
    } catch (err) {
      console.error("Finance Sync Error:", err);
      showSnackbar("Failed to sync financial data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

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
    showSnackbar("Report downloaded successfully.", "success");
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description || !category) {
      showSnackbar("Please fill in all fields, including location.", "warning");
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
      
      await axios.post(`${API_BASE_URL}/transactions`, newTx);
      
      // Reset Form & Refresh
      setAmount('');
      setDescription('');
      setCategory('');
      await fetchData(); 
      showSnackbar("Transaction logged successfully!", "success");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to log transaction.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      showSnackbar("Transaction deleted successfully.", "success");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to delete transaction.", "error");
    }
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

  const getFilteredTransactions = () => {
    let filtered = workspaceFilteredTransactions;
    if (selectedLocation) {
      filtered = filtered.filter(t => t.category === selectedLocation);
    }

    if (activeTab === 1) return filtered.filter(t => t.type === 'contribution');
    if (activeTab === 2) return filtered.filter(t => t.type === 'expense');
    return filtered;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // --- CALCULATIONS ---
  const totalIncome = getFilteredTransactions()
    .filter(t => t.type === 'contribution')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalExpense = getFilteredTransactions()
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Treasury & Budget
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Financial oversight and allocation
          </Typography>
          <Typography variant="body2" color="primary" fontWeight={700} sx={{ mt: 1 }}>
            ENVIRONMENT: {workspace === 'main' ? 'MAIN SANCTUARY' : workspace === 'youth' ? 'YOUTH MINISTRY' : "CHILDREN'S DEPT"}
          </Typography>
        </Box>
        
        {/* Responsive Export Button */}
        <Box>
            <Button 
                variant="outlined" 
                startIcon={<Download size={16} />} 
                sx={{ borderRadius: 2, display: { xs: 'none', sm: 'flex' } }}
                onClick={handleExport}
                disabled={transactions.length === 0 || loading}
            >
                Export CSV
            </Button>
            <IconButton 
                sx={{ display: { xs: 'flex', sm: 'none' }, bgcolor: theme.palette.action.hover }}
                onClick={handleExport}
                disabled={transactions.length === 0 || loading}
            >
                <Download size={20} />
            </IconButton>
        </Box>
      </Box>

      {!isBranchRestricted && (
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
          <Button 
            variant={selectedLocation === 'Mallam' ? 'contained' : 'outlined'} 
            onClick={() => setSelectedLocation('Mallam')}
          >
            Mallam
          </Button>
          <Button 
            variant={selectedLocation === 'Kokrobetey' ? 'contained' : 'outlined'}
            onClick={() => setSelectedLocation('Kokrobetey')}
          >
            Kokrobetey
          </Button>
          <Button 
            variant={selectedLocation === 'Langma' ? 'contained' : 'outlined'}
            onClick={() => setSelectedLocation('Langma')}
          >
            Langma
          </Button>
          {selectedLocation && (
            <Button 
              variant='outlined'
              color='error'
              onClick={() => setSelectedLocation(null)}
            >
              Clear
            </Button>
          )}
        </Stack>
      )}

      {/* --- STATS GRID --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <Grid container>
              <Grid item xs={12} md={4} sx={{ p: 3, background: theme.palette.gradients?.primary || theme.palette.primary.main, color: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} letterSpacing={0.5}>NET BALANCE</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, fontSize: { xs: '1.75rem', md: '3rem' } }}>
                    GHC{balance.toLocaleString()}
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={totalIncome > 0 ? Math.min((balance / totalIncome) * 100, 100) : 0} 
                    sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} 
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack direction="row" sx={{ height: '100%' }} divider={<Divider orientation="vertical" flexItem />}>
                  <Box sx={{ p: 3, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main, borderRadius: 2, width: 40, height: 40 }}>
                          <TrendingUp size={20} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Total Income</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>GHC{totalIncome.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ p: 3, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.main, borderRadius: 2, width: 40, height: 40 }}>
                          <TrendingDown size={20} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Total Expenses</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>GHC{totalExpense.toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: FORM --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: { md: 'sticky' }, top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                <CreditCard size={22} color="#fff" />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>Log Transaction</Typography>
            </Box>

            <form onSubmit={handleTransaction}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <Button 
                      fullWidth 
                      variant={type === 'contribution' ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => setType('contribution')}
                      startIcon={<Plus size={16} />}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Income
                    </Button>
                    <Button 
                      fullWidth 
                      variant={type === 'expense' ? 'contained' : 'outlined'}
                      color="error"
                      onClick={() => setType('expense')}
                      startIcon={<Minus size={16} />}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Expense
                    </Button>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Utility Bill"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Location"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isBranchRestricted}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value=""></option>
                    <option value="Mallam">Mallam</option>
                    <option value="Kokrobetey">Kokrobetey</option>
                    <option value="Langma">Langma</option>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    disabled={submitting}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Log Transaction'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>

        {/* --- RIGHT COL: LEDGER --- */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', minHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, v) => setActiveTab(v)} 
                sx={{ px: 2 }}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="All" />
                <Tab label="Income" />
                <Tab label="Expenses" />
              </Tabs>
            </Box>

            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0, maxHeight: '600px' }}>
              {loading ? (
                // SKELETON LIST
                Array.from(new Array(5)).map((_, i) => (
                    <Box key={i} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Skeleton width="60%" height={24} />
                            <Skeleton width="40%" height={20} />
                        </Box>
                        <Skeleton width={60} height={30} />
                    </Box>
                ))
              ) : getFilteredTransactions().length === 0 ? (
                <Box sx={{ p: 8, textAlign: 'center', color: 'text.secondary' }}>
                  <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Typography variant="h6">No transactions found.</Typography>
                  <Typography variant="body2">Use the form to add your first entry.</Typography>
                </Box>
              ) : (
                getFilteredTransactions().map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ListItem 
                        sx={{ 
                            py: 2, 
                            transition: 'background-color 0.2s',
                            '&:hover': { bgcolor: theme.palette.action.hover }
                        }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: tx.type === 'contribution' ? theme.palette.success.light : theme.palette.error.light,
                          color: tx.type === 'contribution' ? theme.palette.success.main : theme.palette.error.main
                        }}>
                          {tx.type === 'contribution' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={tx.description}
                        primaryTypographyProps={{ fontWeight: 600, color: theme.palette.text.primary }}
                        secondary={format(new Date(tx.date || Date.now()), 'MMM dd, yyyy • p')}
                      />
                      <Typography 
                        variant="body1" 
                        fontWeight={700}
                        sx={{ 
                          color: tx.type === 'contribution' ? theme.palette.success.main : theme.palette.error.main,
                          fontFamily: 'monospace',
                          fontSize: '1.1rem' 
                        }}
                      >
                        {tx.type === 'contribution' ? '+' : '-'}GHC{Number(tx.amount).toLocaleString()}
                      </Typography>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          sx={{ ml: 1, color: theme.palette.error.main }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    {index < getFilteredTransactions().length - 1 && <Divider variant="inset" component="li" />}
                  </motion.div>
                ))
              )}
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

export default Financials;