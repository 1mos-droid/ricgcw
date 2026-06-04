import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  useTheme, 
  Paper,
  alpha,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import { 
  RefreshCcw, 
  Home, 
  AlertCircle, 
  Heart,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Sentry will automatically catch this if initialized, 
    // but you could also explicitly log it here.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} onHome={this.handleGoHome} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ onReset, onHome }) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.default} 100%)`,
        p: 3
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 4, md: 6 }, 
              borderRadius: 8, 
              textAlign: 'center',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 32px 64px -12px ${alpha(theme.palette.primary.main, 0.15)}`,
              background: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)'
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.error.main, 0.1), 
                color: theme.palette.error.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4
              }}
            >
              <AlertCircle size={40} />
            </Box>

            <Typography variant="h3" fontWeight={900} sx={{ mb: 2, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em' }}>
              Something went wrong
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6 }}>
              But take heart—God is still in control. The system encountered an unexpected issue, but we're working to restore the sanctuary for you.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 6 }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<RefreshCcw size={18} />}
                onClick={onReset}
                sx={{ 
                  borderRadius: 2, 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 800,
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Try Again
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<Home size={18} />}
                onClick={onHome}
                sx={{ borderRadius: 2, py: 1.5, px: 4, fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Return to Sanctuary
              </Button>
            </Stack>

            <Divider sx={{ mb: 4, opacity: 0.5 }}>
              <Chip label="SUPPORT" size="small" sx={{ fontWeight: 800, letterSpacing: 1 }} />
            </Divider>

            <Stack direction="row" spacing={3} justifyContent="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Heart size={16} color={theme.palette.primary.main} />
                <Typography variant="caption" fontWeight={700}>We've been notified</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <MessageCircle size={16} color={theme.palette.primary.main} />
                <Typography variant="caption" fontWeight={700}>support@ricgcw.org</Typography>
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;
