import { useState, useEffect } from 'react';
import { Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, useTheme } from '@mui/material';
import { Download } from 'lucide-react';

export default function InstallButton() {
  const theme = useTheme();
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

  const isDark = theme.palette.mode === 'dark';
  const buttonColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
  const buttonHoverColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? 'white' : 'text.primary';

  return (
    <>
      <Tooltip title="Install App">
        <Button
          variant="outlined"
          size="small"
          onClick={handleInstallClick}
          startIcon={<Download size={18} />}
          sx={{
            borderColor: buttonColor,
            color: textColor,
            textTransform: 'none',
            mr: 1,
            fontWeight: 500,
            '&:hover': {
              borderColor: textColor,
              bgcolor: buttonHoverColor,
            },
          }}
        >
          Install App
        </Button>
      </Tooltip>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Install RICGCW CMS</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To install this app on your device:
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <li><Typography variant="body2" sx={{ mb: 1 }}>Chrome (Desktop): Look for install icon in the address bar (right side)</Typography></li>
            <li><Typography variant="body2" sx={{ mb: 1 }}>Chrome (Android): Tap menu (⋮) → "Install app" or "Add to Home Screen"</Typography></li>
            <li><Typography variant="body2" sx={{ mb: 1 }}>Safari (iPhone/iPad): Tap Share button → "Add to Home Screen"</Typography></li>
            <li><Typography variant="body2">Edge (Desktop): Look for install icon in the address bar</Typography></li>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Note: Install prompts require the app to be served over HTTPS.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
