import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Container, 
  Stack,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  User,
  MapPin,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { useColorMode } from '../theme';

// 🌟 Floating Golden Dust Canvas Particles Background
const CanvasBackground = () => {
  const canvasRef = React.useRef(null);
  const { mode } = useColorMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = 45;
    const colors = mode === 'dark' 
      ? ['rgba(212, 175, 55, 0.25)', 'rgba(0, 122, 255, 0.15)', 'rgba(88, 86, 214, 0.12)']
      : ['rgba(212, 175, 55, 0.15)', 'rgba(0, 122, 255, 0.1)', 'rgba(88, 86, 214, 0.08)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3.5 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1, // Softly float upwards
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Reset particle if it drifts off screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.vx = -p.vx;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

// 🌟 Ecclesiastical Scripture slideshow
const SCRIPTURES = [
  {
    text: "Enter into His gates with thanksgiving, and into His courts with praise.",
    reference: "Psalm 100:4",
    title: "Gates of Praise"
  },
  {
    text: "For where two or three are gathered together in my name, there am I in the midst of them.",
    reference: "Matthew 18:20",
    title: "Divine Presence"
  },
  {
    text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.",
    reference: "Isaiah 40:31",
    title: "Renewed Strength"
  },
  {
    text: "The Lord bless thee, and keep thee: The Lord make his face shine upon thee.",
    reference: "Numbers 6:24-25",
    title: "Priestly Blessing"
  }
];

const ScriptureShowcase = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCRIPTURES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const scripture = SCRIPTURES[index];

  return (
    <Box sx={{ width: '100%', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Typography variant="overline" sx={{ color: 'var(--system-blue)', fontWeight: 800, letterSpacing: 2, display: 'block', mb: 1.5, opacity: 0.85 }}>
            {scripture.title}
          </Typography>
          <Typography variant="h5" sx={{ fontStyle: 'italic', fontWeight: 550, lineHeight: 1.5, color: '#ffffff', mb: 2.5, letterSpacing: '-0.01em' }}>
            "{scripture.text}"
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontWeight: 700, letterSpacing: 1 }}>
            — {scripture.reference}
          </Typography>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

// 🌟 Styled Glass Input Field
const SleekInput = ({ 
  placeholder,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  endAdornment,
  required = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useTheme();

  return (
    <Box
      component={motion.div}
      animate={{
        boxShadow: isFocused 
          ? '0 0 0 3px rgba(0, 122, 255, 0.15), inset 0 2px 4px rgba(0,0,0,0.02)'
          : '0 0 0 1px rgba(255,255,255,0.03), inset 0 2px 4px rgba(0,0,0,0.01)',
        borderColor: isFocused ? 'var(--system-blue)' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
      }}
      transition={{ duration: 0.2 }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '14px 18px',
        borderRadius: '16px',
        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(10px)',
        border: '1px solid transparent',
        transition: 'background 0.2s',
        '&:hover': {
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      {Icon && (
        <Box 
          component={motion.div}
          animate={{
            scale: isFocused ? 1.05 : 1,
            color: isFocused ? 'var(--system-blue)' : 'var(--text-secondary)'
          }}
          sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}
        >
          <Icon size={18} />
        </Box>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          fontWeight: 600,
          fontFamily: 'var(--font-stack)',
          width: '100%',
        }}
      />
      {endAdornment && (
        <Box sx={{ ml: 1.5, display: 'flex', alignItems: 'center' }}>
          {endAdornment}
        </Box>
      )}
    </Box>
  );
};

// 🌟 Styled Glass Dropdown selector for branches
const SleekBranchSelector = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Selector Trigger */}
      <Box
        onClick={() => setIsOpen(!isOpen)}
        component={motion.div}
        whileTap={{ scale: 0.99 }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderRadius: '16px',
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          border: `1px solid ${isOpen ? 'var(--system-blue)' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <MapPin size={18} color="var(--system-blue)" />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Assigned Branch
            </Typography>
            <Typography sx={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
              {value || 'Select Branch'}
            </Typography>
          </Box>
        </Stack>
        <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', color: 'var(--text-secondary)' }} />
      </Box>

      {/* Floating Options Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            sx={{
              position: 'absolute',
              bottom: '105%', // Opens upwards to avoid hitting other content
              left: 0,
              width: '100%',
              zIndex: 99,
              mb: 1,
              borderRadius: '16px',
              background: theme.palette.mode === 'dark' ? 'rgba(28, 28, 30, 0.96)' : 'rgba(255, 255, 255, 0.96)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              padding: '6px'
            }}
          >
            {options.map((opt) => (
              <Box
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                component={motion.div}
                whileHover={{ x: 4 }}
                sx={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: value === opt ? 'var(--system-blue)' : 'var(--text-primary)',
                  background: value === opt 
                    ? (theme.palette.mode === 'dark' ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)')
                    : 'transparent',
                  transition: 'background 0.2s',
                  '&:hover': {
                    background: value === opt 
                      ? (theme.palette.mode === 'dark' ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.12)')
                      : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
                  }
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: value === opt ? 'var(--system-blue)' : 'transparent',
                    boxShadow: value === opt ? '0 0 8px var(--system-blue)' : 'none'
                  }} />
                  <Typography fontWeight={600} variant="body2">{opt}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

// 🌟 Sliding Tab Switch (Framer Motion enabled)
const SlidingTabSelector = ({ isSignUp, onChange }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        padding: '4px',
        borderRadius: '14px',
        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
        position: 'relative',
        width: '100%',
        mb: 1
      }}
    >
      {/* Sliding Active Pill */}
      <Box
        component={motion.div}
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: isSignUp ? '50%' : 4,
          width: 'calc(50% - 4px)',
          borderRadius: '10px',
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 12px rgba(0,0,0,0.5), inset 1px 1px 0px rgba(255,255,255,0.05)'
            : '0 4px 12px rgba(0,0,0,0.08), inset 1px 1px 0px rgba(255,255,255,0.6)',
          zIndex: 1
        }}
      />

      <Box
        onClick={() => onChange(false)}
        sx={{
          flex: 1,
          py: 1.25,
          textAlign: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: !isSignUp ? 800 : 600,
            color: !isSignUp ? 'var(--text-primary)' : 'var(--text-secondary)',
            transition: 'color 0.2s',
            fontSize: '0.88rem'
          }}
        >
          Sign In
        </Typography>
      </Box>

      <Box
        onClick={() => onChange(true)}
        sx={{
          flex: 1,
          py: 1.25,
          textAlign: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSignUp ? 800 : 600,
            color: isSignUp ? 'var(--text-primary)' : 'var(--text-secondary)',
            transition: 'color 0.2s',
            fontSize: '0.88rem'
          }}
        >
          Register
        </Typography>
      </Box>
    </Box>
  );
};

// 🌟 Styled Glass Theme Mode Toggle
const ThemeToggle = () => {
  const { toggleColorMode, mode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      component={motion.button}
      whileHover={{ scale: 1.08, rotate: 10 }}
      whileTap={{ scale: 0.92 }}
      sx={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10,
        background: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
        backdropFilter: 'blur(10px)',
        color: mode === 'dark' ? 'gold' : 'var(--system-blue)',
        p: 1.25,
        '&:hover': {
          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        }
      }}
    >
      {mode === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
    </IconButton>
  );
};

// 🌟 Premium Gradient Button
const SleekButton = ({ children, loading, type = 'submit', onClick, disabled }) => {
  const theme = useTheme();
  return (
    <Box
      component={motion.button}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.01, y: -1 }}
      whileTap={disabled || loading ? {} : { scale: 0.99, y: 0 }}
      sx={{
        border: 'none',
        outline: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '52px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, var(--system-blue) 0%, var(--system-purple) 100%)',
        color: '#ffffff',
        fontFamily: 'var(--font-stack)',
        fontSize: '0.98rem',
        fontWeight: 800,
        letterSpacing: '0.5px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 30px rgba(0, 122, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 8px 24px rgba(0, 122, 255, 0.18), inset 0 1px 0 rgba(255,255,255,0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          transition: 'none',
        },
        '&:hover::after': {
          left: '100%',
          transition: 'all 0.8s ease-in-out',
        }
      }}
    >
      {loading ? (
        <CircularProgress size={22} sx={{ color: '#ffffff' }} />
      ) : (
        children
      )}
    </Box>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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
      width: '100%',
      display: 'flex', 
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'var(--bg-default)'
    }}>
      {/* 1. Left Panel - Hero Showcase (hidden on mobile) */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '42%',
        position: 'relative',
        background: 'linear-gradient(135deg, #09090E 0%, #151522 100%)',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 6,
        overflow: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {/* Particle Canvas Animation */}
        <CanvasBackground />

        {/* Ambient background glows */}
        <Box sx={{
          position: 'absolute',
          width: '120%',
          height: '100%',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          opacity: 0.35,
          background: 'radial-gradient(circle at 0% 0%, rgba(0, 122, 255, 0.15) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(88, 86, 214, 0.1) 0%, transparent 60%)'
        }} />

        {/* Header Branding */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ zIndex: 1 }}>
          <Box
            component="img"
            src="/ricgcw.png"
            alt="RICGCW Logo"
            sx={{ width: 42, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.15))' }}
          />
          <Box>
            <Typography sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontSize: '1.1rem', lineHeight: 1.1 }}>
              RICGCW
            </Typography>
            <Typography sx={{ fontWeight: 800, color: 'gold', fontSize: '0.625rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Word Assembly
            </Typography>
          </Box>
        </Stack>

        {/* Rotational Scripture Show */}
        <Box sx={{ zIndex: 1, my: 'auto', pr: 4 }}>
          <ScriptureShowcase />
        </Box>

        {/* Showcase Footer */}
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.35)', fontWeight: 600, letterSpacing: 0.5 }}>
            © {new Date().getFullYear()} Rhema Inner Court Network. All Rights Reserved.
          </Typography>
        </Box>
      </Box>

      {/* 2. Right Panel - Glassmorphic Auth Portal */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: { xs: 2, sm: 4 },
      }}>
        {/* Floating Theme Toggle button */}
        <ThemeToggle />

        {/* Dynamic Glow Circles (Floating behind glass) */}
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          <motion.div
            animate={{ 
              x: [0, 45, 0],
              y: [0, -35, 0],
              scale: [1, 1.12, 1],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              top: '12%',
              right: '8%',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 122, 255, 0.08) 0%, transparent 70%)',
              filter: 'blur(75px)',
            }}
          />
          <motion.div
            animate={{ 
              x: [0, -45, 0],
              y: [0, 35, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              bottom: '12%',
              left: '8%',
              width: '480px',
              height: '480px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(88, 86, 214, 0.06) 0%, transparent 70%)',
              filter: 'blur(75px)',
            }}
          />
        </Box>

        <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box sx={{
              background: theme.palette.mode === 'dark' ? 'rgba(28, 28, 30, 0.45)' : 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(30px) saturate(190%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)'}`,
              borderRadius: '24px',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 20px 50px rgba(0,0,0,0.5), inset 1px 1px 0px rgba(255,255,255,0.05)'
                : '0 20px 50px rgba(165,175,190,0.22), inset 1px 1px 0px rgba(255,255,255,0.6)',
              p: { xs: 4, sm: 5 },
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              
              {/* Brand Logo & Portal Header */}
              <Box sx={{ mb: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Box
                    component="img"
                    src="/ricgcw.png"
                    alt="RICGCW Logo"
                    sx={{
                      width: 80,
                      height: 'auto',
                      mb: 2,
                      filter: 'drop-shadow(0 8px 16px rgba(0, 122, 255, 0.2))'
                    }}
                  />
                </motion.div>
                
                <Typography variant="h4" component="h1" sx={{ 
                  fontWeight: 900, 
                  letterSpacing: '-0.03em',
                  mb: 0.5,
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--system-blue) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  RICGCW PORTAL
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.75, display: 'block', color: 'var(--system-blue)' }}>
                  Rhema Inner Court Gospel Church
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {isSignUp ? 'Ministry Registration Portal' : 'Official Administrator Access'}
                </Typography>
              </Box>

              {/* Form Input fields */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  
                  {/* Sliding Tab Controller */}
                  <SlidingTabSelector isSignUp={isSignUp} onChange={setIsSignUp} />

                  {/* Error Notification Alert */}
                  <AnimatePresence>
                    {error && (
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: -12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        style={{ width: '100%' }}
                      >
                        <Box sx={{ 
                          fontWeight: 700, 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.08)', 
                          color: 'var(--system-red)',
                          p: 1.75, 
                          borderRadius: '14px', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          textAlign: 'left',
                          fontSize: '0.825rem',
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 59, 48, 0.25)' : 'rgba(255, 59, 48, 0.15)'}`,
                          boxShadow: '0 4px 12px rgba(255, 59, 48, 0.05)'
                        }}>
                          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(255, 59, 48, 0.15)' }}>
                            <span style={{ fontWeight: 900 }}>!</span>
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                            {error}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </AnimatePresence>

                  {/* Sign Up Exclusive Fields (Full Name & Branch Dropdown) */}
                  <AnimatePresence initial={false} mode="popLayout">
                    {isSignUp && (
                      <Box
                        component={motion.div}
                        key="signup-fields"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <Stack spacing={2.5} sx={{ pb: 2.5 }}>
                          <SleekInput
                            placeholder="Legal Full Name"
                            icon={User}
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />

                          <SleekBranchSelector
                            value={formData.branch}
                            onChange={(val) => setFormData({ ...formData, branch: val })}
                            options={branches}
                          />
                        </Stack>
                      </Box>
                    )}
                  </AnimatePresence>

                  {/* Common Email Field */}
                  <SleekInput
                    placeholder="Ecclesiastical Email"
                    icon={Mail}
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />

                  {/* Common Password Field */}
                  <SleekInput
                    placeholder="Security Password"
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    endAdornment={
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ p: 0.25, color: 'var(--text-secondary)' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    }
                  />

                  {/* Submit Button */}
                  <SleekButton type="submit" loading={loading}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isSignUp ? 'Initialize Account' : 'Secure Sign In'} <ArrowRight size={18} strokeWidth={2.5} />
                    </Box>
                  </SleekButton>

                </Stack>
              </form>

              {/* Secure Shield Encryption Details */}
              <Box sx={{ 
                mt: 4, 
                pt: 2.5, 
                borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 1 
              }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={16} color="var(--system-green)" />
                  <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Rhema Inner Court Network
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', opacity: 0.5, fontWeight: 700, fontSize: '0.625rem', letterSpacing: 0.5 }}>
                  SECURED WITH 256-BIT MILITARY-GRADE ENCRYPTION
                </Typography>
              </Box>

            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
