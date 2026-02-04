import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  Tooltip
} from '@mui/material';

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
import InstallButton from './InstallButton';

const drawerWidth = 260; // Slightly wider for better readability

// --- STYLED COMPONENTS ---

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0, // Default for mobile (no margin shift)
    
    // Desktop Styles
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
    zIndex: theme.zIndex.drawer + 1, // Ensure AppBar is above drawer on mobile
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    
    // Desktop Styles
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
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

// --- CONFIGURATION ---

const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Church Members', icon: <PeopleIcon />, path: '/members' },
  { text: 'Attendance', icon: <EventNoteIcon />, path: '/attendance' },
  { text: 'Financials', icon: <AccountBalanceWalletIcon />, path: '/financials' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
  { text: 'Bible Studies', icon: <MenuBookIcon />, path: '/bible-studies' },
  { text: 'Reports', icon: <DescriptionIcon />, path: '/reports' },
  { text: 'User Management', icon: <SupervisedUserCircleIcon />, path: '/user-management' },
  { text: 'Quick Switch', icon: <SwapHorizIcon />, path: '/quick-switch' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Help', icon: <HelpCenterIcon />, path: '/help' },
];

// --- COMPONENT ---

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Check if screen is mobile
  const location = useLocation(); // Get current route
  
  // State
  const [open, setOpen] = useState(true); // Desktop state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile state

  // Close mobile drawer when route changes
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

  // Drawer Content (Shared between Mobile & Desktop)
  const drawerContent = (
    <>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Logo Fallback: If image fails, show Avatar */}
          <Avatar 
            src="/ricgcw.png" 
            alt="Logo" 
            variant="rounded" 
            sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
          >
            R
          </Avatar>
          <Typography variant="h6" fontWeight={700} color="primary" noWrap>
            RICGCW CMS
          </Typography>
        </Box>
        {/* Only show close chevron on Desktop Persistent Drawer */}
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>
      
      <List sx={{ px: 1.5, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div 
              key={item.text}
              whileHover={{ scale: 1.02, x: 4 }} 
              whileTap={{ scale: 0.98 }}
            >
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={isActive}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  bgcolor: isActive ? theme.palette.action.selected : 'transparent',
                  borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main + '15', // Transparent primary
                    '&:hover': { bgcolor: theme.palette.primary.main + '25' }
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary
                  }} 
                />
              </ListItemButton>
            </motion.div>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      
      {/* --- TOP BAR --- */}
      <AppBarStyled position="fixed" open={open} elevation={0} sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, ...(open && !isMobile && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />

          <InstallButton />

          {/* Top Right Profile / Actions */}
          <Tooltip title="Admin Profile">
            <IconButton size="small" sx={{ ml: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main, fontSize: 14 }}>
                KM
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBarStyled>

      {/* --- DRAWER (RESPONSIVE) --- */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile: Temporary Drawer (Overlays content) */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }} // Better open performance on mobile
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          // Desktop: Persistent Drawer (Pushes content)
          <Drawer
            variant="persistent"
            anchor="left"
            open={open}
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}` },
            }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* --- MAIN CONTENT AREA --- */}
      <Main open={open}>
        <Toolbar /> {/* Spacer for fixed AppBar */}
        
        {/* Content Fade In Animation */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Main>
    </Box>
  );
};

export default Layout;