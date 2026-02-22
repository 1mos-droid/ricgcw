import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  TextField, 
  Switch, 
  Avatar, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useTheme,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  alpha,
  Stack
} from '@mui/material';
import { 
  User, 
  Bell, 
  Smartphone, 
  Moon, 
  LogOut, 
  RefreshCw, 
  Database,
  Save,
  ShieldCheck,
  Palette,
  UserCheck,
  Zap
} from 'lucide-react';

import { API_BASE_URL } from '../config';

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem('pref_notifications') === 'true'
  );
  
  const [adminName, setAdminName] = useState(localStorage.getItem('admin_name') || "Admin User");
  const [email, setEmail] = useState(localStorage.getItem('admin_email') || "admin@ricgcw.com");
  
  const [loading, setLoading] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // --- HANDLERS ---
  const handleDeduplicate = async () => {
    showConfirmation({
      title: "Clean Registry",
      message: "This will scan all members, find duplicates by name, and delete the ones with missing information. This action is irreversible.",
      severity: "warning",
      onConfirm: async () => {
        setMaintenanceLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/members`);
          const allMembers = res.data || [];
          
          // Group by normalized name
          const groups = {};
          allMembers.forEach(m => {
            if (!m.name) return;
            const key = m.name.trim().toLowerCase();
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
          });

          const toDelete = [];
          
          Object.values(groups).forEach(group => {
            if (group.length > 1) {
              // Rank by completeness (counting non-empty optional fields)
              const scored = group.map(m => {
                const optionalFields = ['email', 'phone', 'address', 'dob', 'department', 'position', 'membershipType'];
                const score = optionalFields.reduce((acc, field) => {
                  return acc + (m[field] && String(m[field]).trim() ? 1 : 0);
                }, 0);
                return { ...m, _completenessScore: score };
              });

              // Sort: highest score first, then newest first
              scored.sort((a, b) => {
                if (b._completenessScore !== a._completenessScore) {
                  return b._completenessScore - a._completenessScore;
                }
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
              });

              // Keep the winner (index 0), mark others for deletion
              for (let i = 1; i < scored.length; i++) {
                toDelete.push(scored[i].id);
              }
            }
          });

          if (toDelete.length === 0) {
            showNotification("Registry is already optimized. No duplicates found.", "success");
          } else {
            // Delete duplicates
            await Promise.all(toDelete.map(id => axios.delete(`${API_BASE_URL}/members/${id}`)));
            showNotification(`Registry sanitized! Removed ${toDelete.length} duplicate records.`, "success");
          }
        } catch (err) {
          console.error("Deduplication Error:", err);
          showNotification("Failed to complete registry cleanup.", "error");
        } finally {
          setMaintenanceLoading(false);
        }
      }
    });
  };

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    window.location.reload(); 
  };

  const handleSave = () => {
    setLoading(true);
    localStorage.setItem('admin_name', adminName);
    localStorage.setItem('admin_email', email);
    localStorage.setItem('pref_notifications', notifications);

    setTimeout(() => {
      setLoading(false);
      showNotification("Preferences updated successfully.");
    }, 800);
  };

  const handleClearCache = () => {
    showConfirmation({
      title: "Clear Cache",
      message: "Are you sure? This will clear all local data and reload the application. You may need to sign in again.",
      onConfirm: () => {
        const currentTheme = localStorage.getItem('theme');
        localStorage.clear();
        if(currentTheme) localStorage.setItem('theme', currentTheme);
        sessionStorage.clear();
        window.location.reload();
      }
    });
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
            PREFERENCES
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize your system experience and local profile
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <Save size={18} />}
          onClick={handleSave}
          disabled={loading}
          sx={{ 
            borderRadius: 3, 
            px: 4, 
            py: 1.2,
            width: { xs: '100%', sm: 'auto' },
            boxShadow: theme.shadows[4],
            fontWeight: 700
          }}
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: PROFILE --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: theme.palette.primary.main, 
                  fontSize: 40, 
                  mx: 'auto',
                  fontWeight: 800,
                  border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                {adminName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: theme.palette.success.main, 
                borderRadius: '50%', 
                position: 'absolute', 
                bottom: 5, 
                right: 5, 
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[2]
              }} />
            </Box>
            
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.01em">{adminName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3 }}>System Administrator</Typography>
            
            <Stack direction="row" spacing={1} justifyContent="center">
              <Chip icon={<ShieldCheck size={14} />} label="Verified Access" size="small" sx={{ fontWeight: 700, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} />
            </Stack>

            <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
            
            <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 2, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Account Status</Typography>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600}>Security Level</Typography>
                        <Typography variant="body2" color="primary" fontWeight={700}>Tier 1</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600}>Last Sync</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Just now</Typography>
                    </Box>
                </Stack>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: SETTINGS --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          
          <Stack spacing={3}>
            {/* Profile Section */}
            <Card sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: 2.5 }}>
                        <User size={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>Profile Information</Typography>
                </Stack>
                
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                            fullWidth 
                            label="Display Name" 
                            value={adminName} 
                            onChange={(e) => setAdminName(e.target.value)} 
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                            fullWidth 
                            label="Email Address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Grid>
                </Grid>
            </Card>

            {/* Appearance Section */}
            <Card sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, borderRadius: 2.5 }}>
                        <Palette size={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>Interface & Experience</Typography>
                </Stack>

                <List sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon sx={{ color: theme.palette.text.primary, minWidth: 48 }}><Moon size={22} /></ListItemIcon>
                        <ListItemText 
                            primary="Midnight Mode" 
                            secondary="Switch to a dark color palette for late hours" 
                            primaryTypographyProps={{ fontWeight: 700 }}
                            secondaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Switch 
                            checked={darkMode} 
                            onChange={handleThemeToggle} 
                        />
                    </ListItem>
                    
                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon sx={{ color: theme.palette.text.primary, minWidth: 48 }}><Bell size={22} /></ListItemIcon>
                        <ListItemText 
                            primary="Real-time Notifications" 
                            secondary="Receive alerts for financial transactions and new members" 
                            primaryTypographyProps={{ fontWeight: 700 }}
                            secondaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Switch 
                            checked={notifications} 
                            onChange={() => setNotifications(!notifications)} 
                        />
                    </ListItem>
                </List>
            </Card>

            {/* Danger Zone */}
            <Card sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, bgcolor: alpha(theme.palette.error.main, 0.02) }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, borderRadius: 2.5 }}>
                        <Database size={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={800} color="error">System Maintenance</Typography>
                </Stack>

                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body1" fontWeight={700}>Optimize Registry</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>Merge duplicate members and remove incomplete records</Typography>
                        </Box>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={maintenanceLoading ? <CircularProgress size={16} /> : <Zap size={16} />} 
                            onClick={handleDeduplicate}
                            disabled={maintenanceLoading}
                            sx={{ borderRadius: 2, fontWeight: 700, border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}` }}
                        >
                            {maintenanceLoading ? 'Scanning...' : 'Clean Registry'}
                        </Button>
                    </Box>
                    
                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body1" fontWeight={700}>Terminate Session</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>Sign out of your account and clear authentication</Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="error" 
                            startIcon={<LogOut size={16} />} 
                            onClick={() => {
                                localStorage.removeItem('isAuthenticated');
                                navigate('/login');
                            }}
                            sx={{ borderRadius: 2, fontWeight: 700, boxShadow: 'none' }}
                        >
                            Log Out
                        </Button>
                    </Box>
                </Stack>
            </Card>
          </Stack>

        </Grid>
      </Grid>

    </Box>
  );
};

export default Settings;