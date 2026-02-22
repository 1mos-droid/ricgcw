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
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AddResourceDialog = ({ open, onClose, onResourceAdded }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);

    try {
      const response = await axios.post(`${API_BASE_URL}/resources/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onResourceAdded(response.data);
      handleClose();
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to upload resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setType('pdf');
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
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" fontWeight={700}>Add New Resource</Typography>
        <IconButton onClick={handleClose} size="small">
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">
              Resource Type
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={type === 'pdf' ? 'contained' : 'outlined'}
                onClick={() => setType('pdf')}
                startIcon={<FileText size={18} />}
                sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}
              >
                PDF
              </Button>
              <Button
                variant={type === 'audio' ? 'contained' : 'outlined'}
                onClick={() => setType('audio')}
                startIcon={<Music size={18} />}
                sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}
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
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}>
                <Upload size={32} color={theme.palette.primary.main} style={{ marginBottom: 8 }} />
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {file ? file.name : 'Click to select or drag file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {type === 'pdf' ? 'PDF (max 10MB)' : 'MP3, WAV (max 50MB)'}
                </Typography>
              </Box>
            </label>
          </Box>

          {error && (
            <Typography color="error" variant="caption" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !file || !title}
          sx={{ 
            borderRadius: 2, 
            fontWeight: 700, 
            px: 4,
            minWidth: 120
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddResourceDialog;
