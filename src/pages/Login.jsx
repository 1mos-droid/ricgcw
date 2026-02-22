import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  Avatar, 
  useTheme, 
  InputAdornment,
  IconButton,
  CircularProgress,
  alpha
} from '@mui/material';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Church
} from 'lucide-react';

import axios from 'axios'; 
import { API_BASE_URL } from '../config';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { refreshUserContext } = useWorkspace();
  
  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: formData.email,
        password: formData.password
      });

      const user = response.data;

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userBranch', user.branch);
      localStorage.setItem('userEmail', user.email);
      
      refreshUserContext();
      
      navigate('/');
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Connection failed. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: theme.palette.mode === 'light'
        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`
        : `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)`,
      position: 'relative',
      p: 2,
      overflow: 'hidden'
    }}>
      {/* Background Decorative Elements */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(80px)'
          }}
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '35vw',
            height: '35vw',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            filter: 'blur(60px)'
          }}
        />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ zIndex: 1, width: '100%', maxWidth: '440px' }}
      >
        <Card sx={{ 
          p: { xs: 4, sm: 6 }, 
          borderRadius: 6, 
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: '24px', 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Church size={32} color="#fff" strokeWidth={2.5} />
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.text.primary, letterSpacing: '-0.03em' }}>
              RICGCW
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 1 }}>
              Inner Court Gospel Church Management
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {error && (
                <Typography variant="caption" color="error" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.error.main, 0.1), p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                variant="outlined"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.common.white, 0.05),
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : alpha(theme.palette.common.white, 0.1) },
                    '&.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}` }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                variant="outlined"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.common.white, 0.05),
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : alpha(theme.palette.common.white, 0.1) },
                    '&.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}` }
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.8, 
                  mt: 1,
                  borderRadius: 3, 
                  fontSize: '1rem', 
                  fontWeight: 800,
                  textTransform: 'none',
                  letterSpacing: '0.02em',
                  boxShadow: `0 10px 20px -5px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 15px 25px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Secure Sign In <ArrowRight size={20} />
                  </Box>
                )}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary', opacity: 0.7 }}>
            <ShieldCheck size={14} />
            <Typography variant="caption" fontWeight={600}>
              Enterprise Grade Security
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
