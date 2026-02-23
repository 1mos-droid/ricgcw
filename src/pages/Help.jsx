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
  alpha,
  Stack,
  Avatar,
  Container,
  Paper
} from '@mui/material';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Lock, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail,
  LifeBuoy,
  Sparkles,
  Book,
  Shield,
  Zap
} from 'lucide-react';

const Help = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    { id: 1, q: "How do I sync member data?", a: "The system automatically syncs every 5 minutes. You can force a manual sync in Settings > Maintenance." },
    { id: 2, q: "Can I use the app offline?", a: "Yes, RICGCW CMS is a PWA. Core features like viewing member lists work without an active connection." },
    { id: 3, q: "Who can see financial reports?", a: "Access is restricted to users with the 'Admin' or 'Auditor' role assigned in User Management." }
  ];

  const categories = [
    { icon: Book, title: 'Guides', color: theme.palette.primary.main },
    { icon: Shield, title: 'Security', color: theme.palette.success.main },
    { icon: Zap, title: 'Features', color: theme.palette.warning.main },
    { icon: MessageCircle, title: 'Community', color: theme.palette.info.main }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        mb: 6, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 8,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`
           : alpha(theme.palette.primary.main, 0.05),
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>KNOWLEDGE BASE</Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mt: 1, mb: 4 }}>
                How can we help?
            </Typography>
            <TextField
                fullWidth
                placeholder="Search for articles, guides, or tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ maxWidth: 600, mx: 'auto', '& .MuiOutlinedInput-root': { borderRadius: 4, height: 60, bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[10] } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search size={22} color={theme.palette.primary.main} /></InputAdornment> }}
            />
        </Container>
      </Box>

      <Grid container spacing={4}>
        
        {/* Categories Grid */}
        <Grid size={{ xs: 12 }}>
            <Grid container spacing={3}>
                {categories.map((cat, i) => (
                    <Grid size={{ xs: 6, md: 3 }} key={i}>
                        <Card sx={{ 
                            p: 3, textAlign: 'center', borderRadius: 5, border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', borderColor: cat.color, bgcolor: alpha(cat.color, 0.02) }
                        }}>
                            <Avatar sx={{ bgcolor: alpha(cat.color, 0.1), color: cat.color, mx: 'auto', mb: 2, borderRadius: 2 }}>
                                <cat.icon size={24} />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={800}>{cat.title}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Grid>

        {/* FAQs */}
        <Grid size={{ xs: 12, lg: 8 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Frequent Questions</Typography>
            <Stack spacing={2}>
                {faqs.map((faq) => (
                    <Card key={faq.id} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                        <Box 
                            onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                            sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}
                        >
                            <Typography fontWeight={700}>{faq.q}</Typography>
                            {expandedId === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </Box>
                        <AnimatePresence>
                            {expandedId === faq.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <Box sx={{ px: 3, pb: 3, pt: 1, color: 'text.secondary', lineHeight: 1.7 }}>
                                        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                                        {faq.a}
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}
            </Stack>
        </Grid>

        {/* Support Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ 
                p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                position: 'relative', overflow: 'hidden'
            }}>
                <LifeBuoy size={100} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }} />
                <Typography variant="h6" fontWeight={800} gutterBottom>Still stuck?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Our engineering team is ready to help you with any issue.</Typography>
                <Button fullWidth variant="contained" startIcon={<MessageCircle size={18} />} sx={{ borderRadius: 2, py: 1.5, fontWeight: 800 }}>Start Chat</Button>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3, color: 'text.secondary' }}>
                    <Mail size={14} />
                    <Typography variant="caption" fontWeight={700}>support@ricgcw.org</Typography>
                </Stack>
            </Card>
        </Grid>

      </Grid>

    </Box>
  );
};

export default Help;