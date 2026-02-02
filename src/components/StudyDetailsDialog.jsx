import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Box,
  IconButton,
  Typography,
  useTheme,
  Grid,
  Slide,
  LinearProgress,
  Chip
} from '@mui/material';
import { X, BookOpen, Clock, Activity, PlayCircle } from 'lucide-react';

// Transition for the Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StudyDetailsDialog = ({ open, onClose, study }) => {
  const theme = useTheme();

  if (!study) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: 'none',
          boxShadow: theme.shadows[10],
          bgcolor: theme.palette.background.paper
        }
      }}
    >
      {/* --- HEADER --- */}
      <Box sx={{
        px: 3,
        py: 2.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: '#fff'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BookOpen size={22} color="#fff" />
          <Typography variant="h6" fontWeight={700}>Study Details</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
            {study.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            {study.subtitle}
          </Typography>

          <Grid container spacing={3}>
            
            {/* Sessions Count */}
            <Grid item xs={6}>
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.action.hover,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%'
                }}>
                    <Clock size={24} color={theme.palette.primary.main} style={{ marginBottom: 8 }} />
                    <Typography variant="h4" fontWeight={700}>{study.sessions}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>TOTAL SESSIONS</Typography>
                </Box>
            </Grid>

            {/* Progress Status */}
            <Grid item xs={6}>
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.action.hover,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%'
                }}>
                    <Activity size={24} color={study.active ? theme.palette.success.main : theme.palette.text.secondary} style={{ marginBottom: 8 }} />
                    <Typography variant="h4" fontWeight={700} sx={{ color: study.active ? theme.palette.success.main : 'inherit' }}>
                        {study.active ? 'Active' : 'Idle'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>CURRENT STATUS</Typography>
                </Box>
            </Grid>

            {/* Progress Bar */}
            <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={600}>Completion Progress</Typography>
                        <Chip 
                            label={`${study.progress}%`} 
                            size="small" 
                            color={study.progress === 100 ? "success" : "primary"} 
                            sx={{ fontWeight: 700, height: 24 }} 
                        />
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={study.progress} 
                        sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: theme.palette.action.selected,
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                            }
                        }} 
                    />
                </Box>
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1, justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, border: `1px solid ${theme.palette.divider}` }}
        >
          Close
        </Button>
        {study.active && (
            <Button
                onClick={() => alert("Resuming session...")} // In real app, navigate to session
                variant="contained"
                disableElevation
                startIcon={<PlayCircle size={18} />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
                Resume Session
            </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudyDetailsDialog;