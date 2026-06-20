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
    <CupertinoCard sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: theme.palette.mode === 'light' ? 'rgba(16, 52, 166, 0.05)' : 'rgba(212, 175, 55, 0.1)',
              color: 'primary.main',
            }}
          >
            {Icon && <Icon size={24} />}
          </Box>
          {trendValue && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: '6px',
                backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: isPositive ? 'success.main' : 'error.main',
              }}
            >
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1 }}>
          {value}
        </Typography>

        {trendLabel && (
          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
            {trendLabel}
          </Typography>
        )}
      </CardContent>
    </CupertinoCard>
  );
};

export default MetricCard;
