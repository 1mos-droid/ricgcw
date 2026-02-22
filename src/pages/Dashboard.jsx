import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  Box,
  Grid,
  Card,
  Typography,
  Avatar,
  Button,
  useTheme,
  Skeleton,
  Chip,
  IconButton,
  Stack,
  Divider,
  alpha,
  Paper,
  Tooltip as MuiTooltip
} from '@mui/material';
import {
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  Activity,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

import { API_BASE_URL } from '../config';

// --- SUB-COMPONENTS ---

const ModernStatCard = ({ title, value, icon: Icon, color, trend, chartData, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card 
        sx={{ 
          position: 'relative', 
          overflow: 'hidden', 
          height: '100%',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 5,
          border: `1px solid ${alpha(color, 0.1)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 20px 40px -20px ${alpha(color, 0.3)}`,
            '& .icon-box': { transform: 'scale(1.1) rotate(5deg)' }
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.7rem' }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: theme.palette.text.primary, letterSpacing: '-0.03em' }}>
              {value}
            </Typography>
            {trend && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                <TrendingUp size={14} color={color} />
                <Typography variant="caption" fontWeight={700} sx={{ color: color }}>
                  {trend}
                </Typography>
              </Stack>
            )}
          </Box>
          <Box 
            className="icon-box"
            sx={{ 
              p: 1.5, 
              borderRadius: '16px', 
              bgcolor: alpha(color, 0.1), 
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            <Icon size={24} />
          </Box>
        </Box>

        {/* Mini Sparkline Background */}
        {chartData && (
          <Box sx={{ position: 'absolute', bottom: -10, left: 0, right: 0, height: 80, opacity: 0.3, zIndex: 1, pointerEvents: 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color${title})`} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const workspaceContext = useWorkspace();
  const workspace = workspaceContext?.workspace || 'main';
  const filterData = workspaceContext?.filterData || ((d) => d);
  const isBranchRestricted = workspaceContext?.isBranchRestricted;
  const userBranch = workspaceContext?.userBranch;

  const [data, setData] = useState({
    members: [],
    transactions: [],
    events: [],
    attendance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data from:", API_BASE_URL);
        
        const [membersRes, txRes, eventsRes, attendanceRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/members`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/events`),
          axios.get(`${API_BASE_URL}/attendance`)
        ]);

        setData({
          members: membersRes.data || [],
          transactions: txRes.data || [],
          events: eventsRes.data || [],
          attendance: attendanceRes.data || []
        });
      } catch (err) {
        console.error("Dashboard Fetch Error:", err.response?.data || err.message);
        workspaceContext?.showNotification("Failed to sync with server. Please check connection.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  const filteredData = useMemo(() => {
    return {
      members: filterData(data.members || []) || [],
      transactions: filterData(data.transactions || []) || [],
      events: filterData(data.events || []) || [],
      attendance: data.attendance || [] 
    };
  }, [data, filterData]);

  const totalContributions = filteredData.transactions
    .filter(t => t.type === 'contribution' && !t.isPrivateMemberRecord)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = filteredData.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalContributions - totalExpenses;

  const sparklineData = [
    { value: 400 }, { value: 300 }, { value: 600 }, { value: 800 }, { value: 500 }, { value: 900 }, { value: 1000 }
  ];

  const upcomingEvents = filteredData.events
    .filter(e => e.date && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const recentActivity = [
    ...filteredData.members.map(m => ({ id: m.id, type: 'member', title: 'New Member Registered', description: m.name, date: new Date(m.createdAt || Date.now()), branch: m.branch })),
    ...filteredData.transactions.map(t => ({ id: t.id, type: 'transaction', title: t.type === 'expense' ? 'Expense Recorded' : 'Contribution Received', description: t.description || `GHC ${t.amount}`, date: new Date(t.date || Date.now()), branch: t.branch })),
  ].sort((a, b) => b.date - a.date).slice(0, 8);

  const financialBarData = [
    { name: 'Income', value: totalContributions },
    { name: 'Expense', value: totalExpenses },
  ];

  if (loading) {
     return (
       <Box sx={{ p: 1 }}>
         <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 6, mb: 4 }} />
         <Grid container spacing={3}>
           {[1, 2, 3].map(i => <Grid key={i} size={{ xs: 12, md: 4 }}><Skeleton variant="rectangular" height={160} sx={{ borderRadius: 5 }} /></Grid>)}
         </Grid>
       </Box>
     );
  }

  return (
    <Box sx={{ pb: 6 }}>
      
      {/* 1. WELCOME BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 }, 
            mb: 4, 
            background: theme.palette.mode === 'light' 
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #1E40AF 100%)`
              : `linear-gradient(135deg, #1E293B 0%, #0F172A 100%)`,
            color: '#fff',
            borderRadius: 6,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            boxShadow: `0 24px 48px -12px ${alpha(theme.palette.primary.main, 0.35)}`
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Chip 
                label={format(new Date(), 'MMMM yyyy')} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }} 
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1 }}>
                {format(new Date(), 'EEEE, do')}
              </Typography>
            </Stack>
            
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.04em' }}>
              Welcome back, {workspaceContext?.userRole === 'admin' ? 'Admin' : 'Minister'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500, fontWeight: 500 }}>
              Here is what's happening across the <Box component="span" sx={{ fontWeight: 800, color: '#fff' }}>{workspace === 'main' ? 'Sanctuary' : workspace}</Box> today.
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 3, md: 0 }, display: 'flex', gap: 2, position: 'relative', zIndex: 2 }}>
            <Button 
              component={Link} 
              to="/members" 
              variant="contained" 
              startIcon={<Plus size={18} />}
              sx={{ 
                bgcolor: '#fff', 
                color: theme.palette.primary.main, 
                px: 3,
                py: 1.5,
                '&:hover': { bgcolor: alpha('#fff', 0.9), transform: 'translateY(-2px)' }
              }}
            >
              Add Member
            </Button>
            <IconButton 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                backdropFilter: 'blur(10px)',
                width: 50, height: 50, borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Activity size={20} />
            </IconButton>
          </Box>

          {/* Abstract Decorations */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', bottom: -100, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', zIndex: 1 }} />
        </Paper>
      </motion.div>

      {/* 2. STATS GRID */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="Active Members" 
            value={filteredData.members.length.toLocaleString()} 
            icon={Users} 
            color={theme.palette.primary.main} 
            trend="+12.5% Growth"
            chartData={sparklineData}
            delay={0.1}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="Total Revenue" 
            value={`GHC ${balance.toLocaleString()}`} 
            icon={DollarSign} 
            color="#10B981" 
            trend="Target reached"
            chartData={sparklineData}
            delay={0.2}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="Active Events" 
            value={filteredData.events.length} 
            icon={Calendar} 
            color="#F59E0B" 
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* 3. MAIN SECTION */}
      <Grid container spacing={4}>
        
        {/* LEFT: ACTIVITY & ANALYTICS */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            
            {/* Charts Section */}
            <Card sx={{ p: 3, borderRadius: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>Financial Analytics</Typography>
                  <Typography variant="caption" color="text.secondary">Income vs Expenses monthly view</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label="Monthly" size="small" variant="filled" sx={{ fontWeight: 700 }} />
                  <IconButton size="small"><ArrowUpRight size={18} /></IconButton>
                </Stack>
              </Box>

              <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 16, border: 'none', boxShadow: theme.shadows[10], padding: '12px 16px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={theme.palette.primary.main} 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#chartGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            {/* Recent Activity Feed */}
            <Card sx={{ borderRadius: 6, overflow: 'hidden' }}>
               <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight={800}>Live Feed</Typography>
                  <Button size="small" sx={{ fontWeight: 700 }}>View All</Button>
               </Box>
               <Box sx={{ p: 0 }}>
                  {recentActivity.map((item, idx) => (
                    <Box 
                      key={item.id || idx} 
                      sx={{ 
                        p: 2.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2.5, 
                        borderBottom: idx === recentActivity.length - 1 ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        transition: 'background 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                      }}
                    >
                      <Avatar sx={{ 
                        bgcolor: item.type === 'member' ? alpha(theme.palette.primary.main, 0.1) : alpha('#10B981', 0.1), 
                        color: item.type === 'member' ? theme.palette.primary.main : '#10B981',
                        width: 44, height: 44, borderRadius: 3
                      }}>
                        {item.type === 'member' ? <Users size={20} /> : <CreditCard size={20} />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600 }}>
                          {format(item.date, 'h:mm a')}
                        </Typography>
                        <Chip label={item.branch || 'Main'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, mt: 0.5 }} />
                      </Box>
                    </Box>
                  ))}
               </Box>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: EVENTS & QUICK ACCESS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            
            {/* Upcoming Events Card */}
            <Card sx={{ borderRadius: 6, bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.paper, 0.5) }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800}>Upcoming Events</Typography>
                <IconButton size="small" component={Link} to="/events"><Plus size={20} /></IconButton>
              </Box>
              
              <Box sx={{ px: 2, pb: 3 }}>
                <Stack spacing={2}>
                  {upcomingEvents.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                      <Calendar size={40} style={{ marginBottom: 8 }} />
                      <Typography variant="body2">No scheduled events</Typography>
                    </Box>
                  ) : upcomingEvents.map((event, idx) => (
                    <Box 
                      key={idx}
                      sx={{ 
                        p: 2, 
                        borderRadius: 4, 
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.05)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.02)', bgcolor: alpha(theme.palette.primary.main, 0.06) }
                      }}
                    >
                      <Box sx={{ 
                        width: 50, height: 50, borderRadius: 3, 
                        bgcolor: theme.palette.primary.main, color: '#fff',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>{format(new Date(event.date), 'MMM')}</Typography>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1 }}>{format(new Date(event.date), 'dd')}</Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={800} noWrap>{event.name}</Typography>
                        <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                           <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                              <Clock size={12} /> {event.time || '08:00 AM'}
                           </Typography>
                           <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                              <MapPin size={12} /> {event.location?.split(' ')[0] || 'Hall'}
                           </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button fullWidth endIcon={<ArrowRight size={16} />} sx={{ fontWeight: 700, borderRadius: 3 }}>Calendar View</Button>
              </Box>
            </Card>

            {/* Quick Stats / Goals Card */}
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: 6, 
                background: `linear-gradient(135deg, ${alpha('#7C3AED', 0.9)} 0%, #4C1D95 100%)`,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>
                Monthly Target
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 3 }}>
                GHC 25,000
              </Typography>
              
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight={700}>Progress</Typography>
                <Typography variant="caption" fontWeight={700}>85%</Typography>
              </Box>
              <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  style={{ height: '100%', backgroundColor: '#fff', borderRadius: 4 }}
                />
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 3 }} alignItems="center">
                <CheckCircle2 size={16} />
                <Typography variant="caption" fontWeight={600}>On track to hit quarterly goal</Typography>
              </Stack>

              <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;