import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Box, CircularProgress } from '@mui/material';

// Component Imports
import AppRouter from './routes/Router';
import Layout from './components/Layout';
import ThemeConfig from './theme.jsx';

// Helper: Resets view to top on page change (Polished feel)
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
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
      {isNavigating && (
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
            backgroundColor: '#ffffff',
            zIndex: 9999,
          }}
        >
          <Box
            component="img"
            src="/ricgcw.png"
            alt="RICGCW Logo"
            sx={{
              width: 100,
              height: 'auto',
              mb: 4,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <CircularProgress size={40} sx={{ color: '#1976d2' }} />
        </Box>
      )}
      <Layout>
        <AnimatePresence mode="wait">
          <AppRouter key={location.pathname} />
        </AnimatePresence>
      </Layout>
    </ThemeConfig>
  );
}

export default App;