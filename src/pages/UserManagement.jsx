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
  Tooltip,
  alpha,
  Stack
} from '@mui/material';
import { 
  Shield, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  UserX,
  Mail,
  Fingerprint
} from 'lucide-react';

const UserManagement = () => {
  const theme = useTheme();
  const { showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const openMenu = Boolean(anchorEl);

  // --- MOCK DATA LOAD ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800)); 
      setUsers([
        { id: 1, name: "Kumesi Moses", email: "isemuk8@gmail.com", role: "Super Admin", status: "Active", lastActive: "Just now" },
        { id: 2, name: "Pastor Nicholas Dobeng", email: "pastor.nicholas@ricgcw.org", role: "Moderator", status: "Active", lastActive: "2 hours ago" },
        { id: 3, name: "System Bot", email: "bot@automation.com", role: "API Key", status: "Active", lastActive: "1 min ago" },
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- HANDLERS ---
  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (selectedUser) {
      if(selectedUser.role === 'Super Admin') {
        showNotification("Cannot remove Super Admin.", "error");
        handleMenuClose();
        return;
      }
      
      showConfirmation({
        title: "Revoke Access",
        message: `Are you sure you want to revoke system access for ${selectedUser.name}?`,
        onConfirm: () => {
          setUsers(users.filter(u => u.id !== selectedUser.id));
          showNotification(`Access revoked for ${selectedUser.name}`, 'info');
        }
      });
    }
    handleMenuClose();
  };

  const handleInvite = () => {
    showNotification("Invitation sent to new user.", "success");
  };

  const handleResetPassword = () => {
    showNotification(`Password reset email sent to ${selectedUser?.email}`, "info");
    handleMenuClose();
  };

  // --- RENDER HELPERS ---
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch(role) {
      case 'Super Admin': return theme.palette.primary.main;
      case 'Moderator': return theme.palette.secondary.main;
      case 'API Key': return theme.palette.warning.main;
      default: return theme.palette.text.secondary;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        gap: 2
      }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
            PERMISSIONS
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system administrators and security permissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<UserPlus size={18} />}
          onClick={handleInvite}
          sx={{ borderRadius: 3, px: 3, py: 1.2, fontWeight: 700, boxShadow: theme.shadows[4] }}
        >
          Grant Access
        </Button>
      </Box>

      {/* --- SEARCH & STATS --- */}
      <Card sx={{ mb: 4, p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 3,
                  '& fieldset': { border: 'none' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                } 
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Chip 
                    icon={<Shield size={14} />} 
                    label={`${users.filter(u => u.role === 'Super Admin').length} Admins`} 
                    sx={{ fontWeight: 700, borderRadius: 2, bgcolor: theme.palette.background.paper }}
                />
                <Chip 
                    icon={<CheckCircle size={14} />} 
                    label={`${users.filter(u => u.status === 'Active').length} Active`} 
                    sx={{ 
                        fontWeight: 700, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        '& .MuiChip-icon': { color: 'inherit' }
                    }}
                />
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* --- USERS GRID --- */}
      <Grid container spacing={3}>
        {loading ? (
            Array.from(new Array(3)).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Card sx={{ p: 3, height: '100%', borderRadius: 4 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Skeleton variant="circular" width={56} height={56} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton variant="text" width="60%" height={30} />
                                <Skeleton variant="text" width="90%" />
                            </Box>
                        </Box>
                        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
                    </Card>
                </Grid>
            ))
        ) : filteredUsers.length === 0 ? (
            <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                    <Box sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.1), width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                        <UserX size={40} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>No users found</Typography>
                    <Typography variant="body2">Try adjusting your search filters.</Typography>
                </Box>
            </Grid>
        ) : (
            filteredUsers.map((user) => {
            const roleColor = getRoleColor(user.role);
            return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
                <Card 
                sx={{ 
                    p: 3, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { 
                        transform: 'translateY(-6px)',
                        boxShadow: `0 20px 40px -12px ${alpha(roleColor, 0.2)}`,
                        borderColor: alpha(roleColor, 0.5)
                    }
                }}
                >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Avatar 
                    sx={{ 
                        width: 60, 
                        height: 60, 
                        bgcolor: alpha(roleColor, 0.1),
                        color: roleColor,
                        fontSize: 22,
                        fontWeight: 800,
                        borderRadius: 3,
                        border: `2px solid ${alpha(roleColor, 0.2)}`
                    }}
                    >
                    {user.name.charAt(0)}
                    </Avatar>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, user)} sx={{ bgcolor: theme.palette.action.hover }}>
                        <MoreVertical size={18} />
                    </IconButton>
                </Box>

                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                    {user.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: theme.palette.text.secondary }}>
                    <Mail size={14} color={theme.palette.primary.main} />
                    <Typography variant="caption" fontWeight={500}>{user.email || 'No email provided'}</Typography>
                </Box>

                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                <Stack spacing={2} sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Fingerprint size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" fontWeight={700} color="text.secondary">PRIVILEGE</Typography>
                        </Stack>
                        <Chip 
                            label={user.role} 
                            size="small" 
                            sx={{ 
                                fontWeight: 800, 
                                height: 24, 
                                bgcolor: alpha(roleColor, 0.1),
                                color: roleColor,
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase'
                            }} 
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">STATUS</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: user.status === 'Active' ? theme.palette.success.main : theme.palette.text.disabled }} />
                            <Typography variant="caption" fontWeight={700} sx={{ color: user.status === 'Active' ? theme.palette.success.main : theme.palette.text.disabled }}>
                                {user.status.toUpperCase()}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">LAST SEEN</Typography>
                        <Typography variant="caption" fontWeight={600} color="text.primary">{user.lastActive}</Typography>
                    </Box>
                </Stack>
                </Card>
            </Grid>
            );})
        )}
      </Grid>

      {/* --- ACTIONS MENU --- */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 200, mt: 1, borderRadius: 3, boxShadow: theme.shadows[8], border: `1px solid ${theme.palette.divider}` } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ gap: 2, py: 1.5 }}>
          <Edit2 size={18} color={theme.palette.primary.main} />
          <Typography variant="body2" fontWeight={600}>Edit Permissions</Typography>
        </MenuItem>
        <MenuItem onClick={handleResetPassword} sx={{ gap: 2, py: 1.5 }}>
          <Lock size={18} color={theme.palette.warning.main} />
          <Typography variant="body2" fontWeight={600}>Reset Password</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main, gap: 2, py: 1.5 }}>
          <Trash2 size={18} />
          <Typography variant="body2" fontWeight={700}>Revoke Access</Typography>
        </MenuItem>
      </Menu>

    </Box>
  );
};

export default UserManagement;