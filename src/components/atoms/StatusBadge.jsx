import React from 'react';
import { Chip, useTheme } from '@mui/material';

const StatusBadge = ({ label, status = 'default', size = 'small', ...props }) => {
  const theme = useTheme();

  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
      case 'paid':
        return {
          backgroundColor: theme.palette.mode === 'light' ? '#DCFCE7' : 'rgba(16, 185, 129, 0.15)',
          color: theme.palette.success.main,
          borderColor: theme.palette.mode === 'light' ? '#BBF7D0' : 'rgba(16, 185, 129, 0.3)',
        };
      case 'pending':
      case 'warning':
        return {
          backgroundColor: theme.palette.mode === 'light' ? '#FEF9C3' : 'rgba(234, 179, 8, 0.15)',
          color: theme.palette.mode === 'light' ? '#854D0E' : '#FDE047',
          borderColor: theme.palette.mode === 'light' ? '#FEF08A' : 'rgba(234, 179, 8, 0.3)',
        };
      case 'error':
      case 'unpaid':
      case 'inactive':
        return {
          backgroundColor: theme.palette.mode === 'light' ? '#FEE2E2' : 'rgba(239, 68, 68, 0.15)',
          color: theme.palette.error.main,
          borderColor: theme.palette.mode === 'light' ? '#FECACA' : 'rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          backgroundColor: theme.palette.mode === 'light' ? '#F1F5F9' : 'rgba(148, 163, 184, 0.1)',
          color: theme.palette.text.secondary,
          borderColor: theme.palette.mode === 'light' ? '#E2E8F0' : 'rgba(148, 163, 184, 0.2)',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <Chip
      label={label}
      size={size}
      variant="outlined"
      sx={{
        fontWeight: 700,
        borderRadius: '100px',
        ...styles,
        '& .MuiChip-label': {
          px: 1.5,
        },
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default StatusBadge;
