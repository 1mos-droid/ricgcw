import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import { 
  Box, 
  Grid, 
  Card, 
  Typography, 
  Avatar, 
  Button, 
  useTheme, 
  LinearProgress,
  Skeleton,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  Activity, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_BASE_URL = "https://us-central1-thegatheringplace-app.cloudfunctions.net/api";

const Dashboard = () => {
  const theme = useTheme();

  const [data, setData] = useState({
    members: [],
    transactions: [],
    events: [],
    attendance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const parseDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (dateVal._seconds) return new Date(dateVal._seconds * 1000); 
    return new Date(dateVal); 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/members`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/events`),
          axios.get(`${API_BASE_URL}/attendance`).catch(() => ({ status: 'rejected', value: null })),
        ]);

        setData({
          members: results[0].status === 'fulfilled' ? results[0].value.data : [],
          transactions: results[1].status === 'fulfilled' ? results[1].value.data : [],
          events: results[2].status === 'fulfilled' ? results[2].value.data : [],
          attendance: results[3].status === 'fulfilled' ? results[3].value.data : []
        });
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError('Unable to sync with server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 3. CALCULATIONS (UPDATED WITH FILTERS) ---
  
  // Financials - 🔴 FIX: Exclude Private Member Records from Global Totals
  const totalContributions = data.transactions
    .filter(t => t.type === 'contribution' && t.isPrivateMemberRecord !== true)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  const totalExpenses = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const budgetProgress = totalContributions > 0 
    ? (totalExpenses / totalContributions) * 100 
    : 0;

  const upcomingEvents = data.events
    .filter(e => e.date && parseDate(e.date) >= new Date()) 
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
    .slice(0, 3);
  
  const recentActivity = [
    ...data.members.map(m => ({ type: 'member', data: m, date: parseDate(m.createdAt) })),
    ...data.transactions.map(t => ({ type: 'transaction', data: t, date: parseDate(t.date) })),
    ...data.events.map(e => ({ type: 'event', data: e, date: parseDate(e.createdAt) })),
  ]
  .sort((a, b) => b.date - a.date)
  .slice(0, 5);

  const latestRecord = data.attendance.length > 0 
    ? data.attendance.sort((a, b) => parseDate(b.date) - parseDate(a.date))[0]
    : null;

  const presentCount = latestRecord ? (latestRecord.attendees || []).length : 0;
  const totalMembers = data.members.length;
  const absentCount = totalMembers > presentCount ? totalMembers - presentCount : 0;

  const attendancePieData = [
    { name: 'Present', value: presentCount, color: '#4caf50' },
    { name: 'Absent', value: absentCount, color: '#f44336' }
  ];

  // Money Collected Pie Chart - 🔴 FIX: Exclude private records here too
  const contributionsTotal = data.transactions
    .filter(t => 
        t.type === 'contribution' && 
        t.isPrivateMemberRecord !== true && 
        t.category !== 'tithe' && 
        t.category !== 'welfare'
    )
    .reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

  const expensesTotal = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = t.category || 'Other Expenses';
      acc[category] = (acc[category] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

  const allCategories = [
    ...Object.entries(contributionsTotal).map(([name, value]) => ({ name, value, type: 'income' })),
    ...Object.entries(expensesTotal).map(([name, value]) => ({ name, value, type: 'expense' }))
  ];

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#f44336', '#e91e63', '#795548'];

  const moneyCollectedData = allCategories.map((item, index) => ({
    ...item,
    color: item.type === 'income' ? COLORS[index % COLORS.length] : '#f44336'
  }));

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const eightMonthsAgo = new Date();
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);

  const memberStatusCounts = data.members.reduce((acc, member) => {
    const lastAttendance = data.attendance
      .filter(record => record.attendees && record.attendees.some(attendee => attendee.id === member.id))
      .map(record => parseDate(record.date))
      .sort((a, b) => b - a)[0];

    let status = 'active';
    if (!lastAttendance) {
      status = 'discontinued';
    } else if (lastAttendance < eightMonthsAgo) {
      status = 'discontinued';
    } else if (lastAttendance < threeMonthsAgo) {
      status = 'inactive';
    }
    
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { active: 0, inactive: 0, discontinued: 0 });

  const memberStatusData = [
    { name: 'Active', value: memberStatusCounts.active, color: '#4caf50' },
    { name: 'Inactive', value: memberStatusCounts.inactive, color: '#ff9800' },
    { name: 'Discontinued', value: memberStatusCounts.discontinued, color: '#f44336' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  if (error) return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <AlertCircle size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
      <Typography variant="h6" color="error" gutterBottom>{error}</Typography>
      <Button variant="outlined" onClick={() => window.location.reload()}>Retry Connection</Button>
    </Box>
  );

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ p: { xs: 0, sm: 1 } }}>
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            {format(new Date(), 'EEEE, MMMM do')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, mt: 0.5, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
            {getGreeting()}, Admin
          </Typography>
        </Box>
        <Chip icon={<Activity size={16}/>} label="System Healthy" color="success" variant="outlined" sx={{ display: { xs: 'none', sm: 'flex' }, fontWeight: 600 }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 3, boxShadow: theme.shadows[2], cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] } }} component={Link} to="/members">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>TOTAL MEMBERS</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: theme.palette.primary.main }}>
                  {loading ? <Skeleton width={60} /> : data.members.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, borderRadius: 2, width: 48, height: 48 }}>
                <Users size={24} />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>FINANCIAL HEALTH</Typography>
              <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main, borderRadius: 2, width: 48, height: 48 }}>
                <DollarSign size={24} />
              </Avatar>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
               {loading ? <Skeleton width={120} /> : `GHC${(totalContributions - totalExpenses).toLocaleString()}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>Available Balance</Typography>
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Budget Usage</Typography>
                <Typography variant="caption" fontWeight={600}>{loading ? '...' : `${Math.round(budgetProgress)}%`}</Typography>
              </Box>
              <LinearProgress variant={loading ? "indeterminate" : "determinate"} value={budgetProgress > 100 ? 100 : budgetProgress} color={budgetProgress > 90 ? "warning" : "primary"} sx={{ borderRadius: 2, height: 8 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', bgcolor: theme.palette.primary.main, color: '#fff', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: theme.shadows[4] }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Quick Actions</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>Manage your community efficiently.</Typography>
            <Grid container spacing={2} sx={{ mt: 'auto' }}>
              <Grid item xs={6}>
                <Button component={Link} to="/members" fullWidth variant="contained" startIcon={<Users size={18} />} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>Add</Button>
              </Grid>
              <Grid item xs={6}>
                <Button component={Link} to="/financials" fullWidth variant="contained" startIcon={<DollarSign size={18} />} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>Log</Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 0, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.background.default }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Upcoming Agenda</Typography>
              <Button size="small" endIcon={<ArrowRight size={16} />} component={Link} to="/events">View All</Button>
            </Box>
            <Box sx={{ p: 0 }}>
              {loading ? (
                 [1, 2].map((i) => (
                   <Box key={i} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                     <Skeleton variant="rounded" width={60} height={60} />
                     <Box sx={{ flexGrow: 1 }}><Skeleton width="60%" height={24} /><Skeleton width="40%" height={20} /></Box>
                   </Box>
                 ))
              ) : upcomingEvents.length === 0 ? (
                <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
                   <Calendar size={40} style={{ opacity: 0.5, marginBottom: 8 }} />
                   <Typography>No upcoming events scheduled.</Typography>
                </Box>
              ) : (
                upcomingEvents.map((event, index) => (
                  <Box key={event.id} sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, sm: 2.5 }, borderBottom: index !== upcomingEvents.length - 1 ? `1px solid ${theme.palette.divider}` : 'none', '&:hover': { bgcolor: theme.palette.action.hover, cursor: 'pointer' } }}>
                    <Box sx={{ p: 1.5, bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, borderRadius: 3, textAlign: 'center', minWidth: 60, mr: 2.5, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>{format(parseDate(event.date), 'MMM')}</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{format(parseDate(event.date), 'dd')}</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{event.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.time || 'All Day'}</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.primary.main }}><ArrowRight size={20} /></IconButton>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Activity</Typography>
            </Box>
            <Box sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 3 }}><Skeleton height={40} /></Box>
              ) : (
                recentActivity.map((activity, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: index !== recentActivity.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                    <Avatar sx={{ mr: 2, bgcolor: activity.type === 'member' ? theme.palette.primary.light : activity.type === 'transaction' ? theme.palette.success.light : theme.palette.warning.light }}>
                      {activity.type === 'member' && <Users size={20} />}
                      {activity.type === 'transaction' && <DollarSign size={20} />}
                      {activity.type === 'event' && <Calendar size={20} />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.type === 'member' && (<span>New member: <strong>{activity.data.name}</strong></span>)}
                        {activity.type === 'transaction' && (<span>Transaction: <strong>{activity.data.description}</strong></span>)}
                        {activity.type === 'event' && (<span>Event created: <strong>{activity.data.name}</strong></span>)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{format(activity.date, 'PP p')}</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Attendance Overview</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {attendancePieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Financial Distribution</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={moneyCollectedData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {moneyCollectedData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => `GHC${Number(value).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Member Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={memberStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {memberStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
