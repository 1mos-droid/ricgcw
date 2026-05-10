import React from 'react';
import { Box, Typography, Container, Paper, Button, useTheme, alpha } from '@mui/material';
import { Hammer, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

const Maintenance = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const { maintenance } = useWorkspace();

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${theme.palette.background.default} 100%)`
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 8, 
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette.background.paper, 0.8)
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '24px', 
              bgcolor: alpha(theme.palette.warning.main, 0.1), 
              color: theme.palette.warning.main,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 4
            }}
          >
            <Hammer size={40} />
          </Box>
          
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            System Maintenance
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            {maintenance?.message || "We're currently performing some scheduled maintenance to improve your experience. We'll be back online shortly."}
          </Typography>

          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 4, mb: 4, display: 'flex', gap: 2, alignItems: 'center', textAlign: 'left' }}>
            <AlertTriangle size={20} color={theme.palette.info.main} />
            <Typography variant="caption" fontWeight={600} color="info.main">
              Developers can still access the system for maintenance.
            </Typography>
          </Box>

          <Button 
            variant="outlined" 
            startIcon={<LogOut size={18} />} 
            onClick={logout}
            sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 700 }}
          >
            Sign Out
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Maintenance;
