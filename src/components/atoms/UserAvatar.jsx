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
    const tones = theme.palette.mode === 'light' ? ['#EAE3D6', '#E1E6EA', '#E7E8E4'] : ['#3E4652', '#464036', '#374747'];
    return tones[Math.abs(hash) % tones.length];
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
        fontWeight: 600,
        bgcolor: backgroundColor,
        color: theme.palette.text.primary,
        border: `2px solid ${theme.palette.background.glassBorder}`,
        boxShadow: 'none',
        ...props.sx,
      }}
      {...props}
    >
      {!src && getInitials(name)}
    </Avatar>
  );
};

export default UserAvatar;
