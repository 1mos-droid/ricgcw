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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.paper }}>
      {/* Header Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', padding: theme.spacing(0, 4), height: 100, justifyContent: 'space-between' }}>
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
      </Box>
      
      {/* Navigation Domains List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 3 }}>
        {Object.entries(groupedNavs).map(([domainName, items]) => {
          if (items.length === 0) return null;

          const isDomainOpen = openDomains[domainName];

          return (
            <Box key={domainName} sx={{ mb: 2 }}>
              {/* Group Header Button */}
              <ListItemButton
                onClick={() => toggleDomain(domainName)}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  justifyContent: 'space-between',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.03)
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {domainName}
                </Typography>
                {isDomainOpen ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
              </ListItemButton>

              {/* Group Body (Collapsible) */}
              <Collapse in={isDomainOpen} timeout="auto" unmountOnExit>
                <List sx={{ pl: 1, mt: 0.5 }}>
                  {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <ListItemButton 
                        key={item.text}
                        component={Link} 
                        to={item.path} 
                        selected={isActive}
                        sx={{
                          py: 1.2,
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
                        <ListItemIcon sx={{ minWidth: 36, color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{ 
                            fontWeight: isActive ? 900 : 700, 
                            fontSize: '0.85rem',
                            letterSpacing: '0.01em'
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
          onClick={onProfileClick}
        >
          <Badge 
            overlap="circular" 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={localStorage.getItem('mimicData') ? "warning" : "success"}
            sx={{ '& .MuiBadge-badge': { width: 14, height: 14, borderRadius: '50%', border: `3px solid ${theme.palette.background.paper}` } }}
          >
            <UserAvatar name={user?.name || user?.email || 'User'} size={48} />
          </Badge>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="subtitle2" fontWeight={900} noWrap sx={{ color: theme.palette.text.primary }}>{user?.name || 'User'}</Typography>
            <Typography variant="caption" color="primary" noWrap sx={{ display: 'block', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>{userRole}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarNav;
