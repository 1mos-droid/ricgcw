import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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

  return (
    <ThemeConfig>
      <ScrollToTop />
      <Layout>
        <AnimatePresence mode="wait">
          <AppRouter key={location.pathname} />
        </AnimatePresence>
      </Layout>
    </ThemeConfig>
  );
}

export default App;