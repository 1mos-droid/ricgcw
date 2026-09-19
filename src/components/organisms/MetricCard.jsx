import React from 'react';
import { CardContent, Box, Typography, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CupertinoCard } from '../Cupertino';

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  trendLabel = 'from last week' 
}) => {
  const theme = useTheme();
  const isPositive = trend === 'up';

  return (
    <CupertinoCard sx={{ height: '100%', position: 'relative' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '8px',
              backgroundColor: theme.palette.mode === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(59, 130, 246, 0.12)',
              color: 'primary.main',
            }}
          >
            {Icon && <Icon size={20} />}
          </Box>
          {trendValue && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: isPositive ? 'success.main' : 'error.main',
              }}
            >
              {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontSize: '0.7rem' }}>
          {title}
        </Typography>
        
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, letterSpacing: '-0.01em' }}>
          {value}
        </Typography>

        {trendLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, fontSize: '0.75rem' }}>
            {trendLabel}
          </Typography>
        )}
      </CardContent>
    </CupertinoCard>
  );
};

export default MetricCard;
