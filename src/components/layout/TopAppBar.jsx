import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  styled,
  InputBase,
  Badge,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import UserAvatar from '../atoms/UserAvatar';
import CommandPalette from '../CommandPalette';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useColorMode } from '../../theme';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 280;

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
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
  borderRadius: 8,
  background: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)',
  border: '1px solid var(--border-color)',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  '&:hover': {
    background: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
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
      width: '28ch',
      '&:focus': {
        width: '32ch',
      },
    },
  },
}));

const TopAppBar = ({ 
  open, 
  isMobile, 
  workspace, 
  currentDepartment, 
  onProfileClick,
  notificationCount = 0
}) => {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const { 
    userBranch, 
    userRole, 
    startMimicking, 
    stopMimicking 
  } = useWorkspace();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [members, setMembers] = useState([]);

  // Listen for global shortcut Cmd+K/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch members to feed search palette in real-time
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "members"));
        const membersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(membersData);
      } catch (err) {
        console.error("TopAppBar members fetch error:", err);
      }
    };
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const handleCampusChange = (e) => {
    const val = e.target.value;
    if (val === 'all') {
      stopMimicking();
    } else {
      startMimicking({
        role: userRole,
        branch: val,
        name: user?.name || 'Administrator',
        email: user?.email
      });
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleSelectMember = (member) => {
    navigate('/members', { state: { selectedMemberId: member.id } });
  };

  return (
    <>
      <AppBarStyled position="fixed" open={open} elevation={0} color="inherit" className="neo-glass-navbar" sx={{ top: 0, border: 'none', borderBottom: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <Toolbar sx={{ height: { xs: 64, md: 72 }, justifyContent: 'space-between' }}>
            
          {/* Logo/Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <Box
                component="img"
                src="/ricgcw.png"
                alt="Rhema Inner Court Gospel Church Worldwide (RICGCW) Logo"
                sx={{
                  width: 32,
                  height: 32,
                  objectFit: 'contain'
                }}
              />
            )}

            <Typography variant="h6" component="h1" fontWeight={700} sx={{ display: { xs: 'none', md: 'block' }, mr: 1, fontSize: '1.1rem' }}>
              {workspace === 'main' ? 'Sanctuary' : currentDepartment}
            </Typography>
            
            {isMobile && (
              <Typography variant="h6" component="h1" fontWeight={700} sx={{ display: { xs: 'block', md: 'none' }, fontSize: '1.05rem' }}>
                RICGCW
              </Typography>
            )}

            {/* System Health Operational Indicator */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: isMobile ? 0.75 : 1.25,
                py: 0.35,
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--system-green)',
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.02em',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 12 }} />
              {!isMobile && 'System: Healthy'}
            </Box>
          </Box>

          {/* Search Trigger box */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Search onClick={() => setPaletteOpen(true)} sx={{ cursor: 'pointer' }}>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search anything... (Ctrl+K)"
                inputProps={{ 'aria-label': 'search' }}
                readOnly
              />
            </Search>
          </Box>

          <Stack direction="row" spacing={isMobile ? 1 : 1.5} alignItems="center">
            {/* Campus / Site Switcher for Admin & Developer */}
            {(userRole === 'admin' || userRole === 'developer') && (
              <FormControl size="small" variant="outlined" sx={{ minWidth: { xs: 90, sm: 140 } }}>
                <InputLabel id="campus-select-label" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Select Campus</InputLabel>
                <Select
                  labelId="campus-select-label"
                  id="campus-select"
                  value={userBranch || 'all'}
                  onChange={handleCampusChange}
                  label="Select Campus"
                  inputProps={{ 'aria-label': 'Select Campus' }}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    bgcolor: 'transparent',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'none',
                    '& fieldset': { border: 'none' },
                    '.MuiSelect-select': { py: 0.8 }
                  }}
                >
                  <MenuItem value="all">All Campuses</MenuItem>
                  <MenuItem value="Mallam">Mallam</MenuItem>
                  <MenuItem value="Kokrobitey">Kokrobitey</MenuItem>
                  <MenuItem value="Langma">Langma</MenuItem>
                  <MenuItem value="Diaspora">Diaspora</MenuItem>
                </Select>
              </FormControl>
            )}

            {isMobile && (
              <IconButton 
                onClick={() => setPaletteOpen(true)} 
                sx={{ color: 'text.secondary' }}
                aria-label="Open Search"
              >
                <SearchIcon />
              </IconButton>
            )}

            <IconButton 
              onClick={toggleColorMode} 
              sx={{ color: 'text.secondary' }}
              aria-label="Toggle theme mode"
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
            
            <Box 
              sx={{ 
                ml: 1,
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center',
              }}
              onClick={onProfileClick}
            >
              <UserAvatar name={user?.name || user?.email || 'User'} size={36} />
            </Box>
          </Stack>
        </Toolbar>
      </AppBarStyled>

      {/* Global Universal Search Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        members={members}
        onNavigate={handleNavigate}
        onSelectMember={handleSelectMember}
      />
    </>
  );
};

export default TopAppBar;
