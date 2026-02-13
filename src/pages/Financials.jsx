import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
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
  Chip,
  LinearProgress,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  CreditCard, 
  Download,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:3002/api';

const Financials = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Income, 2: Expense
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('contribution'); // or 'expense'

  // --- FETCH DATA ---
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/transactions`);
      setTransactions(res.data.reverse()); // Newest first
    } catch (err) {
      console.error("Finance Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // --- CALCULATIONS ---
  const totalIncome = transactions
    .filter(t => t.type === 'contribution')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = totalIncome - totalExpense;

  // --- HANDLERS ---
  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    setSubmitting(true);
    try {
      const newTx = {
        amount: Number(amount),
        description,
        type,
        date: new Date().toISOString()
      };
      
      await axios.post(`${API_BASE_URL}/transactions`, newTx);
      
      // Reset Form & Refresh
      setAmount('');
      setDescription('');
      fetchTransactions(); 
    } catch (error) {
      alert("Transaction Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredTransactions = () => {
    if (activeTab === 1) return transactions.filter(t => t.type === 'contribution');
    if (activeTab === 2) return transactions.filter(t => t.type === 'expense');
    return transactions;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            Treasury & Budget
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Financial oversight and allocation
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<Download size={16} />} 
          sx={{ borderRadius: 2, display: { xs: 'none', sm: 'flex' } }}
        >
          Export Report
        </Button>
      </Box>

      {/* --- STATS GRID --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Net Balance */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>NET BALANCE</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, color: theme.palette.primary.main }}>
                ${balance.toLocaleString()}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: theme.palette.action.hover }} 
              />
            </Box>
            <Wallet size={120} color={theme.palette.primary.main} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }} />
          </Card>
        </Grid>

        {/* Total Income */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main, borderRadius: 2 }}>
                <TrendingUp size={20} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>Total Income</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>${totalIncome.toLocaleString()}</Typography>
          </Card>
        </Grid>

        {/* Total Expenses */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.main, borderRadius: 2 }}>
                <TrendingDown size={20} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>Total Expenses</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>${totalExpense.toLocaleString()}</Typography>
          </Card>
        </Grid>

      </Grid>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: FORM --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                <CreditCard size={20} color="#fff" />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>New Transaction</Typography>
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
                      sx={{ borderRadius: 2 }}
                    >
                      Income
                    </Button>
                    <Button 
                      fullWidth 
                      variant={type === 'expense' ? 'contained' : 'outlined'}
                      color="error"
                      onClick={() => setType('expense')}
                      startIcon={<Minus size={16} />}
                      sx={{ borderRadius: 2 }}
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
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
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
                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    disabled={submitting}
                    sx={{ py: 1.5, borderRadius: 3 }}
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
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ px: 2 }}>
                <Tab label="All" />
                <Tab label="Income" />
                <Tab label="Expenses" />
              </Tabs>
            </Box>

            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
              {loading ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : getFilteredTransactions().length === 0 ? (
                <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography>No transactions found.</Typography>
                </Box>
              ) : (
                getFilteredTransactions().map((tx, index) => (
                  <React.Fragment key={tx.id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: tx.type === 'contribution' ? theme.palette.success.light : theme.palette.error.light,
                          color: tx.type === 'contribution' ? theme.palette.success.main : theme.palette.error.main
                        }}>
                          <DollarSign size={20} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={tx.description}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondary={format(new Date(tx.date || Date.now()), 'MMM dd, yyyy • hh:mm a')}
                      />
                      <Typography 
                        variant="body1" 
                        fontWeight={700}
                        sx={{ 
                          color: tx.type === 'contribution' ? theme.palette.success.main : theme.palette.error.main,
                          fontFamily: 'monospace' 
                        }}
                      >
                        {tx.type === 'contribution' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                      </Typography>
                    </ListItem>
                    {index < getFilteredTransactions().length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
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