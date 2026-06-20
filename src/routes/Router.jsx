import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

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
const LiveBible = lazy(() => import('../pages/LiveBible'));
const Graph = lazy(() => import('../pages/Graph'));
const Login = lazy(() => import('../pages/Login'));
const Developer = lazy(() => import('../pages/Developer'));
const Maintenance = lazy(() => import('../pages/Maintenance'));
const SelfCheckIn = lazy(() => import('../pages/SelfCheckIn'));
const Join = lazy(() => import('../pages/Join'));
const Gallery = lazy(() => import('../pages/Gallery'));

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
  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
    {/* Welcome Banner Skeleton */}
    <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '12px', width: '100%' }} />

    {/* Cards Row Skeleton */}
    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Box key={idx} sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '12px', width: '100%' }} />
        </Box>
      ))}
    </Box>

    {/* Activity/Feed Row Skeleton */}
    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{ flex: { xs: 1, md: 2 } }}>
        <Skeleton variant="rectangular" height={260} sx={{ borderRadius: '12px', width: '100%' }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="rectangular" height={260} sx={{ borderRadius: '12px', width: '100%' }} />
      </Box>
    </Box>
  </Box>
);

// 🟢 Unified Authentication & Authorization Guards
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading, user: originalUser } = useAuth();
  const { maintenance } = useWorkspace();
  const location = useLocation();
  
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Maintenance Guard: ONLY users with the 'developer' role can bypass maintenance mode
  const isDeveloper = originalUser?.role === 'developer';
  if (maintenance?.active && !isDeveloper && location.pathname !== '/maintenance') {
    return <Navigate to="/maintenance" replace />;
  }

  // Prevent accessing maintenance page if not in maintenance mode (except for testing)
  if (!maintenance?.active && location.pathname === '/maintenance') {
    return <Navigate to="/" replace />;
  }

  return children;
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
        <Route path="/maintenance" element={<MotionWrap><Maintenance /></MotionWrap>} />
        <Route path="/checkin" element={<MotionWrap><SelfCheckIn /></MotionWrap>} />
        <Route path="/join" element={<MotionWrap><Join /></MotionWrap>} />
        
        {/* Protected Routes (Authenticated) */}
        <Route path="/" element={<RequireAuth><MotionWrap><Dashboard /></MotionWrap></RequireAuth>} />
        <Route path="/members" element={<RequireAuth><MotionWrap><Members /></MotionWrap></RequireAuth>} />
        <Route path="/attendance" element={<RequireAuth><MotionWrap><Attendance /></MotionWrap></RequireAuth>} />
        <Route path="/financials" element={<RequireAuth><MotionWrap><Financials /></MotionWrap></RequireAuth>} />
        <Route path="/events" element={<RequireAuth><MotionWrap><Events /></MotionWrap></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><MotionWrap><Reports /></MotionWrap></RequireAuth>} />
        <Route path="/bible-studies" element={<RequireAuth><MotionWrap><BibleStudies /></MotionWrap></RequireAuth>} />
        <Route path="/live-bible" element={<RequireAuth><MotionWrap><LiveBible /></MotionWrap></RequireAuth>} />
        <Route path="/gallery" element={<RequireAuth><MotionWrap><Gallery /></MotionWrap></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><MotionWrap><Settings /></MotionWrap></RequireAuth>} />
        <Route path="/help" element={<RequireAuth><MotionWrap><Help /></MotionWrap></RequireAuth>} />

        {/* Admin Restricted Routes */}
        <Route 
          path="/user-management" 
          element={
            <RequireAuth>
              <RequireRole roles={['admin', 'branch_admin', 'developer']}>
                <MotionWrap><UserManagement /></MotionWrap>
              </RequireRole>
            </RequireAuth>
          } 
        />
        <Route 
          path="/developer" 
          element={
            <RequireAuth>
              <RequireRole roles={['developer']}>
                <MotionWrap><Developer /></MotionWrap>
              </RequireRole>
            </RequireAuth>
          } 
        />
        <Route 
          path="/quick-switch" 
          element={
            <RequireAuth>
              <RequireRole roles={['admin', 'branch_admin', 'developer']}>
                <MotionWrap><QuickSwitch /></MotionWrap>
              </RequireRole>
            </RequireAuth>
          } 
        />
        <Route 
          path="/graph" 
          element={
            <RequireAuth>
              <RequireRole roles={['admin', 'branch_admin', 'developer']}>
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