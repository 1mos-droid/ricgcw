import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
  Grid,
  Slider
} from '@mui/material';
import { X, BookOpen, Layers, Type, FileText } from 'lucide-react';

import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

import { useWorkspace } from '../context/WorkspaceContext';

const AddStudyDialog = ({ open, onClose, onStudyAdded }) => {
  const theme = useTheme();
  const { currentDepartment, isDepartmentRestricted } = useWorkspace();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    department: isDepartmentRestricted ? currentDepartment : '',
    sessions: 1,
    progress: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name) => (e, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.subtitle) {
      setError('Please provide both a title and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const studyData = {
        ...formData,
        department: formData.department || null,
        sessions: Number(formData.sessions),
        progress: Number(formData.progress),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "bible-studies"), studyData);
      
      onStudyAdded({ id: docRef.id, ...studyData });
      handleClose();
    } catch (err) {
      console.error('Firestore save error:', err);
      setError('Failed to save study module. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      subtitle: '',
      department: isDepartmentRestricted ? currentDepartment : '',
      sessions: 1,
      progress: 0,
      active: true
    });
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4 }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.02)
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <BookOpen size={20} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={800}>New Study Module</Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" sx={{ bgcolor: theme.palette.action.hover }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Module Title"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. The Book of Acts"
            required
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            label="Brief Description"
            name="subtitle"
            fullWidth
            multiline
            rows={2}
            value={formData.subtitle}
            onChange={handleChange}
            placeholder="A deep dive into the early church..."
            required
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            select
            fullWidth
            label="Assigned Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled={isDepartmentRestricted}
            SelectProps={{ native: false }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            <MenuItem value="">Global / All</MenuItem>
            <MenuItem value="Youth">Youth</MenuItem>
            <MenuItem value="Children's Court">Children's Court</MenuItem>
            <MenuItem value="Mens">Mens</MenuItem>
            <MenuItem value="Women">Women</MenuItem>
          </TextField>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
                    TOTAL SESSIONS: {formData.sessions}
                </Typography>
                <Slider
                    value={formData.sessions}
                    onChange={handleSliderChange('sessions')}
                    min={1}
                    max={20}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
                    INITIAL PROGRESS: {formData.progress}%
                </Typography>
                <Slider
                    value={formData.progress}
                    onChange={handleSliderChange('progress')}
                    min={0}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                />
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" variant="caption" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.error.main, 0.05), p: 1, borderRadius: 2 }}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700, borderRadius: 2.5 }}>
          Discard
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.title || !formData.subtitle}
          sx={{ 
            borderRadius: 2.5, 
            fontWeight: 800, 
            px: 4,
            minWidth: 140,
            boxShadow: theme.shadows[4]
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Module'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudyDialog;
