import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  CircularProgress
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
import { API_BASE_URL } from '../config'; // 🟢 Import from config

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { refreshUserContext } = useWorkspace();
  
  // 🟢 NEW: If already authenticated, go to home
  React.useEffect(() => {
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
      // 🟢 Call Secure Backend Login
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: formData.email,
        password: formData.password
      });

      const user = response.data;

      // Store non-sensitive session data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userBranch', user.branch);
      localStorage.setItem('userEmail', user.email);
      
      // Update global context
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
          p: { xs: 3, sm: 5 }, 
          borderRadius: 6, 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <Box sx={{ mb: 4 }}>
            <Avatar sx={{ 
              width: 70, 
              height: 70, 
              bgcolor: theme.palette.primary.main, 
              margin: '0 auto',
              mb: 2,
              boxShadow: theme.shadows[4]
            }}>
              <Church size={36} color="#fff" />
            </Avatar>
            <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.text.primary, letterSpacing: -1 }}>
              RICGCW
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Inner Court Gospel Church Management
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {error && (
                <Typography variant="caption" color="error" sx={{ fontWeight: 700, bgcolor: 'rgba(211, 47, 47, 0.1)', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
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
                    bgcolor: theme.palette.mode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)',
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
                    bgcolor: theme.palette.mode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)',
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}>
                  Forgot Password?
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 3, 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: `0 8px 16px -4px ${theme.palette.primary.main}4D`,
                  '&:hover': {
                    boxShadow: `0 12px 20px -4px ${theme.palette.primary.main}66`,
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
              Enterprise Grade Security Active
            </Typography>
          </Box>
        </Card>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            Powered by RICGCW IT © 2026
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Login;
