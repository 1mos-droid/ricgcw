import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  InputAdornment,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
import TerminalIcon from '@mui/icons-material/Terminal';

const NAVIGATION_ITEMS = [
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

const CommandPalette = ({ open, onClose, members = [], onNavigate, onSelectMember }) => {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  // Reset query when palette opens/closes
  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  // Handle Ctrl+K/Cmd+K shortcuts at the parent or component level.
  // We can also bundle it inside the component for automatic global listening.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Since the open state is controlled from parent, we rely on parent's state,
        // but listening here helps developers integrate it easily.
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredNavs = useMemo(() => {
    if (!query) return NAVIGATION_ITEMS;
    return NAVIGATION_ITEMS.filter((item) =>
      item.text.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const filteredMembers = useMemo(() => {
    if (!query) return [];
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(query.toLowerCase()) ||
        m.email?.toLowerCase().includes(query.toLowerCase()) ||
        m.branch?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, members]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        'data-testid': 'command-palette-backdrop',
        onClick: (e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        },
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[24],
          backgroundImage: 'none',
          bgcolor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogContent sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
        <TextField
          autoFocus
          fullWidth
          variant="standard"
          placeholder="Type a command or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: '1.1rem',
              fontWeight: 600,
              pb: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }}
        />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
          {/* Navigation Items */}
          {filteredNavs.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 1, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Navigation Commands
              </Typography>
              <List dense>
                {filteredNavs.map((item) => (
                  <ListItemButton
                    key={item.text}
                    onClick={() => {
                      onNavigate(item.path);
                      onClose();
                    }}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Go to ${item.text}`}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}

          {/* Members search */}
          {filteredMembers.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 1, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Members Profiles
              </Typography>
              <List dense>
                {filteredMembers.map((member) => (
                  <ListItemButton
                    key={member.id}
                    onClick={() => {
                      onSelectMember(member);
                      onClose();
                    }}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={member.name}
                      secondary={`${member.branch} • ${member.email}`}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}

          {filteredNavs.length === 0 && filteredMembers.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                No results found for "{query}"
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
