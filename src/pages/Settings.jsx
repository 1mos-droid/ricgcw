import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Lock,
  Save,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // --- STATE ---
  // 1. Load Dark Mode from Local Storage (or default to system/light)
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // 2. Other Local Preferences
  const [notifications, setNotifications] = useState(
    localStorage.getItem('pref_notifications') === 'true'
  );
  
  // 3. Local Profile Data (No Authentication)
  const [adminName, setAdminName] = useState(localStorage.getItem('admin_name') || "Admin User");
  const [email, setEmail] = useState(localStorage.getItem('admin_email') || "admin@ricgcw.com");
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- HANDLERS ---
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // 🟢 DARK MODE TOGGLE (ACTUALLY WORKS)
  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // 1. Save preference to storage so theme.js can read it
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    // 2. Force reload to apply the new theme globally
    window.location.reload(); 
  };

  const handleSave = () => {
    setLoading(true);
    
    // Save all current states to Local Storage
    localStorage.setItem('admin_name', adminName);
    localStorage.setItem('admin_email', email);
    localStorage.setItem('pref_notifications', notifications);

    // Simulate network delay for better UX
    setTimeout(() => {
      setLoading(false);
      showSnackbar("Preferences saved successfully.");
    }, 800);
  };

  const handleClearCache = () => {
    if(window.confirm("Are you sure? This will clear all local data and reload.")) {
        // Clear everything EXCEPT the theme to prevent flashing
        const currentTheme = localStorage.getItem('theme');
        localStorage.clear();
        if(currentTheme) localStorage.setItem('theme', currentTheme);
        
        sessionStorage.clear();
        window.location.reload();
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
            Manage local preferences and interface settings
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
                {adminName.charAt(0).toUpperCase()}
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
            <Typography variant="body2" color="text.secondary" gutterBottom>Administrator</Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, mb: 3 }}>
              <Chip label="Local Admin" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1 }} />
            </Box>

            <Divider sx={{ my: 2 }} />
          </Card>
        </Grid>

        {/* --- RIGHT COL: SETTINGS FORMS --- */}
        <Grid item xs={12} md={8}>
          
          {/* Section 1: Account (Local Only) */}
          <Card sx={{ p: 3, mb: 3, boxShadow: theme.shadows[2], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, borderRadius: 2 }}>
                <User size={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>Profile Details</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Display Name" 
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

          {/* Section 2: Preferences (Dark Mode Logic) */}
          <Card sx={{ p: 3, mb: 3, boxShadow: theme.shadows[2], borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.main, borderRadius: 2 }}>
                <Smartphone size={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>Interface & App</Typography>
            </Box>

            <List>
              {/* DARK MODE TOGGLE */}
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><Moon size={20} /></ListItemIcon>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary={darkMode ? "Dark mode is active" : "Light mode is active"} 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Switch 
                  checked={darkMode} 
                  onChange={handleThemeToggle} 
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><Bell size={20} /></ListItemIcon>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Enable local browser notifications" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Switch 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)} 
                />
              </ListItem>
            </List>
          </Card>

          {/* Section 3: Data Zone */}
          <Card sx={{ p: 3, border: `1px solid ${theme.palette.error.light}`, borderRadius: 3, boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.main, borderRadius: 2 }}>
                <Database size={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="error">Data Zone</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>Clear App Cache</Typography>
                <Button size="small" color="error" startIcon={<RefreshCw size={14} />} onClick={handleClearCache}>
                  Clear Data
                </Button>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>End Session</Typography>
                <Button 
                  size="small" 
                  variant="contained" 
                  color="error" 
                  startIcon={<LogOut size={14} />} 
                  onClick={() => {
                    localStorage.removeItem('isAuthenticated');
                    navigate('/login');
                  }}
                >
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