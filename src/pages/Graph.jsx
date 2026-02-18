import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Box, Typography, Paper, useTheme, Skeleton, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, startOfDay } from 'date-fns';
import { AlertCircle } from 'lucide-react';

const API_BASE_URL = "https://us-central1-thegatheringplace-app.cloudfunctions.net/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const Graph = () => {
  const theme = useTheme();
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

        const totalMembers = membersRes.data.length;
        const incomeTransactions = transactionsRes.data.filter(t => t.type === 'contribution');

        const dailyData = attendanceRes.data.map(record => {
          const recordDate = record.date._seconds ? new Date(record.date._seconds * 1000) : parseISO(record.date);
          const formattedDate = format(recordDate, 'yyyy-MM-dd');
          
          const attendanceRate = totalMembers > 0 ? (record.attendees.length / totalMembers) * 100 : 0;

          const dailyIncome = incomeTransactions
            .filter(t => {
              const tDate = t.date._seconds ? new Date(t.date._seconds * 1000) : parseISO(t.date);
              return startOfDay(tDate).getTime() === startOfDay(recordDate).getTime();
            })
            .reduce((sum, t) => sum + t.amount, 0);

          return {
            date: formattedDate,
            attendanceRate: attendanceRate,
            income: dailyIncome,
          };
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setChartData(dailyData);

      } catch (err) {
        console.error("Graph Page Fetch Error:", err);
        setError('Failed to fetch data for the graphs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
