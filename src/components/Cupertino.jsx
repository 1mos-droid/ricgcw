import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

// 1. Cupertino Button (Neomorphic Glass)
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
      component={motion.button}
      whileTap={disabled ? undefined : { scale: 0.98 }}
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

// 2. Cupertino Sliding Segmented Control (Neomorphic Glass)
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
            component={motion.div}
            whileTap={{ scale: 0.98 }}
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
                fontWeight: isSelected ? 800 : 600,
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

// 3. Cupertino Grouped List Section
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
            px: 2, 
            mb: 1.25,
            fontWeight: 800,
            letterSpacing: 1,
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
            px: 2, 
            mt: 1.25, 
            display: 'block',
            fontWeight: 500,
            fontFamily: 'var(--font-stack)'
          }}
        >
          {footer}
        </Typography>
      )}
    </Box>
  );
};

// 4. Cupertino Grouped List Tile
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
      component={onClick ? motion.div : Box}
      whileTap={onClick ? { opacity: 0.8 } : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 2,
        px: 2.5,
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: divider ? '1px solid var(--border-color-darker)' : 'none',
        transition: 'background-color 0.2s',
        '&:hover': onClick ? {
          backgroundColor: 'rgba(0,0,0,0.01)'
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
            fontWeight: 600, 
            fontSize: '0.92rem',
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
              fontWeight: 500,
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

// 5. Cupertino Card (Neomorphic Glass)
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

// 6. Cupertino Switch (Neomorphic Glass Switch)
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

// 7. Cupertino Text Field / Input (Neomorphic Glass Inset Input)
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
          fontSize: '0.95rem',
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
