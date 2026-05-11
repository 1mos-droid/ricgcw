import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Box, CircularProgress, useTheme, alpha, Typography } from '@mui/material';

// Component Imports
import AppRouter from './routes/Router';
import AppLayout from './components/Layout';
import ThemeConfig from './theme.jsx';
import PWAPrompt from './components/PWAPrompt';

// Helper: Resets view to top on page change (Polished feel)
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const LoadingScreen = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 160,
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4
        }}
      >
        <CircularProgress 
          size={160} 
          thickness={1.5} 
          sx={{ 
            position: 'absolute',
            color: alpha(theme.palette.primary.main, 0.15),
          }} 
        />
        <CircularProgress 
          size={160} 
          thickness={1.5} 
          variant="indeterminate"
          sx={{ 
            position: 'absolute',
            color: theme.palette.primary.main,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }} 
        />
        <Box
          component="img"
          src="/ricgcw.png"
          alt="RICGCW Logo"
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            p: 1.5,
            bgcolor: '#fff',
            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            objectFit: 'contain'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 2, color: theme.palette.primary.main, opacity: 0.6 }}>
        CONNECTING...
      </Typography>
    </Box>
  );
};

function App() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPath = React.useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      setIsNavigating(true);
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <ThemeConfig>
      <ScrollToTop />
      {isNavigating && <LoadingScreen />}
      <AppLayout>
        <AppRouter />
      </AppLayout>
      <PWAPrompt />
    </ThemeConfig>
  );
}

export default App;