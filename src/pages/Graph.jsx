import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { Box, Typography, Paper, useTheme, Skeleton, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, startOfDay } from 'date-fns';
import { AlertCircle } from 'lucide-react';

import { API_BASE_URL } from '../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

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
          const formattedDate = format(recordDate, 'yyyy-MM-dd');
          
          const attendeesCount = Array.isArray(record.attendees) ? record.attendees.length : 0;
          const attendanceRate = totalMembers > 0 ? (attendeesCount / totalMembers) * 100 : 0;

          const dailyIncome = incomeTransactions
            .filter(t => {
              const tDate = t.date._seconds ? new Date(t.date._seconds * 1000) : parseISO(t.date);
              return startOfDay(tDate).getTime() === startOfDay(recordDate).getTime();
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          return {
            date: formattedDate,
            attendanceRate: attendanceRate,
            income: dailyIncome,
          };
        }).filter(Boolean).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setChartData(dailyData);

      } catch (err) {
        console.error("Graph Page Fetch Error:", err);
        setError('Failed to fetch data for the graphs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterData]);

  if (error) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <AlertCircle size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
        <Typography variant="h6" color="error" gutterBottom>{error}</Typography>
      </Box>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Daily Analytics
      </Typography>
      <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        <Grid item xs={12} component={motion.div} variants={itemVariants}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" gutterBottom>Daily Attendance Rate (%)</Typography>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendanceRate" name="Attendance Rate" unit="%">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} component={motion.div} variants={itemVariants}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" gutterBottom>Daily Income (GHC)</Typography>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" name="Income" unit="GHC">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Graph;
