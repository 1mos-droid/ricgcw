import React from 'react';
import { Card, CardContent, Box, Typography, MenuItem, Select, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const TrendChartCard = ({ 
  title, 
  data = [], 
  dataKey = 'value', 
  xKey = 'name',
  filterValue,
  onFilterChange,
  filterOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'This Month' },
    { value: '90d', label: 'Last Quarter' },
  ]
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {title}
          </Typography>
          <Select
            size="small"
            value={filterValue}
            onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
            sx={{ 
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.75rem',
              backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }
            }}
          >
            {filterOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ flexGrow: 1, minHeight: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={theme.palette.divider} 
              />
              <XAxis 
                dataKey={xKey} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  fontWeight: 700
                }} 
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendChartCard;
