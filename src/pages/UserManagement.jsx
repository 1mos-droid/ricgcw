import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  TextField, 
  InputAdornment, 
  Avatar, 
  Chip, 
  IconButton, 
  useTheme, 
  Divider,
  Menu,
  MenuItem,
  Skeleton,
  alpha,
  Stack,
  Container,
  Tooltip
} from '@mui/material';
import { 
  Shield, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail,
  Fingerprint,
  Calendar,
  CheckCircle2,
  XCircle,
  Tag,
  RefreshCw
} from 'lucide-react';
import NewUserDialog from '../components/NewUserDialog';

import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const UserManagement = () => {
  const theme = useTheme();
  const { showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
      showNotification("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const onUserAdded = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
    showNotification("System access granted successfully!", "success");
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    showConfirmation({
      title: "Revoke Access",
      message: `Permanently remove access for ${selectedUser.name}? This will only remove the user record from the system registry, not their Appwrite account.`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "users", selectedUser.id));
          showNotification("Access revoked.");
          fetchUsers();
        } catch (err) {
          showNotification("Failed to revoke access.", "error");
        }
      }
    });
    handleMenuClose();
  };

  const getRoleColor = (role) => {
    const r = String(role || 'guest').toLowerCase();
    if (r.includes('admin')) return theme.palette.primary.main;
    if (r.includes('moderator')) return theme.palette.info.main;
    if (r.includes('developer')) return theme.palette.secondary.main;
    return theme.palette.text.secondary;
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Never') return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.appwriteId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 6, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 2,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`
           : alpha(theme.palette.primary.main, 0.05),
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Chip icon={<Shield size={14} />} label="Security & Governance" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                System Access
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Manage administrative privileges and monitor Appwrite authentication status.
            </Typography>
        </Container>
      </Box>

      {/* --- ACTION BAR --- */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 5 }} justifyContent="space-between" alignItems="center">
        <TextField
            placeholder="Search by name, email or Appwrite ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', md: 400 }, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: alpha(theme.palette.background.paper, 0.8) } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
        />
        <Button variant="contained" startIcon={<UserPlus size={18} />} sx={{ borderRadius: 1, px: 4, fontWeight: 800 }} onClick={() => setIsNewUserDialogOpen(true)}>
            Grant Access
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                    <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
                </Grid>
            ))
        ) : filteredUsers.length === 0 ? (
            <Grid size={{ xs: 12 }}>
                <Typography align="center" color="text.secondary" sx={{ py: 8 }}>No users matching your search.</Typography>
            </Grid>
        ) : (
            filteredUsers.map((user) => {
                const roleColor = getRoleColor(user.role);
                const isLinked = !!user.appwriteId;
                const isVerified = user.verified === true;
                const hasActivity = user.lastActive && user.lastActive !== 'Never';
                
                return (
                    <Grid size={{ xs: 12, md: 4 }} key={user.id}>
                        <Card sx={{ 
                            p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            bgcolor: isLinked ? 'background.paper' : alpha(theme.palette.primary.main, 0.02),
                            '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[10], borderColor: roleColor }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar sx={{ 
                                        width: 64, height: 64, 
                                        bgcolor: isLinked ? alpha(roleColor, 0.1) : alpha(theme.palette.text.disabled, 0.1), 
                                        color: isLinked ? roleColor : theme.palette.text.disabled, 
                                        fontWeight: 800, fontSize: '1.5rem', borderRadius: 1.5 
                                    }}>
                                        {(user.name || '?').charAt(0)}
                                    </Avatar>
                                    {isLinked ? (
                                        <Box sx={{ 
                                            position: 'absolute', bottom: -4, right: -4, 
                                            bgcolor: theme.palette.background.paper, borderRadius: '50%', p: 0.2,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: theme.shadows[2]
                                        }}>
                                            {isVerified ? (
                                                <Tooltip title="Email Verified in Appwrite"><CheckCircle2 size={18} color={theme.palette.success.main} fill={alpha(theme.palette.success.main, 0.1)} /></Tooltip>
                                            ) : (
                                                <Tooltip title="Email Not Verified"><XCircle size={18} color={theme.palette.error.main} fill={alpha(theme.palette.error.main, 0.1)} /></Tooltip>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ 
                                            position: 'absolute', bottom: -4, right: -4, 
                                            bgcolor: theme.palette.background.paper, borderRadius: '50%', p: 0.2,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: theme.shadows[2]
                                        }}>
                                            <Tooltip title="Awaiting first-time login to sync Appwrite data">
                                                <RefreshCw size={18} color={theme.palette.warning.main} />
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                                <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}><MoreVertical size={20} /></IconButton>
                            </Box>

                            <Typography variant="h6" fontWeight={800} noWrap>{user.name}</Typography>
                            
                            <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8rem' }}>
                                    <Mail size={14} /> {user.email}
                                </Typography>
                                <Tooltip title={isLinked ? "Appwrite Unique ID" : "This user exists in the registry but needs to log in once to link their Appwrite ID."}>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8rem', opacity: isLinked ? 0.7 : 0.4, cursor: 'help' }}>
                                        <Fingerprint size={14} /> {user.appwriteId || (hasActivity ? 'Sync Pending' : 'Account Connection Needed')}
                                    </Typography>
                                </Tooltip>
                            </Stack>
                            
                            <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />
                            
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">PRIVILEGE</Typography>
                                    <Chip label={user.role} size="small" sx={{ bgcolor: isLinked ? alpha(roleColor, 0.1) : alpha(theme.palette.text.disabled, 0.05), color: isLinked ? roleColor : theme.palette.text.disabled, fontWeight: 800, height: 22, fontSize: '0.65rem', textTransform: 'uppercase' }} />
                                </Box>

                                {isLinked && user.labels && user.labels.length > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="caption" fontWeight={800} color="text.secondary">APPWRITE LABELS</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end', maxWidth: '70%' }}>
                                            {user.labels.map(label => (
                                                <Chip key={label} label={label} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">STATUS</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ 
                                            width: 8, height: 8, borderRadius: '50%', 
                                            bgcolor: !isLinked ? theme.palette.warning.main : (user.status === 'Active' ? theme.palette.success.main : theme.palette.error.main) 
                                        }} />
                                        <Typography variant="caption" fontWeight={800}>{!isLinked ? (hasActivity ? 'Active (Unlinked)' : 'Invited') : (user.status || 'Offline')}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">REGISTERED</Typography>
                                    <Typography variant="caption" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Calendar size={12} /> {isLinked ? formatDate(user.registration) : (hasActivity ? 'Legacy Account' : 'Awaiting Signup')}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">LAST ACCESS</Typography>
                                    <Typography variant="caption" fontWeight={700} color={isLinked ? 'primary.main' : 'text.disabled'}>
                                        {isLinked ? (user.accessedAt ? formatDate(user.accessedAt) : 'Recent') : (hasActivity ? formatDate(user.lastActive) : 'Never')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                )
            })
        )}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose} sx={{ fontWeight: 600, gap: 1.5 }}>
            <Shield size={16} /> Edit Permissions
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ fontWeight: 600, gap: 1.5 }}>
            <Tag size={16} /> Manage Labels
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDelete} sx={{ fontWeight: 700, color: 'error.main', gap: 1.5 }}>
            <XCircle size={16} /> Revoke Access
          </MenuItem>
      </Menu>

      <NewUserDialog 
        open={isNewUserDialogOpen} 
        onClose={() => setIsNewUserDialogOpen(false)} 
        onUserAdded={onUserAdded} 
      />

    </Box>
  );
};

export default UserManagement;