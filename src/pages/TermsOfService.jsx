import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  Stack,
  alpha,
  useTheme,
  Divider,
  Button,
  Grid
} from '@mui/material';
import {
  FileText,
  Shield,
  Heart,
  Users,
  CreditCard,
  Lock,
  AlertTriangle,
  Mail,
  ChevronLeft,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms of Service | RICGCW';
  }, []);

  const sections = [
    {
      icon: <FileText size={22} color={theme.palette.primary.main} />,
      title: '1. Preamble & Acceptance of Terms',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Welcome to the digital administrative platform of <strong>Rhema Inner Court Gospel Church (Word Assembly Worldwide)</strong> ("RICGCW", "the Church", "we", "us", or "our"). These Terms of Service govern your access to and use of our web application (https://ricgcw.web.app), mobile applications, member directories, and related digital ministry services.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            By accessing, creating an account, or registering with RICGCW digital portals, you acknowledge that you have read, understood, and agreed to be bound by these terms. If you do not agree, please discontinue using this portal immediately.
          </Typography>
        </>
      )
    },
    {
      icon: <Users size={22} color={theme.palette.primary.main} />,
      title: '2. Membership & Directory Integrity',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Our member directory is maintained to support pastoral care, fellowship, discipleship, and church administration across our campuses (Mallam, Langma, Kokrobitey, Diaspora, and affiliated assemblies).
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            When registering, members agree to provide accurate, truthful, and up-to-date information. Member information must be handled with ecclesiastical reverence and personal confidentiality. Unauthorized scraping, bulk exporting, or commercial redistribution of church directory data is strictly prohibited.
          </Typography>
        </>
      )
    },
    {
      icon: <CreditCard size={22} color={theme.palette.primary.main} />,
      title: '3. Stewardship, Tithes & Financial Contributions',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            All financial gifts, tithes, freewill offerings, building funds, and welfare donations made through this platform are voluntary acts of worship and Christian stewardship dedicated to the mission and outreach of the Church.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            All electronic giving transactions are processed through PCI-DSS compliant third-party payment gateways (including licensed mobile money and banking providers). RICGCW does not store sensitive debit/credit card numbers or Mobile Money PINs. Because contributions are charitable donations immediately directed toward ministry obligations, donations are generally non-refundable, except in verified cases of technical duplicate processing.
          </Typography>
        </>
      )
    },
    {
      icon: <Lock size={22} color={theme.palette.primary.main} />,
      title: '4. Account Credentials & Security',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Authorized church leaders, administrators, and members are responsible for maintaining the confidentiality of their credentials. You must immediately notify the IT Administration team (support@ricgcw.org) if you suspect unauthorized access or security compromises.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Role-Based Access Control (RBAC) is enforced across pastoral, administrative, and volunteer tiers. Users must only access data and functions authorized under their assigned ecclesiastical roles.
          </Typography>
        </>
      )
    },
    {
      icon: <BookOpen size={22} color={theme.palette.primary.main} />,
      title: '5. Intellectual Property & Ministry Content',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            All sermon notes, study curricula, devotional materials, service recordings, graphic designs, and logos displayed on this application are the intellectual property of Rhema Inner Court Gospel Church Worldwide, or licensed for ministry use.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Congregants are encouraged to read, study, and share study materials for spiritual edification. However, modifying, publishing for profit, or commercializing church curriculum without written pastoral approval is prohibited.
          </Typography>
        </>
      )
    },
    {
      icon: <Shield size={22} color={theme.palette.primary.main} />,
      title: '6. Pastoral Care & Safeguarding',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Prayer requests and pastoral counseling notes submitted through the application are treated with strict ministerial confidentiality. Pastoral notes containing sensitive counseling details are protected with field-level encryption.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Children church attendance and guardian check-in/check-out tokens are governed by our Child Protection and Safeguarding Policy. Only verified parents and registered guardians are authorized to collect checked-in minors from children's church facilities.
          </Typography>
        </>
      )
    },
    {
      icon: <AlertTriangle size={22} color={theme.palette.primary.main} />,
      title: '7. Community Standards & Code of Conduct',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Users must treat one another with brotherly love, honor, and Christ-like mutual respect. The platform may not be used for harassment, defamatory statements, solicitation, spam, or malicious interference with church operations.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            The Church Leadership reserves the right to suspend or terminate digital access for any account found in breach of these standards or engaging in disruptive behavior.
          </Typography>
        </>
      )
    },
    {
      icon: <Mail size={22} color={theme.palette.primary.main} />,
      title: '8. Governance, Jurisdiction & Contact',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            These terms are governed by the ecclesiastical constitution of Rhema Inner Court Gospel Church Worldwide and applicable statutory laws of the Republic of Ghana, including the Data Protection Act, 2012 (Act 843).
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            If you have questions regarding these terms, your account, or church administrative practices, please reach out to our administration team:
          </Typography>
          <Box sx={{ mt: 2, p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Typography variant="subtitle2" fontWeight={700}>Rhema Inner Court Gospel Church Worldwide</Typography>
            <Typography variant="body2" color="text.secondary">Secretariat & IT Department</Typography>
            <Typography variant="body2" color="text.secondary">P.O. Box DS 1234, Dansoman / Mallam, Accra, Ghana</Typography>
            <Typography variant="body2" color="text.secondary">Email: administration@ricgcw.org | it@ricgcw.org</Typography>
          </Box>
        </>
      )
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        {/* Header Branding */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box
            component="img"
            src="/ricgcw.png"
            alt="RICGCW Logo"
            sx={{
              width: 80,
              height: 80,
              mb: 3,
              objectFit: 'contain'
            }}
          />
          <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={3}>
            LEGAL & ECCLESIASTICAL POLICIES
          </Typography>
          <Typography variant="h3" component="h1" fontWeight={900} sx={{ letterSpacing: '-0.02em', mt: 1, mb: 2 }}>
            Terms of Service
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: 'auto', fontWeight: 500, lineHeight: 1.7 }}>
            Official guidelines governing church membership registration, digital administration, spiritual stewardship, and platform usage across Rhema Inner Court assemblies worldwide.
          </Typography>
        </Box>

        {/* Quick Summary Card */}
        <Card
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <CheckCircle2 size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={800}>
              Commitment to Kingdom Excellence
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            We are dedicated to transparent stewardship, responsible technology stewardship, and honoring the privacy and dignity of every worshipper. Last updated: September 2026.
          </Typography>
        </Card>

        {/* Terms Sections */}
        <Stack spacing={3}>
          {sections.map((sec, idx) => (
            <Card
              key={idx}
              component={motion.div}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1]
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {sec.icon}
                </Box>
                <Typography variant="h6" fontWeight={800}>
                  {sec.title}
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2.5, opacity: 0.5 }} />
              {sec.content}
            </Card>
          ))}
        </Stack>

        {/* Footer info */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
            <Heart size={16} fill={theme.palette.error.main} color={theme.palette.error.main} />
            <Typography variant="body2" fontWeight={800} color="text.secondary">
              Rhema Inner Court Gospel Church Worldwide
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<ChevronLeft size={18} />}
            onClick={() => navigate('/')}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, px: 3, py: 1 }}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default TermsOfService;
