import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ListItemButton,
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  IconButton, 
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Skeleton,
  alpha,
  useTheme,
  Container,
  Paper,
  Tooltip,
  Stack,
  CircularProgress
} from '@mui/material';
import { 
  BookOpen, 
  Download, 
  Play, 
  ChevronRight, 
  FileText, 
  Headphones, 
  Bookmark,
  Search,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import StudyDetailsDialog from '../components/StudyDetailsDialog';
import AddResourceDialog from '../components/AddResourceDialog';

import { API_BASE_URL } from '../config';

const SCRIPTURES = [
  { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "PSALM 119:105" },
  { text: "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night.", ref: "JOSHUA 1:8" },
  { text: "And be not conformed to this world: but be ye transformed by the renewing of your mind.", ref: "ROMANS 12:2" },
  { text: "But he answered and said, It is written, Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.", ref: "MATTHEW 4:4" },
  { text: "For the word of God is quick, and powerful, and sharper than any twoedged sword.", ref: "HEBREWS 4:12" },
  { text: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.", ref: "2 TIMOTHY 2:15" }
];

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
  const [searchTerm, setSearchTerm] = useState('');

  // 🟢 Select Random Scripture on Mount
  const selectedScripture = useMemo(() => {
    return SCRIPTURES[Math.floor(Math.random() * SCRIPTURES.length)];
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [seriesRes, resourcesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/bible-studies/`),
          axios.get(`${API_BASE_URL}/resources/`),
        ]);
        setStudySeries(seriesRes.data || []);
        setResources(resourcesRes.data || []);
      } catch (err) {
        console.error("Bible Studies Sync Error:", err);
        showNotification("Failed to load content.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showNotification]);

  const handleOpenResource = (res) => {
    if (!res.link) {
      showNotification("Resource link not available.", "warning");
      return;
    }
    window.open(res.link, '_blank', 'noopener,noreferrer');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const filteredResources = resources.filter(res => 
    res.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* --- HERO SECTION --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 6, 
        position: 'relative',
        borderRadius: 8,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
           : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, #0B1120 100%)`,
        color: '#fff',
        overflow: 'hidden',
        boxShadow: `0 24px 48px -12px ${alpha(theme.palette.primary.main, 0.3)}`
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Chip 
                    label="Scripture of the Moment" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mb: 3, backdropFilter: 'blur(10px)', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }} 
                />
                <Typography variant="h2" sx={{ 
                    fontFamily: '"Playfair Display", serif', 
                    fontStyle: 'italic', 
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { xs: '1.8rem', md: '3rem' },
                    lineHeight: 1.2
                }}>
                    "{selectedScripture.text}"
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, letterSpacing: 2, fontWeight: 800 }}>
                    — {selectedScripture.ref}
                </Typography>
            </motion.div>
        </Container>
        {/* Decor */}
        <BookOpen size={300} style={{ position: 'absolute', right: -50, bottom: -100, opacity: 0.05, transform: 'rotate(-15deg)' }} />
      </Box>

      {/* --- MAIN LAYOUT --- */}
      <Grid container spacing={4}>
        
        {/* --- LEFT: MODULES & CONTENT --- */}
        <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, flexGrow: 1 }}>
                    <Tab label="Study Modules" sx={{ fontWeight: 700 }} />
                    <Tab label="Resource Vault" sx={{ fontWeight: 700 }} />
                </Tabs>
                <Button variant="contained" size="small" startIcon={<Plus size={16} />} sx={{ borderRadius: 2, ml: 2, display: { xs: 'none', sm: 'flex' } }}>
                    Add Module
                </Button>
            </Box>

            <AnimatePresence mode="wait">
                {activeTab === 0 ? (
                    <motion.div key="modules" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        {loading ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box> : (
                            <Grid container spacing={3}>
                                {studySeries.length === 0 ? (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography color="text.secondary" align="center">No study modules found.</Typography>
                                    </Grid>
                                ) : studySeries.map((study) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={study.id}>
                                        <Card sx={{ 
                                            p: 3, height: '100%', borderRadius: 5, border: `1px solid ${theme.palette.divider}`,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[8], borderColor: theme.palette.primary.main }
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: 2 }}>
                                                    <Bookmark size={20} />
                                                </Avatar>
                                                {study.active && <Chip label="Live" color="success" size="small" sx={{ fontWeight: 800, height: 20 }} />}
                                            </Box>
                                            <Typography variant="h6" fontWeight={800} gutterBottom>{study.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{study.subtitle}</Typography>
                                            
                                            <Box sx={{ mt: 'auto' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="caption" fontWeight={700} color="text.secondary">{study.sessions} Sessions</Typography>
                                                    <Typography variant="caption" fontWeight={800} color="primary">{study.progress || 0}%</Typography>
                                                </Box>
                                                <LinearProgress variant="determinate" value={study.progress || 0} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                                                <Button fullWidth variant="outlined" endIcon={<ChevronRight size={16} />} sx={{ mt: 3, borderRadius: 3, fontWeight: 700 }} onClick={() => setSelectedStudy(study)}>
                                                    View Details
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="resources" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <TextField 
                            fullWidth placeholder="Search resources..." sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.5) } }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
                        />
                        <Card sx={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                            {loading ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box> : (
                                <List disablePadding>
                                    {filteredResources.length === 0 ? (
                                        <ListItem><ListItemText primary="No resources found." /></ListItem>
                                    ) : filteredResources.map((res, i) => (
                                        <React.Fragment key={res.id}>
                                            <ListItemButton sx={{ py: 2, px: 3 }} onClick={() => handleOpenResource(res)}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: 2 }}>
                                                        {res.type === 'audio' ? <Headphones size={20} /> : <FileText size={20} />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary={<Typography fontWeight={700}>{res.title}</Typography>} secondary={`${res.type?.toUpperCase()} • ${res.size || 'N/A'}`} />
                                                <IconButton size="small"><Download size={18} /></IconButton>
                                            </ListItemButton>
                                            {i < filteredResources.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </Grid>

        {/* --- RIGHT: SIDEBAR --- */}
        <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={4}>
                <Card sx={{ p: 3, borderRadius: 5, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sparkles size={20} color={theme.palette.warning.main} /> Daily Insight
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.7 }}>
                        "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth."
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Button fullWidth variant="text" size="small" sx={{ fontWeight: 700 }}>Request Study Material</Button>
                </Card>

                <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'text.secondary', letterSpacing: 1 }}>RECENT MATERIAL</Typography>
                    <Stack spacing={2}>
                        {resources.slice(0, 2).map(res => (
                            <Paper key={res.id} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FileText size={20} color={theme.palette.primary.main} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" fontWeight={700} noWrap>{res.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{res.size || 'N/A'}</Typography>
                                </Box>
                                <IconButton size="small" onClick={() => handleOpenResource(res)}><ExternalLink size={16} /></IconButton>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Grid>

      </Grid>

      <StudyDetailsDialog open={selectedStudy !== null} onClose={() => setSelectedStudy(null)} study={selectedStudy} />
      <AddResourceDialog open={isAddResourceOpen} onClose={() => setIsAddResourceOpen(false)} />

    </Box>
  );
};

export default BibleStudies;