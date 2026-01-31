import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { 
  Button, 
  Snackbar, 
  Box, 
  Typography, 
  useTheme, 
  IconButton,
  Paper,
  Slide
} from '@mui/material';
import { Wifi, RefreshCw, X, DownloadCloud } from 'lucide-react';

function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}

function PWAPrompt() {
  const theme = useTheme();
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log(`SW registered: ${r}`);
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
      <Snackbar
        open={offlineReady}
        onClose={close}
        autoHideDuration={4000}
        TransitionComponent={TransitionUp}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
            border: `1px solid ${theme.palette.success.light}`,
            color: theme.palette.text.primary
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
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>Ready for Offline</Typography>
            <Typography variant="caption" color="text.secondary">App cached successfully.</Typography>
          </Box>
          <IconButton size="small" onClick={close}>
            <X size={16} />
          </IconButton>
        </Paper>
      </Snackbar>

      {/* --- 2. NEW VERSION UPDATE TOAST --- */}
      <Snackbar
        open={needRefresh}
        onClose={close}
        TransitionComponent={TransitionUp}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: { xs: 90, md: 40 } }} // Move up on mobile to avoid nav bar
      >
        <Paper 
          elevation={6}
          sx={{ 
            p: 2, 
            borderRadius: 3, 
            bgcolor: theme.palette.mode === 'dark' ? '#1E293B' : '#fff',
            border: `1px solid ${theme.palette.primary.main}`,
            maxWidth: 350
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              bgcolor: theme.palette.primary.main, 
              color: '#fff',
              display: 'flex'
            }}>
              <DownloadCloud size={20} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>Update Available</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                A new version of FlameCore is available. Reload to apply changes.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleReload}
                  startIcon={<RefreshCw size={14} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Reload Now
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={close}
                  sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary' }}
                >
                  Dismiss
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