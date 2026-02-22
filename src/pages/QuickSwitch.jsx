import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
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
  keyframes,
  alpha,
  Stack,
  Divider
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
  ShieldCheck,
  Cpu
} from 'lucide-react';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
`;

const QuickSwitch = () => {
  const theme = useTheme();
  const workspaceContext = useWorkspace();
  const { workspace: activeWorkspace, switchWorkspace, showNotification } = workspaceContext;
  
  const [systemStatus, setSystemStatus] = useState('Online');

  const workspaces = [
    { id: 'main', label: 'Main Sanctuary', role: 'Admin', icon: <Globe size={22}/>, color: theme.palette.primary.main },
    { id: 'youth', label: 'Youth Ministry', role: 'Moderator', icon: <Layers size={22}/>, color: theme.palette.secondary.main },
    { id: 'kids', label: "Children's Dept", role: 'Staff', icon: <Layers size={22}/>, color: theme.palette.warning.main },
  ];

  const handleSwitch = (id, label) => {
    if (activeWorkspace === id) return;
    switchWorkspace(id);
    showNotification(`Switched to ${label}`, 'success');
  };

  const handleModeClick = (mode) => {
    showNotification(`${mode} activated.`, 'info');
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
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        gap: 2
      }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
            INFRASTRUCTURE
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Command Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage global workspace environments and system states
          </Typography>
        </Box>
        
        <Chip 
          icon={
            <Box sx={{ 
              width: 8, 
              height: 8, 
              bgcolor: theme.palette.success.main, 
              borderRadius: '50%',
              animation: `${pulse} 2s infinite`,
              ml: 1
            }} />
          }
          label={`System Status: ${systemStatus}`}
          sx={{ 
            bgcolor: alpha(theme.palette.success.main, 0.1), 
            color: theme.palette.success.main, 
            fontWeight: 800,
            borderRadius: 3,
            height: 40,
            px: 1,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            '& .MuiChip-icon': { ml: 0.5 }
          }} 
        />
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: WORKSPACES --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Cpu size={18} color={theme.palette.primary.main} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                AVAILABLE ENVIRONMENTS
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {workspaces.map((ws) => {
              const isActive = activeWorkspace === ws.id;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={ws.id}>
                  <Card 
                    onClick={() => handleSwitch(ws.id, ws.label)}
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      borderRadius: 4,
                      border: isActive ? `2px solid ${ws.color}` : `1px solid ${theme.palette.divider}`,
                      bgcolor: isActive ? alpha(ws.color, 0.05) : theme.palette.background.paper,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      '&:hover': { 
                        transform: 'translateY(-6px)',
                        boxShadow: `0 20px 40px -12px ${alpha(ws.color, 0.2)}`,
                        borderColor: ws.color
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                      <Avatar sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 3,
                        bgcolor: isActive ? ws.color : alpha(theme.palette.text.secondary, 0.1), 
                        color: isActive ? '#fff' : theme.palette.text.secondary,
                        boxShadow: isActive ? `0 8px 16px ${alpha(ws.color, 0.3)}` : 'none'
                      }}>
                        {ws.icon}
                      </Avatar>
                      {isActive && (
                        <Chip 
                            label="Active" 
                            size="small" 
                            sx={{ fontWeight: 800, borderRadius: 1.5, bgcolor: ws.color, color: '#fff' }} 
                        />
                      )}
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
                        {ws.label}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ShieldCheck size={14} color={isActive ? ws.color : theme.palette.text.disabled} />
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                                {ws.role} Access
                            </Typography>
                        </Stack>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* System Metrics */}
          <Card variant="outlined" sx={{ 
            display: 'flex', 
            gap: 4, 
            flexDirection: { xs: 'column', sm: 'row' },
            p: 2.5,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            border: `1px dashed ${theme.palette.divider}`
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Server size={18} color={theme.palette.primary.main} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>Port: 3002</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Wifi size={18} color={theme.palette.success.main} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>Latency: 12ms</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Activity size={18} color={theme.palette.info.main} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>Uptime: 99.9%</Typography>
            </Stack>
          </Card>
        </Grid>

        {/* --- RIGHT COL: MODES --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Monitor size={18} color={theme.palette.primary.main} />
            DISPLAY MODES
          </Typography>
          
          <Stack spacing={2}>
            <Card 
                onClick={() => handleModeClick('Kiosk Mode')}
                sx={{ 
                    p: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2.5, 
                    cursor: 'pointer', 
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: theme.palette.primary.main } 
                }}
            >
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, borderRadius: 2.5, width: 44, height: 44 }}>
                <Monitor size={22} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight={800}>Kiosk Mode</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Public check-in terminal</Typography>
              </Box>
              <IconButton size="small" sx={{ color: theme.palette.primary.main }}><ArrowRight size={20} /></IconButton>
            </Card>

            <Card 
                onClick={() => handleModeClick('Developer Console')}
                sx={{ 
                    p: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2.5, 
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: theme.palette.primary.main } 
                }}
            >
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, borderRadius: 2.5, width: 44, height: 44 }}>
                <Terminal size={22} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight={800}>Dev Console</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>System logs & metrics</Typography>
              </Box>
              <IconButton size="small" sx={{ color: theme.palette.primary.main }}><ArrowRight size={20} /></IconButton>
            </Card>
          </Stack>

          <Box sx={{ mt: 6, p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mb: 1.5, fontWeight: 700, color: theme.palette.primary.main }}>
              CORE v2.1.0-STABLE
            </Typography>
            <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" fontWeight={600} color="text.secondary">AUTHORIZED:</Typography>
                <Chip label="Admin User" size="small" sx={{ fontWeight: 800, borderRadius: 1, height: 20, fontSize: '0.65rem' }} />
            </Stack>
          </Box>
        </Grid>

      </Grid>

    </Box>
  );
};

export default QuickSwitch;