import React, { useState } from 'react';
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
  Divider
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

const BibleStudies = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Mock Data
  const studySeries = [
    {
      id: 1,
      title: "The Book of Romans",
      subtitle: "Understanding Grace & Law",
      progress: 60,
      sessions: 12,
      active: true
    },
    {
      id: 2,
      title: "Faith in the Modern Age",
      subtitle: "Navigating culture with truth",
      progress: 0,
      sessions: 4,
      active: false
    },
    {
      id: 3,
      title: "Foundations of Prayer",
      subtitle: "Intercession strategies",
      progress: 0,
      sessions: 8,
      active: false
    }
  ];

  const resources = [
    { id: 1, type: 'pdf', title: "Weekly Study Guide - Romans Ch. 8", size: "2.4 MB" },
    { id: 2, type: 'audio', title: "Sermon Audio: The Just Shall Live by Faith", size: "45 mins" },
    { id: 3, type: 'pdf', title: "Prayer Points for 2026", size: "1.1 MB" },
  ];

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
              {studySeries.map((study) => (
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
                      <Button variant="outlined" endIcon={<ChevronRight size={16} />} fullWidth>
                        Resume Study
                      </Button>
                    ) : (
                      <Button color="inherit" sx={{ color: 'text.secondary' }}>View Details</Button>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab Panel 2: Resources (Placeholder logic) */}
          {activeTab === 1 && (
            <Typography variant="body1" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
              Library view content would go here.
            </Typography>
          )}
        </Grid>

        {/* --- RIGHT COL: SIDEBAR RESOURCES --- */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>Recent Material</Typography>
          
          <Card sx={{ mb: 4 }}>
            <List>
              {resources.map((res, index) => (
                <React.Fragment key={res.id}>
                  <ListItem 
                    secondaryAction={
                      <IconButton edge="end" size="small">
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
              ))}
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
    </Box>
  );
};

export default BibleStudies;