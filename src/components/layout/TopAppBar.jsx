import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  alpha,
  styled,
  useTheme,
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
  borderRadius: 40,
  background: 'rgba(0, 0, 0, 0.02)',
  boxShadow: 'var(--neo-shadow-in)',
  border: '1px solid var(--border-color-darker)',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.04)',
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
  const theme = useTheme();
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
      <AppBarStyled position="fixed" open={open} elevation={0} color="inherit" className="neo-glass-navbar" sx={{ top: 0, border: 'none', boxShadow: 'none' }}>
        <Toolbar sx={{ height: { xs: 70, md: 90 }, justifyContent: 'space-between' }}>
            
          {/* Logo/Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <Box
                component="img"
                src="/ricgcw.png"
                alt="Rhema Inner Court Gospel Church Worldwide (RICGCW) Logo"
                sx={{
                  width: 36,
                  height: 36,
                  objectFit: 'contain',
                  filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.primary.main, 0.4)})`
                }}
              />
            )}

            <Typography variant="h5" component="h1" fontWeight={800} sx={{ display: { xs: 'none', md: 'block' }, mr: 1 }}>
              {workspace === 'main' ? 'Sanctuary' : currentDepartment}
            </Typography>
            
            {isMobile && (
              <Typography variant="h6" component="h1" fontWeight={800} sx={{ display: { xs: 'block', md: 'none' } }}>
                RICGCW
              </Typography>
            )}

            {/* System Health Operational Indicator */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: isMobile ? 0.75 : 1.5,
                py: 0.5,
                borderRadius: 4,
                bgcolor: 'rgba(52, 199, 89, 0.08)',
                color: 'var(--system-green)',
                fontWeight: 800,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                animation: 'pulse 2s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 },
                }
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

          <Stack direction="row" spacing={isMobile ? 1 : 2} alignItems="center">
            {/* Campus / Site Switcher for Admin & Developer */}
            {(userRole === 'admin' || userRole === 'developer') && (
              <FormControl size="small" variant="outlined" sx={{ minWidth: { xs: 90, sm: 150 } }}>
                <InputLabel id="campus-select-label" sx={{ fontSize: '0.75rem', fontWeight: 800 }}>Select Campus</InputLabel>
                <Select
                  labelId="campus-select-label"
                  id="campus-select"
                  value={userBranch || 'all'}
                  onChange={handleCampusChange}
                  label="Select Campus"
                  inputProps={{ 'aria-label': 'Select Campus' }}
                  sx={{
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--border-color-darker)',
                    boxShadow: 'var(--neo-shadow-in)',
                    '& fieldset': { border: 'none' },
                    '.MuiSelect-select': { py: 1 }
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
