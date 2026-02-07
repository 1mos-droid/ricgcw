import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  Chip, 
  Avatar, 
  useTheme, 
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  keyframes
} from '@mui/material';
import { 
  Layers, 
  Monitor, 
  Check, 
  ArrowRight,
  Wifi,
  Globe,
  Server,
  Terminal,
  Activity,
  ShieldCheck
} from 'lucide-react';

// Pulse animation for the "Online" dot
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
`;

const QuickSwitch = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [activeWorkspace, setActiveWorkspace] = useState('main');
  const [systemStatus, setSystemStatus] = useState('Online');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const workspaces = [
    { id: 'main', label: 'Main Sanctuary', role: 'Admin', icon: <Globe size={24}/> },
    { id: 'youth', label: 'Youth Ministry', role: 'Moderator', icon: <Layers size={24}/> },
    { id: 'kids', label: "Children's Dept", role: 'View Only', icon: <Layers size={24}/> },
  ];

  // --- HANDLERS ---
  const handleSwitch = (id, label) => {
    if (activeWorkspace === id) return;
    
    // Simulate context switch
    setActiveWorkspace(id);
    showSnackbar(`Switched environment to: ${label}`, 'success');
  };

  const handleModeClick = (mode) => {
    showSnackbar(`${mode} activated. Press ESC to exit.`, 'info');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ 
        mb: 5, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            Command Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Workspace environments and display modes
          </Typography>
        </Box>
        
        <Chip 
          icon={
            <Box sx={{ 
              width: 10, 
              height: 10, 
              bgcolor: '#4CAF50', 
              borderRadius: '50%',
              animation: `${pulse} 2s infinite`
            }} />
          }
          label={`System ${systemStatus}`}
          sx={{ 
            bgcolor: 'rgba(76, 175, 80, 0.1)', 
            color: '#4CAF50', 
            fontWeight: 700,
            border: '1px solid rgba(76, 175, 80, 0.2)',
            height: 36,
            px: 1
          }} 
        />
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: WORKSPACES --- */}
        <Grid item xs={12} md={8}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, mb: 2, display: 'block' }}>
            ACTIVE ENVIRONMENT
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {workspaces.map((ws) => {
              const isActive = activeWorkspace === ws.id;
              return (
                <Grid item xs={12} sm={6} key={ws.id}>
                  <Card 
                    onClick={() => handleSwitch(ws.id, ws.label)}
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      border: isActive ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                      bgcolor: isActive ? theme.palette.action.selected : theme.palette.background.paper,
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { 
                        transform: 'translateY(-3px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: isActive ? theme.palette.primary.main : theme.palette.action.hover, 
                        color: isActive ? '#fff' : theme.palette.text.secondary 
                      }}>
                        {ws.icon}
                      </Avatar>
                      {isActive && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Box sx={{ 
                            bgcolor: theme.palette.primary.main, 
                            color: '#fff', 
                            borderRadius: '50%', 
                            p: 0.5,
                            display: 'flex',
                            boxShadow: theme.shadows[2]
                            }}>
                            <Check size={14} />
                            </Box>
                        </motion.div>
                      )}
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        {ws.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShieldCheck size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                {ws.role} Access
                            </Typography>
                        </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Quick Stats Row */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            opacity: 0.8,
            flexDirection: { xs: 'column', sm: 'row' },
            bgcolor: theme.palette.background.default,
            p: 2,
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', fontSize: 13 }}>
              <Server size={16} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>Local Server: Port 3002</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#4CAF50', fontSize: 13 }}>
              <Wifi size={16} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>Latency: 12ms</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: theme.palette.info.main, fontSize: 13 }}>
              <Activity size={16} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>Uptime: 99.9%</Typography>
            </Box>
          </Box>
        </Grid>

        {/* --- RIGHT COL: MODES --- */}
        <Grid item xs={12} md={4}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, mb: 2, display: 'block' }}>
            DISPLAY MODES
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* Kiosk Mode */}
            <Card 
                onClick={() => handleModeClick('Kiosk Mode')}
                sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    cursor: 'pointer', 
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: theme.palette.action.hover } 
                }}
            >
              <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark, borderRadius: 2 }}>
                <Monitor size={20} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>Kiosk Mode</Typography>
                <Typography variant="caption" color="text.secondary">Public check-in display</Typography>
              </Box>
              <IconButton size="small"><ArrowRight size={16} /></IconButton>
            </Card>

            {/* Developer Console */}
            <Card 
                onClick={() => handleModeClick('Developer Console')}
                sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    cursor: 'pointer',
                    transition: 'background 0.2s', 
                    '&:hover': { bgcolor: theme.palette.action.hover } 
                }}
            >
              <Avatar sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.dark, borderRadius: 2 }}>
                <Terminal size={20} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>Developer Console</Typography>
                <Typography variant="caption" color="text.secondary">Raw database logs</Typography>
              </Box>
              <IconButton size="small"><ArrowRight size={16} /></IconButton>
            </Card>

          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}`, color: 'text.secondary' }}>
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
              !mos-droid v2.1.0 (Stable)
            </Typography>
            <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Authorized to: <Chip label="Pastor Nicholas Dobeng" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', borderRadius: 1 }} />
            </Typography>
          </Box>
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

export default QuickSwitch;