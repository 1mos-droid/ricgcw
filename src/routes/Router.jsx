import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import BrandLoader from '../components/BrandLoader';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import VerifyEmailGate from '../components/VerifyEmailGate';

// Roles allowed to open pages backed by staff-only data (see firestore.rules).
const STAFF_ROLES = ['admin', 'branch_admin', 'developer'];

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
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const AccountDeletion = lazy(() => import('../pages/AccountDeletion'));

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

const PageLoader = BrandLoader;

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

  // A staff role stays locked until the email address behind it is verified
  if (originalUser?.needsEmailVerification) return <VerifyEmailGate />;

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
        <Route path="/privacy-policy" element={<MotionWrap><PrivacyPolicy /></MotionWrap>} />
        <Route path="/privacy" element={<MotionWrap><PrivacyPolicy /></MotionWrap>} />
        <Route path="/terms-of-service" element={<MotionWrap><TermsOfService /></MotionWrap>} />
        <Route path="/terms" element={<MotionWrap><TermsOfService /></MotionWrap>} />
        <Route path="/delete-account" element={<MotionWrap><AccountDeletion /></MotionWrap>} />
        <Route path="/account-deletion" element={<MotionWrap><AccountDeletion /></MotionWrap>} />
        <Route path="/data-deletion" element={<MotionWrap><AccountDeletion /></MotionWrap>} />
        
        {/* Protected Routes (Authenticated) */}
        <Route path="/" element={<RequireAuth><MotionWrap><Dashboard /></MotionWrap></RequireAuth>} />
        <Route path="/members" element={<RequireAuth><RequireRole roles={STAFF_ROLES}><MotionWrap><Members /></MotionWrap></RequireRole></RequireAuth>} />
        <Route path="/attendance" element={<RequireAuth><RequireRole roles={STAFF_ROLES}><MotionWrap><Attendance /></MotionWrap></RequireRole></RequireAuth>} />
        <Route path="/financials" element={<RequireAuth><RequireRole roles={STAFF_ROLES}><MotionWrap><Financials /></MotionWrap></RequireRole></RequireAuth>} />
        <Route path="/events" element={<RequireAuth><MotionWrap><Events /></MotionWrap></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><RequireRole roles={STAFF_ROLES}><MotionWrap><Reports /></MotionWrap></RequireRole></RequireAuth>} />
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
              <RequireRole roles={STAFF_ROLES}>
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
              <RequireRole roles={STAFF_ROLES}>
                <MotionWrap><QuickSwitch /></MotionWrap>
              </RequireRole>
            </RequireAuth>
          } 
        />
        <Route 
          path="/graph" 
          element={
            <RequireAuth>
              <RequireRole roles={STAFF_ROLES}>
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
