import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Container
} from '@mui/material';
import { 
  Shield, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Lock,
  Mail,
  Fingerprint,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const UserManagement = () => {
  const theme = useTheme();
  const { showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(res.data || []);
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

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    showConfirmation({
      title: "Revoke Access",
      message: `Permanently remove access for ${selectedUser.name}?`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/users/${selectedUser.id}`);
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
    const r = String(role).toLowerCase();
    if (r.includes('admin')) return theme.palette.primary.main;
    if (r.includes('moderator')) return theme.palette.info.main;
    return theme.palette.text.secondary;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 6, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 8,
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
                Manage administrative privileges and monitor system activity.
            </Typography>
        </Container>
      </Box>

      {/* --- ACTION BAR --- */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 5 }} justifyContent="space-between" alignItems="center">
        <TextField
            placeholder="Find user by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', md: 400 }, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.8) } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
        />
        <Button variant="contained" startIcon={<UserPlus size={18} />} sx={{ borderRadius: 3, px: 4, fontWeight: 800 }} onClick={() => showNotification("Invite feature coming soon.", "info")}>
            Invite User
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 5 }} />
                </Grid>
            ))
        ) : filteredUsers.length === 0 ? (
            <Grid size={{ xs: 12 }}>
                <Typography align="center" color="text.secondary" sx={{ py: 8 }}>No users matching your search.</Typography>
            </Grid>
        ) : (
            filteredUsers.map((user) => {
                const roleColor = getRoleColor(user.role);
                return (
                    <Grid size={{ xs: 12, md: 4 }} key={user.id}>
                        <Card sx={{ 
                            p: 4, borderRadius: 6, border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[10], borderColor: roleColor }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(roleColor, 0.1), color: roleColor, fontWeight: 800, fontSize: '1.5rem', borderRadius: 3 }}>
                                    {user.name?.charAt(0)}
                                </Avatar>
                                <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}><MoreVertical size={20} /></IconButton>
                            </Box>
                            <Typography variant="h6" fontWeight={800}>{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Mail size={14} /> {user.email}
                            </Typography>
                            
                            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
                            
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">PRIVILEGE</Typography>
                                    <Chip label={user.role} size="small" sx={{ bgcolor: alpha(roleColor, 0.1), color: roleColor, fontWeight: 800, height: 24, fontSize: '0.65rem' }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">STATUS</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: user.status === 'Active' ? theme.palette.success.main : theme.palette.error.main }} />
                                        <Typography variant="caption" fontWeight={800}>{user.status || 'Offline'}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">LAST SEEN</Typography>
                                    <Typography variant="caption" fontWeight={700}>{user.lastActive || 'N/A'}</Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                )
            })
        )}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose} sx={{ fontWeight: 600 }}>Edit Permissions</MenuItem>
          <Divider />
          <MenuItem onClick={handleDelete} sx={{ fontWeight: 700, color: 'error.main' }}>Revoke Access</MenuItem>
      </Menu>

    </Box>
  );
};

export default UserManagement;