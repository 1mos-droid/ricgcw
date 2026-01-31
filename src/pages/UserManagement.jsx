import React, { useState } from 'react';
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
  MenuItem
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
  Lock
} from 'lucide-react';

const UserManagement = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Mock Data
  const [users, setUsers] = useState([
    { id: 1, name: "Kumesi Moses", email: "isemuk8@gmail.com", role: "Super Admin", status: "Active", lastActive: "Just now" },
    { id: 2, name: "Sarah Jenkins", email: "sarah.j@flamecore.com", role: "Moderator", status: "Active", lastActive: "2 hours ago" },
    { id: 3, name: "David Osei", email: "d.osei@church.org", role: "Viewer", status: "Inactive", lastActive: "5 days ago" },
    { id: 4, name: "System Bot", email: "bot@automation.com", role: "API Key", status: "Active", lastActive: "1 min ago" },
  ]);

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
      setUsers(users.filter(u => u.id !== selectedUser.id));
    }
    handleMenuClose();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Safe Colors (Prevents white screen if theme is missing colors)
  const colors = {
    primary: theme.palette.primary.main,
    success: '#10B981', // Emerald Green
    error: '#EF4444',   // Red
    textSecondary: theme.palette.text.secondary || '#888',
    cardBg: theme.palette.background.paper,
    hoverBg: theme.palette.mode === 'light' ? '#F3F4F6' : '#1F2937'
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system administrators and permissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<UserPlus size={18} />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Grant Access
        </Button>
      </Box>

      {/* --- SEARCH BAR --- */}
      <Card sx={{ mb: 4, p: 2 }}>
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
                    <Search size={20} color={colors.textSecondary} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& fieldset': { border: 'none' } }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
            <Chip 
              icon={<Shield size={14} />} 
              label={`${users.filter(u => u.role === 'Super Admin').length} Admins`} 
              variant="outlined" 
            />
            <Chip 
              icon={<CheckCircle size={14} />} 
              label={`${users.filter(u => u.status === 'Active').length} Active`} 
              sx={{ borderColor: colors.success, color: colors.success, '& .MuiChip-icon': { color: colors.success } }}
              variant="outlined" 
            />
          </Grid>
        </Grid>
      </Card>

      {/* --- USERS GRID --- */}
      <Grid container spacing={3}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card 
              sx={{ 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              {/* Card Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: user.role === 'Super Admin' ? colors.primary : colors.hoverBg,
                    color: user.role === 'Super Admin' ? '#fff' : theme.palette.text.primary,
                    fontSize: 20,
                    fontWeight: 700
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
                <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}>
                  <MoreVertical size={18} />
                </IconButton>
              </Box>

              {/* User Info */}
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
                {user.email}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Details Row */}
              <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary }}>ROLE</Typography>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color={user.role === 'Super Admin' ? 'primary' : 'default'} 
                    sx={{ fontWeight: 600, height: 24 }} 
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary }}>STATUS</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {user.status === 'Active' ? <CheckCircle size={14} color={colors.success} /> : <XCircle size={14} color={colors.textSecondary} />}
                    <Typography variant="caption" sx={{ color: user.status === 'Active' ? colors.success : colors.textSecondary }}>
                      {user.status}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary }}>LAST ACTIVE</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.textSecondary }}>
                    <Clock size={12} />
                    <Typography variant="caption">{user.lastActive}</Typography>
                  </Box>
                </Box>

              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* --- ACTIONS MENU --- */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 150, borderRadius: 2 } }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ gap: 2 }}>
          <Edit2 size={16} />
          <Typography variant="body2">Edit Permissions</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ gap: 2 }}>
          <Lock size={16} />
          <Typography variant="body2">Reset Password</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: colors.error, gap: 2 }}>
          <Trash2 size={16} color={colors.error} />
          <Typography variant="body2">Revoke Access</Typography>
        </MenuItem>
      </Menu>

    </Box>
  );
};

export default UserManagement;