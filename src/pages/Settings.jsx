import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  alpha,
  Stack,
  Container,
  Paper
} from '@mui/material';
import { 
  User, 
  Bell, 
  Moon, 
  LogOut, 
  Database,
  Save,
  ShieldCheck,
  Palette,
  Zap,
  Settings as SettingsIcon,
  Globe,
  Lock
} from 'lucide-react';

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [adminName, setAdminName] = useState("Kumesi Moses");
  const [email, setEmail] = useState("admin@ricgcw.com");
  const [loading, setLoading] = useState(false);

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    showNotification(`Theme changed to ${newMode ? 'Dark' : 'Light'}. Please refresh.`, "info");
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showNotification("Settings synchronized.");
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

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
            <Chip icon={<SettingsIcon size={14} />} label="Preferences" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Configure your workspace, personal profile, and system alerts.
            </Typography>
        </Container>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT: PROFILE PREVIEW --- */}
        <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                    <Avatar sx={{ width: 100, height: 100, bgcolor: theme.palette.primary.main, fontSize: '2.5rem', fontWeight: 800, mx: 'auto', boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.3)}` }}>
                        {adminName.charAt(0)}
                    </Avatar>
                    <Box sx={{ position: 'absolute', bottom: 5, right: 5, width: 24, height: 24, bgcolor: theme.palette.success.main, borderRadius: '50%', border: `4px solid ${theme.palette.background.paper}` }} />
                </Box>
                <Typography variant="h5" fontWeight={800}>{adminName}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>System Administrator</Typography>
                <Chip icon={<ShieldCheck size={14} />} label="Verified Tier 1" size="small" sx={{ mt: 2, fontWeight: 700, borderRadius: 1 }} />
                
                <Divider sx={{ my: 4 }} />
                
                <Stack spacing={2} textAlign="left">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary">SECURITY</Typography>
                        <Typography variant="caption" fontWeight={800} color="success.main">OPTIMAL</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary">LAST SYNC</Typography>
                        <Typography variant="caption" fontWeight={700}>Just now</Typography>
                    </Box>
                </Stack>
            </Card>
        </Grid>

        {/* --- RIGHT: SETTINGS SECTIONS --- */}
        <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={4}>
                {/* Account Section */}
                <Card sx={{ p: 4, borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                        <User size={22} color={theme.palette.primary.main} /> Account Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth label="Full Name" value={adminName} onChange={(e) => setAdminName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                    </Grid>
                </Card>

                {/* Appearance & Workspace */}
                <Card sx={{ p: 4, borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Palette size={22} color={theme.palette.secondary.main} /> Experience
                    </Typography>
                    <List disablePadding>
                        <ListItem sx={{ py: 2, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 48 }}><Moon size={20} /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight={700}>Midnight Mode</Typography>} secondary="Toggle dark interface for low-light environments" />
                            <Switch checked={darkMode} onChange={handleThemeToggle} />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 2, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 48 }}><Bell size={20} /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight={700}>Push Notifications</Typography>} secondary="Receive alerts for financial logs and member updates" />
                            <Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                        </ListItem>
                    </List>
                </Card>

                {/* Security & Maintenance */}
                <Card sx={{ p: 4, borderRadius: 6, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, bgcolor: alpha(theme.palette.error.main, 0.01) }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, color: 'error.main' }}>
                        <Lock size={22} /> Security
                    </Typography>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="body1" fontWeight={700}>Registry Cleanup</Typography>
                                <Typography variant="caption" color="text.secondary">Optimize member database and merge duplicates</Typography>
                            </Box>
                            <Button variant="outlined" color="primary" size="small" startIcon={<Zap size={16} />} sx={{ borderRadius: 2, fontWeight: 700 }}>Scan</Button>
                        </Box>
                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="body1" fontWeight={700}>Revoke Session</Typography>
                                <Typography variant="caption" color="text.secondary">Instantly sign out from all active devices</Typography>
                            </Box>
                            <Button variant="contained" color="error" size="small" startIcon={<LogOut size={16} />} onClick={() => navigate('/login')} sx={{ borderRadius: 2, fontWeight: 700 }}>Log Out</Button>
                        </Box>
                    </Stack>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="contained" size="large" onClick={handleSave} disabled={loading}
                        sx={{ borderRadius: 3, px: 6, py: 1.5, fontWeight: 800, boxShadow: theme.shadows[6] }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
                    >
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </Box>
            </Stack>
        </Grid>

      </Grid>

    </Box>
  );
};

export default Settings;