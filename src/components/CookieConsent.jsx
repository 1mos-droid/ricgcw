import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Link as MuiLink, useTheme, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'ricgcw_cookie_consent';

const CookieConsent = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it smoothly slides in after page loads
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      level,
      date: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          component={motion.div}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 'auto' },
            maxWidth: { sm: 520 },
            zIndex: 9999,
            p: { xs: 2.5, sm: 3 },
            borderRadius: '12px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 16px 36px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4)'
              : '0 16px 36px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06)'
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Cookie size={18} />
                </Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ letterSpacing: '-0.01em', textTransform: 'none', fontSize: '0.9rem' }}>
                  Cookie & Privacy Preferences
                </Typography>
              </Stack>
              <Box
                component="button"
                onClick={() => handleConsent('essential')}
                aria-label="Dismiss cookie banner"
                sx={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  p: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { color: 'text.primary' }
                }}
              >
                <X size={16} />
              </Box>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem', lineHeight: 1.55 }}>
              We use essential cookies and storage to maintain your authenticated session, remember display preferences, and ensure reliable church administrative operations. Read our{' '}
              <MuiLink component={Link} to="/privacy-policy" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Privacy Policy
              </MuiLink>{' '}
              and{' '}
              <MuiLink component={Link} to="/terms-of-service" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Terms of Service
              </MuiLink>.
            </Typography>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleConsent('essential')}
                sx={{
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  py: 0.75,
                  px: 2,
                  borderColor: theme.palette.divider,
                  color: 'text.primary',
                  textTransform: 'none',
                  '&:hover': { borderColor: 'text.secondary', bgcolor: alpha(theme.palette.text.primary, 0.04) }
                }}
              >
                Essential Only
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleConsent('all')}
                sx={{
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  py: 0.75,
                  px: 2.25,
                  bgcolor: 'primary.main',
                  boxShadow: 'none',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
                }}
              >
                Accept All
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
