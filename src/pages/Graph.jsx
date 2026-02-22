import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { Box, Typography, Card, useTheme, Skeleton, Grid, alpha, Stack, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, startOfDay } from 'date-fns';
import { AlertCircle, TrendingUp, BarChart2 } from 'lucide-react';

import { API_BASE_URL } from '../config';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Graph = () => {
  const theme = useTheme();
  const { filterData } = useWorkspace();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const recordDate = record.date && record.date._seconds ? new Date(record.date._seconds * 1000) : parseISO(record.date || new Date().toISOString());
          const formattedDate = format(recordDate, 'MMM dd');
          
          const attendeesCount = Array.isArray(record.attendees) ? record.attendees.length : 0;
          const attendanceRate = totalMembers > 0 ? Math.round((attendeesCount / totalMembers) * 100) : 0;

          const dailyIncome = incomeTransactions
            .filter(t => {
              const tDate = t.date && t.date._seconds ? new Date(t.date._seconds * 1000) : parseISO(t.date);
              return startOfDay(tDate).getTime() === startOfDay(recordDate).getTime();
            })
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          return {
            date: formattedDate,
            attendanceRate: attendanceRate,
            income: dailyIncome,
          };
        }).filter(Boolean).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setChartData(dailyData);

      } catch (err) {
        console.error("Graph Page Fetch Error:", err);
        setError('Failed to sync analytics. Please check connection.');
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <AlertCircle size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
        <Typography variant="h6" color="error" fontWeight={700}>{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
            ANALYTICS
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Data Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualizing church growth and engagement
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
           <Chip icon={<TrendingUp size={14}/>} label="Live Updates" sx={{ fontWeight: 700, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} />
           <Chip icon={<BarChart2 size={14}/>} label="Daily View" sx={{ fontWeight: 700, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* ATTENDANCE CHART */}
        <Grid size={{ xs: 12 }} component={motion.div} variants={itemVariants}>
          <Card sx={{ p: 4, borderRadius: 4, minHeight: 450 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Attendance Engagement</Typography>
                    <Typography variant="caption" color="text.secondary">Percentage of registered members present per service</Typography>
                </Box>
            </Stack>
            
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: 3 }} />
            ) : chartData.length === 0 ? (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No attendance records found for visualization.</Typography>
                </Box>
            ) : (
              <Box sx={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 600 }}
                        unit="%"
                    />
                    <Tooltip 
                        cursor={{ fill: alpha(theme.palette.primary.main, 0.04) }}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[8], fontWeight: 700 }}
                    />
                    <Bar dataKey="attendanceRate" name="Attendance Rate" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>

        {/* INCOME CHART */}
        <Grid size={{ xs: 12 }} component={motion.div} variants={itemVariants}>
          <Card sx={{ p: 4, borderRadius: 4, minHeight: 450 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Financial Inflow</Typography>
                    <Typography variant="caption" color="text.secondary">Total contributions recorded per day (GHC)</Typography>
                </Box>
            </Stack>

            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: 3 }} />
            ) : chartData.length === 0 ? (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No financial records found for visualization.</Typography>
                </Box>
            ) : (
              <Box sx={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis 
                        dataKey="date" 
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
                        cursor={{ fill: alpha(theme.palette.success.main, 0.04) }}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[8], fontWeight: 700 }}
                        formatter={(value) => [`GHC ${value.toLocaleString()}`, 'Income']}
                    />
                    <Bar dataKey="income" name="Income" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Graph;
