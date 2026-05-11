import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Container,
  MenuItem,
  Stack
} from '@mui/material';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Church,
  MapPin,
  UserPlus
} from 'lucide-react';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { refreshUserContext } = useWorkspace();
  const { login, signup, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate, isAuthenticated]);

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    branch: 'Mallam' 
  });
  const [error, setError] = useState('');

  const branches = ['Mallam', 'Langma', 'Kokrobitey', 'Diaspora', 'Overseer'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    if (isSignUp && !formData.name) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        await signup(formData.email, formData.password, formData.name, formData.branch);
      } else {
        await login(formData.email, formData.password);
      }
      refreshUserContext();
      navigate('/');
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || 'Authentication failed. Please try again.');
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
        ? `radial-gradient(circle at 50% 0%, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%)`
        : `radial-gradient(circle at 50% 0%, #020617 0%, #0F172A 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Premium Dynamic Background */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '-5%',
            right: '0%',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: theme.palette.mode === 'light' 
              ? 'radial-gradient(circle, rgba(16, 52, 166, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </Box>

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card sx={{ 
            p: { xs: 4, sm: 6 }, 
            borderRadius: 10, 
            bgcolor: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 1)' 
              : 'rgba(13, 17, 23, 1)',
            border: `2px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'light'
              ? '0 40px 80px -20px rgba(0, 0, 0, 0.15)'
              : '0 40px 80px -20px rgba(0, 0, 0, 0.8)',
            textAlign: 'center'
          }}>
            
            <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="/ricgcw.png"
                  alt="RICGCW Logo"
                  sx={{
                    width: 120,
                    height: 'auto',
                    mb: 3,
                    filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`
                  }}
                />
              </motion.div>
              
              <Typography variant="h3" sx={{ 
                fontFamily: '"Playfair Display", serif', 
                fontWeight: 900, 
                color: theme.palette.text.primary,
                letterSpacing: '-0.02em',
                mb: 1,
                lineHeight: 1
              }}>
                RICGCW
              </Typography>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                Rhema Inner Court Gospel Church
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, opacity: 0.8 }}>
                {isSignUp ? 'Ministry Registration' : 'Official Portal Access'}
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Typography variant="caption" color="error" sx={{ 
                      fontWeight: 800, 
                      bgcolor: alpha(theme.palette.error.main, 0.08), 
                      p: 2, 
                      borderRadius: 4, 
                      display: 'block',
                      border: `1px solid ${theme.palette.error.main}`
                    }}>
                      {error}
                    </Typography>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      key="signup-fields"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Stack spacing={3}>
                        <TextField
                          fullWidth
                          label="Legal Full Name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          sx={{ '& .MuiInputBase-root': { borderRadius: 4, bgcolor: alpha(theme.palette.text.primary, 0.02), fontWeight: 700 } }}
                        />

                        <TextField
                          fullWidth
                          select
                          label="Assigned Branch"
                          required
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          sx={{ '& .MuiInputBase-root': { borderRadius: 4, bgcolor: alpha(theme.palette.text.primary, 0.02), fontWeight: 700, textAlign: 'left' } }}
                        >
                          {branches.map((b) => (
                            <MenuItem key={b} value={b} sx={{ fontWeight: 700 }}>{b}</MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>

                <TextField
                  fullWidth
                  label="Ecclesiastical Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={{ '& .MuiInputBase-root': { borderRadius: 4, bgcolor: alpha(theme.palette.text.primary, 0.02), fontWeight: 700 } }}
                />

                <TextField
                  fullWidth
                  label="Security Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiInputBase-root': { borderRadius: 4, bgcolor: alpha(theme.palette.text.primary, 0.02), fontWeight: 700 } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    height: 64, 
                    borderRadius: 5, 
                    fontSize: '1.1rem', 
                    fontWeight: 900,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.5)}`
                    }
                  }}
                >
                  {loading ? <CircularProgress size={28} color="inherit" /> : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {isSignUp ? 'Initialize Account' : 'Secure Sign In'} <ArrowRight size={22} strokeWidth={3} />
                    </Box>
                  )}
                </Button>

                <Button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}
                >
                  {isSignUp ? 'Back to Authentication' : 'Create New Access'}
                </Button>
              </Stack>
            </form>
...
            <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: theme.palette.text.secondary }}>
                <ShieldCheck size={18} color={theme.palette.success.main} />
                <Typography variant="caption" fontWeight={900} sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Rhema Inner Court Network
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontWeight: 700, fontSize: '0.65rem' }}>
                SECURED WITH 256-BIT MILITARY-GRADE ENCRYPTION
              </Typography>
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;

