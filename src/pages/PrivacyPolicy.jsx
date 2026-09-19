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
  Shield,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Radio,
  Bell,
  Trash2,
  Mail,
  Heart,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy | RICGCW';
  }, []);

  const sections = [
    {
      icon: <Shield size={22} color={theme.palette.primary.main} />,
      title: '1. Ministry & Application Overview',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            This Privacy Policy governs the collection, storage, use, and protection of information across all digital platforms operated by{' '}
            <strong>Rhema Inner Court Gospel Church (Word Assembly Worldwide)</strong> (referred to as "RICGCW", "the Ministry", "we", "our", or "us"), including the{' '}
            <strong>RICGCW Connect</strong> mobile application (Android & iOS) and the <strong>RICGCW Web Portal</strong> (https://ricgcw.web.app).
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            We are dedicated to maintaining the trust of our members, partners, and visitors by safeguarding personal information and honoring the spiritual confidentiality of our congregation.
          </Typography>
        </>
      )
    },
    {
      icon: <Eye size={22} color={theme.palette.primary.main} />,
      title: '2. Information We Collect',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            We collect only information necessary to deliver ministry services, spiritual support, and community engagement:
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1.5, color: 'text.secondary', lineHeight: 1.7 } }}>
            <li>
              <strong>Profile & Contact Information:</strong> Full name, email address, telephone number, residential address, date of birth, home branch (e.g., Main Sanctuary, Langma, Mallam, Kokrobitey, Diaspora), and ministry department.
            </li>
            <li>
              <strong>Attendance & Safety Records:</strong> Self check-in logs, service attendance records, and child court security pickup tag tokens generated during worship services.
            </li>
            <li>
              <strong>Prayer Petitions & Spiritual Requests:</strong> Prayer petitions, thanksgiving testimonies, and spiritual counseling notes submitted by users.
            </li>
            <li>
              <strong>Stewardship & Kingdom Giving:</strong> Transaction reference logs, contribution categories (Tithes, Offerings, Welfare, Missions), dates, and amounts for member giving history records. <em>Note: Payment card details and Mobile Money PINs are processed securely by PCI-DSS certified payment gateways and are never collected or stored on our servers.</em>
            </li>
            <li>
              <strong>Technical & Diagnostic Data:</strong> Device model, operating system version, crash telemetry, and connection status strictly used to troubleshoot and ensure reliable service.
            </li>
          </Box>
        </>
      )
    },
    {
      icon: <Lock size={22} color={theme.palette.primary.main} />,
      title: '3. Pastoral Privilege & Confidentiality',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            All prayer requests, spiritual petitions, and pastoral counseling notes submitted through RICGCW Connect are held with the highest spiritual and ethical confidentiality.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Requests designated as <strong>Confidential</strong> are restricted exclusively to Overseer Rev. Nicholas Dobeng and the ordained Pastoral Council for prayer and spiritual intercession. We never sell, rent, commercialize, or publicly share personal prayer requests with third parties.
          </Typography>
        </>
      )
    },
    {
      icon: <Radio size={22} color={theme.palette.primary.main} />,
      title: '4. Device Permissions & Background Services',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            The RICGCW Connect mobile application requests specific device permissions to provide core features:
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1.5, color: 'text.secondary', lineHeight: 1.7 } }}>
            <li>
              <strong>Foreground Service & Media Playback (FOREGROUND_SERVICE, FOREGROUND_SERVICE_MEDIA_PLAYBACK):</strong> Required to allow continuous streaming of the 24/7 RICGCW live church radio and sermon audio when the screen is locked or while multitasking.
            </li>
            <li>
              <strong>Push Notifications (POST_NOTIFICATIONS):</strong> Used to notify users of live broadcast start times, service updates, daily scriptures, and urgent pastoral announcements. You can enable or disable notifications at any time in device settings.
            </li>
            <li>
              <strong>Network Access (INTERNET, ACCESS_NETWORK_STATE):</strong> Required to retrieve sermon archives, update prayer requests, stream 24/7 radio broadcasts, and synchronize member profile information.
            </li>
          </Box>
        </>
      )
    },
    {
      icon: <UserCheck size={22} color={theme.palette.primary.main} />,
      title: '5. Child & Family Safety',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Protecting the safety of children in our sanctuary is a foundational priority. Information regarding minors in the Children's Court is collected solely through verified parents or legal guardians for safe check-in, age-appropriate ministry grouping, and secure pickup tag verification.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            We do not knowingly collect personal data directly from children under 13 without parental consent.
          </Typography>
        </>
      )
    },
    {
      icon: <Trash2 size={22} color={theme.palette.primary.main} />,
      title: '6. User Rights, Account & Data Deletion',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            In accordance with international data protection standards and Google Play Store policies, you have full control over your personal information:
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1.5, color: 'text.secondary', lineHeight: 1.7 } }}>
            <li><strong>Right of Access & Modification:</strong> You can view and update your profile details at any time in the app or web portal.</li>
            <li><strong>Right of Deletion:</strong> You can request complete deletion of your account, prayer logs, giving history, and personal records.</li>
          </Box>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            <strong>To request account and data deletion:</strong>
            <br />
            1. <strong>Online Deletion Request Portal:</strong> Visit our dedicated <a href="/delete-account" style={{ color: theme.palette.error.main, fontWeight: 800 }}>Account &amp; Data Deletion Request Page</a> to submit an online request.
            <br />
            2. <strong>In-App Deletion:</strong> Open the mobile app and submit a deletion request under <em>Profile &gt; Security &gt; Delete Account</em>.
            <br />
            3. <strong>Direct Email:</strong> Email our IT &amp; Privacy Team at{' '}
            <a href="mailto:privacy@ricgcw.org" style={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              privacy@ricgcw.org
            </a>{' '}
            with your registered email address and name. Requests are processed within 7 business days.
          </Typography>
        </>
      )
    },
    {
      icon: <FileText size={22} color={theme.palette.primary.main} />,
      title: '7. Third-Party Service Providers',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            We utilize industry-leading cloud providers who adhere to strict data security frameworks:
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1.5, color: 'text.secondary', lineHeight: 1.7 } }}>
            <li><strong>Google Cloud & Firebase:</strong> Authentication, encrypted Cloud Firestore database hosting, and crash analytics.</li>
            <li><strong>Zeno Media / Radio Streaming:</strong> Content delivery network for the 24/7 church radio broadcast.</li>
            <li><strong>Payment Processors:</strong> Licensed banks and mobile money carriers for digital giving processing.</li>
          </Box>
        </>
      )
    },
    {
      icon: <Mail size={22} color={theme.palette.primary.main} />,
      title: '8. Contact & Privacy Inquiries',
      content: (
        <>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            If you have questions, feedback, or requests regarding this Privacy Policy, please reach out to our ministry administration:
          </Typography>
          <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
            <Typography variant="subtitle1" fontWeight={800} color="primary" gutterBottom>
              Rhema Inner Court Gospel Church (RICGCW)
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Administration & IT Data Office:</strong> Word Assembly Worldwide
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@ricgcw.org" style={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                privacy@ricgcw.org
              </a>{' '}
              / <a href="mailto:info@ricgcw.org" style={{ color: theme.palette.primary.main, fontWeight: 700 }}>info@ricgcw.org</a>
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Website:</strong> https://ricgcw.web.app
            </Typography>
            <Typography variant="body2">
              <strong>Leadership:</strong> Overseer Rev. Nicholas Dobeng
            </Typography>
          </Box>
        </>
      )
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box
            component="img"
            src="/ricgcw.png"
            alt="RICGCW Logo"
            sx={{
              width: 80,
              height: 80,
              mb: 2.5,
              objectFit: 'contain',
              filter: `drop-shadow(0 4px 12px ${alpha(theme.palette.primary.main, 0.25)})`
            }}
          />
          <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={3}>
            LEGAL & DATA PROTECTION
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            fontWeight={900}
            sx={{ letterSpacing: '-0.02em', mt: 1, mb: 1.5, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            Privacy Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Effective & Last Updated: August 2026 • Version 1.0
          </Typography>
        </Box>

        {/* Introduction Banner Card */}
        <Card
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            mb: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            boxShadow: theme.shadows[4]
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <Shield size={32} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Your Privacy & Pastoral Trust
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                At Rhema Inner Court Gospel Church, we treat your personal and spiritual data with reverence and the highest standards of data security and pastoral discretion.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Policy Sections */}
        <Stack spacing={3}>
          {sections.map((sec, idx) => (
            <Card
              key={idx}
              component={motion.div}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2]
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
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
              Rhema Inner Court Gospel Church - Sanctuary of Power & Grace
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<ChevronLeft size={18} />}
            onClick={() => navigate('/')}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
