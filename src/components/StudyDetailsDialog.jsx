import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
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
  Chip,
  alpha,
  Stack,
  Avatar,
  Card
} from '@mui/material';
import { X, BookOpen, Clock, Activity, PlayCircle } from 'lucide-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StudyDetailsDialog = ({ open, onClose, study }) => {
  const theme = useTheme();
  const { showNotification } = useWorkspace();

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
          borderRadius: 4,
          backgroundImage: 'none',
          overflow: 'hidden'
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
        bgcolor: alpha(theme.palette.primary.main, 0.03)
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40, borderRadius: 2.5 }}>
            <BookOpen size={20} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800}>Module Overview</Typography>
            <Typography variant="caption" color="text.secondary">Detailed curriculum insights</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: theme.palette.action.hover }}>
          <X size={18} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em" gutterBottom color="text.primary">
            {study.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, fontWeight: 500 }}>
            {study.subtitle}
          </Typography>

          <Grid container spacing={2}>
            
            {/* Sessions Count */}
            <Grid size={{ xs: 6 }}>
                <Card variant="outlined" sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderStyle: 'dashed'
                }}>
                    <Clock size={22} color={theme.palette.primary.main} style={{ marginBottom: 12 }} />
                    <Typography variant="h4" fontWeight={800}>{study.sessions}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>SESSIONS</Typography>
                </Card>
            </Grid>

            {/* Progress Status */}
            <Grid size={{ xs: 6 }}>
                <Card variant="outlined" sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    bgcolor: alpha(study.active ? theme.palette.success.main : theme.palette.text.disabled, 0.02),
                    borderStyle: 'dashed'
                }}>
                    <Activity size={22} color={study.active ? theme.palette.success.main : theme.palette.text.disabled} style={{ marginBottom: 12 }} />
                    <Typography variant="h4" fontWeight={800} sx={{ color: study.active ? theme.palette.success.main : theme.palette.text.disabled }}>
                        {study.active ? 'Active' : 'Idle'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>STATUS</Typography>
                </Card>
            </Grid>

            {/* Progress Bar */}
            <Grid size={{ xs: 12 }}>
                <Box sx={{ mt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={800}>COMPLETION PROGRESS</Typography>
                        <Chip 
                            label={`${study.progress}%`} 
                            size="small" 
                            color={study.progress === 100 ? "success" : "primary"} 
                            sx={{ fontWeight: 800, borderRadius: 1.5, height: 24 }} 
                        />
                    </Stack>
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
      <DialogActions sx={{ px: 4, pb: 4, pt: 1, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 3, color: theme.palette.text.secondary }}
        >
          Close
        </Button>
        {study.active && (
            <Button
                onClick={() => showNotification("Resuming session...", "info")} 
                variant="contained"
                startIcon={<PlayCircle size={18} />}
                sx={{ borderRadius: 2.5, fontWeight: 800, px: 4, py: 1.2, boxShadow: theme.shadows[4] }}
            >
                Resume Study
            </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudyDetailsDialog;