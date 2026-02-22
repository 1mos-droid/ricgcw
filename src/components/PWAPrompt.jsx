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
  useMediaQuery,
  alpha
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
      window.navigator.standalone === true;
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
          elevation={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2.5,
            py: 2,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${theme.palette.success.light}`,
            backdropFilter: 'blur(10px)',
            color: theme.palette.text.primary,
            minWidth: 300,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
          }}
        >
          <Box sx={{
            p: 1,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
            display: 'flex'
          }}>
            <Wifi size={20} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={800}>Ready for Offline</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>App cached successfully.</Typography>
          </Box>
          <IconButton size="small" onClick={close} sx={{ color: theme.palette.text.secondary }}>
            <X size={18} />
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
          elevation={12}
          sx={{
            p: 3,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${theme.palette.primary.light}`,
            maxWidth: { xs: '100%', md: 400 },
            width: '100%',
            boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.15)}`
          }}
        >
          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              mt: 0.5
            }}>
              <DownloadCloud size={24} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Update Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1, lineHeight: 1.5, fontWeight: 500 }}>
                A new version of the app is available. Reload to apply changes.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={close}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: theme.palette.text.secondary }}
                >
                  Dismiss
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleReload}
                  startIcon={<RefreshCw size={16} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, boxShadow: theme.shadows[4] }}
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
          elevation={12}
          sx={{
            p: 3,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${theme.palette.primary.light}`,
            maxWidth: { xs: '100%', md: 400 },
            width: '100%',
            boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.15)}`
          }}
        >
          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              mt: 0.5
            }}>
              <DownloadCloud size={24} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Install App
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1, lineHeight: 1.5, fontWeight: 500 }}>
                Install RICGCW CMS on your device for a better experience.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={close}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: theme.palette.text.secondary }}
                >
                  Not Now
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleInstall}
                  startIcon={<DownloadCloud size={16} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, boxShadow: theme.shadows[4] }}
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
