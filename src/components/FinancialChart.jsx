import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  defs,
  linearGradient,
  stop
} from 'recharts';
import { 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  Box, 
  Skeleton,
  Stack,
  alpha
} from '@mui/material';
import { AlertCircle, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Box sx={{ 
        bgcolor: alpha(theme.palette.background.paper, 0.9), 
        p: 2, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        boxShadow: theme.shadows[8],
        backdropFilter: 'blur(10px)'
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 800, letterSpacing: 0.5 }}>
          {label.toUpperCase()}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: index === 0 ? 1 : 0 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: entry.color }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {entry.name}: <Typography component="span" variant="body2" fontWeight={800} color={entry.color}>GHC {Number(entry.value).toLocaleString()}</Typography>
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const FinancialChart = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 4, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 3 }} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card sx={{ borderRadius: 4, height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.divider}` }}>
        <Stack alignItems="center" spacing={2} sx={{ opacity: 0.4 }}>
          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.text.secondary, 0.1) }}>
            <AlertCircle size={40} />
          </Box>
          <Typography variant="body1" fontWeight={600}>No financial data available</Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 4, height: '100%', border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s ease', '&:hover': { boxShadow: theme.shadows[4] } }}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>Financial Trajectory</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 0.5 }}>INCOME VS EXPENDITURE OVERVIEW</Typography>
          </Box>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
            <TrendingUp size={20} />
          </Box>
        </Stack>

        <Box sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 }}
                dy={15}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 }}
                tickFormatter={(value) => `GHC ${value >= 1000 ? `${value / 1000}k` : value}`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ paddingBottom: '30px', fontWeight: 700, fontSize: '12px' }} 
                iconType="circle"
              />
              
              <Area 
                name="Income"
                type="monotone" 
                dataKey="income" 
                stroke={theme.palette.success.main} 
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorIncome)"
                activeDot={{ r: 6, strokeWidth: 0, fill: theme.palette.success.main }}
              />
              
              <Area 
                name="Expense"
                type="monotone" 
                dataKey="expense" 
                stroke={theme.palette.error.main} 
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorExpense)"
                activeDot={{ r: 6, strokeWidth: 0, fill: theme.palette.error.main }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialChart;