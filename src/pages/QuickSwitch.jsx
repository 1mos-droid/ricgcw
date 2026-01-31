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
  Divider,
  IconButton
} from '@mui/material';
import { 
  Command, 
  Layers, 
  Monitor, 
  Check, 
  ArrowRight,
  Cpu,
  Wifi,
  Globe,
  Server,
  Terminal
} from 'lucide-react';

const QuickSwitch = () => {
  const theme = useTheme();
  const [activeWorkspace, setActiveWorkspace] = useState('main');
  const [systemStatus, setSystemStatus] = useState('Online');

  const workspaces = [
    { id: 'main', label: 'Main Sanctuary', role: 'Admin', icon: <Globe size={24}/> },
    { id: 'youth', label: 'Youth Ministry', role: 'Moderator', icon: <Layers size={24}/> },
    { id: 'kids', label: 'Children\'s Dept', role: 'View Only', icon: <Layers size={24}/> },
  ];

  const handleSwitch = (id) => {
    setActiveWorkspace(id);
    // In a real app, this would trigger a global context update
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            Command Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Workspace environments and display modes
          </Typography>
        </Box>
        
        <Chip 
          icon={<Box sx={{ width: 8, height: 8, bgcolor: '#4CAF50', borderRadius: '50%' }} />}
          label={`System ${systemStatus}`}
          sx={{ 
            bgcolor: 'rgba(76, 175, 80, 0.1)', 
            color: '#4CAF50', 
            fontWeight: 700,
            border: '1px solid rgba(76, 175, 80, 0.2)'
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
                    onClick={() => handleSwitch(ws.id)}
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      border: isActive ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                      bgcolor: isActive ? theme.palette.action.selected : theme.palette.background.paper,
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { transform: 'translateY(-2px)' }
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
                        <Box sx={{ 
                          bgcolor: theme.palette.primary.main, 
                          color: '#fff', 
                          borderRadius: '50%', 
                          p: 0.5,
                          display: 'flex'
                        }}>
                          <Check size={14} />
                        </Box>
                      )}
                    </Box>

                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                      {ws.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      {ws.role} Access
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Quick Stats Row */}
          <Box sx={{ display: 'flex', gap: 3, opacity: 0.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: 13 }}>
              <Server size={14} />
              <span>Local Server: Port 3002</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4CAF50', fontSize: 13 }}>
              <Wifi size={14} />
              <span>Latency: 12ms</span>
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
            <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: theme.palette.action.hover } }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark }}>
                <Monitor size={20} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Kiosk Mode</Typography>
                <Typography variant="caption" color="text.secondary">Public check-in display</Typography>
              </Box>
              <IconButton size="small"><ArrowRight size={16} /></IconButton>
            </Card>

            {/* Developer Console */}
            <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: theme.palette.action.hover } }}>
              <Avatar sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.dark }}>
                <Terminal size={20} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Developer Console</Typography>
                <Typography variant="caption" color="text.secondary">Raw database logs</Typography>
              </Box>
              <IconButton size="small"><ArrowRight size={16} /></IconButton>
            </Card>

          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}`, color: 'text.secondary' }}>
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
              FlameCore v2.1.0 (Stable)
            </Typography>
            <Typography variant="caption" display="block">
              Authorized to: Kumesi Moses
            </Typography>
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
};

export default QuickSwitch;