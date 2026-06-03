import React from 'react';
import { Autocomplete, TextField, useTheme } from '@mui/material';

const SearchSelect = ({ options = [], label, placeholder, value, onChange, loading, error, ...props }) => {
  const theme = useTheme();

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: 600,
            },
          }}
        />
      )}
      sx={{
        '& .MuiAutocomplete-paper': {
          borderRadius: '12px',
          boxShadow: theme.palette.mode === 'light' 
            ? '0px 20px 40px rgba(0,0,0,0.1)' 
            : '0px 20px 40px rgba(0,0,0,0.5)',
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
      {...props}
    />
  );
};

export default SearchSelect;
