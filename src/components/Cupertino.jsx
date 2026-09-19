import React from 'react';
import { Box, Typography } from '@mui/material';

// 1. Clean Button
export const CupertinoButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'filled', // 'filled' | 'plain'
  color = 'primary', // 'primary' | 'destructive'
  sx = {}, 
  ...props 
}) => {
  let className = "neo-glass-button";
  if (variant === 'filled') {
    className = color === 'destructive' ? "neo-glass-button-primary neo-glass-button-destructive" : "neo-glass-button-primary";
  }

  return (
    <Box
      component="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      sx={{
        border: 'none',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// 2. Sliding Segmented Control (Clean modern tabs)
export const CupertinoSlidingSegmentedControl = ({ 
  options = [], 
  value, 
  onChange, 
  sx = {}, 
  ...props 
}) => {
  return (
    <Box
      role="tablist"
      className="neo-glass-segmented"
      sx={{
        width: '100%',
        ...sx,
      }}
      {...props}
    >
      {options.map((option, idx) => {
        const isSelected = value === idx;
        return (
          <Box
            key={idx}
            onClick={() => onChange(idx)}
            role="tab"
            aria-selected={isSelected}
            tabIndex={0}
            className={`neo-glass-segmented-item ${isSelected ? 'active' : ''}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-stack)',
              }}
            >
              {option.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// 3. Grouped List Section
export const CupertinoListSection = ({ header, children, footer, sx = {} }) => {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      {header && (
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.72rem', 
            textTransform: 'uppercase', 
            px: 1.5, 
            mb: 1,
            fontWeight: 600,
            letterSpacing: 0.5,
            fontFamily: 'var(--font-stack)'
          }}
        >
          {header}
        </Typography>
      )}
      <Box className="neo-glass-card-inset" sx={{ p: 0, overflow: 'hidden' }}>
        {children}
      </Box>
      {footer && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.72rem', 
            px: 1.5, 
            mt: 1, 
            display: 'block',
            fontWeight: 400,
            fontFamily: 'var(--font-stack)' 
          }}
        >
          {footer}
        </Typography>
      )}
    </Box>
  );
};

// 4. Grouped List Tile
export const CupertinoListTile = ({ 
  leading: Leading, 
  title, 
  subtitle, 
  trailing: Trailing, 
  onClick, 
  divider = true 
}) => {
  return (
    <Box
      onClick={onClick}
      component="div"
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1.5,
        px: 2,
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: divider ? '1px solid var(--border-color-darker)' : 'none',
        transition: 'background-color 0.15s ease',
        '&:hover': onClick ? {
          backgroundColor: 'rgba(0,0,0,0.02)'
        } : {}
      }}
    >
      {Leading && (
        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: 'var(--system-blue)' }}>
          {Leading}
        </Box>
      )}
      <Box sx={{ flexGrow: 1 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 500, 
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-stack)' 
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.75rem',
              fontWeight: 400,
              fontFamily: 'var(--font-stack)' 
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {Trailing && (
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          {Trailing}
        </Box>
      )}
    </Box>
  );
};

// 5. Clean Card
export const CupertinoCard = ({ children, sx = {}, ...props }) => {
  return (
    <Box
      className="neo-glass-card"
      sx={{
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// 6. Switch
export const CupertinoSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <Box
      onClick={disabled ? undefined : () => onChange(!checked)}
      className={`neo-glass-switch ${checked ? 'active' : ''}`}
      sx={{
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Box className="neo-glass-switch-handle" />
    </Box>
  );
};

// 7. Input Field
export const CupertinoInput = ({ 
  placeholder,
  value,
  onChange,
  type = 'text',
  startAdornment,
  endAdornment,
  multiline = false,
  rows = 3,
  sx = {}, 
  ...props 
}) => {
  return (
    <Box
      className="neo-glass-input"
      sx={{
        alignItems: multiline ? 'flex-start' : 'center',
        ...sx,
      }}
    >
      {startAdornment && <Box sx={{ mr: 1.5, mt: multiline ? 0.5 : 0, display: 'flex', alignItems: 'center' }}>{startAdornment}</Box>}
      <Box
        component={multiline ? 'textarea' : 'input'}
        type={multiline ? undefined : type}
        rows={multiline ? rows : undefined}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-stack)',
          width: '100%',
          resize: 'none',
        }}
        {...props}
      />
      {endAdornment && <Box sx={{ ml: 1.5, mt: multiline ? 0.5 : 0, display: 'flex', alignItems: 'center' }}>{endAdornment}</Box>}
    </Box>
  );
};
