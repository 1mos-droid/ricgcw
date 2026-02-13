import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Box, 
  Grid, 
  Card, 
  Typography, 
  Avatar, 
  Button, 
  IconButton, 
  useTheme, 
  Divider,
  Chip,
  LinearProgress,
  Skeleton
} from '@mui/material';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  CreditCard,
  Clock
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002/api';

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ members: [], transactions: [], events: [] });
  const [error, setError] = useState(null);

  // --- 1. SMART GREETING ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, transactionsRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/members`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/events`),
        ]);
        setData({
          members: membersRes.data,
          transactions: transactionsRes.data,
          events: eventsRes.data
        });
      } catch (err) {
        setError('Unable to sync with server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 3. CALCULATIONS ---
  const totalContributions = data.transactions
    .filter(t => t.type === 'contribution')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpenses = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetProgress = totalContributions > 0 
    ? (totalExpenses / totalContributions) * 100 
    : 0;

  const upcomingEvents = data.events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // --- ANIMATION ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (error) return (
    <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
      <Typography variant="h6">{error}</Typography>
      <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Retry</Button>
    </Box>
  );

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER SECTION --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            {format(new Date(), 'EEEE, MMMM do')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, mt: 1 }}>
            {getGreeting()}, Admin
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Activity size={18}/>} sx={{ borderRadius: 3, px: 3 }}>
          System Healthy
        </Button>
      </Box>

      {/* --- STATS GRID --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Card 1: Members */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>TOTAL MEMBERS</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                  {loading ? <Skeleton width={60} /> : data.members.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, borderRadius: 3 }}>
                <Users size={24} />
              </Avatar>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label="+5% this month" size="small" color="success" sx={{ borderRadius: 1, fontWeight: 600 }} />
              <Typography variant="caption" color="text.secondary">vs last month</Typography>
            </Box>
          </Card>
        </Grid>

        {/* Card 2: Financials */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>FINANCIAL HEALTH</Typography>
              <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main, borderRadius: 3 }}>
                <DollarSign size={24} />
              </Avatar>
            </Box>
            
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
               {loading ? <Skeleton width={100} /> : `$${(totalContributions - totalExpenses).toLocaleString()}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Available Balance</Typography>

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" fontWeight={600}>Budget Usage</Typography>
                <Typography variant="caption">{Math.round(budgetProgress)}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={budgetProgress > 100 ? 100 : budgetProgress} sx={{ borderRadius: 2, height: 6 }} />
            </Box>
          </Card>
        </Grid>

        {/* Card 3: Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', bgcolor: theme.palette.primary.main, color: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  component={Link} 
                  to="/members" 
                  fullWidth 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: '#fff', 
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Member
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  component={Link} 
                  to="/financials" 
                  fullWidth 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: '#fff', 
                    boxShadow: 'none', 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Log Expense
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
              <Activity size={16} />
              <Typography variant="caption">Server Latency: 12ms</Typography>
            </Box>
          </Card>
        </Grid>

      </Grid>

      {/* --- AGENDA SECTION --- */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Upcoming Agenda</Typography>
              <Button endIcon={<ArrowRight size={16} />} component={Link} to="/events">View Calendar</Button>
            </Box>

            <Box sx={{ p: 0 }}>
              {upcomingEvents.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No upcoming events.</Box>
              ) : (
                upcomingEvents.map((event, index) => (
                  <Box 
                    key={event.id}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2, 
                      borderBottom: index !== upcomingEvents.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                      '&:hover': { bgcolor: theme.palette.action.hover }
                    }}
                  >
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: theme.palette.action.selected, 
                      borderRadius: 3, 
                      textAlign: 'center', 
                      minWidth: 60,
                      mr: 2
                    }}>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: theme.palette.primary.main }}>
                        {format(new Date(event.date), 'MMM')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        {format(new Date(event.date), 'dd')}
                      </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{event.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <Clock size={14} />
                          <Typography variant="caption">{event.time}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <IconButton size="small"><ArrowRight size={18} /></IconButton>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
};

export default Dashboard;