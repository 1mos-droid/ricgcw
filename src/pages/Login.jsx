import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  useTheme, 
  InputAdornment,
  IconButton,
  CircularProgress,
  alpha,
  Container
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

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { refreshUserContext } = useWorkspace();
  const { login, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate, isAuthenticated]);

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
      await login(formData.email, formData.password);
      refreshUserContext();
      navigate('/');
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || 'Login failed. Please try again.');
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
        ? `radial-gradient(circle at 50% 0%, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%)`
        : `radial-gradient(circle at 50% 0%, #1E293B 0%, #0F172A 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background Orbs */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: theme.palette.mode === 'light' 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: theme.palette.mode === 'light' 
              ? 'radial-gradient(circle, rgba(147, 197, 253, 0.2) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(30, 64, 175, 0.1) 0%, rgba(15, 23, 42, 0) 70%)',
            filter: 'blur(80px)',
          }}
        />
      </Box>

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card sx={{ 
            p: { xs: 4, sm: 5 }, 
            borderRadius: 124, 
            bgcolor: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.6)' 
              : 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(40px)',
            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: theme.palette.mode === 'light'
              ? '0 20px 80px -20px rgba(59, 130, 246, 0.2)'
              : '0 20px 80px -20px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <Box sx={{ 
                  width: 64, height: 64,
                  borderRadius: 64, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 12px 24px -6px ${alpha(theme.palette.primary.main, 0.4)}`,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Church size={32} strokeWidth={2} />
                </Box>
              </motion.div>
              
              <Typography variant="h3" sx={{ 
                fontFamily: 'Playfair Display', 
                fontWeight: 800, 
                color: theme.palette.text.primary,
                letterSpacing: '-0.02em',
                mb: 1
              }}>
                RICGCW
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Welcome back, Minister.
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <Typography variant="caption" color="error" sx={{ 
                      fontWeight: 600, 
                      bgcolor: alpha(theme.palette.error.main, 0.1), 
                      p: 1.5, 
                      borderRadius: 64, 
                      display: 'block',
                      textAlign: 'center' 
                    }}>
                      {error}
                    </Typography>
                  </motion.div>
                )}

                <TextField
                  fullWidth
                  placeholder="Email Address"
                  type="email"
                  required
                  variant="outlined"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: 24, 
                      bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha('#fff', 0.05),
                      height: 56,
                      fontSize: '1rem',
                      '& fieldset': { border: 'none' }, // Clean look
                      boxShadow: theme.shadows[1],
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: theme.shadows[3] },
                      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`, bgcolor: theme.palette.background.paper }
                    }
                  }}
                />

                <TextField
                  fullWidth
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  variant="outlined"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    sx: { 
                      borderRadius: 24, 
                      bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha('#fff', 0.05),
                      height: 56,
                      fontSize: '1rem',
                      '& fieldset': { border: 'none' },
                      boxShadow: theme.shadows[1],
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: theme.shadows[3] },
                      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`, bgcolor: theme.palette.background.paper }
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    py: 2, 
                    borderRadius: 24, 
                    fontSize: '1.05rem', 
                    fontWeight: 800,
                    textTransform: 'none',
                    letterSpacing: '0.02em',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 10px 20px -5px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 15px 30px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Sign In <ArrowRight size={20} />
                    </Box>
                  )}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: theme.palette.text.secondary, opacity: 0.8 }}>
              <ShieldCheck size={16} color={theme.palette.success.main} />
              <Typography variant="caption" fontWeight={600} sx={{ letterSpacing: '0.02em' }}>
                Secured with 256-bit encryption
              </Typography>
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
