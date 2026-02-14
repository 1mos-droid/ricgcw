import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Typography,
  useTheme,
  Grid
} from '@mui/material';
import { X, BookOpen } from 'lucide-react';

const StudyDetailsDialog = ({ open, onClose, study }) => {
  const theme = useTheme();

  if (!study) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <Box sx={{
        px: 3,
        py: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BookOpen size={20} color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={700}>{study.title}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Subtitle</Typography>
            <Typography variant="body1">{study.subtitle}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Sessions</Typography>
            <Typography variant="body1">{study.sessions}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Progress</Typography>
            <Typography variant="body1">{study.progress}%</Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudyDetailsDialog;
