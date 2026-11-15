import React, { useState } from 'react';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Shown to accounts that hold a staff role which is not active yet because the
 * email address behind the login has not been verified.
 */
const VerifyEmailGate = () => {
  const { user, resendVerification, refreshSession, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const run = async (action) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
    } catch (err) {
      setNotice({ severity: 'error', text: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleResend = () => run(async () => {
    await resendVerification();
    setNotice({ severity: 'success', text: `Verification link sent to ${user?.email}. Check your inbox and spam folder.` });
  });

  const handleContinue = () => run(async () => {
    const refreshed = await refreshSession();
    if (refreshed?.needsEmailVerification) {
      setNotice({ severity: 'warning', text: 'This email address is not verified yet. Open the link we emailed you, then try again.' });
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={3} alignItems="flex-start">
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'inline-flex' }}>
          <MailCheck size={28} />
        </Box>
        <Typography component="h1" variant="h4" fontWeight={800}>Verify your email to continue</Typography>
        <Typography color="text.secondary">
          Your account ({user?.email}) has staff access, and we need to confirm the email address belongs to you
          before unlocking it. Open the verification link we emailed you, then return here.
        </Typography>
        {notice && <Alert severity={notice.severity} sx={{ width: '100%' }}>{notice.text}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
          <Button variant="contained" size="large" disabled={busy} onClick={handleContinue}>I have verified my email</Button>
          <Button variant="outlined" size="large" disabled={busy} onClick={handleResend}>Resend link</Button>
          <Button size="large" disabled={busy} onClick={logout}>Sign out</Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default VerifyEmailGate;
