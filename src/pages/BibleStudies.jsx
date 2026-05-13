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
  CircularProgress,
  alpha,
  useTheme,
  Container,
  Paper,
  Stack
} from '@mui/material';
import { 
  BookOpen, 
  Download, 
  ChevronRight, 
  FileText, 
  Headphones, 
  Bookmark,
  Plus,
  Sparkles,
  ExternalLink,
  Search,
  Trash2
} from 'lucide-react';
import { safeParseDate } from '../utils/dateUtils';
import StudyDetailsDialog from '../components/StudyDetailsDialog';
import AddResourceDialog from '../components/AddResourceDialog';
import AddStudyDialog from '../components/AddStudyDialog';

import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

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
  const { showNotification, showConfirmation, filterData } = useWorkspace();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState(0);
  const [studySeries, setStudySeries] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddStudyOpen, setIsAddStudyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 🟢 Select Random Scripture on Mount
  const selectedScripture = useMemo(() => {
    return SCRIPTURES[Math.floor(Math.random() * SCRIPTURES.length)];
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [seriesSnapshot, resourcesSnapshot] = await Promise.all([
          getDocs(collection(db, "bible-studies")),
          getDocs(collection(db, "resources")),
        ]);
        
        const seriesData = (seriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [])
          .sort((a, b) => safeParseDate(b.createdAt || 0) - safeParseDate(a.createdAt || 0));
          
        const resourcesData = (resourcesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [])
          .sort((a, b) => safeParseDate(b.createdAt || 0) - safeParseDate(a.createdAt || 0));
        
        setStudySeries(seriesData);
        setResources(resourcesData);
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

  const onResourceAdded = (newResource) => {
    setResources(prev => [newResource, ...prev]);
    showNotification("Resource added successfully!", "success");
  };

  const onStudyAdded = (newStudy) => {
    setStudySeries(prev => [newStudy, ...prev]);
    showNotification("Study module created!", "success");
  };

  const handleDeleteStudy = async (id, title) => {
    showConfirmation({
      title: "Remove Study Module",
      message: `Permanently delete "${title}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "bible-studies", id));
          setStudySeries(prev => prev.filter(s => s.id !== id));
          showNotification("Module deleted.");
        } catch (err) {
          showNotification("Deletion failed.", "error");
        }
      }
    });
  };

  const handleDeleteResource = async (id, title) => {
    showConfirmation({
      title: "Remove Resource",
      message: `Permanently delete "${title}"?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "resources", id));
          setResources(prev => prev.filter(r => r.id !== id));
          showNotification("Resource removed.");
        } catch (err) {
          showNotification("Deletion failed.", "error");
        }
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const filteredResources = useMemo(() => {
    const data = filterData(resources);
    return data.filter(res => 
      (res.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, filterData, searchTerm]);

  const filteredStudies = useMemo(() => filterData(studySeries), [studySeries, filterData]);

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
          <Grid size={{ xs: 12, md: 5 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)} 
              sx={{ 
                minHeight: 56,
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
              }}
            >
              <Tab label="Study Modules" sx={{ fontWeight: 800, minHeight: 56, fontSize: '0.9rem' }} />
              <Tab label="Resource Vault" sx={{ fontWeight: 800, minHeight: 56, fontSize: '0.9rem' }} />
            </Tabs>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder={activeTab === 0 ? "Search modules..." : "Search resources..."}
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
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<Plus size={22} />}
              onClick={() => activeTab === 0 ? setIsAddStudyOpen(true) : setIsAddResourceOpen(true)}
              sx={{ 
                height: 56, 
                borderRadius: 4, 
                px: 3, 
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: `0 12px 24px -6px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': { 
                    boxShadow: `0 16px 32px -8px ${alpha(theme.palette.primary.main, 0.5)}`,
                    transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {activeTab === 0 ? 'Add Module' : 'Add Resource'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- MAIN LAYOUT --- */}
      <Grid container spacing={4}>
        
        {/* --- LEFT: MODULES & CONTENT --- */}
        <Grid size={{ xs: 12, lg: 8 }}>
            <AnimatePresence mode="wait">
                {activeTab === 0 ? (
                    <motion.div key="modules" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        {loading ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box> : (
                            <Grid container spacing={3}>
                                {filteredStudies.length === 0 ? (
                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 8 }}>
                                            <BookOpen size={64} color={theme.palette.text.disabled} style={{ marginBottom: 16, opacity: 0.5 }} />
                                            <Typography variant="h6" fontWeight={800} color="text.secondary">No study modules found</Typography>
                                            <Typography variant="body2" color="text.secondary">Try a different search term or check back later.</Typography>
                                        </Box>
                                    </Grid>
                                ) : filteredStudies.map((study) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={study.id}>
                                        <Card sx={{ 
                                            p: 3, height: '100%', borderRadius: 5, border: `1px solid ${theme.palette.divider}`,
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[8], borderColor: theme.palette.primary.main }
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: 2 }}>
                                                    <Bookmark size={20} />
                                                </Avatar>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {study.active && <Chip label="Live" color="success" size="small" sx={{ fontWeight: 900, height: 20, fontSize: '0.65rem', textTransform: 'uppercase' }} />}
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteStudy(study.id, study.title)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.01em' }}>{study.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>{study.subtitle}</Typography>
                                            
                                            <Box sx={{ mt: 'auto' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{study.sessions} Sessions</Typography>
                                                    <Typography variant="caption" fontWeight={900} color="primary">{study.progress || 0}% Complete</Typography>
                                                </Box>
                                                <LinearProgress variant="determinate" value={study.progress || 0} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                                                <Button fullWidth variant="outlined" endIcon={<ChevronRight size={16} />} sx={{ mt: 3, borderRadius: 3, fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 } }} onClick={() => setSelectedStudy(study)}>
                                                    Open Study Module
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
                        <Card sx={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[2] }}>
                            {loading ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box> : (
                                <List disablePadding>
                                    {filteredResources.length === 0 ? (
                                        <Box sx={{ py: 10, textAlign: 'center' }}>
                                            <FileText size={64} color={theme.palette.text.disabled} style={{ marginBottom: 16, opacity: 0.5 }} />
                                            <Typography variant="h6" fontWeight={800} color="text.secondary">No resources found</Typography>
                                        </Box>
                                    ) : filteredResources.map((res, i) => (
                                        <React.Fragment key={res.id}>
                                            <ListItemButton sx={{ py: 2.5, px: 3, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }} onClick={() => handleOpenResource(res)}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: 2.5, width: 48, height: 48 }}>
                                                        {res.type === 'audio' ? <Headphones size={22} /> : <FileText size={22} />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText 
                                                    primary={<Typography variant="subtitle1" fontWeight={800}>{res.title}</Typography>} 
                                                    secondary={
                                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            {res.type?.toUpperCase()} • {res.size || 'N/A'}
                                                        </Typography>
                                                    } 
                                                />
                                                <Stack direction="row" spacing={1.5}>
                                                    <Tooltip title="Download">
                                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenResource(res); }} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main }}>
                                                            <Download size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove">
                                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteResource(res.id, res.title); }} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
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
                        {filteredResources.slice(0, 2).map(res => (
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
      <AddResourceDialog open={isAddResourceOpen} onClose={() => setIsAddResourceOpen(false)} onResourceAdded={onResourceAdded} />
      <AddStudyDialog open={isAddStudyOpen} onClose={() => setIsAddStudyOpen(false)} onStudyAdded={onStudyAdded} />

    </Box>
  );
};

export default BibleStudies;
