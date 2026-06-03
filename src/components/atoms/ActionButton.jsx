import React from 'react';
import { Button, useTheme } from '@mui/material';

const ActionButton = ({ variant = 'primary', size = 'medium', children, sx = {}, ...props }) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          variant: 'contained',
          color: 'primary',
        };
      case 'secondary':
        return {
          variant: 'contained',
          color: 'secondary',
        };
      case 'ghost':
        return {
          variant: 'text',
          sx: {
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
              color: theme.palette.primary.main,
            },
          },
        };
      case 'danger':
        return {
          variant: 'outlined',
          color: 'error',
          sx: {
            borderColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
              color: '#FFFFFF',
            },
          },
        };
      case 'outline':
        return {
          variant: 'outlined',
          color: 'primary',
        };
      default:
        return {
          variant: 'contained',
          color: 'primary',
        };
    }
  };

  const { variant: muiVariant, color, sx: variantSx } = getVariantStyles();

  return (
    <Button
      variant={muiVariant}
      color={color}
      size={size}
      sx={{
        fontWeight: 800,
        textTransform: 'none',
        borderRadius: '10px',
        ...variantSx,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
