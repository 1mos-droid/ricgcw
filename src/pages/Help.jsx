import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  TextField, 
  InputAdornment, 
  useTheme,
  IconButton,
  Snackbar,
  Alert,
  alpha,
  Stack,
  Avatar
} from '@mui/material';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Lock, 
  CreditCard, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail,
  ExternalLink,
  SearchX,
  LifeBuoy
} from 'lucide-react';

const Help = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // --- DATA ---
  const faqs = [
    {
      id: 1,
      question: "How do I export the annual financial report?",
      answer: "Navigate to the 'Reports' module via the sidebar. Select 'Financial Statement' from the available options, choose your date range, and click the 'Download CSV' button at the top right."
    },
    {
      id: 2,
      question: "Can I manage multiple church branches?",
      answer: "Yes. Use the 'Quick Switch' command center to toggle between different workspace environments (e.g., Main Sanctuary vs. Youth Ministry)."
    },
    {
      id: 3,
      question: "How secure is the member data?",
      answer: "We utilize banking-grade AES-256 encryption for all personal data. Access levels are strictly controlled via the Settings panel, and we perform daily encrypted backups."
    },
    {
      id: 4,
      question: "How do I reset my administrative password?",
      answer: "Go to User Management, find the relevant user account, click the options menu (three dots), and select 'Reset Password'."
    },
    {
      id: 5,
      question: "How do I add a new user to the system?",
      answer: "Navigate to User Management. Click 'Grant Access' at the top right, enter the user details, and assign an appropriate privilege level."
    }
  ];

  const quickTopics = [
    { icon: <FileText size={20} />, label: "User Manual" },
    { icon: <Lock size={20} />, label: "Privacy Policy" },
    { icon: <CreditCard size={20} />, label: "Pricing" },
    { icon: <HelpCircle size={20} />, label: "Support" },
  ];

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLiveChat = () => {
    setSnackbar({ open: true, message: 'Connecting you to a support agent...' });
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HERO SECTION --- */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: { xs: 6, md: 10 }, 
        mt: { xs: 2, md: 4 },
        px: 2
      }}>
        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>
          SUPPORT HUB
        </Typography>
        <Typography variant="h2" sx={{ 
          fontWeight: 800, 
          mb: 2,
          fontSize: { xs: '2.25rem', md: '3.5rem' },
          color: theme.palette.text.primary,
          letterSpacing: '-0.03em'
        }}>
          How can we help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
          Search our comprehensive documentation or browse popular topics to find the assistance you need.
        </Typography>
        
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search documentation (e.g. 'Reports', 'Security')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={22} color={theme.palette.primary.main} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 4, 
                bgcolor: theme.palette.background.paper,
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
                height: 64,
                paddingLeft: 2,
                fontSize: '1.1rem',
                fontWeight: 500,
                '& fieldset': { border: `1px solid ${theme.palette.divider}` },
                '&:hover fieldset': { borderColor: theme.palette.primary.main }
              }
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={6}>
        
        {/* --- LEFT COL: TOPICS --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={4}>
            <Box>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 800, mb: 3, letterSpacing: 0.5 }}>
                    QUICK RESOURCES
                </Typography>
                <Grid container spacing={2}>
                    {quickTopics.map((topic, index) => (
                    <Grid size={{ xs: 6 }} key={index}>
                        <Card 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            borderRadius: 4,
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                                transform: 'translateY(-4px)',
                                borderColor: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                boxShadow: `0 12px 24px -8px ${alpha(theme.palette.primary.main, 0.2)}`
                            }
                        }}
                        >
                        <Box sx={{ mb: 1.5, color: theme.palette.primary.main, display: 'flex', justifyContent: 'center' }}>
                            {topic.icon}
                        </Box>
                        <Typography variant="body2" fontWeight={700}>{topic.label}</Typography>
                        </Card>
                    </Grid>
                    ))}
                </Grid>
            </Box>

            <Card sx={{ 
                p: 4, 
                background: theme.palette.mode === 'light' 
                    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                    : alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary, 
                borderRadius: 4,
                boxShadow: theme.shadows[8],
                border: theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <LifeBuoy size={120} style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.1, transform: 'rotate(-15deg)' }} />
                
                <Typography variant="h6" fontWeight={800} gutterBottom>Need dedicated support?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 4, lineHeight: 1.6, fontWeight: 500 }}>
                    Our engineering team is standing by to resolve any mission-critical issues.
                </Typography>
                
                <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    onClick={handleLiveChat}
                    startIcon={<MessageCircle size={20} />}
                    sx={{ 
                        bgcolor: theme.palette.mode === 'light' ? '#fff' : theme.palette.primary.main, 
                        color: theme.palette.mode === 'light' ? theme.palette.primary.main : '#fff', 
                        fontWeight: 800, 
                        mb: 2,
                        borderRadius: 3,
                        '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : theme.palette.primary.dark }
                    }}
                >
                    Launch Live Chat
                </Button>
                
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ opacity: 0.8 }}>
                    <Mail size={14} />
                    <Typography variant="caption" fontWeight={700}>support@ricgcw.org</Typography>
                </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* --- RIGHT COL: FAQ --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 800, mb: 3, letterSpacing: 0.5 }}>
            {searchTerm ? `RESULTS FOR "${searchTerm}"` : 'FREQUENTLY ASKED QUESTIONS'}
          </Typography>
          
          <Stack spacing={2}>
            {filteredFaqs.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 10, 
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                border: `2px dashed ${theme.palette.divider}`
              }}>
                <SearchX size={48} color={theme.palette.text.disabled} style={{ marginBottom: 16 }} />
                <Typography variant="h6" fontWeight={700}>No matches found</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Try broader keywords or browse the categories on the left.
                </Typography>
                <Button 
                  onClick={() => setSearchTerm('')}
                  sx={{ mt: 3, fontWeight: 700 }}
                >
                  Clear search query
                </Button>
              </Box>
            ) : (
              filteredFaqs.map((faq) => (
                <Card 
                  key={faq.id} 
                  sx={{ 
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease',
                    boxShadow: expandedId === faq.id ? theme.shadows[4] : 'none',
                    borderColor: expandedId === faq.id ? theme.palette.primary.main : theme.palette.divider,
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    onClick={() => toggleFAQ(faq.id)}
                    sx={{ 
                      p: 3, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      bgcolor: expandedId === faq.id ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: expandedId === faq.id ? theme.palette.primary.main : theme.palette.text.primary }}>
                      {faq.question}
                    </Typography>
                    <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: expandedId === faq.id ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.1),
                        color: expandedId === faq.id ? '#fff' : theme.palette.text.secondary
                    }}>
                      {expandedId === faq.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </Avatar>
                  </Box>
                  
                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, fontWeight: 500, mt: 2 }}>
                            {faq.answer}
                          </Typography>
                          <Button 
                            size="small" 
                            endIcon={<ExternalLink size={14} />} 
                            sx={{ mt: 3, fontWeight: 700, borderRadius: 2 }}
                          >
                            Read technical guide
                          </Button>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))
            )}
          </Stack>
        </Grid>

      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Help;