import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  IconButton,
  Stack,
  Divider,
  alpha,
  Paper,
  Tooltip as MuiTooltip,
  Container,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  Badge
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
  MoreHorizontal,
  Send,
  Loader2,
  HeartHandshake,
  History,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Zap,
  Star,
  Milestone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis,
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { safeParseDate, getISOStringDate } from '../utils/dateUtils';
import { syncMemberDepartments } from '../utils/syncDepartments';
import { autoAssignVolunteers } from '../utils/autoRoster';
import { validateBatchDeposit } from '../utils/dualCustody';
import emailjs from '@emailjs/browser';
import { sendSMS } from '../utils/communicationApi';
import DigitalGivingDialog from '../components/DigitalGivingDialog';

// New Components
import MetricCard from '../components/organisms/MetricCard';
import TrendChartCard from '../components/organisms/TrendChartCard';
import UpcomingEventsWidget from '../components/organisms/UpcomingEventsWidget';
import RecentActivityFeed from '../components/organisms/RecentActivityFeed';

// --- SUB-COMPONENTS ---

const MemberDashboardView = ({ user, transactions, events }) => {
  const theme = useTheme();
  const { showNotification } = useWorkspace();
  const [prayerRequest, setPrayerRequest] = useState('');
  const [sending, setSending] = useState(false);
  const [memberProfile, setMemberProfile] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [givingOpen, setGivingOpen] = useState(false);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        const membersSnap = await getDocs(collection(db, "members"));
        const membersData = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const matched = membersData.find(m => m.email?.toLowerCase() === user?.email?.toLowerCase());
        setMemberProfile(matched);
      } catch (err) {
        console.error("Error matching member profile:", err);
      } finally {
        setFetchingProfile(false);
      }
    };
    if (user?.email) fetchMemberProfile();
  }, [user]);

  const personalTransactions = useMemo(() => {
    if (!memberProfile) return [];
    return transactions.filter(t => String(t.memberId) === String(memberProfile.id));
  }, [memberProfile, transactions]);

  const totalPersonalGiving = useMemo(() => {
    return personalTransactions
      .filter(t => t.type === 'contribution')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [personalTransactions]);

  const handlePrayerRequest = async () => {
    if (!prayerRequest.trim()) {
        showNotification("Please enter your prayer request.", "warning");
        return;
    }
    setSending(true);
    
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      showNotification("Email service not configured. Please contact IT.", "error");
      setSending(false);
      return;
    }

    const templateParams = {
      to_email: 'prayer@ricgcw.org', 
      to_name: 'Pastoral Team',
      from_name: user?.name || user?.email,
      branch: user?.branch || 'Main',
      message: prayerRequest,
      subject: `🙏 Prayer Request: ${user?.name || user?.email}`
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      // Also send an SMS alert to the head pastor/admin if configured
      const adminPhone = import.meta.env.VITE_ADMIN_PHONE;
      if (adminPhone) {
        await sendSMS(adminPhone, `🙏 New Prayer Request from ${user?.name || user?.email} (${user?.branch || 'Main'}). Check the portal for details.`);
      }

      showNotification("Your prayer request has been sent to the pastoral team.", "success");
      setPrayerRequest('');
    } catch (error) {
      console.error("Prayer Request Error:", error);
      showNotification("Failed to send request. Please try again later.", "error");
    } finally {
      setSending(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* 1. MEMBER WELCOME BANNER */}
      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            mb: 5, 
            background: theme.palette.mode === 'light' 
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
            color: '#fff',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 24px 48px -12px ${alpha(theme.palette.primary.main, 0.4)}`,
            border: `1px solid ${alpha('#fff', 0.1)}`
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8, fontWeight: 800 }}>MEMBER PORTAL</Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: '"Playfair Display", serif' }}>
              Welcome Back, {user?.name?.split(' ')[0] || 'Member'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 500 }}>
                We are glad to have you in the sanctuary today. Your presence and support strengthen the body of Christ.
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: '50%', background: alpha('#fff', 0.05), zIndex: 1 }} />
        </Paper>
      </motion.div>

      <Grid container spacing={4}>
        {/* LEFT: GIVING HISTORY & PRAYER REQUEST */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            
            {/* GIVING OVERVIEW */}
            <motion.div variants={itemVariants} initial="hidden" animate="show">
                <Card sx={{ borderRadius: 4, p: 4, border: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={900}>My Giving History</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>TRANSPARENT FINANCIAL RECORDS</Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<Plus size={18} />}
                            onClick={() => setGivingOpen(true)}
                            sx={{ borderRadius: 3, fontWeight: 800, px: 3 }}
                        >
                            Give Online
                        </Button>
                    </Stack>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                                <Typography variant="caption" fontWeight={800} color="primary" sx={{ display: 'block', mb: 1 }}>TOTAL CONTRIBUTED</Typography>
                                <Typography variant="h4" fontWeight={900}>GHC {totalPersonalGiving.toLocaleString()}</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.03), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                                <Typography variant="caption" fontWeight={800} color="success.main" sx={{ display: 'block', mb: 1 }}>RECENT CONTRIBUTIONS</Typography>
                                <Typography variant="h4" fontWeight={900}>{personalTransactions.length}</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History size={16} /> RECENT TRANSACTIONS
                    </Typography>
                    
                    {fetchingProfile ? (
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                    ) : !memberProfile ? (
                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.02), borderStyle: 'dashed' }}>
                            <Typography variant="body2" fontWeight={700} color="warning.main">
                                Account Linking Required
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Please contact the church administration to link your digital profile ({user?.email}) to your giving records.
                            </Typography>
                        </Paper>
                    ) : personalTransactions.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>No giving records found yet.</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {personalTransactions.slice(0, 5).map((tx, idx) => (
                                <React.Fragment key={tx.id || idx}>
                                    <ListItem sx={{ py: 2, px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main, borderRadius: 2 }}>
                                                <HeartHandshake size={20} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={<Typography variant="body2" fontWeight={800}>{tx.description || 'Contribution'}</Typography>}
                                            secondary={format(safeParseDate(tx.date), 'MMMM dd, yyyy')}
                                        />
                                        <Typography variant="body1" fontWeight={900} color="primary">
                                            GHC {Number(tx.amount).toLocaleString()}
                                        </Typography>
                                    </ListItem>
                                    {idx < personalTransactions.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Card>
            </motion.div>

            {/* PRAYER REQUEST FORM */}
            <motion.div variants={itemVariants} initial="hidden" animate="show">
                <Card sx={{ borderRadius: 4, p: 4, bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.paper, 0.5) }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                            <Send size={20} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={900}>Prayer Request</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>DIRECT TO THE PASTORAL TEAM</Typography>
                        </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        Your requests are held in strict confidence. Submit your burdens and let the intercessory team stand with you in faith.
                    </Typography>
                    <TextField 
                        fullWidth 
                        multiline 
                        rows={4} 
                        placeholder="Describe your prayer point or burden..." 
                        value={prayerRequest}
                        onChange={(e) => setPrayerRequest(e.target.value)}
                        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                    />
                    <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        onClick={handlePrayerRequest}
                        disabled={sending || !prayerRequest.trim()}
                        startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send size={18} />}
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                    >
                        {sending ? 'Sending...' : 'Submit Prayer Request'}
                    </Button>
                </Card>
            </motion.div>
          </Stack>
        </Grid>

        {/* RIGHT: UPCOMING EVENTS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            <motion.div variants={itemVariants} initial="hidden" animate="show">
                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <Typography variant="h6" fontWeight={800}>Upcoming Events</Typography>
                    </Box>
                    <Box sx={{ p: 0 }}>
                        {events.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                <Typography variant="body2" fontWeight={600}>No scheduled events</Typography>
                            </Box>
                        ) : (
                            events.slice(0, 5).map((event, idx) => (
                                <Box 
                                    key={idx}
                                    sx={{ 
                                        p: 2.5, 
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                        display: 'flex', 
                                        gap: 2,
                                        alignItems: 'center',
                                        '&:last-child': { borderBottom: 'none' }
                                    }}
                                >
                                    <Box sx={{ 
                                        width: 50, height: 50, borderRadius: 2, 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
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
                    <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Button component={Link} to="/events" size="small" sx={{ fontWeight: 800 }}>Explore Calendar</Button>
                    </Box>
                </Card>
            </motion.div>
          </Stack>
        </Grid>
      </Grid>

      <DigitalGivingDialog 
        open={givingOpen} 
        onClose={() => setGivingOpen(false)} 
        user={user} 
        memberProfile={memberProfile}
      />
    </Box>
  );
};

// --- MAIN PORTAL COMPONENT ---

const Dashboard = () => {
  const theme = useTheme();
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

  const handleTabChange = (event, newValue) => {
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

  // --- MULTI-CAMPUS COMPARATIVE LOGISTICS ---
  const campusAnalytics = useMemo(() => {
    const branches = ['Mallam', 'Kokrobitey', 'Langma', 'Diaspora'];
    return branches.map(branchName => {
      const membersCount = data.members.filter(m => m.branch === branchName).length;
      const contributionsTotal = data.transactions
        .filter(t => t.branch === branchName && t.type === 'contribution')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      return {
        name: branchName,
        Members: membersCount,
        Giving: contributionsTotal
      };
    });
  }, [data.members, data.transactions]);

  // --- SAFETY CHECK-IN ROSTERS ---
  const safetyStatus = useMemo(() => {
    const checkedInMemberIds = new Set();
    filteredData.attendance.forEach(record => {
      if (Array.isArray(record.attendees)) {
        record.attendees.forEach(att => {
          if (att && att.id) checkedInMemberIds.add(String(att.id));
        });
      }
    });

    const checkedInChildren = data.members.filter(m => {
      if (!checkedInMemberIds.has(String(m.id))) return false;
      if (!m.dob) return false;
      const age = new Date().getFullYear() - safeParseDate(m.dob).getFullYear();
      return age < 13;
    });

    const checkedInCount = checkedInChildren.length;

    return {
      checkedInCount,
      activeTokenCount: checkedInCount,
      allergyAlerts: checkedInChildren.filter(m => m.allergies || m.medicalNotes).length
    };
  }, [data.members, filteredData.attendance]);

  // --- VOLUNTEER ASSIGNMENT MATRICES ---
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

    const potentialVolunteers = data.members.map(m => ({
      id: m.id || Math.random().toString(),
      name: m.name || 'Anonymous',
      roles: m.volunteerRoles || ['Usher', 'AV Sound Board', 'Children Teacher', 'Musician'],
      availability: ['Sunday', 'Saturday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      lastServed: m.lastServed || '2026-05-24',
      gapWeeks: 1
    }));

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

  // --- DUAL CUSTODY AUDIT CUES ---
  const pendingAudits = useMemo(() => {
    const mallamTx = data.transactions.filter(t => t.type === 'contribution' && t.branch === 'Mallam');
    if (mallamTx.length === 0) {
      return {
        batchId: null,
        total: 0,
        signatures: [],
        isValid: true,
        reason: 'No pending batches requiring audit.'
      };
    }

    const batchTotal = mallamTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
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
    
    const attendancePieData = [
      { name: 'Present', value: filteredData.attendance.reduce((sum, r) => sum + (r.attendees?.length || 0), 0), color: theme.palette.primary.main },
      { name: 'Absent', value: Math.max(0, (filteredData.members.length * filteredData.attendance.length) - filteredData.attendance.reduce((sum, r) => sum + (r.attendees?.length || 0), 0)), color: alpha(theme.palette.primary.main, 0.2) }
    ];

    const categoryTotals = filteredData.transactions.reduce((acc, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});
    
    const financialPieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

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

  if (isMember) {
      return (
          <MemberDashboardView 
            user={user} 
            transactions={data.transactions} 
            events={data.events} 
            loading={loading} 
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
            
            <Typography variant="h3" component="h2" sx={{
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

      {/* 2. TABBED CONTENT CHUNKING (HCI PRINCIPLE) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          centered
          aria-label="admin portal tabs"
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
              bgcolor: theme.palette.primary.main
            },
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              px: { xs: 2, sm: 4 },
              py: 2,
              color: theme.palette.text.secondary,
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 900
              }
            }
          }}
        >
          <Tab label="Overview" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab 
            label={
              <Badge 
                color="error" 
                variant="dot" 
                invisible={pendingAudits.isValid && safetyStatus.allergyAlerts === 0}
                sx={{ '& .MuiBadge-badge': { right: -8, top: -2 } }}
              >
                Operations
              </Badge>
            } 
            id="admin-tab-1" 
            aria-controls="admin-tabpanel-1" 
          />
          <Tab label="Analytics" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
        </Tabs>
      </Box>

      {/* TAB PANEL 0: OVERVIEW */}
      {tabValue === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* PENDING DUAL CUSTODY AUDITS */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
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
                </Card>
              </motion.div>
            </Grid>

            {/* CHILD SAFETY CHECK-INS */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
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
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2 }}>
                          <Typography variant="h5" fontWeight={900} color="primary.main">{safetyStatus.checkedInCount}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>CHECKED-IN</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.03), borderRadius: 2 }}>
                          <Typography variant="h5" fontWeight={900} color="success.main">{safetyStatus.activeTokenCount}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>ACTIVE TOKENS</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.error.main, 0.03), borderRadius: 2 }}>
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
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* VOLUNTEER ROSTER SLOTS */}
            <Grid size={{ xs: 12 }}>
              <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
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
                            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyBehavior: 'space-between' }}>
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
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* TAB PANEL 2: ANALYTICS */}
      {tabValue === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
                <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, p: 3 }}>
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
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;