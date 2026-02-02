import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Alert
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  BookOpen, 
  Download, 
  Play, 
  ChevronRight, 
  FileText, 
  Headphones, 
  Bookmark,
  Search
} from 'lucide-react';
import axios from 'axios';
import StudyDetailsDialog from '../components/StudyDetailsDialog';

const API_BASE_URL = 'http://localhost:3002/api';

const BibleStudies = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState(0);
  const [studySeries, setStudySeries] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate network delay if needed, or remove for production
        // await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        const [seriesRes, resourcesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/bible-studies`),
          axios.get(`${API_BASE_URL}/resources`),
        ]);
        setStudySeries(seriesRes.data);
        setResources(resourcesRes.data);
      } catch (err) {
        console.error("Sync Error:", err);
        showSnackbar("Failed to load content. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
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
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: theme.palette.text.primary,
          fontSize: { xs: '1.5rem', sm: '2.125rem' }
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
            p: { xs: 3, sm: 4 },
            mb: 5, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: theme.shadows[4]
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: { xs: '100%', md: '80%' } }}>
            <Chip 
              label="Scripture of the Week" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mb: 2, backdropFilter: 'blur(4px)' }} 
            />
            <Typography variant="h4" component="div" sx={{ 
              fontFamily: '"Playfair Display", serif', 
              fontStyle: 'italic', 
              mb: 2, 
              lineHeight: 1.4, 
              fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } 
            }}>
              "Do not conform to the pattern of this world, but be transformed by the renewing of your mind."
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 600 }}>
              — Romans 12:2
            </Typography>
          </Box>
          
          {/* Decorative Icon Background */}
          <BookOpen 
            size={180} 
            color="#fff" 
            style={{ 
              position: 'absolute', 
              right: -40, 
              bottom: -60, 
              opacity: 0.1, 
              transform: 'rotate(-15deg)',
              pointerEvents: 'none'
            }} 
          />
        </Card>
      )}

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: CURRICULUM & RESOURCES --- */}
        <Grid item xs={12} md={8}>
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
            >
              <Tab label="Active Modules" />
              <Tab label="Resource Library" />
            </Tabs>
          </Box>

          {/* Tab Panel 1: Modules */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {loading ? (
                 // Loading Skeletons for Modules
                 Array.from(new Array(4)).map((_, i) => (
                   <Grid item xs={12} sm={6} key={i}>
                     <Card sx={{ p: 3, height: '100%' }}>
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
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                    <BookOpen size={48} style={{ marginBottom: 16 }} />
                    <Typography>No study modules available currently.</Typography>
                  </Box>
                </Grid>
              ) : (
                studySeries.map((study) => (
                  <Grid item xs={12} sm={6} key={study.id}>
                    <Card 
                      sx={{ 
                        p: 3, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        border: study.active ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[3] }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: study.active ? theme.palette.primary.main : theme.palette.action.selected,
                          color: study.active ? '#fff' : theme.palette.text.secondary
                        }}>
                          <Bookmark size={20} />
                        </Avatar>
                        {study.active && <Chip label="Current" color="primary" size="small" />}
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: theme.palette.text.primary }}>
                        {study.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                        {study.subtitle}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">{study.sessions} Sessions</Typography>
                          {study.active && <Typography variant="caption" color="primary.main">{study.progress}% Complete</Typography>}
                        </Box>
                        {study.active && (
                          <LinearProgress variant="determinate" value={study.progress} sx={{ borderRadius: 2, height: 6 }} />
                        )}
                      </Box>

                      {study.active ? (
                        <Button 
                          variant="outlined" 
                          endIcon={<ChevronRight size={16} />} 
                          fullWidth 
                          onClick={() => showSnackbar("Resuming study session...", "info")}
                        >
                          Resume Study
                        </Button>
                      ) : (
                        <Button color="inherit" sx={{ color: 'text.secondary' }} onClick={() => setSelectedStudy(study)}>
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
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
                  <Button 
                    size="small"
                    variant={filterType === 'all' ? 'contained' : 'outlined'} 
                    onClick={() => setFilterType('all')}
                    sx={{ flex: 1 }}
                  >
                    All
                  </Button>
                  <Button 
                    size="small"
                    variant={filterType === 'pdf' ? 'contained' : 'outlined'} 
                    onClick={() => setFilterType('pdf')}
                    sx={{ flex: 1 }}
                  >
                    PDF
                  </Button>
                  <Button 
                    size="small"
                    variant={filterType === 'audio' ? 'contained' : 'outlined'} 
                    onClick={() => setFilterType('audio')}
                    sx={{ flex: 1 }}
                  >
                    Audio
                  </Button>
                </Box>
              </Box>

              <Card variant="outlined">
                <List sx={{ p: 0 }}>
                  {filteredResources.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">No resources match your search.</Typography>
                    </Box>
                  ) : (
                    filteredResources.map((res, index) => (
                      <React.Fragment key={res.id}>
                        <ListItem
                          sx={{ 
                            '&:hover': { bgcolor: theme.palette.action.hover },
                            cursor: 'pointer'
                          }}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              size="small" 
                              onClick={() => showSnackbar(res.type === 'pdf' ? "Downloading PDF..." : "Playing Audio...", "success")}
                            >
                              {res.type === 'audio' ? <Play size={16} /> : <Download size={16} />}
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1), 
                              color: theme.palette.primary.main,
                              width: 36,
                              height: 36
                            }}>
                              {res.type === 'pdf' ? <FileText size={18} /> : <Headphones size={18} />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={res.title}
                            primaryTypographyProps={{ fontSize: 14, fontWeight: 600, color: theme.palette.text.primary }}
                            secondary={`${res.type.toUpperCase()} • ${res.size}`}
                            secondaryTypographyProps={{ fontSize: 12 }}
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
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
            Recent Material
          </Typography>
          
          <Card sx={{ mb: 4, maxHeight: '400px', overflowY: 'auto' }}>
            <List disablePadding>
              {loading ? (
                // Simple loading for sidebar
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
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          size="small" 
                          onClick={() => showSnackbar(res.type === 'audio' ? "Playing audio..." : "Downloading started...", "success")}
                        >
                          {res.type === 'audio' ? <Play size={16} /> : <Download size={16} />}
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1), 
                          color: theme.palette.primary.main,
                          width: 32,
                          height: 32
                        }}>
                          {res.type === 'pdf' ? <FileText size={16} /> : <Headphones size={16} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={res.title} 
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
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
            p: 3, 
            bgcolor: alpha(theme.palette.secondary.main, 0.05), 
            border: 'none', 
            boxShadow: 'none',
            borderRadius: 3
          }}>
            <Typography variant="h2" sx={{ color: theme.palette.secondary.main, opacity: 0.2, lineHeight: 0.5, mb: 2 }}>
              “
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary, mb: 2, position: 'relative', zIndex: 1 }}>
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

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default BibleStudies;