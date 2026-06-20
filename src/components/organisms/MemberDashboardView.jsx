import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Box, 
  Grid, 
  Typography, 
  Avatar, 
  useTheme, 
  Skeleton, 
  Stack, 
  Divider, 
  alpha, 
  Paper, 
  CircularProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List
} from '@mui/material';
import { Plus, HeartHandshake, Send, History, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { safeParseDate } from '../../utils/dateUtils';
import emailjs from '@emailjs/browser';
import { sendSMS } from '../../utils/communicationApi';
import DigitalGivingDialog from '../DigitalGivingDialog';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CupertinoButton, CupertinoCard, CupertinoInput } from '../Cupertino';

export default function MemberDashboardView({ user, transactions, events }) {
  const theme = useTheme();
  const navigate = useNavigate();
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
      
      const adminPhone = import.meta.env.VITE_ADMIN_PHONE;
      if (adminPhone) {
        await sendSMS(adminPhone, `🙏 New Prayer Request from ${user?.name || user?.email} (${user?.branch || 'Main'}). Check the portal.`);
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
    <Box className="member-dashboard" sx={{ pb: 8 }}>
      {/* 1. MEMBER WELCOME BANNER */}
      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <Paper elevation={0} className="member-welcome-banner">
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="overline" className="banner-overline" sx={{ letterSpacing: 2, opacity: 0.8, fontWeight: 800 }}>
              MEMBER PORTAL
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
              Welcome Back, {user?.name?.split(' ')[0] || 'Member'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 500, lineHeight: 1.6 }}>
              We are glad to have you in the sanctuary today. Your presence and support strengthen the body of Christ.
            </Typography>
          </Box>
          <Box className="banner-glow-decor" />
        </Paper>
      </motion.div>

      <Grid container spacing={4}>
        {/* LEFT: GIVING HISTORY & PRAYER REQUEST */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            
            {/* GIVING OVERVIEW */}
            <motion.div variants={itemVariants} initial="hidden" animate="show">
              <CupertinoCard sx={{ p: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={900}>My Giving History</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TRANSPARENT FINANCIAL RECORDS</Typography>
                  </Box>
                  <CupertinoButton 
                    onClick={() => setGivingOpen(true)}
                    sx={{ py: 1, px: 3, borderRadius: 2 }}
                  >
                    <Plus size={18} /> Give Online
                  </CupertinoButton>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box className="member-status-card primary">
                      <Typography variant="caption" fontWeight={800} color="primary" sx={{ display: 'block', mb: 1 }}>TOTAL CONTRIBUTED</Typography>
                      <Typography variant="h4" fontWeight={900}>GHC {totalPersonalGiving.toLocaleString()}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box className="member-status-card success">
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
                        {idx < personalTransactions.length - 1 && <Divider component="li" sx={{ borderColor: 'var(--border-color-darker)' }} />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CupertinoCard>
            </motion.div>

            {/* PRAYER REQUEST FORM */}
            <motion.div variants={itemVariants} initial="hidden" animate="show">
              <CupertinoCard sx={{ p: 4 }}>
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
                
                <CupertinoInput 
                  placeholder="Describe your prayer point or burden..." 
                  value={prayerRequest}
                  onChange={(e) => setPrayerRequest(e.target.value)}
                  multiline={true}
                  rows={4}
                  sx={{ mb: 3 }}
                />

                <CupertinoButton 
                  onClick={handlePrayerRequest}
                  disabled={sending || !prayerRequest.trim()}
                  sx={{ width: '100%', py: 1.5 }}
                >
                  {sending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <>
                      <Send size={18} /> Submit Prayer Request
                    </>
                  )}
                </CupertinoButton>
              </CupertinoCard>
            </motion.div>
          </Stack>
        </Grid>

        {/* RIGHT: UPCOMING EVENTS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            <motion.div variants={itemVariants} initial="hidden" animate="show">
              <CupertinoCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid var(--border-color-darker)`, bgcolor: 'rgba(var(--system-blue-rgb), 0.02)' }}>
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
                          borderBottom: `1px solid var(--border-color-darker)`,
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
                <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid var(--border-color-darker)` }}>
                  <CupertinoButton 
                    onClick={() => navigate('/events')}
                    variant="plain"
                    sx={{ width: '100%', py: 1 }}
                  >
                    Explore Calendar
                  </CupertinoButton>
                </Box>
              </CupertinoCard>
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
}
