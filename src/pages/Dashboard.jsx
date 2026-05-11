import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  Box,
  Grid,
  Card,
  Typography,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
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
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useCallback } from 'react';

import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { safeParseDate, getISOStringDate } from '../utils/dateUtils';
import { syncMemberDepartments } from '../utils/syncDepartments';

// --- SUB-COMPONENTS ---

const ModernStatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Card 
        sx={{ 
          position: 'relative', 
          overflow: 'hidden', 
          height: '100%',
          p: 3.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 3,
          background: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(40px)',
          border: `1px solid ${alpha(color, 0.2)}`,
          boxShadow: `0 20px 40px -15px ${alpha(color, 0.15)}`,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: `0 30px 60px -20px ${alpha(color, 0.3)}`,
            borderColor: alpha(color, 0.4),
            '& .icon-box': { transform: 'scale(1.1) rotate(10deg)', bgcolor: color, color: '#fff' }
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ opacity: 0.6, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ color: theme.palette.text.primary, letterSpacing: '-0.04em', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {value}
            </Typography>
            {trend && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <Box sx={{ bgcolor: alpha(color, 0.1), borderRadius: 1.5, px: 1, py: 0.5, display: 'flex', alignItems: 'center' }}>
                    <TrendingUp size={14} color={color} style={{ marginRight: 6 }} />
                    <Typography variant="caption" fontWeight={900} sx={{ color: color, fontSize: '0.7rem' }}>
                        {trend}
                    </Typography>
                </Box>
              </Stack>
            )}
          </Box>
          <Box 
            className="icon-box"
            sx={{ 
              p: 2, 
              borderRadius: 2.5, 
              bgcolor: alpha(color, 0.1), 
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.4s ease',
              boxShadow: `0 12px 24px -6px ${alpha(color, 0.2)}`
            }}
          >
            <Icon size={26} strokeWidth={2.5} />
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const workspaceContext = useWorkspace();
  const workspace = workspaceContext?.workspace || 'main';
  const filterData = workspaceContext?.filterData || ((d) => d);
  const userRole = workspaceContext?.userRole || 'guest';
  
  const [data, setData] = useState({
    members: [],
    transactions: [],
    events: [],
    attendance: []
  });
  const [loading, setLoading] = useState(true);

  const dynamicGreeting = useMemo(() => {
    const greetings = [
        "Let's lead with grace today",
        "Excellence is our standard",
        "Ready to make an impact?",
        "Faith in action starts here",
        "Empowered to serve the sanctuary",
        "Charting the path of growth",
        "Your leadership makes a difference",
        "Cultivating the harvest together",
        "A great day for ministry",
        "Strength and honor today"
    ];
    const hour = new Date().getHours();
    let timeGreeting = "Good Morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good Afternoon";
    else if (hour >= 17) timeGreeting = "Good Evening";
    
    const randomMsg = greetings[Math.floor(Math.random() * greetings.length)];
    return { timeGreeting, randomMsg };
  }, []);

  const checkUpcomingBirthdays = useCallback(async (members, allEvents) => {
    // Only admins or branch admins trigger automatic creation to avoid duplicates/unauthorized writes
    if (userRole !== 'admin' && userRole !== 'branch_admin') return;

    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 7);
    const targetMonth = targetDate.getMonth() + 1;
    const targetDay = targetDate.getDate();
    
    const targetDateISO = targetDate.toISOString().split('T')[0];
    const targetDateStr = targetDateISO + "T00:00:00.000Z";

    const upcomingBirthdays = members.filter(member => {
      if (!member.dob) return false;
      const dob = safeParseDate(member.dob);
      return (dob.getMonth() + 1) === targetMonth && dob.getDate() === targetDay;
    });

    for (const member of upcomingBirthdays) {
      const eventName = `🎂 Birthday: ${member.name}`;
      const exists = allEvents.some(e => 
        e.name === eventName && 
        getISOStringDate(e.date) === targetDateISO
      );

      if (!exists) {
        try {
          await addDoc(collection(db, "events"), {
            name: eventName,
            date: targetDateStr,
            time: "00:00",
            location: "Main Auditorium",
            isOnline: false,
            description: `Happy Birthday to ${member.name}! This is an automatically generated reminder.`,
            branch: member.branch || 'Main',
            createdAt: new Date().toISOString()
          });
          console.log(`Automatic event created: ${eventName}`);
        } catch (err) {
          console.error("Error creating birthday event:", err);
        }
      }
    }
  }, [userRole]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [membersSnapshot, txSnapshot, eventsSnapshot, attendanceSnapshot] = await Promise.all([
          getDocs(collection(db, "members")),
          getDocs(collection(db, "transactions")),
          getDocs(collection(db, "events")),
          getDocs(collection(db, "attendance"))
        ]);

        const now = new Date();
        const rawMembers = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const rawEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Background check for birthdays
        checkUpcomingBirthdays(rawMembers, rawEvents);

        const upcomingEvents = (rawEvents || []).filter(event => {
          if (!event.date) return false;
          const eventDateStr = getISOStringDate(event.date);
          const eventDateTime = new Date(`${eventDateStr}T${event.time || '00:00'}`);
          
          if (isNaN(eventDateTime.getTime())) {
            const justDate = safeParseDate(event.date);
            justDate.setHours(23, 59, 59, 999);
            return justDate >= now;
          }
          return eventDateTime >= now;
        });

        setData({
          members: rawMembers,
          transactions: txSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [],
          events: upcomingEvents,
          attendance: attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || []
        });

        // Admin only: Run a silent background sync of member departments to keep age-based groups accurate
        if (userRole === 'admin') {
            syncMemberDepartments().catch(err => console.error("Auto-sync error:", err));
        }

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [checkUpcomingBirthdays]);

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

  const totalExpenses = useMemo(() => {
    return filteredData.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [filteredData.transactions]);

  const budgetProgress = useMemo(() => {
    const monthlyTarget = 25000;
    return (totalContributions / monthlyTarget) * 100;
  }, [totalContributions]);
  
  const aggregatedData = useMemo(() => {
    // 1. Financial Overview & Revenue Sparkline (Daily Income)
    const incomeByDate = filteredData.transactions
      .filter(t => t.type === 'contribution')
      .reduce((acc, t) => {
        const d = format(safeParseDate(t.date), 'yyyy-MM-dd');
        acc[d] = (acc[d] || 0) + (Number(t.amount) || 0);
        return acc;
      }, {});

    const financialChartData = Object.entries(incomeByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15); 

    // 2. Members Sparkline (Daily Registrations)
    const membersByDate = filteredData.members.reduce((acc, m) => {
      const d = format(safeParseDate(m.createdAt), 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const membersSparklineData = Object.entries(membersByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    // 3. Events Sparkline
    const eventsByDate = filteredData.events.reduce((acc, e) => {
      const d = format(safeParseDate(e.date), 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const eventsSparklineData = Object.entries(eventsByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    // --- RESTORED PIE CHART LOGIC ---
    
    // Attendance Pie
    const attendancePieData = [
      { name: 'Present', value: filteredData.attendance.reduce((sum, r) => sum + (r.attendees?.length || 0), 0), color: theme.palette.primary.main },
      { name: 'Absent', value: (filteredData.members.length * filteredData.attendance.length) - filteredData.attendance.reduce((sum, r) => sum + (r.attendees?.length || 0), 0), color: alpha(theme.palette.primary.main, 0.2) }
    ];

    // Financial Distribution
    const categoryTotals = filteredData.transactions.reduce((acc, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});
    
    const financialPieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

    // Member Status (Restored logic from previous version)
    const eightMonthsAgo = new Date();
    eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const memberStatusCounts = filteredData.members.reduce((acc, member) => {
      const lastAttendance = filteredData.attendance
        .filter(record => record.attendees && record.attendees.some(attendee => String(attendee.id) === String(member.id)))
        .map(record => safeParseDate(record.date))
        .sort((a, b) => b - a)[0];

      let status = 'active';
      if (!lastAttendance) {
        // If brand new (joined < 1 month ago), count as active
        const joinedDate = safeParseDate(member.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        status = joinedDate > oneMonthAgo ? 'active' : 'discontinued';
      } else if (lastAttendance < eightMonthsAgo) {
        status = 'discontinued';
      } else if (lastAttendance < threeMonthsAgo) {
        status = 'inactive';
      }

      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { active: 0, inactive: 0, discontinued: 0 });

    const statusPieData = [
      { name: 'Active', value: memberStatusCounts.active },
      { name: 'Inactive', value: memberStatusCounts.inactive },
      { name: 'Discontinued', value: memberStatusCounts.discontinued }
    ].filter(item => item.value > 0);

    // Recent Activity Feed
    const activities = [
      ...filteredData.members.slice(-5).map(m => ({ id: m.id, type: 'member', title: 'New Member', description: m.name, date: safeParseDate(m.createdAt), branch: m.branch })),
      ...filteredData.transactions.slice(-5).map(t => ({ id: t.id, type: 'transaction', title: t.category, description: `GHC ${t.amount}`, date: safeParseDate(t.date), branch: t.branch })),
      ...filteredData.events.slice(-5).map(e => ({ id: e.id, type: 'event', title: 'New Event', description: e.name, date: safeParseDate(e.date), branch: e.branch }))
    ].sort((a, b) => b.date - a.date).slice(0, 8);

    // Default Fallbacks
    const fallback = [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }];

    return {
      financial: financialChartData.length > 0 ? financialChartData : fallback,
      members: membersSparklineData.length > 0 ? membersSparklineData : fallback,
      events: eventsSparklineData.length > 0 ? eventsSparklineData : fallback,
      revenue: financialChartData.length > 0 ? financialChartData.slice(-7) : fallback,
      attendancePie: attendancePieData,
      financialPie: financialPieData,
      statusPie: statusPieData,
      activities: activities
    };
  }, [filteredData, theme]);

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
         <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3, mb: 4 }} />
         <Grid container spacing={3}>
           {[1, 2, 3].map(i => <Grid key={i} size={{ xs: 12, md: 4 }}><Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} /></Grid>)}
         </Grid>
       </Box>
     );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ paddingBottom: '3rem' }}
    >
      {/* 1. WELCOME BANNER */}
      <motion.div variants={itemVariants}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 7 }, 
            mb: 6, 
            background: theme.palette.mode === 'light' 
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, #020617 0%, #0D1117 100%)`,
            color: '#fff',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            boxShadow: `0 32px 64px -12px ${alpha(theme.palette.primary.main, 0.5)}`,
            border: `2px solid ${alpha('#fff', 0.1)}`
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: { md: '65%' } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Box sx={{ bgcolor: theme.palette.secondary.main, color: '#fff', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 900, fontSize: '0.65rem', letterSpacing: 1.5 }}>
                OFFICIAL PORTAL
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                {format(new Date(), 'EEEE, MMMM do')}
              </Typography>
            </Stack>
            
            <Typography variant="h2" sx={{ 
                fontWeight: 900, 
                mb: 2.5, 
                letterSpacing: '-0.03em',
                fontSize: { xs: '2.5rem', md: '3.8rem' },
                lineHeight: 1,
                fontFamily: '"Playfair Display", serif',
                textShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {dynamicGreeting.timeGreeting}, {workspaceContext?.userRole === 'admin' ? 'Administrator' : 'Minister'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 600, maxWidth: 600, lineHeight: 1.6 }}>
              <Box component="span" sx={{ opacity: 0.6, fontSize: '0.8rem', letterSpacing: 2, display: 'block', mb: 0.5 }}>{dynamicGreeting.randomMsg.toUpperCase()}</Box>
              Governing the <Box component="span" sx={{ fontWeight: 900, color: theme.palette.secondary.light, borderBottom: `3px solid ${theme.palette.secondary.main}` }}>{workspace === 'main' ? 'Rhema Global Sanctuary' : workspace}</Box> with excellence.
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 5, md: 0 }, display: 'flex', gap: 2.5, position: 'relative', zIndex: 2, width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}>
            <Chip 
              icon={<Activity size={16} color="#fff" />} 
              label="SYSTEM ONLINE" 
              sx={{ 
                display: { xs: 'none', lg: 'flex' }, 
                bgcolor: alpha(theme.palette.success.main, 0.2), 
                color: '#fff', 
                fontWeight: 900, 
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                backdropFilter: 'blur(10px)',
                px: 1,
                borderRadius: 2
              }} 
            />
            <Button 
              component={Link} 
              to="/members" 
              variant="contained" 
              fullWidth={isMobile}
              startIcon={<Plus size={24} strokeWidth={3} />}
              sx={{ 
                bgcolor: theme.palette.secondary.main, 
                color: '#fff', 
                px: { md: 6 },
                py: 2.5,
                borderRadius: 2.5,
                fontWeight: 900,
                fontSize: '1.1rem',
                border: '3px solid rgba(255,255,255,0.4)',
                boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.4)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': { 
                    bgcolor: theme.palette.secondary.dark, 
                    transform: 'translateY(-6px) scale(1.02)', 
                    boxShadow: `0 25px 50px ${alpha(theme.palette.secondary.main, 0.6)}`,
                    borderColor: '#fff'
                }
              }}
            >
              Add New Member
            </Button>
          </Box>

          {/* Abstract Premium Decorations */}
          <Box sx={{ position: 'absolute', top: -100, right: -100, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', bottom: -150, left: '5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 162, 232, 0.1) 0%, transparent 70%)', zIndex: 1 }} />
        </Paper>
      </motion.div>

      {/* 2. STATS GRID */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="ACTIVE MEMBERSHIP" 
            value={filteredData.members.length.toLocaleString()} 
            icon={Users} 
            color={theme.palette.primary.main} 
            trend="+12% growth"
            delay={0.1}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="TOTAL REVENUE" 
            value={`GHC ${totalContributions.toLocaleString()}`} 
            icon={DollarSign} 
            color={theme.palette.success.main} 
            trend="On target"
            delay={0.2}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernStatCard 
            title="TOTAL EXPENSES" 
            value={`GHC ${totalExpenses.toLocaleString()}`} 
            icon={CreditCard} 
            color={theme.palette.error.main} 
            trend="Managed"
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* 3. MAIN SECTION */}
      <Grid container spacing={5}>
        
        {/* LEFT: ACTIVITY FEED */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={5}>
            
            {/* RESTORED: Recent Activity / Live Feed */}
            <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h5" fontWeight={900}>Live Activity</Typography>
                        <Button size="small" endIcon={<ArrowRight size={18} />}>Full Log</Button>
                    </Box>
                    <Box sx={{ p: 0 }}>
                        {aggregatedData.activities.map((activity, idx) => (
                            <Box 
                                key={activity.id || idx} 
                                sx={{ 
                                    p: 3, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 3,
                                    borderBottom: idx === aggregatedData.activities.length - 1 ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                }}
                            >
                                <Avatar sx={{ 
                                    bgcolor: activity.type === 'member' ? alpha(theme.palette.primary.main, 0.1) : activity.type === 'transaction' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                                    color: activity.type === 'member' ? theme.palette.primary.main : activity.type === 'transaction' ? theme.palette.success.main : theme.palette.warning.main,
                                    width: 48, height: 48, borderRadius: 2
                                }}>
                                    {activity.type === 'member' ? <Users size={22} /> : activity.type === 'transaction' ? <CreditCard size={22} /> : <Calendar size={22} />}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={800}>{activity.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{activity.description}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {format(activity.date, 'h:mm a')}
                                    </Typography>
                                    <Chip label={activity.branch || 'Global'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900, mt: 0.5, border: 'none', bgcolor: alpha(theme.palette.text.primary, 0.05) }} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Card>
            </motion.div>
          </Stack>
        </Grid>

        {/* RIGHT: EVENTS & GOALS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
                                        width: 50, height: 50, borderRadius: 2, 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {format(safeParseDate(event.date), 'MMM')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1 }}>
                                            {format(safeParseDate(event.date), 'dd')}
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