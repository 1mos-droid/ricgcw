import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  styled, 
  useTheme, 
  CssBaseline, 
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Grid,
  alpha,
  Avatar,
  Toolbar
} from '@mui/material';
import { motion } from 'framer-motion';

import { useColorMode } from '../theme';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import EventsGateway from './layout/EventsGateway';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import ImageIcon from '@mui/icons-material/Image';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import TerminalIcon from '@mui/icons-material/Terminal';

// New Components
import SidebarNav from './layout/SidebarNav';
import TopAppBar from './layout/TopAppBar';

const drawerWidth = 280; 

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3, 2, 12, 2), // Mobile padding (extra bottom for nav)
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4, 4, 6, 4),
      marginLeft: open ? 0 : 0,
      width: `calc(100% - ${open ? drawerWidth : 0}px)`,
    },
  }),
);

const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Members', icon: <PeopleIcon />, path: '/members' },
  { text: 'Attendance', icon: <EventNoteIcon />, path: '/attendance' },
  { text: 'Financials', icon: <AccountBalanceWalletIcon />, path: '/financials' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
  { text: 'Bible Studies', icon: <MenuBookIcon />, path: '/bible-studies' },
  { text: 'Live Bible', icon: <MenuBookIcon />, path: '/live-bible' },
  { text: 'Gallery', icon: <ImageIcon />, path: '/gallery' },
  { text: 'Reports', icon: <DescriptionIcon />, path: '/reports' },
  { text: 'Graph', icon: <BarChartIcon />, path: '/graph' },
  { text: 'Users', icon: <SupervisedUserCircleIcon />, path: '/user-management' },
  { text: 'Quick Switch', icon: <SwapHorizIcon />, path: '/quick-switch' },
  { text: 'Developer', icon: <TerminalIcon />, path: '/developer' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Help', icon: <HelpCenterIcon />, path: '/help' },
];

const MobileMoreMenu = ({ open, onClose, theme, navigate, filteredNavItems, location }) => (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(30px)',
          backgroundImage: 'none',
          maxHeight: '80vh',
          p: 3,
          pb: 12
        }
      }}
    >
      <Box sx={{ width: 36, height: 4, bgcolor: theme.palette.divider, borderRadius: 1, mx: 'auto', mb: 3 }} />
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, px: 1, fontSize: '1.1rem' }}>Explore</Typography>
      
      <Grid container spacing={2}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Grid size={{ xs: 4 }} key={item.text}>
              <Box
                component={motion.div}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: isActive ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.04),
                    color: isActive ? '#fff' : theme.palette.text.primary,
                    width: 44, height: 44, borderRadius: 2
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography variant="caption" fontWeight={600} align="center" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {item.text}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Drawer>
  );

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { userRole, workspace, currentDepartment } = useWorkspace(); 
  
  const STANDALONE_PATHS = [
    '/login',
    '/join',
    '/checkin',
    '/maintenance',
    '/privacy-policy',
    '/privacy',
    '/delete-account',
    '/account-deletion',
    '/data-deletion'
  ];
  const isStandalonePage = STANDALONE_PATHS.includes(location.pathname);

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (userRole === 'developer') return true;
    if (userRole === 'admin' || userRole === 'branch_admin') {
      return item.path !== '/developer';
    }
    const memberAllowedPaths = ['/', '/events', '/bible-studies', '/live-bible', '/gallery', '/settings', '/help'];
    return memberAllowedPaths.includes(item.path);
  });

  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [showEventsGate, setShowEventsGate] = useState(false);

  // Inactivity timeout: auto-logout after 15 minutes of user inactivity
  useSessionTimeout({
    timeoutMs: 15 * 60 * 1000, 
    onTimeout: () => {
      logout();
      sessionStorage.removeItem('ricgcw_has_seen_events');
      navigate('/login');
    },
    isEnabled: !!user && !isStandalonePage
  });

  // Controls displaying the upcoming events gateway screen post-login
  useEffect(() => {
    if (user && !isStandalonePage) {
      const hasSeen = sessionStorage.getItem('ricgcw_has_seen_events');
      if (!hasSeen) {
        setShowEventsGate(true);
      }
    } else {
      setShowEventsGate(false);
    }
  }, [user, isStandalonePage]);

  const handleDismissEventsGate = () => {
    sessionStorage.setItem('ricgcw_has_seen_events', 'true');
    setShowEventsGate(false);
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('ricgcw_has_seen_events');
    handleClose();
    navigate('/login');
  };

  useEffect(() => {
    if (isMobile) {
      setOpen(false); 
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const filteredBottomNavItems = useMemo(() => [
    { text: 'Home', icon: <DashboardIcon />, path: '/' },
    ...(userRole === 'admin' || userRole === 'branch_admin' || userRole === 'developer' 
      ? [
          { text: 'Members', icon: <PeopleIcon />, path: '/members' },
          { text: 'Finance', icon: <AccountBalanceWalletIcon />, path: '/financials' }
        ]
      : [
          { text: 'Bible', icon: <MenuBookIcon />, path: '/live-bible' },
          { text: 'Help', icon: <HelpCenterIcon />, path: '/help' }
        ]
    ),
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'More', icon: <MenuIcon />, path: '/settings' }, 
  ], [userRole]);

  const [bottomNavValue, setBottomNavValue] = useState(location.pathname);
  useEffect(() => {
    const currentPath = location.pathname;
    const matched = filteredBottomNavItems.find(item => item.path === currentPath);
    if (matched && currentPath !== '/settings') {
      setBottomNavValue(currentPath);
    } else if (currentPath === '/settings' || !matched) {
      setBottomNavValue('/settings');
    }
  }, [location.pathname, filteredBottomNavItems]);

  if (isStandalonePage) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', bgcolor: theme.palette.background.default }}>
        <CssBaseline />
        <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>{children}</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      
      {/* Upcoming Events Post-Login gateway */}
      <EventsGateway open={showEventsGate} onProceed={handleDismissEventsGate} />
      
      <TopAppBar 
        open={open}
        isMobile={isMobile}
        workspace={workspace}
        currentDepartment={currentDepartment}
        user={user}
        onProfileClick={handleMenu}
      />

      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }} 
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mb: 1, width: 220, borderRadius: 1, boxShadow: theme.shadows[8], mt: 1.5 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>My Account</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email || 'Manage preferences'}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleClose} sx={{ py: 1.5, px: 2 }}>Profile & Security</MenuItem>
        <MenuItem onClick={toggleColorMode} sx={{ py: 1.5, px: 2 }}>
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main, fontWeight: 600, py: 1.5, px: 2 }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      {!isMobile && (
        <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0 }}>
            <Drawer 
                variant="persistent"
                anchor="left" 
                open={open} 
                PaperProps={{
                  sx: {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    border: 'none',
                    borderRight: '1px solid var(--border-color)',
                    borderRadius: 0,
                    boxShadow: 'none',
                    background: 'var(--bg-paper)'
                  }
                }}
            >
                <SidebarNav 
                  navItems={filteredNavItems}
                  user={user}
                  userRole={userRole}
                  onProfileClick={handleMenu}
                />
            </Drawer>
        </Box>
      )}

      {isMobile && (
          <>
          <Paper 
            sx={{ 
                position: 'fixed', 
                bottom: 12, 
                left: 12, 
                right: 12, 
                zIndex: theme.zIndex.drawer + 2,
                borderRadius: '16px',
                background: 'transparent',
                boxShadow: 'none'
            }} 
            elevation={0}
          >
             <BottomNavigation
                showLabels
                value={bottomNavValue}
                onChange={(event, newValue) => {
                    if (newValue === '/settings') {
                        setMoreOpen(true);
                    } else {
                        setBottomNavValue(newValue);
                        navigate(newValue);
                    }
                }}
                sx={{
                  borderRadius: '16px',
                  background: 'var(--bg-paper)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
                  height: 60,
                  '& .MuiBottomNavigationAction-root': {
                    color: 'var(--text-secondary)',
                    transition: 'color 0.15s ease',
                    minWidth: 'auto',
                    padding: '4px 0',
                    '&.Mui-selected': {
                      color: 'var(--system-blue)',
                      fontWeight: 600,
                      '& .MuiSvgIcon-root': {
                        transform: 'none',
                        filter: 'none',
                      }
                    }
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.3rem',
                    transition: 'none',
                  }
                }}
             >
                {filteredBottomNavItems.map((item) => (
                    <BottomNavigationAction 
                        key={item.text} 
                        label={item.text} 
                        value={item.path} 
                        icon={item.icon} 
                    />
                ))}
             </BottomNavigation>
          </Paper>
          <MobileMoreMenu 
            open={moreOpen} 
            onClose={() => setMoreOpen(false)} 
            theme={theme}
            navigate={navigate}
            filteredNavItems={filteredNavItems}
            location={location}
          />
          </>
      )}

      <Main open={open}>
        <Toolbar sx={{ height: { xs: 70, md: 90 } }} /> {/* Spacer */}
        {children}
      </Main>
    </Box>
  );
};

export default AppLayout;
