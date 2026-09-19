import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  alpha,
  useTheme,
  Badge,
  Collapse,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import TerminalIcon from '@mui/icons-material/Terminal';
import UserAvatar from '../atoms/UserAvatar';

const DOMAIN_GROUPS = {
  'Administration': ['Dashboard', 'Members', 'Users', 'Quick Switch', 'Developer'],
  'Ministry': ['Attendance', 'Events', 'Bible Studies', 'Live Bible', 'Gallery'],
  'Finance': ['Financials', 'Graph'],
  'Engagement': ['Reports', 'Help'],
  'Configuration': ['Settings']
};

const SidebarNav = ({ 
  navItems = [], 
  user, 
  userRole, 
  onProfileClick 
}) => {
  const theme = useTheme();
  const location = useLocation();

  const [openDomains, setOpenDomains] = useState({
    'Administration': true,
    'Ministry': true,
    'Finance': true,
    'Engagement': true,
    'Configuration': true,
  });

  const toggleDomain = (domain) => {
    setOpenDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  // Group the provided navItems into their respective domains
  const groupedNavs = React.useMemo(() => {
    const groups = {
      'Administration': [],
      'Ministry': [],
      'Finance': [],
      'Engagement': [],
      'Configuration': []
    };

    navItems.forEach(item => {
      // Find which group contains this nav item
      let foundGroup = false;
      for (const [groupName, itemNames] of Object.entries(DOMAIN_GROUPS)) {
        if (itemNames.includes(item.text)) {
          groups[groupName].push(item);
          foundGroup = true;
          break;
        }
      }
      // Fallback to Administration if not matched
      if (!foundGroup) {
        groups['Administration'].push(item);
      }
    });

    return groups;
  }, [navItems]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
      {/* Header Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', padding: theme.spacing(0, 3), height: 72, borderBottom: '1px solid var(--border-color)', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            component="img"
            src="/ricgcw.png"
            alt="Rhema Inner Court Gospel Church Worldwide (RICGCW) Logo"
            sx={{
              width: 36,
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ color: theme.palette.text.primary }}>
              RICGCW
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: '0.02em', fontSize: '0.65rem', display: 'block' }}>
              Church Management
            </Typography>
          </Box>
        </Stack>
      </Box>
      
      {/* Navigation Domains List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        {Object.entries(groupedNavs).map(([domainName, items]) => {
          if (items.length === 0) return null;

          const isDomainOpen = openDomains[domainName];

          return (
            <Box key={domainName} sx={{ mb: 1.5 }}>
              {/* Group Header Button */}
              <ListItemButton
                onClick={() => toggleDomain(domainName)}
                sx={{
                  py: 0.75,
                  px: 1.5,
                  borderRadius: 1.5,
                  justifyContent: 'space-between',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.03)
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {domainName}
                </Typography>
                {isDomainOpen ? <ExpandLess sx={{ fontSize: 15, color: 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: 15, color: 'text.secondary' }} />}
              </ListItemButton>

              {/* Group Body (Collapsible) */}
              <Collapse in={isDomainOpen} timeout="auto" unmountOnExit>
                <List sx={{ pl: 0, mt: 0.25 }}>
                  {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <ListItemButton 
                        key={item.text}
                        component={Link} 
                        to={item.path} 
                        selected={isActive}
                        sx={{
                          py: 0.9,
                          px: 1.5,
                          borderRadius: '8px',
                          transition: 'background-color 0.15s ease, color 0.15s ease',
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            boxShadow: 'none',
                            '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                            }
                          },
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.03)',
                            color: theme.palette.text.primary
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: isActive ? theme.palette.primary.main : 'text.secondary' }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{ 
                            fontWeight: isActive ? 600 : 500, 
                            fontSize: '0.85rem',
                            letterSpacing: '0em'
                          }} 
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* User Profile in Sidebar Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid var(--border-color)' }}>
        {(userRole === 'admin' || userRole === 'developer') && (
          <Box 
            sx={{ 
              mb: 1.5, p: 1.25, borderRadius: '8px', 
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              bgcolor: 'rgba(0,0,0,0.02)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: userRole === 'developer' ? theme.palette.secondary.main : theme.palette.primary.main, color: '#fff' }}>
              <TerminalIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={600} color={userRole === 'developer' ? "secondary" : "primary"} sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.625rem', letterSpacing: '0.04em' }}>
                {localStorage.getItem('mimicData') ? 'Mimicking' : 'Dev Mode'}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                {userRole === 'developer' ? 'Master Access' : 'Authorized'}
              </Typography>
            </Box>
          </Box>
        )}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            p: 1.25, 
            borderRadius: '8px', 
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            bgcolor: 'var(--bg-paper)',
            boxShadow: 'var(--neo-shadow-out)',
            transition: 'border-color 0.15s ease',
            '&:hover': { 
              borderColor: alpha(theme.palette.primary.main, 0.4)
            }
          }}
          onClick={onProfileClick}
        >
          <Badge 
            overlap="circular" 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={localStorage.getItem('mimicData') ? "warning" : "success"}
            sx={{ '& .MuiBadge-badge': { width: 10, height: 10, borderRadius: '50%', border: `2px solid var(--bg-paper-flat)` } }}
          >
            <UserAvatar name={user?.name || user?.email || 'User'} size={38} />
          </Badge>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{user?.name || 'User'}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.65rem' }}>{userRole}</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Link to="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 500 }}>
            Privacy Policy
          </Link>
          <Typography component="span" sx={{ color: 'var(--text-secondary)', opacity: 0.4, fontSize: '0.7rem' }}>•</Typography>
          <Link to="/terms-of-service" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 500 }}>
            Terms of Service
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarNav;
