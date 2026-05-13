import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  TextField, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Button, 
  CircularProgress, 
  Stack, 
  alpha, 
  useTheme,
  Paper,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Search, 
  CheckCircle2, 
  User, 
  MapPin, 
  Calendar as CalendarIcon,
  ArrowRight,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { format } from 'date-fns';
import { safeParseDate } from '../utils/dateUtils';

const SelfCheckIn = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useWorkspace();

  const dateParam = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const branchParam = searchParams.get('branch') || 'All';

  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "members"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter by branch if specified and not 'All'
        const filtered = branchParam !== 'All' 
          ? data.filter(m => String(m.branch).toLowerCase() === String(branchParam).toLowerCase())
          : data;
        
        setMembers(filtered);

        // Auto check-in if logged in
        if (isAuthenticated && user?.email) {
            const matched = filtered.find(m => m.email?.toLowerCase() === user.email.toLowerCase());
            if (matched) {
                handleCheckIn(matched, true);
            }
        }
      } catch (err) {
        console.error("Fetch members error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchParam, isAuthenticated, user]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return [];
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.memberId && m.memberId.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 10);
  }, [members, searchTerm]);

  const handleCheckIn = async (member, isAuto = false) => {
    setSubmitting(true);
    try {
      const recordId = `${dateParam}_${branchParam}`;
      const recordRef = doc(db, "attendance", recordId);
      
      const recordSnap = await getDoc(recordRef);
      
      const isChild = String(member.department || '').toLowerCase().includes('child');
      const pickupTag = isChild ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;

      // Member object as stored in attendance records
      const memberObj = {
        id: member.id,
        name: member.name,
        branch: member.branch || '',
        memberId: member.memberId || '',
        pickupTag: pickupTag || null
      };

      if (!recordSnap.exists()) {
        // Create new record for the day
        const [year, month, day] = dateParam.split('-').map(Number);
        const recordDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        
        await setDoc(recordRef, {
          date: recordDate.toISOString(),
          attendees: [memberObj],
          branch: branchParam,
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing record using arrayUnion to avoid overwrites
        await updateDoc(recordRef, {
          attendees: arrayUnion(memberObj)
        });
      }

      setCheckedIn(true);
      if (!isAuto) {
        showNotification(`Check-in successful for ${member.name}!`, "success");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      showNotification("Failed to check in. Please try again.", "error");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.palette.background.default }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography variant="body2" fontWeight={700} color="text.secondary">Preparing the Sanctuary...</Typography>
        </Stack>
      </Box>
    );
  }

  if (checkedIn) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Box sx={{ 
            p: 6, 
            borderRadius: 8, 
            bgcolor: alpha(theme.palette.success.main, 0.05),
            border: `2px solid ${alpha(theme.palette.success.main, 0.1)}`,
            mb: 4
          }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: theme.palette.success.main, mx: 'auto', mb: 3 }}>
                <CheckCircle2 size={40} color="#fff" />
            </Avatar>
            <Typography variant="h4" fontWeight={900} gutterBottom>You're Checked In!</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: typeof checkedIn === 'string' ? 3 : 0 }}>
                Welcome to the service. We are glad to have you with us today!
            </Typography>
            {typeof checkedIn === 'string' && (
                <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 4, display: 'inline-block', border: `2px dashed ${theme.palette.success.main}` }}>
                    <Typography variant="overline" color="success.main" fontWeight={900} sx={{ letterSpacing: 2 }}>CHILD PICKUP TAG</Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: 4, fontFamily: 'monospace' }}>{checkedIn}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontWeight: 700 }}>Present this tag to pick up your child after service.</Typography>
                </Box>
            )}
          </Box>
          <Button 
            variant="outlined" 
            onClick={() => window.close()} // If opened from a browser, try to close
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            Finish
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>MEMBER SELF CHECK-IN</Typography>
        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.02em', mt: 1, mb: 2 }}>Welcome Home</Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
            <Chip 
                icon={<CalendarIcon size={14} />} 
                label={format(safeParseDate(dateParam), 'MMMM dd, yyyy')} 
                variant="outlined" 
                sx={{ fontWeight: 700, borderRadius: 2 }}
            />
            <Chip 
                icon={<MapPin size={14} />} 
                label={branchParam} 
                variant="outlined" 
                sx={{ fontWeight: 700, borderRadius: 2 }}
            />
        </Stack>
      </Box>

      <Card sx={{ p: 4, borderRadius: 6, boxShadow: theme.shadows[10], border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Find your name</Typography>
        <TextField 
            fullWidth
            placeholder="Search by name or member ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                startAdornment: <InputAdornment position="start"><Search size={20} color={theme.palette.primary.main} /></InputAdornment>
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
        />

        <Box sx={{ mt: 4 }}>
            <AnimatePresence>
                {searchTerm && filteredMembers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center">No matches found. Please try another name.</Typography>
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredMembers.map((m, idx) => (
                            <motion.div 
                                key={m.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <ListItemButton 
                                    onClick={() => {
                                        setSelectedMember(m);
                                        setConfirmOpen(true);
                                    }}
                                    sx={{ 
                                        borderRadius: 3, 
                                        mb: 1, 
                                        py: 2,
                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}>
                                            {m.name.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={<Typography variant="subtitle1" fontWeight={800}>{m.name}</Typography>}
                                        secondary={m.memberId || 'Active Member'}
                                    />
                                    <ArrowRight size={20} color={theme.palette.primary.main} />
                                </ListItemButton>
                            </motion.div>
                        ))}
                    </List>
                )}
            </AnimatePresence>
        </Box>
      </Card>

      <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.6 }}>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Heart size={16} fill={theme.palette.error.main} color={theme.palette.error.main} />
            <Typography variant="caption" fontWeight={700}>Rhema Inner Court Gospel Church</Typography>
        </Stack>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Check-in</DialogTitle>
        <DialogContent>
            <Typography>Are you checking in as <strong>{selectedMember?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setConfirmOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button 
                variant="contained" 
                onClick={() => handleCheckIn(selectedMember)} 
                disabled={submitting}
                sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}
            >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SelfCheckIn;
