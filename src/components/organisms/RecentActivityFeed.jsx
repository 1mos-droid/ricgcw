import React from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, useTheme, Divider } from '@mui/material';
import UserAvatar from '../atoms/UserAvatar';

const RecentActivityFeed = ({ activities = [] }) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Recent Activity
          </Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <ListItem
              key={activity.id}
              divider={index !== activities.length - 1}
              sx={{
                px: 3,
                py: 2,
              }}
            >
              <ListItemAvatar>
                <UserAvatar name={activity.userName} src={activity.userImage} size={40} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box component="span" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                      {activity.userName}
                    </Box>
                    {' '}{activity.action}{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>
                      {activity.target}
                    </Box>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
                    {activity.timestamp}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          {activities.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                No recent activity recorded
              </Typography>
            </Box>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
