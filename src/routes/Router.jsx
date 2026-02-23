import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// --- PAGE IMPORTS (Lazy Loaded) ---
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Members = lazy(() => import('../pages/Members'));
const Attendance = lazy(() => import('../pages/Attendance'));
const Financials = lazy(() => import('../pages/Financials'));
const Events = lazy(() => import('../pages/Events'));
const Reports = lazy(() => import('../pages/Reports'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const QuickSwitch = lazy(() => import('../pages/QuickSwitch'));
const Help = lazy(() => import('../pages/Help'));
const Settings = lazy(() => import('../pages/Settings'));
const BibleStudies = lazy(() => import('../pages/BibleStudies'));
const Graph = lazy(() => import('../pages/Graph'));
const Login = lazy(() => import('../pages/Login'));

// --- ANIMATION CONFIGURATION ---
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.25,
};

const MotionWrap = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress size={40} />
  </Box>
);

// 🟢 Unified Authentication & Authorization Guards
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RequireRole = ({ roles, children }) => {
  const { user, hasRole, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user || !hasRole(roles)) {
    return <Navigate to="/" replace />; // Unauthorized: back to dashboard
  }
  return children;
};

const AppRouter = () => {
  const location = useLocation();
  
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<MotionWrap><Login /></MotionWrap>} />
          
          {/* Protected Routes (Authenticated) */}
          <Route path="/" element={<RequireAuth><MotionWrap><Dashboard /></MotionWrap></RequireAuth>} />
          <Route path="/members" element={<RequireAuth><MotionWrap><Members /></MotionWrap></RequireAuth>} />
          <Route path="/attendance" element={<RequireAuth><MotionWrap><Attendance /></MotionWrap></RequireAuth>} />
          <Route path="/financials" element={<RequireAuth><MotionWrap><Financials /></MotionWrap></RequireAuth>} />
          <Route path="/events" element={<RequireAuth><MotionWrap><Events /></MotionWrap></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><MotionWrap><Reports /></MotionWrap></RequireAuth>} />
          <Route path="/bible-studies" element={<RequireAuth><MotionWrap><BibleStudies /></MotionWrap></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><MotionWrap><Settings /></MotionWrap></RequireAuth>} />
          <Route path="/help" element={<RequireAuth><MotionWrap><Help /></MotionWrap></RequireAuth>} />

          {/* Admin Restricted Routes */}
          <Route 
            path="/user-management" 
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <MotionWrap><UserManagement /></MotionWrap>
                </RequireRole>
              </RequireAuth>
            } 
          />
          <Route 
            path="/quick-switch" 
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <MotionWrap><QuickSwitch /></MotionWrap>
                </RequireRole>
              </RequireAuth>
            } 
          />
          <Route 
            path="/graph" 
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <MotionWrap><Graph /></MotionWrap>
                </RequireRole>
              </RequireAuth>
            } 
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default AppRouter;