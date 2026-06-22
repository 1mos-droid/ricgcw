import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
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
  Stack,
  Divider,
  alpha,
  Paper,
  Badge,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  Users,
  DollarSign,
  Calendar,
  Activity,
  CreditCard,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar, Legend
} from 'recharts';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { safeParseDate, getISOStringDate } from '../utils/dateUtils';
import { syncMemberDepartments } from '../utils/syncDepartments';
import { autoAssignVolunteers } from '../utils/autoRoster';
import { validateBatchDeposit } from '../utils/dualCustody';
import { CupertinoSlidingSegmentedControl, CupertinoButton, CupertinoCard } from '../components/Cupertino';

// Sub-components
import MemberDashboardView from '../components/organisms/MemberDashboardView';
import MetricCard from '../components/organisms/MetricCard';
import TrendChartCard from '../components/organisms/TrendChartCard';
import UpcomingEventsWidget from '../components/organisms/UpcomingEventsWidget';
import RecentActivityFeed from '../components/organisms/RecentActivityFeed';

// Stylesheet
import './Dashboard.css';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const workspaceContext = useWorkspace();
  const workspace = workspaceContext?.workspace || 'main';
  const defaultFilterData = useCallback((d) => d, []);
  const filterData = workspaceContext?.filterData || defaultFilterData;
  const userRole = workspaceContext?.userRole || 'guest';
  
  const [data, setData] = useState({
    members: [],
    transactions: [],
    events: [],
    attendance: []
  });
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const isMember = useMemo(() => {
    return userRole !== 'admin' && userRole !== 'branch_admin' && userRole !== 'developer';
  }, [userRole]);

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
    if (userRole !== 'admin' && userRole !== 'branch_admin') return;

    const today = new Date();
    // Timezone-safe local ISO string for today (YYYY-MM-DD)
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Check local storage cache to prevent duplicate processing/API calls on every load
    const cachedDate = localStorage.getItem('birthdaysLastChecked');
    if (cachedDate === todayISO) {
      return;
    }

    // Build target date map for the next 8 days (0 to 7)
    // Map key: "MM-DD" -> { targetDateISO, targetDateStr }
    const targetDayMap = new Map();
    for (let d = 0; d <= 7; d++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + d);
      
      const targetMonth = targetDate.getMonth() + 1;
      const targetDay = targetDate.getDate();
      const key = `${targetMonth}-${targetDay}`;
      
      const year = targetDate.getFullYear();
      const month = String(targetMonth).padStart(2, '0');
      const day = String(targetDay).padStart(2, '0');
      const targetDateISO = `${year}-${month}-${day}`;
      const targetDateStr = `${targetDateISO}T00:00:00.000Z`;
      
      targetDayMap.set(key, { targetDateISO, targetDateStr });
    }

    // Index allEvents to check for existing birthdays in O(1) time
    // Event unique key: "eventName_targetDateISO"
    const existingEvents = new Set();
    allEvents.forEach(e => {
      if (e.name && e.date) {
        const isoDate = getISOStringDate(e.date);
        existingEvents.add(`${e.name}_${isoDate}`);
      }
    });

    let writesOccurred = false;

    // Filter upcoming birthdays in a single pass O(M) over members
    for (const member of members) {
      if (!member.dob) continue;
      const dob = safeParseDate(member.dob);
      const dobMonth = dob.getMonth() + 1;
      const dobDay = dob.getDate();
      const dobKey = `${dobMonth}-${dobDay}`;

      const targetInfo = targetDayMap.get(dobKey);
      if (targetInfo) {
        const eventName = `🎂 Birthday: ${member.name}`;
        const eventKey = `${eventName}_${targetInfo.targetDateISO}`;

        if (!existingEvents.has(eventKey)) {
          try {
            await addDoc(collection(db, "events"), {
              name: eventName,
              date: targetInfo.targetDateStr,
              time: "00:00",
              location: "Main Auditorium",
              isOnline: false,
              description: `Happy Birthday to ${member.name}! This is an automatically generated reminder.`,
              branch: member.branch || 'Main',
              createdAt: new Date().toISOString()
            });
            console.log(`Automatic event created: ${eventName} for ${targetInfo.targetDateISO}`);
            
            // Add to our sets to prevent duplicate checks/creation in the same execution
            existingEvents.add(eventKey);
            allEvents.push({
              name: eventName,
              date: targetInfo.targetDateStr,
              branch: member.branch || 'Main'
            });
            writesOccurred = true;
          } catch (err) {
            console.error("Error creating birthday event:", err);
          }
        }
      }
    }

    // Store in local storage that we checked today to prevent duplicate runs
    localStorage.setItem('birthdaysLastChecked', todayISO);
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
  }, [checkUpcomingBirthdays, userRole]);

  const filteredData = useMemo(() => {
    return {
      members: filterData(data.members || []) || [],
      transactions: filterData(data.transactions || []) || [],
      events: filterData(data.events || []) || [],
      attendance: data.attendance || [] 
    };
  }, [data, filterData]);

  const { totalContributions, totalExpenses } = useMemo(() => {
    let contributions = 0;
    let expenses = 0;
    filteredData.transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'contribution') {
        contributions += amt;
      } else if (t.type === 'expense') {
        expenses += amt;
      }
    });
    return { totalContributions: contributions, totalExpenses: expenses };
  }, [filteredData.transactions]);

  const budgetProgress = useMemo(() => {
    const monthlyTarget = 25000;
    return (totalContributions / monthlyTarget) * 100;
  }, [totalContributions]);

  const campusAnalytics = useMemo(() => {
    const branches = ['Mallam', 'Kokrobitey', 'Langma', 'Diaspora'];
    const counts = {
      Mallam: { members: 0, giving: 0 },
      Kokrobitey: { members: 0, giving: 0 },
      Langma: { members: 0, giving: 0 },
      Diaspora: { members: 0, giving: 0 },
    };
    
    data.members.forEach(m => {
      if (m.branch && counts[m.branch] !== undefined) {
        counts[m.branch].members += 1;
      }
    });

    data.transactions.forEach(t => {
      if (t.type === 'contribution' && t.branch && counts[t.branch] !== undefined) {
        counts[t.branch].giving += (Number(t.amount) || 0);
      }
    });

    return branches.map(branchName => ({
      name: branchName,
      Members: counts[branchName].members,
      Giving: counts[branchName].giving
    }));
  }, [data.members, data.transactions]);

  const safetyStatus = useMemo(() => {
    let latestDateStr = null;
    let latestDateTime = 0;

    // Find the latest attendance record's date
    filteredData.attendance.forEach(record => {
      if (!record.date) return;
      const d = safeParseDate(record.date);
      const time = d.getTime();
      if (time > latestDateTime) {
        latestDateTime = time;
        latestDateStr = getISOStringDate(record.date);
      }
    });

    const checkedInMemberIds = new Set();
    if (latestDateStr) {
      filteredData.attendance.forEach(record => {
        if (record.date && getISOStringDate(record.date) === latestDateStr) {
          if (Array.isArray(record.attendees)) {
            record.attendees.forEach(att => {
              if (att && att.id) checkedInMemberIds.add(String(att.id));
            });
          }
        }
      });
    }

    // Build map for O(1) member lookup instead of O(M) DOB parses
    const membersMap = new Map();
    data.members.forEach(m => {
      if (m.id) membersMap.set(String(m.id), m);
    });

    const checkedInChildren = [];
    checkedInMemberIds.forEach(id => {
      const m = membersMap.get(id);
      if (m) {
        if (m.dob) {
          const age = new Date().getFullYear() - safeParseDate(m.dob).getFullYear();
          if (age < 13) {
            checkedInChildren.push(m);
          }
        }
      }
    });

    const checkedInCount = checkedInChildren.length;

    return {
      checkedInCount,
      activeTokenCount: checkedInCount,
      allergyAlerts: checkedInChildren.filter(m => m.allergies || m.medicalNotes).length
    };
  }, [data.members, filteredData.attendance]);

  const volunteerSlots = useMemo(() => {
    const slots = [];
    filteredData.events.slice(0, 3).forEach(event => {
      if (event.date) {
        const eventDateStr = getISOStringDate(event.date);
        slots.push({
          id: `slot-${event.id}-usher`,
          role: 'Usher',
          serviceDate: eventDateStr,
          dayOfWeek: format(safeParseDate(event.date), 'EEEE')
        });
        slots.push({
          id: `slot-${event.id}-av`,
          role: 'AV Sound Board',
          serviceDate: eventDateStr,
          dayOfWeek: format(safeParseDate(event.date), 'EEEE')
        });
      }
    });

    // Extract unique roles needed to pre-filter potential volunteers
    const slotRoles = new Set(slots.map(s => s.role));
    const potentialVolunteers = [];
    for (let i = 0; i < data.members.length; i++) {
      const m = data.members[i];
      const roles = m.volunteerRoles || ['Usher', 'AV Sound Board', 'Children Teacher', 'Musician'];
      // Only include volunteers if they have a matching role needed
      if (roles.some(r => slotRoles.has(r))) {
        potentialVolunteers.push({
          id: m.id || String(i),
          name: m.name || 'Anonymous',
          roles: roles,
          availability: ['Sunday', 'Saturday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          lastServed: m.lastServed || '2026-05-24',
          gapWeeks: 1
        });
      }
    }

    const assignments = autoAssignVolunteers(slots, potentialVolunteers);

    return slots.map(slot => {
      const match = assignments.find(a => a.slotId === slot.id);
      return {
        ...slot,
        assignedName: match ? match.volunteerName : 'Unassigned',
        status: match ? 'Assigned' : 'Vacant'
      };
    });
  }, [filteredData.events, data.members]);

  const pendingAudits = useMemo(() => {
    const mallamTx = [];
    let batchTotal = 0;
    
    data.transactions.forEach(t => {
      if (t.type === 'contribution' && t.branch === 'Mallam') {
        mallamTx.push(t);
        batchTotal += (Number(t.amount) || 0);
      }
    });

    if (mallamTx.length === 0) {
      return {
        batchId: null,
        total: 0,
        signatures: [],
        isValid: true,
        reason: 'No pending batches requiring audit.'
      };
    }

    const countUsers = [user?.email || 'admin@ricgcw.org'];

    const auditCheck = validateBatchDeposit(
      batchTotal,
      mallamTx,
      countUsers
    );

    return {
      batchId: `B-${format(new Date(), 'yyyy-MM')}`,
      total: batchTotal,
      signatures: countUsers,
      isValid: auditCheck.success,
      reason: auditCheck.reason
    };
  }, [data.transactions, user]);

  const aggregatedData = useMemo(() => {
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

    const membersByDate = filteredData.members.reduce((acc, m) => {
      const d = format(safeParseDate(m.createdAt), 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const membersSparklineData = Object.entries(membersByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const eventsByDate = filteredData.events.reduce((acc, e) => {
      const d = format(safeParseDate(e.date), 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const eventsSparklineData = Object.entries(eventsByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const categoryTotals = filteredData.transactions.reduce((acc, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

    const activities = [
      ...filteredData.members.slice(-5).map(m => ({ id: m.id, type: 'member', title: 'New Member', description: m.name, date: safeParseDate(m.createdAt), branch: m.branch })),
      ...filteredData.transactions.slice(-5).map(t => ({ id: t.id, type: 'transaction', title: t.category, description: `GHC ${t.amount}`, date: safeParseDate(t.date), branch: t.branch })),
      ...filteredData.events.slice(-5).map(e => ({ id: e.id, type: 'event', title: 'New Event', description: e.name, date: safeParseDate(e.date), branch: e.branch }))
    ].sort((a, b) => b.date - a.date).slice(0, 8);

    const fallback = [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }];

    return {
      financial: financialChartData.length > 0 ? financialChartData : fallback,
      members: membersSparklineData.length > 0 ? membersSparklineData : fallback,
      events: eventsSparklineData.length > 0 ? eventsSparklineData : fallback,
      revenue: financialChartData.length > 0 ? financialChartData.slice(-7) : fallback,
      activities: activities
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
       <Box sx={{ pb: '3rem' }}>
         <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '12px', mb: 3 }} />
         <Grid container spacing={4}>
           {[1, 2, 3].map(i => (
             <Grid key={i} size={{ xs: 12, md: 4 }}>
               <Skeleton variant="rectangular" height={175} sx={{ borderRadius: '12px' }} />
             </Grid>
           ))}
         </Grid>
       </Box>
     );
  }

  if (isMember) {
      return (
          <MemberDashboardView 
            user={user} 
            transactions={data.transactions} 
            events={data.events} 
          />
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
        <Paper elevation={0} className="dashboard-welcome-banner">
          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: { md: '70%' } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Box sx={{ bgcolor: 'var(--system-blue)', color: '#fff', px: 1, py: 0.25, borderRadius: 1, fontWeight: 900, fontSize: '0.6rem', letterSpacing: 1 }}>
                OFFICIAL PORTAL
              </Box>
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {format(new Date(), 'EEEE, MMMM do')}
              </Typography>
            </Stack>
            
            <Typography variant="h5" component="h2" sx={{
                fontWeight: 900,
                mb: 1,
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.4rem', md: '1.8rem' },
                lineHeight: 1.2,
                color: 'var(--text-primary)'
            }}>
              {dynamicGreeting.timeGreeting}, {workspaceContext?.userRole === 'admin' ? 'Administrator' : 'Minister'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 650, lineHeight: 1.4 }}>
              Governing the <Box component="span" sx={{ fontWeight: 800, color: 'var(--system-blue)' }}>{workspace === 'main' ? 'Rhema Global Sanctuary' : workspace}</Box> with excellence. ({dynamicGreeting.randomMsg})
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 3, md: 0 }, display: 'flex', gap: 2, position: 'relative', zIndex: 2, width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}>
            <Chip 
              icon={<Activity size={14} color="var(--system-green)" />} 
              label="SYSTEM ONLINE" 
              sx={{ 
                display: { xs: 'none', lg: 'flex' }, 
                bgcolor: 'rgba(52, 199, 89, 0.08)', 
                color: 'var(--system-green)', 
                fontWeight: 800, 
                fontSize: '0.7rem',
                border: '1px solid rgba(52, 199, 89, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 1.5
              }} 
            />
            <CupertinoButton 
              onClick={() => navigate('/members')} 
              variant="filled" 
              color="primary"
              sx={{ 
                px: { md: 4 },
                py: 1.25,
                borderRadius: 2,
                fontSize: '0.9rem',
                height: 40
              }}
            >
              <Plus size={16} strokeWidth={3} /> Add Member
            </CupertinoButton>
          </Box>

          {/* Abstract Decorations */}
          <Box className="glow-decor-1" />
          <Box className="glow-decor-2" />
        </Paper>
      </motion.div>

      {/* 2. TABBED CONTENT CHUNKING */}
      <Box sx={{ maxWidth: { xs: '100%', md: 540 }, mx: 'auto', mb: 5 }}>
        <CupertinoSlidingSegmentedControl
          options={[
            { label: "Overview" },
            { 
              label: (
                <Badge 
                  color="error" 
                  variant="dot" 
                  invisible={pendingAudits.isValid && safetyStatus.allergyAlerts === 0}
                  sx={{ '& .MuiBadge-badge': { right: -8, top: -2 } }}
                >
                  Operations
                </Badge>
              ) 
            },
            { label: "Analytics" }
          ]}
          value={tabValue}
          onChange={handleTabChange}
        />
      </Box>

      {/* TAB PANEL 0: OVERVIEW */}
      {tabValue === 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* STATS GRID */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MetricCard 
                title="Active Membership" 
                value={filteredData.members.length.toLocaleString()} 
                icon={Users} 
                trend="up"
                trendValue="12"
                trendLabel="growth from last month"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MetricCard 
                title="Total Revenue" 
                value={`GHC ${totalContributions.toLocaleString()}`} 
                icon={DollarSign} 
                trend="up"
                trendValue={Math.round(budgetProgress).toString()}
                trendLabel="of monthly target"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MetricCard 
                title="Total Expenses" 
                value={`GHC ${totalExpenses.toLocaleString()}`} 
                icon={CreditCard} 
                trend="down"
                trendValue="5"
                trendLabel="managed effectively"
              />
            </Grid>
          </Grid>

          <Grid container spacing={5}>
            {/* LEFT: ACTIVITY FEED */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <RecentActivityFeed 
                activities={aggregatedData.activities.map(a => ({
                  id: a.id,
                  userName: a.type === 'member' ? a.description : 'System',
                  userImage: '',
                  action: a.type === 'member' ? 'joined' : a.type === 'transaction' ? 'received' : 'scheduled',
                  target: a.title,
                  timestamp: format(a.date, 'h:mm a')
                }))}
              />
            </Grid>

            {/* RIGHT: UPCOMING EVENTS */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <UpcomingEventsWidget 
                events={filteredData.events.slice(0, 5).map(e => ({
                  id: e.id,
                  month: format(safeParseDate(e.date), 'MMM'),
                  day: format(safeParseDate(e.date), 'dd'),
                  title: e.name,
                  time: e.time,
                  location: e.location || 'Main Sanctuary'
                }))}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* TAB PANEL 1: OPERATIONS */}
      {tabValue === 1 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* PENDING DUAL CUSTODY AUDITS */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={itemVariants}>
                <CupertinoCard sx={{ height: '100%' }}>
                  <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.warning.main, 0.03), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                      <CreditCard size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>Pending Dual-Custody Deposit Audits</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>FINANCIAL LEDGER SECURITY QUEUE</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    {!pendingAudits.isValid ? (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 3, 
                          bgcolor: alpha(theme.palette.warning.main, 0.02),
                          borderColor: alpha(theme.palette.warning.main, 0.3)
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <AlertTriangle color={theme.palette.warning.main} size={22} style={{ flexShrink: 0 }} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="warning.main">
                              Action Required: Missing Auditing Signature
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.4 }}>
                              {pendingAudits.reason}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>BATCH ID</Typography>
                            <Typography variant="body2" fontWeight={900}>{pendingAudits.batchId}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>TOTAL AMOUNT</Typography>
                            <Typography variant="body2" fontWeight={900} color="primary.main">GHC {pendingAudits.total.toLocaleString()}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>SIGNATURES</Typography>
                            <Chip size="small" label={`${pendingAudits.signatures.length}/2 Signed`} color="warning" sx={{ fontWeight: 800 }} />
                          </Box>
                        </Stack>
                      </Paper>
                    ) : (
                      <Box sx={{ py: 3, textAlign: 'center', opacity: 0.6 }}>
                        <CheckCircle2 color={theme.palette.success.main} size={36} style={{ margin: '0 auto 12px' }} />
                        <Typography variant="body2" fontWeight={700}>All batches reconciled & dual-signed.</Typography>
                      </Box>
                    )}
                  </Box>
                </CupertinoCard>
              </motion.div>
            </Grid>

            {/* CHILD SAFETY CHECK-INS */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={itemVariants}>
                <CupertinoCard sx={{ height: '100%' }}>
                  <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.03), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      <ShieldCheck size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>Child Safety Check-Ins</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>LIVE ROSTER & SAFETY MONITORS</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 4 }}>
                        <Box className="operations-status-box primary">
                          <Typography variant="h5" fontWeight={900} color="primary.main">{safetyStatus.checkedInCount}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>CHECKED-IN</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box className="operations-status-box success">
                          <Typography variant="h5" fontWeight={900} color="success.main">{safetyStatus.activeTokenCount}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>ACTIVE TOKENS</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box className="operations-status-box error">
                          <Typography variant="h5" fontWeight={900} color="error.main">{safetyStatus.allergyAlerts}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>ALERTS</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <List disablePadding>
                      <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText 
                          primary={<Typography variant="body2" fontWeight={800}>Parent-Child Token Status</Typography>} 
                          secondary="Verifying guardian matching tickets" 
                        />
                        <Chip size="small" label="SECURE" color="success" variant="outlined" sx={{ fontWeight: 800 }} />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText 
                          primary={<Typography variant="body2" fontWeight={800}>Emergency Contact Readiness</Typography>} 
                          secondary="Guardian SMS broadcast enabled" 
                        />
                        <Chip size="small" label="READY" color="primary" variant="outlined" sx={{ fontWeight: 800 }} />
                      </ListItem>
                    </List>
                  </Box>
                </CupertinoCard>
              </motion.div>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* VOLUNTEER ROSTER SLOTS */}
            <Grid size={{ xs: 12 }}>
              <motion.div variants={itemVariants}>
                <CupertinoCard>
                  <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.secondary.main, 0.03), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                      <Calendar size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>Volunteer Roster Slots</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>DYNAMIC MINISTRY ASSIGNMENTS</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: volunteerSlots.length === 0 ? 3 : 0 }}>
                    {volunteerSlots.length === 0 ? (
                      <Box sx={{ py: 3, textAlign: 'center', opacity: 0.6 }}>
                        <Calendar size={36} style={{ margin: '0 auto 12px' }} />
                        <Typography variant="body2" fontWeight={700}>No upcoming event slots to roster.</Typography>
                      </Box>
                    ) : (
                      <Grid container>
                        {volunteerSlots.map((slot, idx) => (
                          <Grid size={{ xs: 12, md: 6 }} key={slot.id} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, borderRight: { md: idx % 2 === 0 ? `1px solid ${theme.palette.divider}` : 'none' } }}>
                            <Box className="volunteer-slot-item">
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="subtitle2" fontWeight={800}>{slot.role}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <Clock size={12} /> {format(safeParseDate(slot.serviceDate), 'MMM dd, yyyy')} ({slot.dayOfWeek})
                                </Typography>
                              </Box>
                              <Chip 
                                size="small" 
                                label={slot.assignedName} 
                                color={slot.status === 'Assigned' ? 'success' : 'default'} 
                                sx={{ fontWeight: 800 }} 
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </CupertinoCard>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* TAB PANEL 2: ANALYTICS */}
      {tabValue === 2 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* REVENUE OVERVIEW TREND */}
            <Grid size={{ xs: 12 }}>
              <TrendChartCard 
                title="Revenue Overview"
                data={aggregatedData.financial}
                dataKey="value"
                xKey="date"
              />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* CAMPUS COMPARATIVE LOGISTICS */}
            <Grid size={{ xs: 12 }}>
              <motion.div variants={itemVariants}>
                <CupertinoCard sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        <MapPin size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={800}>Campus Comparative Logistics</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>SITE-SPECIFIC PERFORMANCE COMPARISON</Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ height: 350, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={campusAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, fontWeight: 800 }} />
                        <Legend />
                        <Bar dataKey="Members" name="Members Count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Giving" name="Total Giving (GHC)" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CupertinoCard>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;