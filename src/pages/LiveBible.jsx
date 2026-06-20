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
  Skeleton,
  Snackbar,
  Alert,
  Chip,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Globe,
  Plus,
  Trash2,
  Download,
  BookOpen,
  Tag,
  PenTool,
  RotateCcw
} from 'lucide-react';
import { BIBLE_VERSIONS } from '../data/bibleData';
import { fetchBooks, fetchChapters, fetchChapterContent, translateToGenZ, VERSION_MAP } from '../utils/bibleApi';
import { 
  createSermonNote, 
  addScriptureToNote, 
  addTagToNote, 
  formatNotesForExport 
} from '../utils/sermonNotes';

// ==========================================
// Sub-Components (Modular React Architecture)
// ==========================================

/**
 * 1. BibleVersionSelector Component
 * Renders the button grid for selecting active Bible translations.
 */
const BibleVersionSelector = ({ selectedVersion, onVersionChange }) => {
  const theme = useTheme();
  return (
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
                onClick={() => onVersionChange(version.id)}
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
  );
};

/**
 * 2. BibleSelectorGroup Component
 * Renders Book/Chapter dropdown selectors and active text searches.
 */
const BibleSelectorGroup = ({
  books,
  chapters,
  selectedBookId,
  selectedChapterId,
  searchTerm,
  onBookChange,
  onChapterChange,
  onSearchChange,
  selectedVersion
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="book-select-label">Book</InputLabel>
          <Select
            labelId="book-select-label"
            value={selectedBookId || ''}
            label="Book"
            onChange={onBookChange}
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
            onChange={onChapterChange}
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
          onChange={onSearchChange}
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
  );
};

/**
 * 3. BibleVerseReader Component
 * Displays loading states, Bible text verses, and reference citation buttons.
 */
