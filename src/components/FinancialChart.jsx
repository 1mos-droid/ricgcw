import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart, // Switching to Area for a better look? Let's stick to Line but style it well.
} from 'recharts';
import { 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  Box, 
  Skeleton,
  Stack
} from '@mui/material';
import { AlertCircle } from 'lucide-react';

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Box sx={{ 
        bgcolor: theme.palette.background.paper, 
        p: 1.5, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: theme.shadows[3]
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: entry.color }}>
              {entry.name}: ${Number(entry.value).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const FinancialChart = ({ data, loading }) => {
  const theme = useTheme();

  // Loading State
  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={150} height={30} />
            <Skeleton variant="circular" width={20} height={20} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%', minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={1} sx={{ opacity: 0.5 }}>
          <AlertCircle size={40} />
          <Typography variant="body2">No financial data available for this period.</Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>Financial Overview</Typography>
          <Typography variant="body2" color="text.secondary">Income vs Expenses over time</Typography>
        </Box>

        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                dy={10}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}k` : value}`}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: theme.palette.text.secondary, strokeDasharray: '5 5' }} />
              
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Line 
                name="Income"
                type="monotone" 
                dataKey="income" 
                stroke={theme.palette.success.main} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
                activeDot={{ r: 6 }}
              />
              
              <Line 
                name="Expenses"
                type="monotone" 
                dataKey="expense" 
                stroke={theme.palette.error.main} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialChart;