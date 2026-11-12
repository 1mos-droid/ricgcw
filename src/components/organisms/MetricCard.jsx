import React from 'react';
import { Box } from '@mui/material';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CupertinoCard } from '../Cupertino';

export default function MetricCard({ title, value, icon: Icon, trend, trendValue, trendLabel = 'from last week' }) {
  const isPositive = trend === 'up';
  return <CupertinoCard className="metric-card" sx={{ height: '100%', overflow: 'hidden' }}>
    <div className="metric-card-body"><div className="metric-card-heading"><span>{title}</span>{Icon && <Icon size={18} strokeWidth={1.5} />}</div><div className="metric-card-value">{value}</div></div>
    <Box className="metric-card-footer">{trendValue != null && <span className={'metric-trend ' + (isPositive ? 'positive' : 'negative')}>{isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{trendValue}%</span>}<span>{trendLabel}</span></Box>
  </CupertinoCard>;
}
