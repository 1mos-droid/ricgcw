import { useState, useEffect } from 'react';
import { Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import { Download } from 'lucide-react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowDialog(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <Tooltip title="Install App">
        <Button
          variant="outlined"
          size="small"
          onClick={handleInstallClick}
          startIcon={<Download size={18} />}
          sx={{
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'white',
            textTransform: 'none',
            mr: 1,
            '&:hover': {
              borderColor: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          Install
        </Button>
      </Tooltip>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Install RICGCW CMS</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To install this app on your device:
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <li><Typography variant="body2">Chrome/Edge: Click the install icon in the address bar</Typography></li>
            <li><Typography variant="body2">Safari (iOS): Tap Share → Add to Home Screen</Typography></li>
            <li><Typography variant="body2">Menu (Android): Tap ⋮ → Install App</Typography></li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