const BibleVerseReader = ({
  currentBookName,
  currentChapterName,
  selectedVersion,
  chapters,
  selectedChapterId,
  onChapterPrev,
  onChapterNext,
  loadingVerses,
  filteredVerses,
  onAddVerseReference
}) => {
  const theme = useTheme();
  
  const isPrevDisabled = chapters.findIndex(c => c.id === selectedChapterId) === 0;
  const isNextDisabled = chapters.findIndex(c => c.id === selectedChapterId) === chapters.length - 1;

  return (
    <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 6, minHeight: '500px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {currentBookName} {currentChapterName}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
            {BIBLE_VERSIONS.find(v => v.id === selectedVersion)?.label.toUpperCase()}
          </Typography>
        </Stack>
        <Box>
          <IconButton disabled={isPrevDisabled} onClick={onChapterPrev}>
            <ChevronLeft />
          </IconButton>
          <IconButton disabled={isNextDisabled} onClick={onChapterNext}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {loadingVerses ? (
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2 }}>
           {[1, 2, 3, 4, 5].map(i => (
             <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
           ))}
         </Box>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedChapterId}-${selectedVersion}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {filteredVerses.length > 0 ? filteredVerses.map((verse) => (
                <Box 
                  key={verse.number} 
                  sx={{ 
                    display: 'flex', 
                    gap: 2,
                    p: 1.25,
                    borderRadius: '10px',
                    transition: 'background 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      '& .add-ref-btn': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '28px' }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.primary.main, 
                        fontWeight: 800, 
                        mt: 0.5
                      }}
                    >
                      {verse.number}
                    </Typography>
                    
                    <IconButton 
                      className="add-ref-btn"
                      size="small"
                      onClick={() => onAddVerseReference(verse.number)}
                      title="Add reference to sermon notes"
                      sx={{ 
                        opacity: { xs: 1, md: 0 }, 
                        transition: 'opacity 0.2s', 
                        p: 0.25,
                        mt: 0.5,
                        color: theme.palette.primary.main 
                      }}
                    >
                      <Plus size={14} />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem', flex: 1 }}>
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
  );
};

/**
 * 4. SermonJournalForm Component
 * Renders the sermon notes creation & editing workspace.
 */
const SermonJournalForm = ({
  activeNote,
  notesFormData,
  onNotesFormChange,
  onSaveNote,
  onNewNote,
  onExportNote,
  onRemoveVerseReference
}) => {
  const theme = useTheme();
  return (
    <Card sx={{ p: 4, borderRadius: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <PenTool size={20} color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={800}>
            {activeNote ? 'Edit Sermon Note' : 'New Sermon Note'}
          </Typography>
        </Stack>
        
        <IconButton onClick={onNewNote} title="Clear and create new notes" size="small">
          <RotateCcw size={16} />
        </IconButton>
      </Stack>

      <form onSubmit={onSaveNote}>
        <Stack spacing={2.5}>
          <TextField
            label="Sermon Title"
            required
            fullWidth
            size="small"
            value={notesFormData.title}
            onChange={(e) => onNotesFormChange({ title: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            label="Preacher"
            fullWidth
            size="small"
            value={notesFormData.preacher}
            onChange={(e) => onNotesFormChange({ preacher: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            label="Tags (comma-separated)"
            fullWidth
            size="small"
            placeholder="e.g. Grace, Worship, faith"
            value={notesFormData.tags}
            onChange={(e) => onNotesFormChange({ tags: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tag size={14} />
                </InputAdornment>
              )
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {/* Scripture references links */}
          {activeNote && activeNote.scriptureReferences?.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1, letterSpacing: 0.5 }}>
                STUDY SCRIPTURES
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {activeNote.scriptureReferences.map((ref) => (
                  <Chip
                    key={ref}
                    label={ref}
                    size="small"
                    onDelete={() => onRemoveVerseReference(ref)}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <TextField
            label="Notes Content"
            multiline
            rows={8}
            fullWidth
            placeholder="Write sermon outlines, revelations, or action items here..."
            value={notesFormData.notesText}
            onChange={(e) => onNotesFormChange({ notesText: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button 
              fullWidth 
              type="submit" 
              variant="contained" 
              sx={{ borderRadius: 3, fontWeight: 700, py: 1 }}
            >
              Save note
            </Button>
            <Button 
              variant="outlined" 
              onClick={onExportNote}
              sx={{ borderRadius: 3, minWidth: '48px', p: 1 }}
              title="Download notes as text file"
            >
              <Download size={18} />
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
};

/**
 * 5. SermonNotesHistory Component
 * Lists historical saved sermon outline notes.
 */
const SermonNotesHistory = ({
  savedNotes,
  activeNote,
  onLoadNote,
  onDeleteNote
}) => {
  const theme = useTheme();
  return (
    <Card sx={{ p: 4, borderRadius: 6 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <BookOpen size={20} color={theme.palette.primary.main} />
        <Typography variant="h6" fontWeight={800}>Saved Sermon Journal</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {savedNotes.length > 0 ? (
        <Stack spacing={1.5}>
          {savedNotes.map((note) => {
            const isNoteActive = activeNote?.id === note.id;
            return (
              <Box
                key={note.id}
                onClick={() => onLoadNote(note)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isNoteActive 
                    ? alpha(theme.palette.primary.main, 0.08) 
                    : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                  border: `1px solid ${isNoteActive ? theme.palette.primary.main : 'transparent'}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: isNoteActive 
                      ? alpha(theme.palette.primary.main, 0.12)
                      : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                  }
                }}
              >
                <Box sx={{ textAlign: 'left', flex: 1, pr: 2 }}>
                  <Typography variant="body2" fontWeight={850} sx={{ lineBreak: 'anywhere' }}>
                    {note.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontWeight: 600 }}>
                    {note.preacher || 'No preacher'} • {note.date}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={(e) => onDeleteNote(note.id, e)}
                  sx={{ p: 0.5 }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No saved study notes. Click "+" next to verse numbers or fill the editor.
          </Typography>
        </Box>
      )}
    </Card>
  );
};

// ==========================================
// Main LiveBible Workspace Controller
// ==========================================

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

  // UI Feedback States
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // --- SERMON NOTES DATA STATE ---
  const [savedNotes, setSavedNotes] = useState(() => {
    try {
      const data = localStorage.getItem('ricgcw_sermon_notes');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [activeNote, setActiveNote] = useState(null);
  const [notesFormData, setNotesFormData] = useState({
    title: '',
    preacher: '',
    notesText: '',
    tags: ''
  });

  // Sync saved notes to localStorage
  useEffect(() => {
    localStorage.setItem('ricgcw_sermon_notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  // 1. Fetch Books on Mount or Version Change
  useEffect(() => {
    const loadBooks = async () => {
      setLoadingBooks(true);
      try {
        const bibleId = VERSION_MAP[selectedVersion] || VERSION_MAP.KJV;
        const data = await fetchBooks(bibleId);
        setBooks(data);
        if (data.length > 0) {
          setSelectedBookId(prev => prev || data[0].id);
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
        
        // Extract verses from JSON content structure
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleNotesFormChange = (fields) => {
    setNotesFormData(prev => ({
      ...prev,
      ...fields
    }));
  };

  const filteredVerses = useMemo(() => {
    if (!currentVerses) return [];
    return currentVerses.filter(v => 
      v.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentVerses, searchTerm]);

  // --- SERMON JOURNAL ACTIONS ---
  const currentBookName = books.find(b => b.id === selectedBookId)?.name || "";
  const currentChapterName = chapters.find(c => c.id === selectedChapterId)?.number || "";

  const handleAddVerseReference = (verseNumber) => {
    const ref = `${currentBookName} ${currentChapterName}:${verseNumber}`;
    let updatedNote;
    
    if (!activeNote) {
      const defaultTitle = `Study of ${currentBookName} ${currentChapterName}`;
      const newNote = createSermonNote(defaultTitle, '', '', '');
      updatedNote = addScriptureToNote(newNote, ref);
    } else {
      updatedNote = addScriptureToNote(activeNote, ref);
    }

    setActiveNote(updatedNote);
    setNotesFormData(prev => ({
      ...prev,
      title: updatedNote.title,
      preacher: updatedNote.preacher,
      notesText: updatedNote.notesText,
      tags: updatedNote.tags.join(', ')
    }));

    setSnackbar({ open: true, message: `Added ${ref} reference to notes.`, severity: 'success' });
  };

  const handleRemoveVerseReference = (ref) => {
    if (!activeNote) return;
    const updated = {
      ...activeNote,
      scriptureReferences: activeNote.scriptureReferences.filter(r => r !== ref)
    };
    setActiveNote(updated);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!notesFormData.title.trim()) {
      setSnackbar({ open: true, message: 'Please enter a sermon title.', severity: 'warning' });
      return;
    }

    let noteToSave;
    const tagList = notesFormData.tags.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (activeNote) {
      noteToSave = {
        ...activeNote,
        title: notesFormData.title.trim(),
        preacher: notesFormData.preacher.trim(),
        notesText: notesFormData.notesText,
        tags: tagList
      };
      setSavedNotes(prev => prev.map(n => n.id === noteToSave.id ? noteToSave : n));
      setActiveNote(noteToSave);
    } else {
      const baseNote = createSermonNote(
        notesFormData.title.trim(),
        notesFormData.preacher.trim(),
        new Date().toISOString().split('T')[0],
        notesFormData.notesText
      );
      
      let finalNote = baseNote;
      tagList.forEach(tag => {
        finalNote = addTagToNote(finalNote, tag);
      });
      
      noteToSave = finalNote;
      setSavedNotes(prev => [noteToSave, ...prev]);
      setActiveNote(noteToSave);
    }

    setSnackbar({ open: true, message: 'Study Journal saved successfully!', severity: 'success' });
  };

  const handleNewNote = () => {
    setActiveNote(null);
    setNotesFormData({
      title: '',
      preacher: '',
      notesText: '',
      tags: ''
    });
  };

  const handleLoadNote = (note) => {
    setActiveNote(note);
    setNotesFormData({
      title: note.title,
      preacher: note.preacher,
      notesText: note.notesText,
      tags: note.tags.join(', ')
    });
  };

  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation();
    setSavedNotes(prev => prev.filter(n => n.id !== noteId));
    if (activeNote && activeNote.id === noteId) {
      handleNewNote();
    }
    setSnackbar({ open: true, message: 'Sermon note deleted.', severity: 'info' });
  };

  const handleExportNote = () => {
    if (!notesFormData.title.trim()) {
      setSnackbar({ open: true, message: 'Please enter a title before exporting.', severity: 'warning' });
      return;
    }

    const noteToExport = activeNote || {
      title: notesFormData.title.trim(),
      preacher: notesFormData.preacher.trim(),
      date: new Date().toISOString().split('T')[0],
      notesText: notesFormData.notesText,
      tags: notesFormData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      scriptureReferences: []
    };

    const text = formatNotesForExport(noteToExport);

    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${noteToExport.title.replace(/\s+/g, '_')}_study_journal.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setSnackbar({ open: true, message: 'Journal notes downloaded!', severity: 'success' });
  };

  const handleChapterPrev = () => {
    const idx = chapters.findIndex(c => c.id === selectedChapterId);
    setSelectedChapterId(chapters[idx - 1].id);
  };

  const handleChapterNext = () => {
    const idx = chapters.findIndex(c => c.id === selectedChapterId);
    setSelectedChapterId(chapters[idx + 1].id);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* 1. Page Header */}
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
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>Live Bible & Sermon Journal</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>Access scriptures and write structured sermon study notes side-by-side</Typography>
        </Container>
        <Globe size={200} style={{ position: 'absolute', right: -40, bottom: -60, opacity: 0.05, transform: 'rotate(-15deg)' }} />
      </Box>

      {/* 2. Version Selector */}
      <BibleVersionSelector 
        selectedVersion={selectedVersion} 
        onVersionChange={setSelectedVersion} 
      />

      {/* 3. Navigation Controls */}
      <BibleSelectorGroup
        books={books}
        chapters={chapters}
        selectedBookId={selectedBookId}
        selectedChapterId={selectedChapterId}
        searchTerm={searchTerm}
        onBookChange={handleBookChange}
        onChapterChange={handleChapterChange}
        onSearchChange={handleSearchChange}
        selectedVersion={selectedVersion}
      />

      {/* 4. Main Page Workspace (Bible Reader + Sermon Journal Panels) */}
      <Grid container spacing={4}>
        
        {/* Left Column: Bible Verse Reader */}
        <Grid size={{ xs: 12, lg: 7.2 }}>
          <BibleVerseReader
            currentBookName={currentBookName}
            currentChapterName={currentChapterName}
            selectedVersion={selectedVersion}
            chapters={chapters}
            selectedChapterId={selectedChapterId}
            onChapterPrev={handleChapterPrev}
            onChapterNext={handleChapterNext}
            loadingVerses={loadingVerses}
            filteredVerses={filteredVerses}
            onAddVerseReference={handleAddVerseReference}
          />
        </Grid>

        {/* Right Column: Sermon Journal Panel */}
        <Grid size={{ xs: 12, lg: 4.8 }}>
          <Stack spacing={3}>
            
            <SermonJournalForm
              activeNote={activeNote}
              notesFormData={notesFormData}
              onNotesFormChange={handleNotesFormChange}
              onSaveNote={handleSaveNote}
              onNewNote={handleNewNote}
              onExportNote={handleExportNote}
              onRemoveVerseReference={handleRemoveVerseReference}
            />

            <SermonNotesHistory
              savedNotes={savedNotes}
              activeNote={activeNote}
              onLoadNote={handleLoadNote}
              onDeleteNote={handleDeleteNote}
            />

          </Stack>
        </Grid>

      </Grid>

      {/* UI Feedbacks */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LiveBible;
