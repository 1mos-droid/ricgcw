import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// --- PAGE IMPORTS ---
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import Attendance from '../pages/Attendance';
import Financials from '../pages/Financials';
import Events from '../pages/Events';
import Reports from '../pages/Reports';
import UserManagement from '../pages/UserManagement';
import QuickSwitch from '../pages/QuickSwitch';
import Help from '../pages/Help';
import Settings from '../pages/Settings';
import BibleStudies from '../pages/BibleStudies';
import Graph from '../pages/Graph';
import Login from '../pages/Login'; // 🟢 Added

// --- ANIMATION CONFIGURATION ---
// "CareOS" Feel: Fast, snappy, subtle fade-up
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8, // Subtle lift
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -8, // Subtle drop
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.25, // Snappy response
};

// Wrapper Component to apply animations automatically
const MotionWrap = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    style={{ width: '100%' }} // Removing fixed height prevents double scrollbars
  >
    {children}
  </motion.div>
);

// 🟢 NEW: Authentication Guard
const RequireAuth = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  const location = useLocation();
  
  return (
    // AnimatePresence is required for exit animations to work
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<MotionWrap><Login /></MotionWrap>} />

        {/* Protected Routes */}
        <Route path="/" element={<RequireAuth><MotionWrap><Dashboard /></MotionWrap></RequireAuth>} />
        <Route path="/members" element={<RequireAuth><MotionWrap><Members /></MotionWrap></RequireAuth>} />
        <Route path="/attendance" element={<RequireAuth><MotionWrap><Attendance /></MotionWrap></RequireAuth>} />
        <Route path="/financials" element={<RequireAuth><MotionWrap><Financials /></MotionWrap></RequireAuth>} />
        <Route path="/events" element={<RequireAuth><MotionWrap><Events /></MotionWrap></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><MotionWrap><Reports /></MotionWrap></RequireAuth>} />
        
        {/* Utility Pages */}
        <Route path="/user-management" element={<RequireAuth><MotionWrap><UserManagement /></MotionWrap></RequireAuth>} />
        <Route path="/quick-switch" element={<RequireAuth><MotionWrap><QuickSwitch /></MotionWrap></RequireAuth>} />
        <Route path="/help" element={<RequireAuth><MotionWrap><Help /></MotionWrap></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><MotionWrap><Settings /></MotionWrap></RequireAuth>} />
        <Route path="/bible-studies" element={<RequireAuth><MotionWrap><BibleStudies /></MotionWrap></RequireAuth>} />
        <Route path="/graph" element={<RequireAuth><MotionWrap><Graph /></MotionWrap></RequireAuth>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;