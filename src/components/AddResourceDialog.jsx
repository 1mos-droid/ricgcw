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
  useTheme
} from '@mui/material';
import { X, Upload, FileText, Music } from 'lucide-react';

import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

import { useWorkspace } from '../context/WorkspaceContext';

const AddResourceDialog = ({ open, onClose, onResourceAdded }) => {
  const theme = useTheme();
  const { currentDepartment, isDepartmentRestricted } = useWorkspace();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [department, setDepartment] = useState(isDepartmentRestricted ? currentDepartment : '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-set title if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      // Auto-set type based on extension
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (['mp3', 'wav', 'm4a'].includes(ext)) {
        setType('audio');
      } else {
        setType('pdf');
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !title) {
      setError('Please provide both a title and a file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real Firebase migration, we would upload to Storage first.
      // For now, as per Firestore SDK migration instructions, we store metadata.
      const resourceData = {
        title,
        type,
        department: department || null,
        fileName: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        createdAt: new Date().toISOString(),
        link: 'https://firebasestorage.googleapis.com/v0/b/thegatheringplace-app.appspot.com/o/placeholder.pdf?alt=media' // Placeholder
      };

      const docRef = await addDoc(collection(db, "resources"), resourceData);
      
      onResourceAdded({ id: docRef.id, ...resourceData });
      handleClose();
    } catch (err) {
      console.error('Firestore save error:', err);
      setError('Failed to save resource metadata to Firestore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setType('pdf');
    setDepartment(isDepartmentRestricted ? currentDepartment : '');
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="xs"
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
        <Typography variant="h6" fontWeight={800}>Add New Resource</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ bgcolor: theme.palette.action.hover }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Resource Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly Study Guide"
            required
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            select
            fullWidth
            label="Target Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
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

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
              Resource Type
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={type === 'pdf' ? 'contained' : 'outlined'}
                onClick={() => setType('pdf')}
                startIcon={<FileText size={18} />}
                sx={{ flex: 1, borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
              >
                PDF
              </Button>
              <Button
                variant={type === 'audio' ? 'contained' : 'outlined'}
                onClick={() => setType('audio')}
                startIcon={<Music size={18} />}
                sx={{ flex: 1, borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
              >
                Audio
              </Button>
            </Stack>
          </Box>

          <Box>
            <input
              accept={type === 'pdf' ? '.pdf' : 'audio/*'}
              style={{ display: 'none' }}
              id="resource-file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="resource-file-upload">
              <Box sx={{
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'scale(1.01)'
                }
              }}>
                <Upload size={32} color={theme.palette.primary.main} style={{ marginBottom: 8 }} />
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {file ? file.name : 'Click to select or drag file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {type === 'pdf' ? 'PDF (max 10MB)' : 'MP3, WAV (max 50MB)'}
                </Typography>
              </Box>
            </label>
          </Box>

          {error && (
            <Typography color="error" variant="caption" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.error.main, 0.05), p: 1, borderRadius: 2 }}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700, borderRadius: 2.5 }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !file || !title}
          sx={{ 
            borderRadius: 2.5, 
            fontWeight: 800, 
            px: 4,
            minWidth: 120,
            boxShadow: theme.shadows[4]
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddResourceDialog;
