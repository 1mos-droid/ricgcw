import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Divider,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  ButtonBase,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Search, ChevronRight, ChevronLeft, CheckCircle2, Globe } from 'lucide-react';
import { BIBLE_VERSIONS } from '../data/bibleData';
import { fetchBooks, fetchChapters, fetchChapterContent, translateToGenZ, VERSION_MAP } from '../utils/bibleApi';

const LiveBible = () => {
  const theme = useTheme();
  
  // Data States
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [currentVerses, setCurrentVerses] = useState([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  
  // Selection States
  const [selectedBookId, setSelectedBookId] = useState(''); // e.g., 'GEN'
  const [selectedChapterId, setSelectedChapterId] = useState(''); // e.g., 'GEN.1'
  const [selectedVersion, setSelectedVersion] = useState('KJV');
  const [searchTerm, setSearchTerm] = useState('');

  // UI States
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // 1. Fetch Books on Mount or Version Change
  useEffect(() => {
    const loadBooks = async () => {
      setLoadingBooks(true);
      try {
        const bibleId = VERSION_MAP[selectedVersion] || VERSION_MAP.KJV;
        const data = await fetchBooks(bibleId);
        setBooks(data);
        if (data.length > 0 && !selectedBookId) {
          setSelectedBookId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setSnackbar({ open: true, message: "Failed to connect to Bible API. Please check your API key.", severity: "error" });
      } finally {
        setLoadingBooks(false);
      }
    };

    loadBooks();
  }, [selectedVersion]);

  // 2. Fetch Chapters when Book changes
  useEffect(() => {
    if (!selectedBookId) return;

    const loadChapters = async () => {
      try {
        const bibleId = VERSION_MAP[selectedVersion] || VERSION_MAP.KJV;
        const data = await fetchChapters(bibleId, selectedBookId);
        setChapters(data);
        // If we switch books, default to first chapter
        const firstChapter = data[0];
        if (firstChapter) {
          setSelectedChapterId(firstChapter.id);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };

    loadChapters();
  }, [selectedBookId, selectedVersion]);

  // 3. Fetch Verse Content
  useEffect(() => {
    if (!selectedChapterId) return;

    const loadContent = async () => {
      setLoadingVerses(true);
      try {
        const bibleId = VERSION_MAP[selectedVersion] || VERSION_MAP.KJV;
        const data = await fetchChapterContent(bibleId, selectedChapterId);
        
        // Extract verses from JSON content structure:
        // Text is often sibling to 'verse' markers and has 'attrs.verseId'
        const verseMap = {};
        const verseOrder = [];
        
        const walk = (items) => {
          if (!items) return;
          items.forEach(item => {
            if (item.type === 'text' && item.attrs?.verseId) {
              const vId = item.attrs.verseId;
              const vNum = vId.split('.').pop();
              
              if (!verseMap[vId]) {
                verseMap[vId] = { number: vNum, text: "" };
                verseOrder.push(vId);
              }
              verseMap[vId].text += item.text;
            }
            if (item.items) walk(item.items);
          });
        };

        if (data.content) {
          walk(data.content);
        }

        const versesList = verseOrder.map(id => {
          const verse = verseMap[id];
          return {
            number: verse.number,
            text: selectedVersion === 'GENZ' ? translateToGenZ(verse.text) : verse.text
          };
        });
        
        setCurrentVerses(versesList);
      } catch (error) {
        console.error("Error fetching verse content:", error);
        setCurrentVerses([]);
      } finally {
        setLoadingVerses(false);
      }
    };

    loadContent();
  }, [selectedChapterId, selectedVersion]);

  const handleBookChange = (event) => {
    setSelectedBookId(event.target.value);
  };

  const handleChapterChange = (event) => {
    setSelectedChapterId(event.target.value);
  };

  const filteredVerses = useMemo(() => {
    if (!currentVerses) return [];
    return currentVerses.filter(v => 
      v.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentVerses, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loadingBooks && books.length === 0) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentBookName = books.find(b => b.id === selectedBookId)?.name || "";
  const currentChapterName = chapters.find(c => c.id === selectedChapterId)?.number || "";

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* --- HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 4, 
        textAlign: 'center',
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
           : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, #0B1120 100%)`,
        color: '#fff',
        borderRadius: 6,
        boxShadow: `0 20px 40px -12px ${alpha(theme.palette.primary.main, 0.25)}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>Live Bible</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>Real-time access to the Word via api.bible</Typography>
        </Container>
        <Globe size={200} style={{ position: 'absolute', right: -40, bottom: -60, opacity: 0.05, transform: 'rotate(-15deg)' }} />
      </Box>

      {/* --- VERSION SELECTOR --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
          SELECT BIBLE VERSION
        </Typography>
        <Grid container spacing={2}>
          {BIBLE_VERSIONS.map((version) => {
            const isSelected = selectedVersion === version.id;
            return (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={version.id}>
                <ButtonBase
                  onClick={() => setSelectedVersion(version.id)}
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
                    border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.02),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    fontWeight={800} 
                    color={isSelected ? 'primary.main' : 'text.primary'}
                  >
                    {version.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {version.label}
                  </Typography>
                  {isSelected && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <CheckCircle2 size={16} color={theme.palette.primary.main} />
                    </Box>
                  )}
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* --- NAVIGATION & SEARCH --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="book-select-label">Book</InputLabel>
            <Select
              labelId="book-select-label"
              value={selectedBookId || ''}
              label="Book"
              onChange={handleBookChange}
              sx={{ borderRadius: 3 }}
            >
              {books.map((book) => (
                <MenuItem key={book.id} value={book.id}>{book.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="chapter-select-label">Chapter</InputLabel>
            <Select
              labelId="chapter-select-label"
              value={selectedChapterId || ''}
              label="Chapter"
              onChange={handleChapterChange}
              sx={{ borderRadius: 3 }}
            >
              {chapters.map((ch) => (
                <MenuItem key={ch.id} value={ch.id}>
                  {ch.number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField 
            fullWidth 
            placeholder={`Search ${selectedVersion} verses...`}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 }
            }}
          />
        </Grid>
      </Grid>

      {/* --- BIBLE CONTENT --- */}
      <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, minHeight: '400px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>
              {currentBookName} {currentChapterName}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
              {BIBLE_VERSIONS.find(v => v.id === selectedVersion)?.label.toUpperCase()}
            </Typography>
          </Stack>
          <Box>
            <IconButton 
              disabled={chapters.findIndex(c => c.id === selectedChapterId) === 0}
              onClick={() => {
                const idx = chapters.findIndex(c => c.id === selectedChapterId);
                setSelectedChapterId(chapters[idx - 1].id);
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton 
              disabled={chapters.findIndex(c => c.id === selectedChapterId) === chapters.length - 1}
              onClick={() => {
                const idx = chapters.findIndex(c => c.id === selectedChapterId);
                setSelectedChapterId(chapters[idx + 1].id);
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {loadingVerses ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
             <CircularProgress />
           </Box>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedChapterId}-${selectedVersion}-${searchTerm}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {filteredVerses.length > 0 ? filteredVerses.map((verse) => (
                  <Box key={verse.number} sx={{ display: 'flex', gap: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.primary.main, 
                        fontWeight: 800, 
                        minWidth: '24px',
                        mt: 0.5
                      }}
                    >
                      {verse.number}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                      {verse.text}
                    </Typography>
                  </Box>
                )) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No verses found.
                    </Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          </AnimatePresence>
        )}
      </Card>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LiveBible;
