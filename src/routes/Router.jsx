import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

const AppRouter = () => {
  const location = useLocation();
  
  return (
    // AnimatePresence is required for exit animations to work
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MotionWrap><Dashboard /></MotionWrap>} />
        <Route path="/members" element={<MotionWrap><Members /></MotionWrap>} />
        <Route path="/attendance" element={<MotionWrap><Attendance /></MotionWrap>} />
        <Route path="/financials" element={<MotionWrap><Financials /></MotionWrap>} />
        <Route path="/events" element={<MotionWrap><Events /></MotionWrap>} />
        <Route path="/reports" element={<MotionWrap><Reports /></MotionWrap>} />
        
        {/* Utility Pages */}
        <Route path="/user-management" element={<MotionWrap><UserManagement /></MotionWrap>} />
        <Route path="/quick-switch" element={<MotionWrap><QuickSwitch /></MotionWrap>} />
        <Route path="/help" element={<MotionWrap><Help /></MotionWrap>} />
        <Route path="/settings" element={<MotionWrap><Settings /></MotionWrap>} />
        <Route path="/bible-studies" element={<MotionWrap><BibleStudies /></MotionWrap>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;