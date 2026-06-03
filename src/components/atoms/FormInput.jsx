import React from 'react';
import { TextField, useTheme } from '@mui/material';

const FormInput = ({ label, placeholder, error, helperText, sx = {}, ...props }) => {
  const theme = useTheme();

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      error={!!error}
      helperText={error || helperText}
      fullWidth
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease-in-out',
          '& fieldset': {
            borderColor: theme.palette.divider,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.light,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root': {
          fontWeight: 600,
          color: theme.palette.text.secondary,
        },
        '& .MuiInputBase-input': {
          fontWeight: 500,
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default FormInput;
