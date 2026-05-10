import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Button, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  Paper,
  alpha,
  useTheme,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Terminal, 
  Hammer, 
  Users, 
  ShieldAlert, 
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { syncMemberDepartments } from '../utils/syncDepartments';

const Developer = () => {
  const theme = useTheme();
  const { user: originalUser, isDeveloper } = useAuth();
  const { 
    maintenance, 
    toggleMaintenance, 
    startMimicking, 
    stopMimicking, 
    mimicData,
    showNotification 
  } = useWorkspace();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [maintMessage, setMaintMessage] = useState(maintenance?.message || '');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData = querySnapshot.docs.map(doc => doc.data());
        setUsers(userData);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
const handleMaintenanceToggle = (e) => {
  toggleMaintenance(e.target.checked, maintMessage);
  showNotification(`Maintenance mode ${e.target.checked ? 'activated' : 'deactivated'}`, e.target.checked ? 'warning' : 'success');
};

const handleSyncDepartments = async () => {
  setSyncing(true);
  try {
    const { updatedCount, summary } = await syncMemberDepartments();
    showNotification(`Sync complete: ${updatedCount} members updated.`, updatedCount > 0 ? "success" : "info");
    if (updatedCount > 0) {
      console.log("Sync Summary:", summary);
    }
  } catch (err) {
    console.error("Sync Error:", err);
    showNotification("Failed to sync member departments.", "error");
  } finally {
    setSyncing(false);
  }
};

const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ pb: 6 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 5 }}>
        <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
          <Terminal size={24} />
        </Box>
        <Box>
          <Typography variant="overline" color="secondary" fontWeight={800}>Developer Only</Typography>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>Master Control</Typography>
        </Box>
      </Stack>

      <Grid container spacing={4}>
        {/* MAINTENANCE MODE */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 4, borderRadius: 6, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Hammer size={20} /> Maintenance Mode
              </Typography>
              <Switch 
                checked={maintenance?.active || false} 
                onChange={handleMaintenanceToggle}
                color="warning"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              When active, users with roles other than 'admin' will be redirected to the maintenance page.
            </Typography>

            <TextField 
              fullWidth
              label="Maintenance Message"
              placeholder="Explain why the app is down..."
              value={maintMessage}
              onChange={(e) => setMaintMessage(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
            />

            <Button 
              variant="contained" 
              fullWidth
              color="warning"
              onClick={() => toggleMaintenance(maintenance?.active, maintMessage)}
              sx={{ borderRadius: 3, fontWeight: 700, py: 1.5 }}
            >
              Update Message
            </Button>
          </Card>
        </Grid>

        {/* REGISTRY AUTOMATION */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 4, borderRadius: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
             <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <RotateCcw size={20} /> Registry Automation
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Recalculate and sync all member departments based on their current age. This will move members under 13 to <strong>Children's Court</strong> and 13+ to <strong>Youth</strong>.
              </Typography>

              <Box sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), mb: 4, flexGrow: 1 }}>
                  <Typography variant="caption" fontWeight={800} color="primary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>Current Rules:</Typography>
                  <Typography variant="body2" fontWeight={700}>• Age &lt; 13 → Children's Court</Typography>
                  <Typography variant="body2" fontWeight={700}>• Age 13-35 → Youth Ministry</Typography>
              </Box>

              <Button 
                variant="outlined" 
                fullWidth
                disabled={syncing}
                onClick={handleSyncDepartments}
                startIcon={syncing ? <CircularProgress size={18} /> : <Users size={18} />}
                sx={{ borderRadius: 3, fontWeight: 700, py: 1.5 }}
              >
                {syncing ? 'Syncing Registry...' : 'Sync All Member Departments'}
              </Button>
          </Card>
        </Grid>

        {/* IDENTITY MIMICRY */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 4, borderRadius: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Users size={20} /> User Mimicry
            </Typography>

            {mimicData ? (
              <Box sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} color="info.main" gutterBottom>CURRENT IDENTITY:</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>{mimicData.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography fontWeight={700}>{mimicData.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{mimicData.role} • {mimicData.branch}</Typography>
                  </Box>
                </Stack>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="info" 
                  startIcon={<RotateCcw size={18} />}
                  onClick={stopMimicking}
                  sx={{ mt: 3, borderRadius: 3, fontWeight: 700 }}
                >
                  Restore Original Identity
                </Button>
              </Box>
            ) : (
              <Box sx={{ p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.05), mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle2 size={20} color={theme.palette.success.main} />
                <Typography variant="body2" fontWeight={600} color="success.main">Using your real identity: {originalUser?.name}</Typography>
              </Box>
            )}

            <TextField 
              fullWidth
              placeholder="Search users to mimic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
            />

            <Paper variant="outlined" sx={{ flexGrow: 1, borderRadius: 4, overflow: 'hidden', maxHeight: 300, overflowY: 'auto' }}>
              <List disablePadding>
                {loading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={32} /></Box>
                ) : filteredUsers.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No users found</Box>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <React.Fragment key={u.email}>
                      <ListItem 
                        secondaryAction={
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => startMimicking(u)}
                            disabled={u.email === originalUser?.email}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                          >
                            Mimic
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ fontSize: '0.8rem' }}>{u.name?.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="body2" fontWeight={700}>{u.name}</Typography>}
                          secondary={<Typography variant="caption">{u.role} • {u.branch}</Typography>}
                        />
                      </ListItem>
                      {idx < filteredUsers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          </Card>
        </Grid>

        {/* STATUS PANEL */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.text.primary, 0.02) }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ShieldAlert size={20} /> System Status
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Original Identity', value: originalUser?.email, color: 'primary' },
                { label: 'Active Identity', value: mimicData?.email || originalUser?.email, color: 'info' },
                { label: 'Active Role', value: mimicData?.role || originalUser?.role, color: 'secondary' },
                { label: 'Active Branch', value: mimicData?.branch || originalUser?.branch, color: 'success' },
                { label: 'Maintenance Mode', value: maintenance?.active ? 'ENABLED' : 'DISABLED', color: maintenance?.active ? 'warning' : 'success' }
              ].map((stat) => (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={stat.label}>
                  <Box sx={{ p: 2, borderRadius: 4, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: `${stat.color}.main`, mt: 0.5, wordBreak: 'break-all' }}>{stat.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Developer;
