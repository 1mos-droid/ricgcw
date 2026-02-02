import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  useTheme,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Moon, 
  LogOut, 
  RefreshCw, 
  Database,
  CreditCard,
  Lock,
  Save,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  const theme = useTheme();
  
  // --- STATE ---
  // UI Toggles
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark'); // Local state for demo
  
  // Form Data
  const [adminName, setAdminName] = useState("Kumesi Moses");
  const [email, setEmail] = useState("admin@ricgcw.com");
  
  // Status States
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- HANDLERS ---
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showSnackbar("System preferences updated successfully.");
    }, 1200);
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    // In a real app, you would call your Context toggle function here
    // e.g., colorMode.toggleColorMode();
    showSnackbar(`Switched to ${!darkMode ? 'Dark' : 'Light'} mode (Simulation)`, 'info');
  };

  const handleClearCache = () => {
    if(window.confirm("Are you sure? This will reload the application.")) {
        showSnackbar("Cache cleared. Reloading...", "info");
        setTimeout(() => window.location.reload(), 1500);
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            System Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage global preferences and security
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <Save size={18} />}
          onClick={handleSave}
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            px: 4, 
            width: { xs: '100%', sm: 'auto' },
            boxShadow: theme.shadows[3]
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: NAVIGATION & PROFILE --- */}
        <Grid item xs={12} md={4}>
          
          {/* Profile Card */}
          <Card sx={{ p: 4, textAlign: 'center', mb: 3, boxShadow: theme.shadows[2], borderRadius: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: theme.palette.primary.main, 
                  fontSize: 32, 
                  mx: 'auto',
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[3]
                }}
              >
                {adminName.charAt(0).toUpperCase()}M
              </Avatar>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                bgcolor: '#4CAF50', 
                borderRadius: '50%', 
                position: 'absolute', 
                bottom: 5, 
                right: 5, 
                border: `2px solid ${theme.palette.background.paper}` 
              }} />
            </Box>
            
            <Typography variant="h6" fontWeight={700}>{adminName}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>Super Administrator</Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, mb: 3 }}>
              <Chip label="Root Access" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1 }} />
              <Chip label="ID: #8839" size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <List component="nav" sx={{ p: 0 }}>
              <ListItemButton selected sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon><User size={18} /></ListItemIcon>
                <ListItemText primary="General" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
              <ListItemButton sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon><CreditCard size={18} /></ListItemIcon>
                <ListItemText primary="Billing" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
              <ListItemButton sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon><Lock size={18} /></ListItemIcon>
                <ListItemText primary="API Keys" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </List>
          </Card>
        </Grid>

        {/* --- RIGHT COL: SETTINGS FORMS --- */}
        <Grid item xs={12} md={8}>
          
          {/* Section 1: Account */}
          <Card sx={{ p: 3, mb: 3, boxShadow: theme.shadows[2], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, borderRadius: 2 }}>
                <User size={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>Account Details</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </Grid>
            </Grid>
          </Card>

          {/* Section 2: Preferences */}
          <Card sx={{ p: 3, mb: 3, boxShadow: theme.shadows[2], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.main, borderRadius: 2 }}>
                <Smartphone size={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>App Preferences</Typography>
            </Box>

            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><Bell size={20} /></ListItemIcon>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Receive alerts for new member registrations" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Switch 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)} 
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><Moon size={20} /></ListItemIcon>
                <ListItemText 
                  primary="Dark Mode Interface" 
                  secondary="Toggle between Light and Dark themes" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Switch 
                  checked={darkMode} 
                  onChange={handleThemeToggle} 
                />
              </ListItem>
            </List>
          </Card>

          {/* Section 3: Security */}
          <Card sx={{ p: 3, mb: 3, boxShadow: theme.shadows[2], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.main, borderRadius: 2 }}>
                <Shield size={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>Security</Typography>
            </Box>

            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><Lock size={20} /></ListItemIcon>
                <ListItemText 
                  primary="Two-Factor Authentication" 
                  secondary="Secure account with SMS verification" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Switch 
                  checked={twoFactor} 
                  onChange={() => setTwoFactor(!twoFactor)} 
                  color="warning"
                />
              </ListItem>
            </List>

            <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: 'center', 
                bgcolor: theme.palette.background.default, 
                p: 2, 
                borderRadius: 2,
                gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle size={16} color={theme.palette.success.main} />
                <Typography variant="body2" color="text.secondary">Password last changed 30 days ago</Typography>
              </Box>
              <Button size="small" variant="outlined" color="inherit">Update Password</Button>
            </Box>
          </Card>

          {/* Section 4: Data Zone */}
          <Card sx={{ p: 3, border: `1px solid ${theme.palette.error.light}`, borderRadius: 3, boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.main, borderRadius: 2 }}>
                <Database size={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="error">Data Zone</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>Clear Local Cache</Typography>
                <Button size="small" color="error" startIcon={<RefreshCw size={14} />} onClick={handleClearCache}>
                  Clear Data
                </Button>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>Log Out All Devices</Typography>
                <Button size="small" variant="contained" color="error" startIcon={<LogOut size={14} />} onClick={() => showSnackbar("All sessions terminated.", "info")}>
                  Log Out
                </Button>
              </Box>
            </Box>
          </Card>

        </Grid>
      </Grid>

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

export default Settings;