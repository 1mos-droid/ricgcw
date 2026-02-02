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
  Alert
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
  SearchX // Icon for empty state
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
      answer: "Yes. Use the 'Quick Switch' command center (CMD+K or Ctrl+K) to toggle between different workspace environments (e.g., Main Sanctuary vs. Youth Ministry)."
    },
    {
      id: 3,
      question: "How secure is the member data?",
      answer: "We utilize banking-grade AES-256 encryption for all personal data. Access levels are strictly controlled via the Settings panel, and we perform daily encrypted backups."
    },
    {
      id: 4,
      question: "How do I reset my administrative PIN?",
      answer: "For security reasons, PIN resets cannot be done automatically if 2FA is not enabled. Please contact the FlameCore dedicated support line or email security@flamecore.com."
    },
    {
      id: 5,
      question: "How do I add a new user to the system?",
      answer: "Go to Settings > Team Management. Click 'Invite Member', enter their email address, and assign a role (Admin, Editor, or Viewer)."
    }
  ];

  const quickTopics = [
    { icon: <FileText size={20} />, label: "Guides" },
    { icon: <Lock size={20} />, label: "Security" },
    { icon: <CreditCard size={20} />, label: "Billing" },
    { icon: <HelpCircle size={20} />, label: "FAQs" },
  ];

  // --- LOGIC ---
  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLiveChat = () => {
    setSnackbar({ open: true, message: 'Connecting you to a support agent...' });
  };

  // Filter FAQs based on search
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
      
      {/* --- HEADER & SEARCH --- */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: { xs: 5, md: 8 }, 
        mt: { xs: 2, md: 4 },
        px: 2
      }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          mb: 2,
          fontSize: { xs: '2rem', md: '3rem' },
          color: theme.palette.text.primary
        }}>
          How can we help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Search our knowledge base for answers or browse popular topics below.
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search documentation (e.g. 'Financial Report')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 4, 
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
                height: 56,
                paddingLeft: 2,
                '& fieldset': { border: 'none' } 
              }
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={{ xs: 4, md: 6 }}>
        
        {/* --- LEFT COL: TOPICS & CONTACT --- */}
        <Grid item xs={12} md={4}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, mb: 2, display: 'block' }}>
            QUICK ACCESS
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {quickTopics.map((topic, index) => (
              <Grid item xs={6} key={index}>
                <Card 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-3px)',
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      boxShadow: theme.shadows[2]
                    }
                  }}
                >
                  <Box sx={{ mb: 1.5, color: 'inherit', display: 'flex', justifyContent: 'center' }}>
                    {topic.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>{topic.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ 
            p: 4, 
            bgcolor: theme.palette.primary.main, 
            color: '#fff', 
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: theme.shadows[4]
          }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Need Human Help?</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3, lineHeight: 1.6 }}>
              Our support team is available 24/7 for administrative emergencies.
            </Typography>
            
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={handleLiveChat}
              startIcon={<MessageCircle size={18} />}
              sx={{ 
                bgcolor: '#fff', 
                color: theme.palette.primary.main, 
                fontWeight: 700, 
                mb: 2,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              Start Live Chat
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontSize: 13, opacity: 0.8 }}>
              <Mail size={14} />
              <span>priority@flamecore.com</span>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: FAQ ACCORDION --- */}
        <Grid item xs={12} md={8}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, mb: 2, display: 'block' }}>
            {searchTerm ? 'SEARCH RESULTS' : 'FREQUENTLY ASKED'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredFaqs.length === 0 ? (
              // EMPTY STATE
              <Box sx={{ 
                textAlign: 'center', 
                py: 8, 
                px: 2,
                border: `2px dashed ${theme.palette.divider}`, 
                borderRadius: 3 
              }}>
                <SearchX size={48} color={theme.palette.text.disabled} style={{ marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary">No results found</Typography>
                <Typography variant="body2" color="text.disabled">
                  Try searching for keywords like "export", "user", or "security".
                </Typography>
                <Button 
                  onClick={() => setSearchTerm('')}
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              </Box>
            ) : (
              // FAQ LIST
              filteredFaqs.map((faq) => (
                <Card 
                  key={faq.id} 
                  sx={{ 
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
                    borderRadius: 2,
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: theme.palette.action.active }
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
                      bgcolor: expandedId === faq.id ? theme.palette.action.selected : 'transparent',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: expandedId === faq.id ? theme.palette.primary.main : theme.palette.text.primary }}>
                      {faq.question}
                    </Typography>
                    <IconButton size="small" sx={{ ml: 2 }}>
                      {expandedId === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </IconButton>
                  </Box>
                  
                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {faq.answer}
                          </Typography>
                          <Button 
                            size="small" 
                            endIcon={<ExternalLink size={14} />} 
                            sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
                          >
                            View full documentation
                          </Button>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))
            )}
          </Box>
        </Grid>

      </Grid>

      {/* --- NOTIFICATIONS --- */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Help;