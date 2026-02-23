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
  Tooltip as MuiTooltip,
  Container
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
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis 
} from 'recharts';

import { API_BASE_URL } from '../config';

// --- SUB-COMPONENTS ---

const ModernStatCard = ({ title, value, icon: Icon, color, trend, chartData, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={{ height: '100%' }}
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
          background: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(color, 0.15)}`,
          boxShadow: `0 10px 30px -10px ${alpha(color, 0.15)}`,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px -15px ${alpha(color, 0.25)}`,
            '& .icon-box': { transform: 'scale(1.1) rotate(5deg)' }
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.65rem', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: theme.palette.text.primary, letterSpacing: '-0.03em', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {value}
            </Typography>
            {trend && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                <Box sx={{ bgcolor: alpha(color, 0.1), borderRadius: 2, px: 0.8, py: 0.2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUp size={12} color={color} style={{ marginRight: 4 }} />
                    <Typography variant="caption" fontWeight={800} sx={{ color: color }}>
                    {trend}
                    </Typography>
                </Box>
              </Stack>
            )}
          </Box>
          <Box 
            className="icon-box"
            sx={{ 
              p: 1.5, 
              borderRadius: '18px', 
              background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.2)} 100%)`, 
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.4s ease',
              boxShadow: `0 8px 16px -4px ${alpha(color, 0.2)}`
            }}
          >
            <Icon size={24} strokeWidth={2.5} />
          </Box>
        </Box>

        {/* Mini Sparkline Background */}
        {chartData && (
          <Box sx={{ position: 'absolute', bottom: -10, left: 0, right: 0, height: 100, opacity: 0.25, zIndex: 1, pointerEvents: 'none' }}>
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
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return {
      members: filterData(data.members || []) || [],
      transactions: filterData(data.transactions || []) || [],
      events: filterData(data.events || []) || [],
      attendance: data.attendance || [] 
    };
  }, [data, filterData]);

  const totalContributions = useMemo(() => {
    return filteredData.transactions
      .filter(t => t.type === 'contribution')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [filteredData.transactions]);
  
  const aggregatedData = useMemo(() => {
    // 1. Financial Overview & Revenue Sparkline (Daily Income)
    const incomeByDate = filteredData.transactions
      .filter(t => t.type === 'contribution')
      .reduce((acc, t) => {
        const d = format(parseISO(t.date || new Date().toISOString()), 'yyyy-MM-dd');
        acc[d] = (acc[d] || 0) + (Number(t.amount) || 0);
        return acc;
      }, {});

    const financialChartData = Object.entries(incomeByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15); // Show last 15 days with data

    // 2. Members Sparkline (Daily Registrations)
    const membersByDate = filteredData.members.reduce((acc, m) => {
      const d = format(parseISO(m.createdAt || new Date().toISOString()), 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const membersSparklineData = Object.entries(membersByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    // 3. Events Sparkline (Daily Events)
    const eventsByDate = filteredData.events.reduce((acc, e) => {
      const d = format(parseISO(e.date || new Date().toISOString()), 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const eventsSparklineData = Object.entries(eventsByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    // Default Fallbacks for empty states
    const fallback = [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }];

    return {
      financial: financialChartData.length > 0 ? financialChartData : fallback,
      members: membersSparklineData.length > 0 ? membersSparklineData : fallback,
      events: eventsSparklineData.length > 0 ? eventsSparklineData : fallback,
      revenue: financialChartData.length > 0 ? financialChartData.slice(-7) : fallback
    };
  }, [filteredData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
  };

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ paddingBottom: '2rem' }}
    >
      {/* 1. WELCOME BANNER */}
      <motion.div variants={itemVariants}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 }, 
            mb: 4, 
            background: theme.palette.mode === 'light' 
              ? `linear-gradient(120deg, ${theme.palette.primary.main} 0%, #2563EB 50%, #1E40AF 100%)`
              : `linear-gradient(120deg, #1E293B 0%, #0F172A 100%)`,
            color: '#fff',
            borderRadius: 6,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            boxShadow: `0 24px 48px -12px ${alpha(theme.palette.primary.main, 0.4)}`
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: { md: '60%' } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Chip 
                label={format(new Date(), 'MMMM yyyy')} 
                size="small" 
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    color: '#fff', 
                    fontWeight: 700, 
                    backdropFilter: 'blur(10px)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '0.7rem'
                }} 
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1 }}>
                {format(new Date(), 'EEEE, do')}
              </Typography>
            </Stack>
            
            <Typography variant="h2" sx={{ 
                fontWeight: 800, 
                mb: 1.5, 
                letterSpacing: '-0.04em',
                fontSize: { xs: '2rem', md: '3rem' }
            }}>
              Hello, {workspaceContext?.userRole === 'admin' ? 'Admin' : 'Minister'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 500, lineHeight: 1.6 }}>
              Overview of <Box component="span" sx={{ fontWeight: 800, color: '#fff', borderBottom: '2px solid rgba(255,255,255,0.3)' }}>{workspace === 'main' ? 'Sanctuary' : workspace}</Box> activities.
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 4, md: 0 }, display: 'flex', gap: 2, position: 'relative', zIndex: 2, width: { xs: '100%', md: 'auto' } }}>
            <Button 
              component={Link} 
              to="/members" 
              variant="contained" 
              fullWidth={true}
              startIcon={<Plus size={18} />}
              sx={{ 
                bgcolor: '#fff', 
                color: theme.palette.primary.main, 
                px: 3,
                py: 1.5,
                fontWeight: 800,
                boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
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
                border: '1px solid rgba(255,255,255,0.1)',
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <Activity size={20} />
            </IconButton>
          </Box>

          {/* Abstract Decorations */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', bottom: -100, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', zIndex: 1 }} />
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
            trend="+12.5%"
            chartData={aggregatedData.members}
            delay={0.1}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="Total Revenue" 
            value={`GHC ${totalContributions.toLocaleString()}`} 
            icon={DollarSign} 
            color="#10B981" 
            trend="Target met"
            chartData={aggregatedData.revenue}
            delay={0.2}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="Active Events" 
            value={filteredData.events.length} 
            icon={Calendar} 
            color="#F59E0B" 
            chartData={aggregatedData.events}
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
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, borderRadius: 6, minHeight: 400 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Financial Overview</Typography>
                    <Typography variant="caption" color="text.secondary">Daily income trend</Typography>
                  </Box>
                  <IconButton size="small"><MoreHorizontal size={20} /></IconButton>
                </Box>

                <Box sx={{ height: 300, width: '100%', minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aggregatedData.financial}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: 16, border: 'none', boxShadow: theme.shadows[10], padding: '12px 16px', backgroundColor: theme.palette.background.paper }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#chartGradient)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </motion.div>
          </Stack>
        </Grid>

        {/* RIGHT: EVENTS & GOALS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 6, overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={800}>Upcoming Events</Typography>
                        <Button size="small" component={Link} to="/events">View All</Button>
                    </Box>
                    <Box sx={{ p: 0 }}>
                        {filteredData.events.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body2">No upcoming events</Typography>
                            </Box>
                        ) : (
                            filteredData.events.slice(0, 3).map((event, idx) => (
                                <Box 
                                    key={idx}
                                    sx={{ 
                                        p: 2.5, 
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                        display: 'flex', 
                                        gap: 2,
                                        alignItems: 'center',
                                        transition: 'background 0.2s',
                                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) }
                                    }}
                                >
                                    <Box sx={{ 
                                        width: 50, height: 50, borderRadius: 3, 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {format(new Date(event.date), 'MMM')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1 }}>
                                            {format(new Date(event.date), 'dd')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={800} noWrap>{event.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <Clock size={12} /> {event.time}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Card>
            </motion.div>
          </Stack>
        </Grid>

      </Grid>
    </motion.div>
  );
};

export default Dashboard;