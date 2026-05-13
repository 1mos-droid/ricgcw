import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  IconButton, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  alpha, 
  useTheme, 
  Container, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  Chip,
  Paper
} from '@mui/material';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Plus, 
  X, 
  Download, 
  Trash2, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { uploadToHuggingFace } from '../utils/huggingFaceApi';

const Gallery = () => {
  const theme = useTheme();
  const { showNotification, showConfirmation, filterData } = useWorkspace();
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Upload State
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const imageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(imageData);
    } catch (err) {
      console.error("Gallery Fetch Error:", err);
      showNotification("Failed to load gallery.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification("Please select an image file.", "warning");
        return;
      }
      setNewImageFile(file);
      if (!newImageTitle) {
        setNewImageTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!newImageFile || !newImageTitle) {
      showNotification("Title and image are required.", "warning");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadToHuggingFace(newImageFile);
      
      const imageData = {
        title: newImageTitle,
        url: imageUrl,
        fileName: newImageFile.name,
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, "gallery"), imageData);
      setImages([{ id: docRef.id, ...imageData }, ...images]);
      
      showNotification("Image uploaded to Hugging Face successfully!", "success");
      handleCloseUpload();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUpload = () => {
    setUploadOpen(false);
    setNewImageTitle('');
    setNewImageFile(null);
  };

  const handleDelete = async (id, title) => {
    showConfirmation({
      title: "Delete Image",
      message: `Permanently remove "${title}" from the gallery?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "gallery", id));
          setImages(images.filter(img => img.id !== id));
          showNotification("Image removed from gallery.");
        } catch (err) {
          showNotification("Failed to delete.", "error");
        }
      }
    });
  };

  const filteredImages = useMemo(() => {
    return images.filter(img => 
      (img.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [images, searchTerm]);

  return (
    <Box sx={{ pb: 8 }}>
      
      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 6, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 8,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`
           : alpha(theme.palette.primary.main, 0.05),
        overflow: 'hidden'
      }}>
        <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Chip icon={<Sparkles size={14} />} label="Member Gallery" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                    Community Media
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                    A shared space for memories and moments from our congregation. Powered by Hugging Face storage.
                </Typography>
            </motion.div>
        </Container>
      </Box>

      {/* --- COMMAND BAR --- */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 6, 
          mb: 5, 
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
          bgcolor: alpha(theme.palette.background.paper, 0.8), 
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 20,
          zIndex: 10,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              placeholder="Search gallery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, height: 56, bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.5) } }}
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search size={18} strokeWidth={2.5} color={theme.palette.primary.main} />
                    </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<Plus size={22} />}
              onClick={() => setUploadOpen(true)}
              sx={{ 
                height: 56, 
                borderRadius: 4, 
                px: 4, 
                fontWeight: 800,
                boxShadow: `0 12px 24px -6px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': { 
                    boxShadow: `0 16px 32px -8px ${alpha(theme.palette.primary.main, 0.5)}`,
                    transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              Upload Image
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- GALLERY GRID --- */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : filteredImages.length === 0 ? (
        <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 8 }}>
          <ImageIcon size={64} color={theme.palette.text.disabled} style={{ marginBottom: 16, opacity: 0.5 }} />
          <Typography variant="h6" fontWeight={800} color="text.secondary">No images yet</Typography>
          <Typography variant="body2" color="text.secondary">Be the first to share a moment!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredImages.map((img, idx) => (
            <Grid key={img.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card sx={{ 
                  position: 'relative', 
                  borderRadius: 5, 
                  overflow: 'hidden',
                  '&:hover .image-overlay': { opacity: 1 }
                }}>
                  <Box 
                    component="img" 
                    src={img.url} 
                    alt={img.title}
                    crossOrigin="anonymous"
                    sx={{ 
                      width: '100%', 
                      height: 250, 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  
                  {/* Overlay */}
                  <Box 
                    className="image-overlay"
                    sx={{ 
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      bgcolor: 'rgba(0,0,0,0.4)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      p: 2, opacity: 0, transition: 'opacity 0.3s',
                      backdropFilter: 'blur(2px)'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>{img.title}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Full">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => setSelectedImage(img)}>
                          <Maximize2 size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => window.open(img.url, '_blank')}>
                          <Download size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => handleDelete(img.id, img.title)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* --- UPLOAD DIALOG --- */}
      <Dialog open={uploadOpen} onClose={handleCloseUpload} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: `1px solid ${theme.palette.divider}` }}>Upload Community Media</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <TextField 
              label="Image Title" 
              fullWidth 
              value={newImageTitle} 
              onChange={(e) => setNewImageTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            
            <Box>
              <input accept="image/*" style={{ display: 'none' }} id="gallery-upload" type="file" onChange={handleFileChange} />
              <label htmlFor="gallery-upload">
                <Box sx={{
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 4, p: 4, textAlign: 'center', cursor: 'pointer',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }
                }}>
                  <Upload size={32} color={theme.palette.primary.main} style={{ marginBottom: 8 }} />
                  <Typography variant="body2" fontWeight={700}>
                    {newImageFile ? newImageFile.name : 'Select an image'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">PNG, JPG, WEBP</Typography>
                </Box>
              </label>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseUpload} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpload} 
            disabled={uploading || !newImageFile || !newImageTitle}
            sx={{ borderRadius: 2, fontWeight: 800, minWidth: 100 }}
          >
            {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- FULL VIEW DIALOG --- */}
      <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="lg" PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton sx={{ position: 'absolute', right: -40, top: 0, color: '#fff' }} onClick={() => setSelectedImage(null)}><X size={32} /></IconButton>
          {selectedImage && (
            <Box component="img" src={selectedImage.url} alt={selectedImage.title} sx={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 4 }} />
          )}
        </Box>
      </Dialog>

    </Box>
  );
};

export default Gallery;
