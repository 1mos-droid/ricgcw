import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Download, Smartphone, Computer, Share } from 'lucide-react';

export default function InstallButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      setShowDialog(true);
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleInstallClick}
        startIcon={<Download />}
        sx={{
          mr: 2,
          bgcolor: 'primary.main',
          color: 'white',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        Install App
      </Button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Install RICGCW CMS</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Choose your device:
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon><Computer /></ListItemIcon>
              <ListItemText 
                primary="Desktop (Chrome/Edge)"
                secondary="Click the install icon in the right side of the address bar"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Smartphone /></ListItemIcon>
              <ListItemText 
                primary="Android"
                secondary="Chrome menu → 'Install app' or 'Add to Home Screen'"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Share /></ListItemIcon>
              <ListItemText 
                primary="iPhone/iPad"
                secondary="Safari → Share button → 'Add to Home Screen'"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
