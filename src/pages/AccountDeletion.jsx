import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  TextField,
  Button,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Mail,
  User,
  Phone,
  AlertTriangle,
  ChevronLeft,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AccountDeletion = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter the email address associated with your account.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm that you understand this action will permanently delete your account data.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'account_deletion_requests'), {
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        phone: phone.trim() || null,
        reason: reason.trim() || 'User requested deletion',
        status: 'pending',
        platform: 'web_request',
        createdAt: new Date().toISOString()
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Account deletion request error:', err);
      setError('An error occurred while submitting your request. You can also email us directly at privacy@ricgcw.org.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Card
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                borderRadius: 6,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[10]
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <CheckCircle2 size={44} />
              </Box>
              <Typography variant="h4" fontWeight={900} gutterBottom>
                Request Submitted
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                We have received your account and data deletion request for <strong>{email}</strong>.
              </Typography>
              <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 4, textAlign: 'left', borderRadius: 3 }}>
                Your authentication credentials, member profile, prayer logs, and associated records will be permanently removed from our active databases within <strong>7 business days</strong>.
              </Alert>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
                >
                  Return to Home
                </Button>
              </Stack>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box
            component="img"
            src="/ricgcw.png"
            alt="RICGCW Logo"
            sx={{
              width: 72,
              height: 72,
              mb: 2,
              objectFit: 'contain',
              filter: `drop-shadow(0 4px 10px ${alpha(theme.palette.primary.main, 0.2)})`
            }}
          />
          <Typography variant="overline" color="error" fontWeight={800} letterSpacing={2}>
            GOOGLE PLAY & PRIVACY COMPLIANCE
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            fontWeight={900}
            sx={{ letterSpacing: '-0.02em', mt: 0.5, mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}
          >
            Request Account & Data Deletion
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto', fontWeight: 500 }}>
            Submit a request to permanently delete your <strong>RICGCW Connect</strong> mobile application and web portal account and all associated personal data.
          </Typography>
        </Box>

        {/* Data Deletion Details Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                bgcolor: alpha(theme.palette.error.main, 0.03),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Trash2 size={20} color={theme.palette.error.main} />
                <Typography variant="subtitle1" fontWeight={800} color="error">
                  What Will Be Deleted
                </Typography>
              </Stack>
              <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 1, color: 'text.secondary', fontSize: '0.9rem' } }}>
                <li>Firebase Authentication account & login credentials</li>
                <li>Member profile (Full name, phone, branch, department, address)</li>
                <li>Confidential prayer petitions and testimony submissions</li>
                <li>Personal spiritual journal notes</li>
                <li>Service check-in attendance records & safety pickup tag logs</li>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                bgcolor: alpha(theme.palette.info.main, 0.03),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <ShieldAlert size={20} color={theme.palette.info.main} />
                <Typography variant="subtitle1" fontWeight={800} color="info.main">
                  Processing & Retention Policy
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                • <strong>Timeline:</strong> Deletion requests are fulfilled within 7 business days across all Firebase databases.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                • <strong>Giving History:</strong> Statutory financial audit records of contributions processed through third-party banks/gateways may be retained in anonymized accounting summaries as required by applicable nonprofit financial laws.
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Deletion Request Form */}
        <Card
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8]
          }}
        >
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Submit Deletion Request
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide the registered details associated with your RICGCW account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Registered Email Address"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                InputProps={{
                  startAdornment: (
                    <Mail size={18} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Name (Optional)"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <User size={18} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone Number (Optional)"
                    type="tel"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 XX XXX XXXX"
                    InputProps={{
                      startAdornment: (
                        <Phone size={18} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Reason for deletion (Optional)"
                multiline
                rows={3}
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help us understand how we can improve our ministry app services..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    color="error"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    I confirm that I want to delete my account and understand that this action is permanent and cannot be undone.
                  </Typography>
                }
              />

              <Button
                type="submit"
                variant="contained"
                color="error"
                size="large"
                disabled={submitting}
                sx={{
                  py: 1.8,
                  borderRadius: 3.5,
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: `0 8px 20px -4px ${alpha(theme.palette.error.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 12px 28px -6px ${alpha(theme.palette.error.main, 0.5)}`
                  }
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Request Deletion'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <Typography variant="caption" color="text.secondary" display="block">
              <strong>Need assistance?</strong> You can also contact our Data Protection and IT Ministry team directly by emailing{' '}
              <a href="mailto:privacy@ricgcw.org" style={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                privacy@ricgcw.org
              </a>{' '}
              or calling our administrative office.
            </Typography>
          </Box>
        </Card>

        {/* Back Link */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="text"
            startIcon={<ChevronLeft size={18} />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AccountDeletion;
