import { useState, useEffect, useCallback } from 'react';
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
import { useRegisterSW } from 'virtual:pwa-register/react';

function SlideUp(props) {
  return <Slide {...props} direction="up" />;
}

export default function PWAPrompt() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  let offlineReady = false;
  let needRefresh = false;
  let updateServiceWorker = null;

  try {
    const sw = useRegisterSW({
      onRegistered(r) {
        console.log('Service Worker Registered');
      },
      onRegisterError(error) {
        console.error('SW registration error', error);
      },
    });
    if (sw) {
      offlineReady = sw.offlineReady?.[0] ?? false;
      needRefresh = sw.needRefresh?.[0] ?? false;
      updateServiceWorker = sw.updateServiceWorker;
    }
  } catch (e) {
    console.warn('PWA registerSW error:', e);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPromptEvent) return;

    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;

    if (outcome === 'accepted') {
      setShowInstall(false);
    }

    setInstallPromptEvent(null);
  }, [installPromptEvent]);

  const close = useCallback(() => {
    setShowInstall(false);
  }, []);

  const handleReload = useCallback(() => {
    if (updateServiceWorker) {
      updateServiceWorker(true);
    }
  }, [updateServiceWorker]);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <Snackbar
        open={offlineReady}
        onClose={close}
        autoHideDuration={4000}
        TransitionComponent={SlideUp}
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

      <Snackbar
        open={needRefresh}
        onClose={close}
        TransitionComponent={SlideUp}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right'
        }}
        sx={{
          bottom: { xs: 20, md: 30 },
          right: { md: 30 },
          width: { xs: '90%', md: 'auto' }
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
                A new version of the app is available. Reload to apply changes.
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

      <Snackbar
        open={showInstall && !needRefresh && !offlineReady}
        onClose={close}
        TransitionComponent={SlideUp}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right'
        }}
        sx={{
          bottom: { xs: 20, md: 30 },
          right: { md: 30 }
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
                Install App
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 0.5, lineHeight: 1.5 }}>
                Install RICGCW CMS on your device for a better experience.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={close}
                  sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: theme.palette.divider }}
                >
                  Not Now
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleInstall}
                  startIcon={<DownloadCloud size={14} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
                >
                  Install
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Snackbar>
    </>
  );
}
