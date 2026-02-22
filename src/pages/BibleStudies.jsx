import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  LinearProgress, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  IconButton, 
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Skeleton,
  Snackbar,
  Alert,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  BookOpen, 
  Download, 
  Play, 
  ChevronRight, 
  FileText, 
  Headphones, 
  Bookmark,
  Search,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import StudyDetailsDialog from '../components/StudyDetailsDialog';
import AddResourceDialog from '../components/AddResourceDialog';

import { API_BASE_URL } from '../config';

const BibleStudies = () => {
  const theme = useTheme();
  const { showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState(0);
  const [studySeries, setStudySeries] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching Bible Studies from:", `${API_BASE_URL}/bible-studies/`);
        const [seriesRes, resourcesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/bible-studies/`),
          axios.get(`${API_BASE_URL}/resources/`),
        ]);
        setStudySeries(seriesRes.data || []);
        setResources(resourcesRes.data || []);
      } catch (err) {
        console.error("Bible Studies Sync Error:", err.response?.data || err.message);
        showNotification("Failed to load content. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showNotification]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleResourceAdded = (newResource) => {
    setResources(prev => [newResource, ...prev]);
    showNotification(`Successfully uploaded ${newResource.title}`, "success");
  };

  const handleDeleteResource = async (resource) => {
    showConfirmation({
      title: "Delete Resource",
      message: `Are you sure you want to delete "${resource.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/resources/${resource.id}/`);
          setResources(prev => prev.filter(r => r.id !== resource.id));
          showNotification(`Deleted ${resource.title}`, "success");
        } catch (err) {
          console.error("Delete Resource Error:", err.response?.data || err.message);
          showNotification("Failed to delete resource.", "error");
        }
      }
    });
  };

  // --- 🟢 NEW: HANDLE GOOGLE DRIVE LINKS ---
  const handleOpenResource = (resource) => {
    if (!resource.link) {
      showNotification("Resource link not available yet.", "warning");
      return;
    }
    showNotification(`Opening ${resource.title}...`, "info");
    window.open(resource.link, '_blank', 'noopener,noreferrer');
  };

  // Filter Logic
  const filteredResources = resources.filter(res => {
    const termMatch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filterType === 'all' || res.type === filterType;
    return termMatch && typeMatch;
  });

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
          EDUCATION
        </Typography>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          color: theme.palette.text.primary,
          letterSpacing: '-0.02em'
        }}>
          Scripture & Study
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Theological resources and weekly curriculum
        </Typography>
      </Box>

      {/* --- HERO CARD (Scripture) --- */}
      {loading ? (
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 5 }} />
      ) : (
        <Card 
          sx={{ 
            p: { xs: 3, sm: 5 },
            mb: 5, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: theme.shadows[6]
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: { xs: '100%', md: '80%' } }}>
            <Chip 
              label="Scripture of the Week" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mb: 3, backdropFilter: 'blur(4px)', fontWeight: 700 }} 
            />
            <Typography variant="h3" component="div" sx={{ 
              fontFamily: '"Playfair Display", serif', 
              fontStyle: 'italic', 
              mb: 3, 
              lineHeight: 1.3, 
              fontWeight: 700
            }}>
              "Do not conform to the pattern of this world, but be transformed by the renewing of your mind."
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 700, letterSpacing: 1 }}>
              — ROMANS 12:2
            </Typography>
          </Box>
          
          <BookOpen 
            size={240} 
            color="#fff" 
            style={{ 
              position: 'absolute', 
              right: -60, 
              bottom: -80, 
              opacity: 0.1, 
              transform: 'rotate(-15deg)',
              pointerEvents: 'none'
            }} 
          />
        </Card>
      )}

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: CURRICULUM & RESOURCES --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="study tabs"
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ '& .MuiTab-root': { fontWeight: 700, minHeight: 64 } }}
            >
              <Tab label="Active Modules" />
              <Tab label="Resource Library" />
            </Tabs>
          </Box>

          {/* Tab Panel 1: Modules */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {loading ? (
                 Array.from(new Array(4)).map((_, i) => (
                   <Grid size={{ xs: 12, sm: 6 }} key={i}>
                     <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                         <Skeleton variant="circular" width={40} height={40} />
                         <Skeleton variant="rounded" width={60} height={24} />
                       </Box>
                       <Skeleton variant="text" height={32} width="80%" sx={{ mb: 1 }} />
                       <Skeleton variant="text" width="60%" sx={{ mb: 3 }} />
                       <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
                     </Card>
                   </Grid>
                 ))
              ) : studySeries.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                    <BookOpen size={48} style={{ marginBottom: 16 }} />
                    <Typography>No study modules available currently.</Typography>
                  </Box>
                </Grid>
              ) : (
                studySeries.map((study) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={study.id}>
                    <Card 
                      sx={{ 
                        p: 3, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: 3,
                        border: study.active ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: study.active ? theme.palette.primary.main : theme.palette.action.selected,
                          color: study.active ? '#fff' : theme.palette.text.secondary,
                          borderRadius: 2
                        }}>
                          <Bookmark size={20} />
                        </Avatar>
                        {study.active && <Chip label="Current" color="primary" size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />}
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
                        {study.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                        {study.subtitle}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>{study.sessions} Sessions</Typography>
                          {study.active && <Typography variant="caption" color="primary.main" fontWeight={700}>{study.progress}% Complete</Typography>}
                        </Box>
                        {study.active && (
                          <LinearProgress variant="determinate" value={study.progress} sx={{ borderRadius: 2, height: 6 }} />
                        )}
                      </Box>

                      {study.active ? (
                        <Button 
                          variant="contained" 
                          endIcon={<ChevronRight size={16} />} 
                          fullWidth 
                          onClick={() => showNotification("Resuming study session...", "info")}
                          sx={{ borderRadius: 2, fontWeight: 700, boxShadow: 'none' }}
                        >
                          Resume Study
                        </Button>
                      ) : (
                        <Button variant="outlined" color="inherit" fullWidth sx={{ color: 'text.secondary', borderRadius: 2, fontWeight: 600 }} onClick={() => setSelectedStudy(study)}>
                          View Details
                        </Button>
                      )}
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {/* Tab Panel 2: Resources */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3, 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}>
                <TextField
                  fullWidth
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={18} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
                  {['all', 'pdf', 'audio'].map((type) => (
                    <Button 
                      key={type}
                      size="small"
                      variant={filterType === type ? 'contained' : 'outlined'} 
                      onClick={() => setFilterType(type)}
                      sx={{ flex: 1, textTransform: 'capitalize', borderRadius: 2, fontWeight: 600 }}
                    >
                      {type}
                    </Button>
                  ))}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Plus size={18} />}
                    onClick={() => setIsAddResourceOpen(true)}
                    sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                  >
                    Add Resource
                  </Button>
                </Box>
              </Box>

              <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <List sx={{ p: 0 }}>
                  {filteredResources.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                      <Typography color="text.secondary" fontWeight={500}>No resources match your search.</Typography>
                    </Box>
                  ) : (
                    filteredResources.map((res, index) => (
                      <React.Fragment key={res.id}>
                        <ListItem
                          sx={{ 
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                            cursor: 'pointer',
                            py: 2,
                            px: 3
                          }}
                          onClick={() => handleOpenResource(res)}
                          secondaryAction={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  handleOpenResource(res);
                                }}
                                sx={{ color: theme.palette.primary.main }}
                              >
                                {res.type === 'audio' ? <Play size={20} /> : <Download size={20} />}
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  handleDeleteResource(res);
                                }}
                                color="error"
                              >
                                <Trash2 size={20} />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1), 
                              color: theme.palette.primary.main,
                              width: 40,
                              height: 40,
                              borderRadius: 2
                            }}>
                              {res.type === 'pdf' ? <FileText size={20} /> : <Headphones size={20} />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={res.title}
                            primaryTypographyProps={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.text.primary }}
                            secondary={`${res.type.toUpperCase()} • ${res.size}`}
                            secondaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                          />
                        </ListItem>
                        {index < filteredResources.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))
                  )}
                </List>
              </Card>
            </Box>
          )}
        </Grid>

        {/* --- RIGHT COL: SIDEBAR RESOURCES --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: theme.palette.text.primary }}>
            Recent Material
          </Typography>
          
          <Card sx={{ mb: 4, maxHeight: '400px', overflowY: 'auto', borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <List disablePadding>
              {loading ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton height={50} sx={{ mb: 1 }} />
                  <Skeleton height={50} sx={{ mb: 1 }} />
                  <Skeleton height={50} />
                </Box>
              ) : resources.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent materials found." sx={{ textAlign: 'center', opacity: 0.6 }} />
                </ListItem>
              ) : (
                resources.slice(0, 5).map((res, index) => (
                  <React.Fragment key={res.id}>
                    <ListItem 
                      onClick={() => handleOpenResource(res)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }, py: 1.5 }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenResource(res);
                          }}
                        >
                          {res.type === 'audio' ? <Play size={16} /> : <Download size={16} />}
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: theme.palette.background.default, 
                          color: theme.palette.text.secondary,
                          width: 32,
                          height: 32,
                          borderRadius: 2
                        }}>
                          {res.type === 'pdf' ? <FileText size={16} /> : <Headphones size={16} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={res.title} 
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                        secondary={`${res.type.toUpperCase()} • ${res.size}`}
                        secondaryTypographyProps={{ fontSize: 11 }}
                      />
                    </ListItem>
                    {index < Math.min(resources.length, 5) - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Card>

          {/* Quote Box */}
          <Card sx={{ 
            p: 4, 
            bgcolor: alpha(theme.palette.secondary.main, 0.08), 
            border: 'none', 
            boxShadow: 'none', 
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography variant="h1" sx={{ color: theme.palette.secondary.main, opacity: 0.1, position: 'absolute', top: -10, left: 10, fontSize: '6rem' }}>
              “
            </Typography>
            <Typography variant="h6" sx={{ fontStyle: 'italic', color: theme.palette.text.primary, mb: 2, position: 'relative', zIndex: 1, fontWeight: 500, lineHeight: 1.6 }}>
              To understand the scripture is to understand the heart of God.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* --- DIALOGS & ALERTS --- */}
      <StudyDetailsDialog
        open={selectedStudy !== null}
        onClose={() => setSelectedStudy(null)}
        study={selectedStudy}
      />

      <AddResourceDialog
        open={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        onResourceAdded={handleResourceAdded}
      />

    </Box>
  );
};

export default BibleStudies;