import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

function App() {
  return (
    <ThemeConfig>
      <ScrollToTop />
      <AppLayout>
        <AppRouter />
      </AppLayout>
      <PWAPrompt />
    </ThemeConfig>
  );
}

export default App;