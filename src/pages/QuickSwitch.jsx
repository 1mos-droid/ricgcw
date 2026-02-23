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
  alpha,
  Stack,
  Divider,
  Container
} from '@mui/material';
import { 
  Layers, 
  Monitor, 
  Check, 
  Globe, 
  Server, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Cpu,
  Sparkles
} from 'lucide-react';

const QuickSwitch = () => {
  const theme = useTheme();
  const { workspace: activeWorkspace, switchWorkspace, showNotification } = useWorkspace();
  
  const workspaces = [
    { id: 'main', label: 'Main Sanctuary', desc: 'Central governance and master registry.', color: theme.palette.primary.main },
    { id: 'youth', label: 'Youth Ministry', desc: 'Departmental records and youth engagement.', color: theme.palette.secondary.main },
    { id: 'kids', label: "Children's Dept", desc: 'Safeguarding and early education tracking.', color: theme.palette.warning.main },
  ];

  const handleSwitch = (id, label) => {
    if (activeWorkspace === id) return;
    switchWorkspace(id);
    showNotification(`Environment switched to ${label}`);
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
            <Chip icon={<Cpu size={14} />} label="Infrastructure" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                Command Center
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Toggle between different church environments and manage system-wide states.
            </Typography>
        </Container>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- LEFT: ENVIRONMENTS --- */}
        <Grid size={{ xs: 12, lg: 8 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Layers size={20} color={theme.palette.primary.main} /> Active Environments
            </Typography>
            <Grid container spacing={3}>
                {workspaces.map((ws) => {
                    const isActive = activeWorkspace === ws.id;
                    return (
                        <Grid size={{ xs: 12, sm: 6 }} key={ws.id}>
                            <Card 
                                onClick={() => handleSwitch(ws.id, ws.label)}
                                sx={{ 
                                    p: 4, borderRadius: 6, cursor: 'pointer',
                                    border: isActive ? `2px solid ${ws.color}` : `1px solid ${theme.palette.divider}`,
                                    bgcolor: isActive ? alpha(ws.color, 0.03) : theme.palette.background.paper,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[10], borderColor: ws.color }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Avatar sx={{ bgcolor: isActive ? ws.color : alpha(theme.palette.text.secondary, 0.1), color: isActive ? '#fff' : theme.palette.text.secondary, borderRadius: 2 }}>
                                        <Globe size={24} />
                                    </Avatar>
                                    {isActive && <Chip label="ACTIVE" size="small" sx={{ bgcolor: ws.color, color: '#fff', fontWeight: 900, height: 20, fontSize: '0.6rem' }} />}
                                </Box>
                                <Typography variant="h6" fontWeight={800} gutterBottom>{ws.label}</Typography>
                                <Typography variant="body2" color="text.secondary">{ws.desc}</Typography>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Grid>

        {/* --- RIGHT: SYSTEM HEALTH --- */}
        <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
                <Card sx={{ p: 4, borderRadius: 6, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Activity size={20} color={theme.palette.success.main} /> System Health
                    </Typography>
                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary">LATENCY</Typography>
                            <Typography variant="caption" fontWeight={800} color="success.main">12ms (Optimal)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary">UPTIME</Typography>
                            <Typography variant="caption" fontWeight={800}>99.98%</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary">SERVER</Typography>
                            <Typography variant="caption" fontWeight={800}>US-CENTRAL-1</Typography>
                        </Box>
                    </Stack>
                </Card>

                <Card sx={{ p: 4, borderRadius: 6, border: `1px solid ${theme.palette.divider}`, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, color: '#fff' }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Maintenance</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>No scheduled maintenance for the next 7 days.</Typography>
                    <Button fullWidth variant="contained" sx={{ bgcolor: '#fff', color: theme.palette.secondary.main, fontWeight: 800, '&:hover': { bgcolor: alpha('#fff', 0.9) } }}>
                        View Logs
                    </Button>
                </Card>
            </Stack>
        </Grid>

      </Grid>

    </Box>
  );
};

export default QuickSwitch;