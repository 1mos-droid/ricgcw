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
  Avatar, 
  useTheme,
  IconButton,
  Chip
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
  ExternalLink
} from 'lucide-react';

const Help = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const faqs = [
    {
      id: 1,
      question: "How do I export the annual financial report?",
      answer: "Navigate to the 'Reports' module via the sidebar. Select 'Financial Statement' from the available options and click the 'Download CSV' button."
    },
    {
      id: 2,
      question: "Can I manage multiple church branches?",
      answer: "Yes. Use the 'Quick Switch' command center to toggle between different workspace environments (e.g., Main Sanctuary vs. Youth Ministry)."
    },
    {
      id: 3,
      question: "How secure is the member data?",
      answer: "We utilize banking-grade encryption for all personal data. Access levels are strictly controlled via the Settings panel."
    },
    {
      id: 4,
      question: "How do I reset my administrative PIN?",
      answer: "For security reasons, PIN resets cannot be done automatically. Please contact the FlameCore dedicated support line or email security@flamecore.com."
    }
  ];

  const quickTopics = [
    { icon: <FileText size={20} />, label: "Guides" },
    { icon: <Lock size={20} />, label: "Security" },
    { icon: <CreditCard size={20} />, label: "Billing" },
    { icon: <HelpCircle size={20} />, label: "FAQs" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER & SEARCH --- */}
      <Box sx={{ textAlign: 'center', mb: 8, mt: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          How can we help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Search our knowledge base or browse popular topics
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search documentation (e.g. 'Add Member')"
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
                boxShadow: theme.shadows[2],
                '& fieldset': { border: 'none' } 
              }
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={6}>
        
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
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  <Box sx={{ mb: 1, color: 'inherit' }}>{topic.icon}</Box>
                  <Typography variant="subtitle2" fontWeight={600}>{topic.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ p: 4, bgcolor: theme.palette.primary.main, color: '#fff', textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Need Human Help?</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
              Our support team is available 24/7 for administrative emergencies.
            </Typography>
            
            <Button 
              variant="contained" 
              fullWidth 
              startIcon={<MessageCircle size={18} />}
              sx={{ 
                bgcolor: '#fff', 
                color: theme.palette.primary.main, 
                fontWeight: 700, 
                mb: 2,
                '&:hover': { bgcolor: '#f0f0f0' }
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
            FREQUENTLY ASKED
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {faqs.map((faq) => (
              <Card 
                key={faq.id} 
                sx={{ 
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none'
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
                    '&:hover': { bgcolor: theme.palette.action.hover }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: expandedId === faq.id ? 'primary.main' : 'text.primary' }}>
                    {faq.question}
                  </Typography>
                  <IconButton size="small">
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
                      <Box sx={{ px: 3, pb: 3, pt: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {faq.answer}
                        </Typography>
                        <Button 
                          size="small" 
                          endIcon={<ExternalLink size={14} />} 
                          sx={{ mt: 2 }}
                        >
                          Read full article
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Help;