import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  styled, 
  useTheme, 
  CssBaseline, 
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Stack,
  InputBase,
  alpha,
  Tooltip,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Grid
} from '@mui/material';

import { useColorMode } from '../theme';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import TerminalIcon from '@mui/icons-material/Terminal';
import InstallButton from './InstallButton';

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

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: 'none',
    borderBottom: 'none',
    backgroundColor: alpha(theme.palette.background.default, 0.7),
    backdropFilter: 'blur(24px)',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${open ? drawerWidth : 0}px)`,
      marginLeft: open ? drawerWidth : 0,
    },
  }),
);

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 40,
  backgroundColor: theme.palette.mode === 'light' 
    ? alpha(theme.palette.common.black, 0.03) 
    : alpha(theme.palette.common.white, 0.03),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' 
      ? alpha(theme.palette.common.black, 0.05) 
      : alpha(theme.palette.common.white, 0.05),
    transform: 'translateY(-1px)',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2.5),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(5)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.9rem',
    fontWeight: 600,
    [theme.breakpoints.up('md')]: {
      width: '32ch',
      '&:focus': {
        width: '40ch',
      },
    },
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 4),
  height: 100, 
  justifyContent: 'space-between',
}));

const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Members', icon: <PeopleIcon />, path: '/members' },
  { text: 'Attendance', icon: <EventNoteIcon />, path: '/attendance' },
  { text: 'Financials', icon: <AccountBalanceWalletIcon />, path: '/financials' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
  { text: 'Bible Studies', icon: <MenuBookIcon />, path: '/bible-studies' },
  { text: 'Live Bible', icon: <MenuBookIcon />, path: '/live-bible' },
  { text: 'Reports', icon: <DescriptionIcon />, path: '/reports' },
  { text: 'Graph', icon: <BarChartIcon />, path: '/graph' },
  { text: 'Users', icon: <SupervisedUserCircleIcon />, path: '/user-management' },
  { text: 'Quick Switch', icon: <SwapHorizIcon />, path: '/quick-switch' },
  { text: 'Developer', icon: <TerminalIcon />, path: '/developer' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Help', icon: <HelpCenterIcon />, path: '/help' },
];

// Bottom Nav Items (Subset for Mobile)
const BOTTOM_NAV_ITEMS = [
  { text: 'Home', icon: <DashboardIcon />, path: '/' },
  { text: 'Members', icon: <PeopleIcon />, path: '/members' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
  { text: 'Finance', icon: <AccountBalanceWalletIcon />, path: '/financials' },
  { text: 'More', icon: <MenuIcon />, path: '/settings' }, 
];

const MobileMoreMenu = ({ open, onClose, theme, navigate, filteredNavItems, location }) => (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          backgroundImage: 'none',
          maxHeight: '80vh',
          p: 3,
          pb: 12
        }
      }}
    >
      <Box sx={{ width: 40, height: 4, bgcolor: theme.palette.divider, borderRadius: 1, mx: 'auto', mb: 4 }} />
      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, px: 1 }}>Explore</Typography>
      
      <Grid container spacing={2}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Grid size={{ xs: 4 }} key={item.text}>
              <Box
                component={motion.div}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'all 0.2s'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: isActive ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.05),
                    color: isActive ? '#fff' : theme.palette.text.primary,
                    width: 50, height: 50, borderRadius: 2.5
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography variant="caption" fontWeight={700} align="center" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
  
  const isLoginPage = location.pathname === '/login';

  const filteredNavItems = NAV_ITEMS.filter(item => {
    // Developers see everything
    if (userRole === 'developer') return true;
    
    // Admins and Branch Admins see management but NOT developer tools
    if (userRole === 'admin' || userRole === 'branch_admin') {
      return item.path !== '/developer';
    }

    // Regular Members (Guests) - Restricted to Personal View and Content
    const memberAllowedPaths = ['/', '/events', '/bible-studies', '/live-bible', '/settings', '/help'];
    return memberAllowedPaths.includes(item.path);
  });

  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
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

  // Handle Bottom Nav Change
  const [bottomNavValue, setBottomNavValue] = useState(location.pathname);
  useEffect(() => {
    const currentPath = location.pathname;
    const matched = filteredBottomNavItems.find(item => item.path === currentPath);
    if (matched && currentPath !== '/settings') {
        setBottomNavValue(currentPath);
    } else if (currentPath === '/settings' || !matched) {
        setBottomNavValue('/settings'); // Use settings path as 'More' indicator
    }
  }, [location.pathname, filteredBottomNavItems]);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.paper }}>
      <DrawerHeader>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box
            component="img"
            src="/ricgcw.png"
            alt="RICGCW Logo"
            sx={{
              width: 56,
              height: 56,
              objectFit: 'contain',
              filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.primary.main, 0.4)})`
            }}
          />
          <Box>
            <Typography variant="h6" fontWeight={900} lineHeight={1} letterSpacing="-0.01em" sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
              RICGCW
            </Typography>
            <Typography variant="caption" color="primary" fontWeight={900} sx={{ letterSpacing: '0.05em', fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>
              Rhema Inner Court
            </Typography>
          </Box>
        </Stack>
      </DrawerHeader>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 3 }}>
        <Typography variant="subtitle2" sx={{ px: 2, mb: 2, opacity: 0.8, fontWeight: 900 }}>
          DASHBOARD
        </Typography>
        <List sx={{ mb: 4 }}>
          {filteredNavItems.slice(0, 1).map((item) => {
            const isActive = location.pathname === item.path;
            return (
               <ListItemButton 
                key={item.text}
                component={Link} 
                to={item.path} 
                selected={isActive}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main }
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 44, color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }}>
                   {React.cloneElement(item.icon, { strokeWidth: 2.5, size: 22 })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 900 : 700, 
                    fontSize: '0.95rem',
                    letterSpacing: '0.01em'
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>

        <Typography variant="subtitle2" sx={{ px: 2, mb: 2, opacity: 0.8, fontWeight: 900 }}>
          MINISTRY MANAGEMENT
        </Typography>
        <List>
           {filteredNavItems.slice(1).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton 
                key={item.text}
                component={Link} 
                to={item.path} 
                selected={isActive}
                sx={{
                  py: 1.6,
                  borderRadius: 3,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main }
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 44, color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }}>
                  {React.cloneElement(item.icon, { strokeWidth: 2.5, size: 22 })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 900 : 700, 
                    fontSize: '0.9rem',
                    letterSpacing: '0.01em'
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* User Profile in Sidebar Footer */}
      <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        {(userRole === 'admin' || userRole === 'developer') && (
           <Box 
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ 
              mb: 3, p: 2, borderRadius: 2.5, 
              background: userRole === 'developer' 
                ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(userRole === 'developer' ? theme.palette.secondary.main : theme.palette.primary.main, 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: userRole === 'developer' ? theme.palette.secondary.main : theme.palette.primary.main, color: '#fff' }}>
                <TerminalIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
                <Typography variant="caption" fontWeight={900} color={userRole === 'developer' ? "secondary" : "primary"} sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {localStorage.getItem('mimicData') ? 'Mimicking Mode' : 'Developer Console'}
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: theme.palette.text.primary }}>
                    {userRole === 'developer' ? 'Master Access' : 'Authorized'}
                </Typography>
            </Box>
          </Box>
        )}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            borderRadius: 3, 
            cursor: 'pointer',
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-2px)'
            }
          }}
          onClick={handleMenu}
        >
          <Badge 
            overlap="circular" 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={localStorage.getItem('mimicData') ? "warning" : "success"}
            sx={{ '& .MuiBadge-badge': { width: 14, height: 14, borderRadius: '50%', border: `3px solid ${theme.palette.background.paper}` } }}
          >
            <Avatar sx={{ 
                width: 48, height: 48, 
                bgcolor: theme.palette.primary.main, 
                fontSize: '1.1rem', fontWeight: 900,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Badge>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="subtitle2" fontWeight={900} noWrap sx={{ color: theme.palette.text.primary }}>{user?.name || 'User'}</Typography>
            <Typography variant="caption" color="primary" noWrap sx={{ display: 'block', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>{userRole}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (isLoginPage) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        <CssBaseline />
        <Box component="main" sx={{ flexGrow: 1 }}>{children}</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      
      {/* APP BAR (Only show on Desktop or if needed for mobile header info) */}
      <AppBarStyled position="fixed" open={open} elevation={0} color="inherit" sx={{ top: 0 }}>
        <Toolbar sx={{ height: { xs: 70, md: 90 }, justifyContent: 'space-between' }}>
            
          {/* Logo/Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
             {/* Only show logo on mobile here since desktop has sidebar */}
             {isMobile && (
                <Box
                    component="img"
                    src="/ricgcw.png"
                    alt="RICGCW Logo"
                    sx={{
                      width: 36,
                      height: 36,
                      mr: 2,
                      objectFit: 'contain',
                      filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.primary.main, 0.4)})`
                    }}
                />
             )}

             <Typography variant="h5" fontWeight={800} sx={{ display: { xs: 'none', md: 'block' }, mr: 4, fontFamily: '"Playfair Display", serif' }}>
               {workspace === 'main' ? 'Sanctuary' : currentDepartment}
             </Typography>
             
             {/* Mobile Title */}
             <Typography variant="h6" fontWeight={800} sx={{ display: { xs: 'block', md: 'none' }, fontFamily: 'Playfair Display' }}>
                RICGCW
             </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
             <Search>
                <SearchIconWrapper>
                  <SearchIcon fontSize="small" />
                </SearchIconWrapper>
                <StyledInputBase placeholder="Search anything..." inputProps={{ 'aria-label': 'search' }} />
             </Search>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            
            {/* Profile Avatar on Mobile Header */}
             <Box 
                sx={{ 
                    ml: 1,
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center',
                }}
                onClick={handleMenu}
            >
                <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.secondary.main, fontSize: '0.8rem', fontWeight: 700 }}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
            </Box>
          </Stack>

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
        </Toolbar>
      </AppBarStyled>

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0 }}>
            <Drawer 
                variant="persistent"
                anchor="left" 
                open={open} 
                sx={{ 
                '& .MuiDrawer-paper': { 
                    boxSizing: 'border-box', 
                    width: drawerWidth,
                    borderRight: 'none', 
                    backgroundColor: theme.palette.background.paper, 
                    boxShadow: theme.shadows[4]
                } 
                }}
            >
                {drawerContent}
            </Drawer>
        </Box>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      {isMobile && (
          <>
          <Paper 
            sx={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                zIndex: theme.zIndex.drawer + 2,
                borderRadius: 0,
                background: 'transparent',
                boxShadow: 'none'
            }} 
            elevation={3}
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