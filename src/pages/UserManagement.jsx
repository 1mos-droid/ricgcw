import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Snackbar,
  Alert,
  Skeleton,
  Tooltip
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
  RefreshCw
} from 'lucide-react';

const UserManagement = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- MOCK DATA LOAD ---
  useEffect(() => {
    // Simulate API fetch
    const loadData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800)); // Fake network delay
      setUsers([
        { id: 1, name: "Kumesi Moses", email: "isemuk8@gmail.com", role: "Super Admin", status: "Active", lastActive: "Just now" },
        { id: 2, name: "Pastor Nicholas Dobeng", email: "", role: "Moderator", status: "Active", lastActive: "2 hours ago" },
        { id: 3, name: "David Osei", email: "d.osei@church.org", role: "Viewer", status: "Inactive", lastActive: "5 days ago" },
        { id: 4, name: "System Bot", email: "bot@automation.com", role: "API Key", status: "Active", lastActive: "1 min ago" },
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

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = () => {
    if (selectedUser) {
      if(selectedUser.role === 'Super Admin') {
        showSnackbar("Cannot remove Super Admin.", "error");
        handleMenuClose();
        return;
      }
      setUsers(users.filter(u => u.id !== selectedUser.id));
      showSnackbar(`Access revoked for ${selectedUser.name}`, 'info');
    }
    handleMenuClose();
  };

  const handleInvite = () => {
    showSnackbar("Invitation sent to new user.", "success");
  };

  const handleResetPassword = () => {
    showSnackbar(`Password reset email sent to ${selectedUser?.email}`, "info");
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
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system administrators and permissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<UserPlus size={18} />}
          onClick={handleInvite}
          sx={{ borderRadius: 2, px: 3, width: { xs: '100%', sm: 'auto' } }}
        >
          Grant Access
        </Button>
      </Box>

      {/* --- SEARCH BAR --- */}
      <Card sx={{ mb: 4, p: 2, boxShadow: theme.shadows[2], borderRadius: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search users by name or email..."
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
                  bgcolor: theme.palette.action.hover,
                  borderRadius: 2,
                  '& fieldset': { border: 'none' } 
                } 
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<Shield size={14} />} 
              label={`${users.filter(u => u.role === 'Super Admin').length} Admins`} 
              variant="outlined" 
              sx={{ fontWeight: 600, borderRadius: 2 }}
            />
            <Chip 
              icon={<CheckCircle size={14} />} 
              label={`${users.filter(u => u.status === 'Active').length} Active`} 
              sx={{ 
                borderColor: theme.palette.success.light, 
                color: theme.palette.success.dark, 
                bgcolor: theme.palette.success.light + '20',
                fontWeight: 600,
                borderRadius: 2,
                '& .MuiChip-icon': { color: theme.palette.success.dark } 
              }}
              variant="outlined" 
            />
          </Grid>
        </Grid>
      </Card>

      {/* --- USERS GRID --- */}
      <Grid container spacing={3}>
        {loading ? (
            // SKELETON LOADING
            Array.from(new Array(3)).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Skeleton variant="circular" width={56} height={56} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton variant="text" width="60%" height={30} />
                                <Skeleton variant="text" width="90%" />
                            </Box>
                        </Box>
                        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                    </Card>
                </Grid>
            ))
        ) : filteredUsers.length === 0 ? (
            // EMPTY STATE
            <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <UserX size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <Typography variant="h6">No users found</Typography>
                    <Typography variant="body2">Try adjusting your search criteria.</Typography>
                </Box>
            </Grid>
        ) : (
            filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card 
                sx={{ 
                    p: 3, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s',
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                        borderColor: theme.palette.primary.main
                    }
                }}
                >
                {/* Card Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar 
                    sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: getRoleColor(user.role),
                        color: '#fff',
                        fontSize: 20,
                        fontWeight: 700,
                        boxShadow: theme.shadows[2]
                    }}
                    >
                    {user.name.charAt(0)}
                    </Avatar>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}>
                        <MoreVertical size={18} />
                    </IconButton>
                </Box>

                {/* User Info */}
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {user.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, mt: 0.5, color: theme.palette.text.secondary }}>
                    <Mail size={12} />
                    <Typography variant="caption">{user.email}</Typography>
                </Box>

                <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                {/* Details Row */}
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">ROLE</Typography>
                        <Chip 
                            label={user.role} 
                            size="small" 
                            sx={{ 
                                fontWeight: 700, 
                                height: 24, 
                                bgcolor: getRoleColor(user.role) + '22',
                                color: getRoleColor(user.role),
                                border: 'none'
                            }} 
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">STATUS</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {user.status === 'Active' ? 
                                <CheckCircle size={14} color={theme.palette.success.main} /> : 
                                <XCircle size={14} color={theme.palette.text.disabled} />
                            }
                            <Typography variant="caption" fontWeight={600} sx={{ color: user.status === 'Active' ? theme.palette.success.main : theme.palette.text.disabled }}>
                            {user.status}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">LAST ACTIVE</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: theme.palette.text.secondary }}>
                            <Clock size={12} />
                            <Typography variant="caption">{user.lastActive}</Typography>
                        </Box>
                    </Box>

                </Box>
                </Card>
            </Grid>
            ))
        )}
      </Grid>

      {/* --- ACTIONS MENU --- */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 160, borderRadius: 2, boxShadow: theme.shadows[4] } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ gap: 2, py: 1.5 }}>
          <Edit2 size={16} />
          <Typography variant="body2" fontWeight={500}>Edit Permissions</Typography>
        </MenuItem>
        <MenuItem onClick={handleResetPassword} sx={{ gap: 2, py: 1.5 }}>
          <Lock size={16} />
          <Typography variant="body2" fontWeight={500}>Reset Password</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main, gap: 2, py: 1.5 }}>
          <Trash2 size={16} />
          <Typography variant="body2" fontWeight={600}>Revoke Access</Typography>
        </MenuItem>
      </Menu>

      {/* --- NOTIFICATIONS --- */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default UserManagement;