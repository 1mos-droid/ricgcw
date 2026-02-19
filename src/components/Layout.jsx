import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';

import { useColorMode } from '../theme';
import { useWorkspace } from '../context/WorkspaceContext';
import LogoutIcon from '@mui/icons-material/Logout';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
import InstallButton from './InstallButton';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    [theme.breakpoints.up('md')]: {
      marginLeft: `-${drawerWidth}px`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      }),
    },
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up('md')]: {
      ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    },
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Church Members', icon: <PeopleIcon />, path: '/members' },
  { text: 'Attendance', icon: <EventNoteIcon />, path: '/attendance' },
  { text: 'Financials', icon: <AccountBalanceWalletIcon />, path: '/financials' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
  { text: 'Bible Studies', icon: <MenuBookIcon />, path: '/bible-studies' },
  { text: 'Reports', icon: <DescriptionIcon />, path: '/reports' },
  { text: 'Graph', icon: <BarChartIcon />, path: '/graph' },
  { text: 'User Management', icon: <SupervisedUserCircleIcon />, path: '/user-management' },
  { text: 'Quick Switch', icon: <SwapHorizIcon />, path: '/quick-switch' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Help', icon: <HelpCenterIcon />, path: '/help' },
];

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { userRole } = useWorkspace(); // 🟢 Get user role
  
  const isLoginPage = location.pathname === '/login';

  // Filter NAV_ITEMS based on role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (userRole === 'admin') return true;
    
    // Restricted pages for branch admins
    const restrictedPaths = ['/user-management', '/quick-switch', '/graph'];
    return !restrictedPaths.includes(item.path);
  });

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userBranch');
    handleClose();
    navigate('/login');
  };

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const drawerContent = (
    <>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src="/ricgcw.png" variant="rounded" sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>R</Avatar>
          <Typography variant="h6" fontWeight={700} color="primary" noWrap>RICGCW CMS</Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}><ChevronLeftIcon /></IconButton>
        )}
      </DrawerHeader>
      <List sx={{ px: 1.5, py: 1 }}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div key={item.text} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
              <ListItemButton 
                component={Link} to={item.path} selected={isActive}
                sx={{ mb: 0.5, borderRadius: 2, '&.Mui-selected': { bgcolor: theme.palette.action.selected } }}
              >
                <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : theme.palette.text.secondary, minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, color: isActive ? theme.palette.primary.main : theme.palette.text.primary }} />
              </ListItemButton>
            </motion.div>
          );
        })}
      </List>
    </>
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
      <AppBarStyled position="fixed" open={open} elevation={0} sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} edge="start" sx={{ mr: 2, ...(open && !isMobile && { display: 'none' }) }}><MenuIcon /></IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <InstallButton />
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton>
          <IconButton size="small" sx={{ ml: 2 }} onClick={handleMenu}><Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main, fontSize: 14 }}>KM</Avatar></IconButton>
          <Menu
            anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: 1.5, borderRadius: 2, minWidth: 150, boxShadow: theme.shadows[3], border: `1px solid ${theme.palette.divider}` } }}
          >
            <MenuItem onClick={handleClose} sx={{ py: 1, fontWeight: 500 }}>My Profile</MenuItem>
            <MenuItem onClick={handleClose} sx={{ py: 1, fontWeight: 500 }}>Settings</MenuItem>
            <Box sx={{ my: 1, borderTop: `1px solid ${theme.palette.divider}` }} />
            <MenuItem onClick={handleLogout} sx={{ py: 1, fontWeight: 600, color: theme.palette.error.main }}>
              <ListItemIcon sx={{ color: theme.palette.error.main }}><LogoutIcon fontSize="small" /></ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>{drawerContent}</Drawer>
        ) : (
          <Drawer variant="persistent" anchor="left" open={open} sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}` } }}>{drawerContent}</Drawer>
        )}
      </Box>
      <Main open={open}>
        <Toolbar />
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{children}</motion.div>
      </Main>
    </Box>
  );
};

export default AppLayout;
