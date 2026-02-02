import React from 'react';
// Ensure 'vite-plugin-pwa' is installed for this import to work
import { useRegisterSW } from 'virtual:pwa-register/react';
import { 
  Button, 
  Snackbar, 
  Box, 
  Typography, 
  useTheme, 
  IconButton,
  Paper,
  Slide,
  useMediaQuery
} from '@mui/material';
import { Wifi, RefreshCw, X, DownloadCloud } from 'lucide-react';

function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}

function PWAPrompt() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker Registered');
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleReload = () => {
    updateServiceWorker(true);
  };

  return (
    <>
      {/* --- 1. OFFLINE READY TOAST --- */}
      {/* Shows when the app has finished caching for offline use */}
      <Snackbar
        open={offlineReady}
        onClose={close}
        autoHideDuration={4000}
        TransitionComponent={TransitionUp}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ bottom: { xs: 20, md: 24 }, left: { xs: 20, md: 24 } }}
      >
        <Paper 
          elevation={4}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            px: 2, 
            py: 1.5, 
            borderRadius: 3, 
            bgcolor: theme.palette.background.paper,
            borderLeft: `4px solid ${theme.palette.success.main}`,
            color: theme.palette.text.primary,
            minWidth: 280
          }}
        >
          <Box sx={{ 
            p: 1, 
            borderRadius: '50%', 
            bgcolor: theme.palette.success.light, 
            color: theme.palette.success.dark,
            display: 'flex'
          }}>
            <Wifi size={18} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>Ready for Offline</Typography>
            <Typography variant="caption" color="text.secondary">App cached successfully.</Typography>
          </Box>
          <IconButton size="small" onClick={close}>
            <X size={16} />
          </IconButton>
        </Paper>
      </Snackbar>

      {/* --- 2. NEW VERSION UPDATE TOAST --- */}
      {/* Shows when a new deployment is detected */}
      <Snackbar
        open={needRefresh}
        onClose={close}
        TransitionComponent={TransitionUp}
        // Center on mobile, Bottom-Right on Desktop
        anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: isMobile ? 'center' : 'right' 
        }}
        sx={{ 
            bottom: { xs: 20, md: 30 }, 
            right: { md: 30 },
            width: { xs: '90%', md: 'auto' } // Responsive width
        }} 
      >
        <Paper 
          elevation={8}
          sx={{ 
            p: 2, 
            borderRadius: 3, 
            bgcolor: theme.palette.mode === 'dark' ? '#1E293B' : '#fff',
            border: `1px solid ${theme.palette.primary.main}`,
            maxWidth: { xs: '100%', md: 400 },
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '50%', 
              bgcolor: theme.palette.primary.main, 
              color: '#fff',
              display: 'flex',
              mt: 0.5
            }}>
              <DownloadCloud size={24} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '1rem' }}>
                Update Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 0.5, lineHeight: 1.5 }}>
                A new version of the app is available. Reload to apply changes and get the latest features.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={close}
                  sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: theme.palette.divider }}
                >
                  Dismiss
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleReload}
                  startIcon={<RefreshCw size={14} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
                >
                  Reload Now
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Snackbar>
    </>
  );
}

export default PWAPrompt;