import React from 'react';
import { CardContent, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, useTheme, Divider } from '@mui/material';
import { Calendar, ChevronRight } from 'lucide-react';
import ActionButton from '../atoms/ActionButton';
import { CupertinoCard } from '../Cupertino';

const UpcomingEventsWidget = ({ events = [] }) => {
  const theme = useTheme();

  return (
    <CupertinoCard sx={{ height: '100%' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Upcoming Events
          </Typography>
          <ActionButton variant="ghost" size="small">
            View Calendar
          </ActionButton>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {events.map((event, index) => (
            <ListItem
              key={event.id}
              divider={index !== events.length - 1}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)',
                },
                cursor: 'pointer',
              }}
            >
              <ListItemAvatar>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                    {event.month}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 900, lineHeight: 1 }}>
                    {event.day}
                  </Typography>
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {event.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {event.time} • {event.location}
                  </Typography>
                }
              />
              <ChevronRight size={18} color={theme.palette.text.disabled} />
            </ListItem>
          ))}
          {events.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Calendar size={40} color={theme.palette.text.disabled} style={{ marginBottom: 16 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                No upcoming events scheduled
              </Typography>
            </Box>
          )}
        </List>
      </CardContent>
    </CupertinoCard>
  );
};

export default UpcomingEventsWidget;
