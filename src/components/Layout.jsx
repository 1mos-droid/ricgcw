import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, IconButton, styled, useTheme, CssBaseline } from '@mui/material';
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
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(4), // Increased padding for generous whitespace
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between', // Space between logo and close button
}));

const MotionListItem = ({ children, to }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ originX: 0 }}>
    <ListItemButton component={Link} to={to}>
      {children}
    </ListItemButton>
  </motion.div>
);


const Layout = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true); // Drawer defaults to open

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit" // Ensures icon color adapts to AppBar's text color
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <img src="/ricgcw.jpeg" alt="RICGCW Logo" style={{ height: 40, marginRight: 10 }} />
          <Typography variant="h6" noWrap component="div" sx={{ color: 'inherit' }}>
            RICGCW CMS
          </Typography>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <img src="/ricgcw.jpeg" alt="RICGCW Logo" style={{ height: 40, marginLeft: 10 }} />
          <IconButton onClick={handleDrawerClose} sx={{ color: theme.palette.text.primary }}>
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        <List sx={{ mt: 2 }}> {/* Added margin top to list */}
            <MotionListItem to="/"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><DashboardIcon /></ListItemIcon><ListItemText primary="Dashboard" /></MotionListItem>
            <MotionListItem to="/members"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><PeopleIcon /></ListItemIcon><ListItemText primary="Church Members" /></MotionListItem>
            <MotionListItem to="/attendance"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><EventNoteIcon /></ListItemIcon><ListItemText primary="Attendance" /></MotionListItem>
            <MotionListItem to="/financials"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Financials" /></MotionListItem>
            <MotionListItem to="/events"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><EventIcon /></ListItemIcon><ListItemText primary="Events" /></MotionListItem>
            <MotionListItem to="/reports"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><DescriptionIcon /></ListItemIcon><ListItemText primary="Reports" /></MotionListItem>
            <MotionListItem to="/user-management"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><SupervisedUserCircleIcon /></ListItemIcon><ListItemText primary="User Management" /></MotionListItem>
            <MotionListItem to="/quick-switch"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><SwapHorizIcon /></ListItemIcon><ListItemText primary="Quick Switch" /></MotionListItem>
            <MotionListItem to="/help"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><HelpCenterIcon /></ListItemIcon><ListItemText primary="Help" /></MotionListItem>
            <MotionListItem to="/settings"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><SettingsIcon /></ListItemIcon><ListItemText primary="Settings" /></MotionListItem>
            <MotionListItem to="/bible-studies"><ListItemIcon sx={{ color: theme.palette.text.secondary }}><MenuBookIcon /></ListItemIcon><ListItemText primary="Bible Studies" /></MotionListItem>
        </List>
      </Drawer>
      <Main open={open}>
        <Toolbar /> {/* Spacer below AppBar */}
        {children}
      </Main>
    </Box>
  );
};

export default Layout;
