import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { Box, Typography, Card, useTheme, Skeleton, Grid, alpha, Stack, Chip, Container } from '@mui/material';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { format, parseISO, startOfDay } from 'date-fns';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';

import { API_BASE_URL } from '../config';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Graph = () => {
  const theme = useTheme();
  const { filterData } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attendanceRes, transactionsRes, membersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/attendance`),
          axios.get(`${API_BASE_URL}/transactions`),
          axios.get(`${API_BASE_URL}/members`),
        ]);

        const filteredMembers = filterData(membersRes.data || []);
        const filteredTransactions = filterData(transactionsRes.data || []);
        const filteredAttendance = filterData(attendanceRes.data || []);

        const totalMembers = filteredMembers.length;
        const incomeTransactions = filteredTransactions.filter(t => t && t.type === 'contribution');

        const dailyData = filteredAttendance.map(record => {
          if (!record) return null;
          const recordDate = parseISO(record.date || new Date().toISOString());
          const formattedDate = format(recordDate, 'MMM dd');
          
          const attendeesCount = Array.isArray(record.attendees) ? record.attendees.length : 0;
          const attendanceRate = totalMembers > 0 ? Math.round((attendeesCount / totalMembers) * 100) : 0;

          const dailyIncome = incomeTransactions
            .filter(t => {
              const tDate = parseISO(t.date);
              return startOfDay(tDate).getTime() === startOfDay(recordDate).getTime();
            })
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          return {
            date: formattedDate,
            attendance: attendanceRate,
            income: dailyIncome,
          };
        }).filter(Boolean).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setChartData(dailyData);

      } catch (err) {
        console.error("Graph Page Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterData]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 6, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 8,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`
           : alpha(theme.palette.primary.main, 0.05),
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Chip icon={<Activity size={14} />} label="System Analytics" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                Data Insights
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Visualizing congregation growth, financial health, and engagement trends.
            </Typography>
        </Container>
      </Box>

      <Grid container spacing={4}>
        {/* Engagement Area Chart */}
        <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 4, borderRadius: 6, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[4] }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>Attendance Trends</Typography>
                        <Typography variant="caption" color="text.secondary">Engagement percentage per service</Typography>
                    </Box>
                </Box>
                <Box sx={{ height: 350, width: '100%', minHeight: 0 }}>
                    {loading ? <Skeleton variant="rectangular" height="100%" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} unit="%" />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[8] }} />
                                <Area type="monotone" dataKey="attendance" stroke={theme.palette.primary.main} strokeWidth={4} fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </Card>
        </Grid>

        {/* Financial Bar Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 4, borderRadius: 6, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Revenue Streams</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 4 }}>Daily contribution totals (GHC)</Typography>
                <Box sx={{ height: 300, width: '100%', minHeight: 0 }}>
                    {loading ? <Skeleton variant="rectangular" height="100%" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[8] }} />
                                <Bar dataKey="income" radius={[4, 4, 0, 0]} barSize={30}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </Card>
        </Grid>

        {/* Stats Summary Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
                <Card sx={{ p: 3, borderRadius: 5, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, color: '#fff' }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ opacity: 0.8, letterSpacing: 1 }}>ANALYSIS</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>Live Sync</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Data reflects current system state.</Typography>
                </Card>
                <Card sx={{ p: 3, borderRadius: 5, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Metrics</Typography>
                    <Typography variant="body2" color="text.secondary">Use the reports page for detailed exports and audits.</Typography>
                </Card>
            </Stack>
        </Grid>
      </Grid>

    </Box>
  );
};

export default Graph;