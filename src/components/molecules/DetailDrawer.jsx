import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  useTheme,
} from '@mui/material';
import { X } from 'lucide-react';
import ActionButton from '../atoms/ActionButton';

const DetailDrawer = ({ 
  open, 
  onClose, 
  title, 
  subtitle, 
  children, 
  actions,
  width = 400 
}) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: width },
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.1)',
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          {children}
        </Box>

        {/* Actions Footer */}
        {actions && (
          <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)' }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {actions}
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default DetailDrawer;
