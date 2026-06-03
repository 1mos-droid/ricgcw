import React from 'react';
import { Avatar, useTheme } from '@mui/material';

const UserAvatar = ({ name = '', src = '', size = 40, ...props }) => {
  const theme = useTheme();

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getColorFromName = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, ${theme.palette.mode === 'light' ? '45%' : '65%'})`;
  };

  const backgroundColor = src ? 'transparent' : getColorFromName(name);

  return (
    <Avatar
      src={src}
      alt={name}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 800,
        bgcolor: backgroundColor,
        color: '#FFFFFF',
        border: `2px solid ${theme.palette.background.glassBorder}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        ...props.sx,
      }}
      {...props}
    >
      {!src && getInitials(name)}
    </Avatar>
  );
};

export default UserAvatar;
