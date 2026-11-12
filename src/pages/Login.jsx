import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ArrowRight, Moon, Sun, LockKeyhole } from 'lucide-react';
import SlideTextButton from '../components/ui/kokonut/SlideTextButton';
import RevealText from '../components/ui/smooth/RevealText';
import ContinuousTabs from '../components/ui/watermelon/ContinuousTabs';
import PasswordInput from '../components/ui/rare/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useColorMode } from '../theme';

const BRANCHES = ['Mallam', 'Langma', 'Kokrobitey', 'Diaspora', 'Overseer'];

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, resetPassword, isAuthenticated } = useAuth();
  const { refreshUserContext } = useWorkspace();
  const { mode, toggleColorMode } = useColorMode();
  const [view, setView] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '', branch: 'Mallam' });
  const isSignup = view === 'signup';
  const isReset = view === 'reset';
  useEffect(() => {
    document.title = `${isReset ? 'Reset Password' : isSignup ? 'Create Account' : 'Sign In'} | RICGCW`;
  }, [isReset, isSignup]);
  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);
  const changeView = (next) => { setView(next); setError(''); setSuccess(''); };
  const update = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (isReset) {
        const result = await resetPassword(form.email.trim());
        if (result?.success === false) throw new Error(result.error || 'Unable to send a reset link.');
        setSuccess(result?.message || 'Password reset link sent! Check your inbox.');
      } else {
        if (isSignup) await signup(form.email.trim(), form.password, form.name.trim(), form.branch);
        else await login(form.email.trim(), form.password);
        refreshUserContext();
        navigate('/');
      }
    } catch (err) { setError(err.message || 'Unable to continue. Please try again.'); }
    finally { setLoading(false); }
  };
  return (
    <Box className="auth-page">
      <Box component="aside" className="auth-visual">
        <div className="auth-photo" role="img" aria-label="Sunlight through stained glass in a church sanctuary" />
        <div className="auth-visual-shade" />
        <div className="auth-visual-top">
          <div className="auth-brand"><img src="/ricgcw.png" alt="" width="48" height="48" /><span>RICGCW<small>Church Management</small></span></div>
          <span className="auth-edition">Faith in action.</span>
        </div>
        <div className="auth-visual-copy">
          <span className="eyebrow light">A shared faith. A connected church.</span>
          <h2><RevealText>People at the heart.</RevealText><br /><em>Purpose in every step.</em></h2>
          <p>One place to care for our community, serve our ministries, and grow together.</p>
        </div>
        <div className="auth-visual-bottom"><span>“Let all things be done decently and in order.”<small>1 Corinthians 14:40 · KJV</small></span><span className="auth-index">01 / RICGCW</span></div>
      </Box>
      <Box component="main" className="auth-panel">
        <header className="auth-panel-top"><span>RICGCW PORTAL</span><IconButton aria-label={'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode'} onClick={toggleColorMode}>{mode === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</IconButton></header>
        <Container maxWidth="xs" className="auth-form-wrap">
          <div className="auth-mobile-brand"><img src="/ricgcw.png" alt="" width="38" height="38" /><span>RICGCW<small>Your church, connected.</small></span></div>
          <span className="eyebrow">Member & ministry access</span>
          <Typography component="h1" className="auth-title"><RevealText key={view}>{isReset ? 'A fresh start.' : isSignup ? 'You belong here.' : 'Good to have you here.'}</RevealText></Typography>
          <Typography className="auth-description">{isReset ? 'Password Recovery & Activation Portal' : isSignup ? 'Member & Worker Account Request' : 'Ministry & Leadership Portal'}</Typography>
          {!isReset && <ContinuousTabs value={view} onChange={changeView} disabled={loading} label="Account access" tabs={[{ id: 'signin', label: 'Sign in' }, { id: 'signup', label: 'Create account' }]} />}
          <Box component="form" onSubmit={submit} aria-busy={loading} className="auth-form">
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
              {isReset && <Typography variant="body2" color="text.secondary">Enter your registered email address. We’ll send you a link to reset your password.</Typography>}
              {isSignup && <TextField disabled={loading} label="Full name" placeholder="Full Name" autoComplete="name" required value={form.name} onChange={update('name')} />}
              {isSignup && <TextField disabled={loading} select label="Branch" value={form.branch} onChange={update('branch')}>{BRANCHES.map((branch) => <MenuItem key={branch} value={branch}>{branch}</MenuItem>)}</TextField>}
              <TextField disabled={loading} label="Email address" placeholder="Email Address" type="email" autoComplete="email" required value={form.email} onChange={update('email')} />
              {!isReset && <PasswordInput disabled={loading} label="Password" placeholder="Password" autoComplete={isSignup ? 'new-password' : 'current-password'} required strength={isSignup} value={form.password} onChange={update('password')} />}
              {!isReset && <Button disabled={loading} className="auth-forgot" onClick={() => changeView('reset')}>Forgot password?</Button>}
              <SlideTextButton type="submit" variant="contained" size="large" disabled={loading} className="auth-submit" hoverText={isReset ? 'Send my reset link' : isSignup ? 'Join your church workspace' : 'Open your workspace'} endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowRight size={18} />}>{isReset ? 'Send Reset Link' : isSignup ? 'Create account' : 'Sign In'}</SlideTextButton>
              {isReset && <Button disabled={loading} onClick={() => changeView('signin')}>← Return to Sign In</Button>}
            </Stack>
          </Box>
          <div className="auth-trust"><LockKeyhole size={14} /><span>Your church account. Securely connected.</span></div>
        </Container>
        <footer className="auth-footer"><span>© {new Date().getFullYear()} RICGCW</span><div><Link to="/privacy-policy">Privacy</Link><Link to="/terms-of-service">Terms</Link><a href="https://rareui.com" target="_blank" rel="noreferrer">UI credits</a></div></footer>
      </Box>
    </Box>
  );
}
