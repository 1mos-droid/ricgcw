import React from 'react';
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';

const ProgressBar = ({ value, label, showValue = true, height = 8, ...props }) => {
  const theme = useTheme();
  
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(0, value), 100);

  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && (
            <Typography variant="subtitle2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800 }}>
              {normalizedValue}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={normalizedValue}
        sx={{
          height: height,
          borderRadius: height / 2,
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          },
          ...props.sx,
        }}
        {...props}
      />
    </Box>
  );
};

export default ProgressBar;
