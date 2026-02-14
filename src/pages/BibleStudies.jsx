import React, { useState, useEffect, useCallback } from 'react';
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
  TextField
} from '@mui/material';
// ✅ FIXED: Correct import for alpha utility
import { useTheme, alpha } from '@mui/material/styles';

import { 
  BookOpen, 
  Download, 
  Play, 
  ChevronRight, 
  FileText, 
  Headphones, 
  Bookmark
} from 'lucide-react';
import axios from 'axios';
import StudyDetailsDialog from '../components/StudyDetailsDialog';

const API_BASE_URL = 'http://localhost:3002/api';

const BibleStudies = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [studySeries, setStudySeries] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const filteredResources = resources.filter(res => {
    const termMatch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filterType === 'all' || res.type === filterType;
    return termMatch && typeMatch;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [seriesRes, resourcesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/bible-studies`),
          axios.get(`${API_BASE_URL}/resources`),
        ]);
        setStudySeries(seriesRes.data);
        setResources(resourcesRes.data);
      } catch (err) {
        console.error("Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
          Scripture & Study
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Theological resources and weekly curriculum
        </Typography>
      </Box>

      {/* --- HERO CARD (Scripture) --- */}
      <Card 
        sx={{ 
          p: 4, 
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
          <Typography variant="h4" component="div" sx={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', mb: 2, lineHeight: 1.4 }}>
            "Do not conform to the pattern of this world, but be transformed by the renewing of your mind."
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
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
            transform: 'rotate(-15deg)' 
          }} 
        />
      </Card>

      <Grid container spacing={4}>
        
        {/* --- LEFT COL: CURRICULUM --- */}
        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="study tabs"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Active Modules" />
              <Tab label="Resource Library" />
            </Tabs>
          </Box>

          {/* Tab Panel 1: Modules */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {studySeries.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                    No study series found.
                  </Typography>
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
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' }
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
                        <Button variant="outlined" endIcon={<ChevronRight size={16} />} fullWidth onClick={() => alert('Resume study!')}>
                          Resume Study
                        </Button>
                      ) : (
                        <Button color="inherit" sx={{ color: 'text.secondary' }} onClick={() => setSelectedStudy(study)}>View Details</Button>
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
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant={filterType === 'all' ? 'contained' : 'outlined'} onClick={() => setFilterType('all')}>All</Button>
                <Button variant={filterType === 'pdf' ? 'contained' : 'outlined'} onClick={() => setFilterType('pdf')}>PDF</Button>
                <Button variant={filterType === 'audio' ? 'contained' : 'outlined'} onClick={() => setFilterType('audio')}>Audio</Button>
              </Box>
              <List>
                {filteredResources.map((res, index) => (
                  <ListItem
                    key={res.id}
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={() => window.open(res.type === 'pdf' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '_blank')}>
                        {res.type === 'audio' ? <Play size={16} /> : <Download size={16} />}
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        {res.type === 'pdf' ? <FileText size={20} /> : <Headphones size={20} />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={res.title}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: theme.palette.text.primary }}
                      secondary={`${res.type.toUpperCase()} • ${res.size}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Grid>

        {/* --- RIGHT COL: SIDEBAR RESOURCES --- */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>Recent Material</Typography>
          
          <Card sx={{ mb: 4 }}>
            <List>
              {resources.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent materials found." />
                </ListItem>
              ) : (
                resources.map((res, index) => (
                  <React.Fragment key={res.id}>
                    <ListItem 
                      secondaryAction={
                        <IconButton edge="end" size="small" onClick={() => alert(res.type === 'audio' ? 'Playing audio...' : 'Downloading...')}>
                          {res.type === 'audio' ? <Play size={16} /> : <Download size={16} />}
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                          {res.type === 'pdf' ? <FileText size={20} /> : <Headphones size={20} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={res.title} 
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: theme.palette.text.primary }}
                        secondary={`${res.type.toUpperCase()} • ${res.size}`}
                      />
                    </ListItem>
                    {index < resources.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Card>

          {/* Quote Box */}
          <Card sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.1), border: 'none', boxShadow: 'none' }}>
            <Typography variant="h2" sx={{ color: theme.palette.text.secondary, opacity: 0.2, lineHeight: 0.5, mb: 2 }}>
              “
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary, mb: 2, position: 'relative', zIndex: 1 }}>
              To understand the scripture is to understand the heart of God.
            </Typography>
          </Card>
        </Grid>

      </Grid>
      <StudyDetailsDialog
        open={selectedStudy !== null}
        onClose={() => setSelectedStudy(null)}
        study={selectedStudy}
      />
    </Box>
  );
};

export default BibleStudies;