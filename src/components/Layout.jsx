import React, { useState, useEffect } from 'react';
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
    backgroundColor: alpha(theme.palette.background.default, 0.8),
    backdropFilter: 'blur(16px)',
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
  borderRadius: 16,
  backgroundColor: alpha(theme.palette.text.primary, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.06),
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
  padding: theme.spacing(0, 2),
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.9rem',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      width: '24ch',
    },
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 3),
  height: 90, 
  justifyContent: 'space-between',
}));

const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Members', icon: <PeopleIcon />, path: '/members' },
  { text: 'Attendance', icon: <EventNoteIcon />, path: '/attendance' },
  { text: 'Financials', icon: <AccountBalanceWalletIcon />, path: '/financials' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
  { text: 'Bible Studies', icon: <MenuBookIcon />, path: '/bible-studies' },
  { text: 'Reports', icon: <DescriptionIcon />, path: '/reports' },
  { text: 'Graph', icon: <BarChartIcon />, path: '/graph' },
  { text: 'Users', icon: <SupervisedUserCircleIcon />, path: '/user-management' },
  { text: 'Quick Switch', icon: <SwapHorizIcon />, path: '/quick-switch' },
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

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { userRole, workspace } = useWorkspace(); 
  
  const isLoginPage = location.pathname === '/login';

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (userRole === 'admin') return true;
    const restrictedPaths = ['/user-management', '/quick-switch', '/graph'];
    return !restrictedPaths.includes(item.path);
  });

  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userBranch');
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

  // Handle Bottom Nav Change
  const [bottomNavValue, setBottomNavValue] = useState(location.pathname);
  useEffect(() => {
    const currentPath = location.pathname;
    const matched = BOTTOM_NAV_ITEMS.find(item => item.path === currentPath);
    if (matched && currentPath !== '/settings') {
        setBottomNavValue(currentPath);
    } else if (currentPath === '/settings' || !matched) {
        setBottomNavValue('/settings'); // Use settings path as 'More' indicator
    }
  }, [location.pathname]);

  const MobileMoreMenu = () => (
    <Drawer
      anchor="bottom"
      open={moreOpen}
      onClose={() => setMoreOpen(false)}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          backgroundImage: 'none',
          maxHeight: '80vh',
          p: 3,
          pb: 12
        }
      }}
    >
      <Box sx={{ width: 40, height: 4, bgcolor: theme.palette.divider, borderRadius: 2, mx: 'auto', mb: 4 }} />
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
                  setMoreOpen(false);
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 4,
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'all 0.2s'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: isActive ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.05),
                    color: isActive ? '#fff' : theme.palette.text.primary,
                    width: 50, height: 50, borderRadius: 3
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

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.paper }}>
      <DrawerHeader>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box 
            sx={{ 
              width: 44, 
              height: 44, 
              borderRadius: '14px', 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: `0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.4)}`
            }}
          >
            R
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1} letterSpacing="-0.02em">RICGCW</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.05em">CMS v2.0</Typography>
          </Box>
        </Stack>
      </DrawerHeader>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ px: 2, mb: 1.5, display: 'block', fontWeight: 700, color: theme.palette.text.secondary, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
          Overview
        </Typography>
        <List sx={{ mb: 2 }}>
          {filteredNavItems.slice(0, 1).map((item) => {
            const isActive = location.pathname === item.path;
            return (
               <ListItemButton 
                key={item.text}
                component={Link} 
                to={item.path} 
                selected={isActive}
              >
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary, transition: 'color 0.2s' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500, 
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>

        <Typography variant="caption" sx={{ px: 2, mb: 1.5, display: 'block', fontWeight: 700, color: theme.palette.text.secondary, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
          Management
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
              >
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500, 
                    fontSize: '0.9rem'
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* User Profile in Sidebar Footer */}
      <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 1.5, 
            borderRadius: 4, 
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) }
          }}
          onClick={handleMenu}
        >
          <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.secondary.main, fontSize: '0.9rem', fontWeight: 700 }}>ND</Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>Rev. Nicholas Dobeng</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{userRole || 'Administrator'}</Typography>
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
                    sx={{ 
                    width: 36, 
                    height: 36, 
                    mr: 2,
                    borderRadius: '10px', 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: `0 4px 12px -2px ${alpha(theme.palette.primary.main, 0.4)}`
                    }}
                >
                    R
                </Box>
             )}

             <Typography variant="h5" fontWeight={800} sx={{ display: { xs: 'none', md: 'block' }, mr: 4, fontFamily: 'Playfair Display' }}>
               {workspace === 'main' ? 'Sanctuary' : workspace}
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
            {/* Install Button (Hidden on XS if space needed) */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <InstallButton />
            </Box>
            
            <Tooltip title="Notifications">
              <IconButton size="large" color="inherit">
                <Badge badgeContent={3} color="error" variant="dot">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>

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
                <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.secondary.main, fontSize: '0.8rem', fontWeight: 700 }}>KM</Avatar>
            </Box>
          </Stack>

          <Menu
            anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }} 
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mb: 1, width: 220, borderRadius: 3, boxShadow: theme.shadows[8], mt: 1.5 } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>My Account</Typography>
              <Typography variant="caption" color="text.secondary">Manage your preferences</Typography>
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
                {BOTTOM_NAV_ITEMS.map((item) => (
                    <BottomNavigationAction 
                        key={item.text} 
                        label={item.text} 
                        value={item.path} 
                        icon={item.icon} 
                    />
                ))}
             </BottomNavigation>
          </Paper>
          <MobileMoreMenu />
          </>
      )}

      <Main open={open}>
        <Toolbar sx={{ height: { xs: 70, md: 90 } }} /> {/* Spacer */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }} 
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Main>
    </Box>
  );
};

export default AppLayout;
