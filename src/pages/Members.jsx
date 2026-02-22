import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  TextField, 
  InputAdornment, 
  Avatar, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  Tooltip,
  Grid,
  useMediaQuery,
  Snackbar,
  Alert,
  Skeleton,
  CircularProgress,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  alpha,
  Paper,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  UserPlus, 
  Printer, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  UserX,
  Cake,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Download,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarDays,
  Sparkles,
  Zap
} from 'lucide-react';
import AddMemberDialog from '../components/AddMemberDialog';
import MemberDetailsDialog from '../components/MemberDetailsDialog';

import { API_BASE_URL } from '../config';

const Members = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { filterData, showNotification, showConfirmation, userRole, userBranch, isBranchRestricted } = useWorkspace();
  
  // --- STATE ---
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(isBranchRestricted ? userBranch : '');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchMembers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      console.log("Members: Fetching from", `${API_BASE_URL}/members`);
      const response = await axios.get(`${API_BASE_URL}/members`);
      console.log("Members: Received", response.data?.length || 0, "items");
      setMembers(response.data || []);
    } catch (err) {
      console.error("Members Fetch Error:", err.response?.data || err.message);
      showNotification("Failed to sync member database. Check console.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const handleCleanupDuplicates = () => {
    showConfirmation({
      title: "Remove Historical Duplicates",
      message: "This will scan the registry for identical names and permanently delete older duplicate entries, keeping only the most recent record for each person. Continue?",
      severity: "warning",
      onConfirm: async () => {
        setMaintenanceLoading(true);
        try {
          // Use current members state
          const groups = {};
          members.forEach(m => {
            if (!m.name) return;
            const key = m.name.trim().toLowerCase();
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
          });

          const toDelete = [];
          Object.values(groups).forEach(group => {
            if (group.length > 1) {
              // Sort by date descending (newest first)
              const sorted = group.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
              });
              // Mark all but the newest (index 0) for deletion
              for (let i = 1; i < sorted.length; i++) {
                toDelete.push(sorted[i].id);
              }
            }
          });

          if (toDelete.length === 0) {
            showNotification("No duplicates found. Your registry is clean!", "success");
          } else {
            await Promise.all(toDelete.map(id => axios.delete(`${API_BASE_URL}/members/${id}`)));
            showNotification(`Optimization complete! Removed ${toDelete.length} old duplicate records.`, "success");
            await fetchMembers(true);
          }
        } catch (err) {
          console.error("Cleanup Error:", err);
          showNotification("Registry cleanup encountered an issue.", "error");
        } finally {
          setMaintenanceLoading(false);
        }
      }
    });
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (newMember) => {
    // 🟢 Duplicate Name Check (Case-Insensitive)
    const nameExists = members.some(m => 
      m.name.trim().toLowerCase() === newMember.name.trim().toLowerCase()
    );

    if (nameExists) {
      showNotification(`Registry Alert: A member named "${newMember.name}" already exists.`, "warning");
      throw new Error("Duplicate member name"); // Stop submission and reset dialog loading state
    }

    try {
      setLoading(true);
      console.log("Members: Adding new", newMember);
      const response = await axios.post(`${API_BASE_URL}/members`, newMember);
      console.log("Members: Add success", response.data);
      
      await fetchMembers(true); 
      setOpenAddMemberDialog(false);
      showNotification("New member successfully registered!", "success");
      return response.data;
    } catch (err) {
      console.error("Members Add Error:", err.response?.data || err.message);
      showNotification(`Failed to register member: ${err.response?.status} ${err.message}`, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, updatedMember) => {
    try {
      await axios.put(`${API_BASE_URL}/members/${id}`, updatedMember);
      await fetchMembers(true);
      setSelectedMember(null);
      showNotification("Member profile synchronized.", "success");
    } catch (err) {
      console.error("Members Edit Error:", err.response?.data || err.message);
      showNotification("Failed to update profile.", "error");
    }
  };

  const handleDelete = async (id) => {
    showConfirmation({
      title: "Remove Member",
      message: "Are you sure you want to remove this member from the directory? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/members/${id}`);
          await fetchMembers(true);
          setSelectedMember(null);
          showNotification("Member removed from directory.", "info");
        } catch (err) {
          console.error("Members Delete Error:", err.response?.data || err.message);
          showNotification("Failed to remove member.", "error");
        }
      }
    });
  };

  const filteredMembers = useMemo(() => {
    const environmentFiltered = filterData(members);
    return environmentFiltered.filter(m => {
      const matchesSearch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (m.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranch === '' || (m.branch || '').toLowerCase() === selectedBranch.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || (m.status || 'active').toLowerCase() === selectedStatus.toLowerCase();
      
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [members, searchTerm, selectedBranch, selectedStatus, filterData]);

  const getStatusChip = (status = 'active') => {
    const colors = {
      active: { main: '#10B981', bg: alpha('#10B981', 0.1) },
      inactive: { main: '#F59E0B', bg: alpha('#F59E0B', 0.1) },
      discontinued: { main: '#EF4444', bg: alpha('#EF4444', 0.1) },
    };
    const color = colors[status.toLowerCase()] || colors.active;
    
    return (
      <Chip 
        label={status}
        size="small"
        sx={{ 
          bgcolor: color.bg, 
          color: color.main, 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          fontSize: '0.65rem',
          letterSpacing: 0.5,
          borderRadius: 2
        }} 
      />
    );
  };

  const renderMemberCard = (member, index) => (
    <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={member.id}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card 
          onClick={() => setSelectedMember(member)}
          sx={{ 
            p: 3, 
            borderRadius: 5, 
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              borderColor: alpha(theme.palette.primary.main, 0.2)
            },
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, height: 56, 
                borderRadius: '16px', 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              {member.name?.charAt(0).toUpperCase()}
            </Avatar>
            {getStatusChip(member.status)}
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>{member.name}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Building2 size={14} /> {member.branch || 'Main Sanctuary'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.6 }}>
               Contact Information
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
               <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
                  <Mail size={14} color={theme.palette.text.secondary} /> {member.email || 'No email set'}
               </Typography>
               <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
                  <Phone size={14} color={theme.palette.text.secondary} /> {member.phone || 'N/A'}
               </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5, opacity: 0.5 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.primary.main }}>
              #{member.id?.toString().slice(-4)}
            </Typography>
            <IconButton size="small"><MoreVertical size={16} /></IconButton>
          </Box>
        </Card>
      </motion.div>
    </Grid>
  );

  return (
    <Box sx={{ pb: 6 }}>
      
      {/* --- HEADER --- */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={3} sx={{ mb: 5 }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2} sx={{ opacity: 0.7 }}>
             GLOBAL DIRECTORY
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: '-0.04em' }}>
            Church Registry
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          {userRole === 'admin' && (
            <Button 
              variant="outlined" 
              color="warning"
              startIcon={maintenanceLoading ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={18} />}
              onClick={handleCleanupDuplicates}
              disabled={maintenanceLoading || members.length === 0}
              sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
            >
              {maintenanceLoading ? 'Cleaning...' : 'Clean Duplicates'}
            </Button>
          )}
          <Button 
            variant="outlined" 
            startIcon={<Printer size={18} />}
            onClick={() => window.print()}
            sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
          >
            Export
          </Button>
          <Button 
            variant="contained" 
            startIcon={<UserPlus size={18} />} 
            onClick={() => setOpenAddMemberDialog(true)}
            sx={{ 
              borderRadius: 3, px: 4, py: 1.5, fontWeight: 800,
              boxShadow: `0 12px 24px -6px ${alpha(theme.palette.primary.main, 0.4)}` 
            }}
          >
            Add New Member
          </Button>
        </Stack>
      </Stack>

      {/* --- FILTERS & TOOLS --- */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 5, mb: 4, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Quick search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: theme.palette.background.paper } }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
             <FormControl fullWidth size="medium">
                <Select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper }}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  <MenuItem value="Langma">Langma</MenuItem>
                  <MenuItem value="Mallam">Mallam</MenuItem>
                  <MenuItem value="Kokrobetey">Kokrobetey</MenuItem>
                </Select>
             </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
             <FormControl fullWidth size="medium">
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
             </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, v) => v && setViewMode(v)}
                size="small"
                sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3 }}
              >
                <ToggleButton value="grid" sx={{ px: 2, borderRadius: '12px 0 0 12px !important' }}><LayoutGrid size={18} /></ToggleButton>
                <ToggleButton value="table" sx={{ px: 2, borderRadius: '0 12px 12px 0 !important' }}><TableIcon size={18} /></ToggleButton>
              </ToggleButtonGroup>
              <IconButton sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}><Download size={18} /></IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* --- CONTENT --- */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Grid container spacing={3}>
               {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Grid key={i} size={{ xs: 12, md: 3 }}><Skeleton variant="rectangular" height={220} sx={{ borderRadius: 5 }} /></Grid>)}
             </Grid>
          </motion.div>
        ) : filteredMembers.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Box sx={{ py: 15, textAlign: 'center' }}>
              <UserX size={80} color={theme.palette.text.disabled} style={{ opacity: 0.3, marginBottom: 16 }} />
              <Typography variant="h5" fontWeight={800} color="text.secondary">No members found</Typography>
              <Typography variant="body2" color="text.secondary">Try adjusting your filters or search terms</Typography>
              <Button sx={{ mt: 3, fontWeight: 700 }} onClick={() => { setSearchTerm(''); setSelectedBranch(''); setSelectedStatus('all'); }}>Clear All Filters</Button>
            </Box>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
             {filteredMembers.map((member, idx) => renderMemberCard(member, idx))}
          </Grid>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.text.primary, 0.02) }}>
                  <TableRow>
                    {['Member', 'Contact Details', 'Location', 'Registered', 'Status', 'Actions'].map(h => <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: theme.palette.text.secondary }}>{h}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} hover onClick={() => setSelectedMember(member)} sx={{ cursor: 'pointer', transition: 'background 0.2s' }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 800 }}>{member.name?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800}>{member.name}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>#{member.id?.toString().slice(-4)}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                         <Stack spacing={0.2}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>{member.email}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{member.phone}</Typography>
                         </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{member.branch || 'Main Sanctuary'}</Typography>
                        <Typography variant="caption" color="text.secondary">{member.address || 'No Address'}</Typography>
                      </TableCell>
                      <TableCell>
                         <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                            <CalendarDays size={14} /> {member.createdAt ? format(new Date(member.createdAt), 'MMM dd, yyyy') : 'N/A'}
                         </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(member.status)}</TableCell>
                      <TableCell>
                        <IconButton size="small"><MoreVertical size={18} /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}
      </AnimatePresence>

      <AddMemberDialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        onAddMember={handleAddMember}
      />
      
      <MemberDetailsDialog
        open={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </Box>
  );
};

export default Members;