import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { safeParseDate } from '../utils/dateUtils';
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
  Skeleton,
  CircularProgress,
  FormControl, 
  Select, 
  MenuItem,
  alpha,
  Paper,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Menu
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
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Download,
  CalendarDays,
  Building2,
  Filter,
  FileText,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import AddMemberDialog from '../components/AddMemberDialog';
import MemberDetailsDialog from '../components/MemberDetailsDialog';

import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Members = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { filterData, showNotification, showConfirmation, userBranch, isBranchRestricted } = useWorkspace();
  
  // --- STATE ---
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogTab, setDialogTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(isBranchRestricted ? userBranch : '');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // --- HANDLERS ---
  const handleOpenDetails = (member, tab = 0) => {
    setDialogTab(tab);
    setSelectedMember(member);
  };

  // --- FETCH DATA ---
  const fetchMembers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const querySnapshot = await getDocs(collection(db, "members"));
      const membersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort members by 'createdAt' (newest first)
      const sortedMembers = (membersData || []).sort((a, b) => {
        const dateA = safeParseDate(a.createdAt || 0);
        const dateB = safeParseDate(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setMembers(sortedMembers);
    } catch (_err) {
      console.error("Members Fetch Error:", _err);
      showNotification("Failed to sync member database.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- AUTOMATIC ID SYSTEM ---
  const getBranchPrefix = (branch) => {
    switch (branch?.toLowerCase()) {
      case 'mallam': return 'M';
      case 'kokrobitey': return 'K';
      case 'langma': return 'L';
      case 'diaspora': return 'D';
      default: return 'M'; // Default to Mallam if unspecified
    }
  };

  const generateMemberId = (branch, currentMembers) => {
    const prefix = getBranchPrefix(branch);
    // The user wants the number to be unique and not greater than the number of members.
    // We'll use the current count + 1. 
    // To ensure it's "xxx" format, we'll pad with zeros.
    const nextNum = currentMembers.length + 1;
    const paddedNum = String(nextNum).padStart(3, '0');
    return `${prefix}${paddedNum}`;
  };

  const syncMemberIds = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "members"));
      const allMembers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort by creation date to assign IDs in order
      const sorted = [...allMembers].sort((a, b) => {
        const dateA = safeParseDate(a.createdAt || 0);
        const dateB = safeParseDate(b.createdAt || 0);
        return dateA - dateB;
      });

      let updatedCount = 0;
      for (let i = 0; i < sorted.length; i++) {
        const m = sorted[i];
        const prefix = getBranchPrefix(m.branch);
        const newId = `${prefix}${String(i + 1).padStart(3, '0')}`;
        
        if (m.memberId !== newId) {
          await setDoc(doc(db, "members", m.id), { memberId: newId }, { merge: true });
          updatedCount++;
        }
      }
      
      await fetchMembers(true);
      showNotification(`System Sync: ${updatedCount} IDs updated.`, "success");
    } catch (_err) {
      console.error("ID Sync Error:", _err);
      showNotification("Failed to sync member IDs.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (formatType) => {
    setExportAnchorEl(null);
    const data = filteredMembers;
    if (data.length === 0) return;

    const fileName = `member_directory_${new Date().toISOString().slice(0,10)}`;

    if (formatType === 'pdf') {
      const doc = new jsPDF();
      doc.text("MEMBER DIRECTORY", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);
      
      const headers = [["ID", "Name", "Email", "Phone", "Branch", "Status", "Joined"]];
      const rows = data.map(m => [
        m.memberId || 'N/A',
        m.name,
        m.email || 'N/A',
        m.phone || 'N/A',
        m.branch || 'Main',
        m.status || 'Active',
        m.createdAt ? format(safeParseDate(m.createdAt), 'yyyy-MM-dd') : 'N/A'
      ]);

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      doc.save(`${fileName}.pdf`);
    } else {
      // Add memberId to Excel export
      const exportData = data.map(m => ({
        ID: m.memberId || '',
        Name: m.name,
        Email: m.email || '',
        Phone: m.phone || '',
        Branch: m.branch || '',
        Status: m.status || '',
        Joined: m.createdAt ? format(safeParseDate(m.createdAt), 'yyyy-MM-dd') : ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
    showNotification(`Member directory exported as ${formatType.toUpperCase()}`);
  };

  const handleAddMember = async (newMember) => {
    const newName = String(newMember?.name || "").trim().toLowerCase();
    const nameExists = members.some(m => String(m?.name || "").trim().toLowerCase() === newName);
    
    if (newName && nameExists) {
      showNotification(`"${newMember.name}" already exists.`, "warning");
      throw new Error("Duplicate member name");
    }
    try {
      setLoading(true);
      
      // Auto-generate Member ID
      const memberId = generateMemberId(newMember.branch, members);
      
      const docRef = await addDoc(collection(db, "members"), {
        ...newMember,
        memberId,
        createdAt: new Date().toISOString()
      });
      await fetchMembers(true); 
      setOpenAddMemberDialog(false);
      showNotification(`Member registered with ID: ${memberId}`, "success");
      return { id: docRef.id, ...newMember, memberId };
    } catch (err) {
      showNotification(`Failed to register: ${err.message}`, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, updatedMember) => {
    try {
      await setDoc(doc(db, "members", id), updatedMember, { merge: true });
      await fetchMembers(true);
      setSelectedMember(null);
      showNotification("Profile updated.", "success");
    } catch {
      showNotification("Update failed.", "error");
    }
  };

  const handleDelete = async (id) => {
    showConfirmation({
      title: "Remove Member",
      message: "Permanently remove this member?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "members", id));
          await fetchMembers(true);
          setSelectedMember(null);
          showNotification("Member removed.", "info");
        } catch {
          showNotification("Delete failed.", "error");
        }
      }
    });
  };

  const filteredMembers = useMemo(() => {
    const environmentFiltered = filterData(members);
    return environmentFiltered.filter(m => {
      const matchesSearch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (m.memberId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranch === '' || (m.branch || '').toLowerCase() === selectedBranch.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || (m.status || 'active').toLowerCase() === selectedStatus.toLowerCase();
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [members, searchTerm, selectedBranch, selectedStatus, filterData]);

  const getStatusChip = (status = 'active') => {
    const colors = {
      active: { main: '#10B981', bg: alpha('#10B981', 0.08) },
      inactive: { main: '#F59E0B', bg: alpha('#F59E0B', 0.08) },
      discontinued: { main: '#EF4444', bg: alpha('#EF4444', 0.08) },
    };
    const color = colors[status.toLowerCase()] || colors.active;
    return (
      <Chip 
        label={status} size="small"
        sx={{ 
          bgcolor: color.bg, color: color.main, fontWeight: 900, 
          textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 1.5,
          letterSpacing: 0.5, border: `1px solid ${alpha(color.main, 0.2)}`
        }} 
      />
    );
  };

  const renderMemberCard = (member, index) => (
    <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={member.id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Card 
          onClick={() => handleOpenDetails(member)}
          sx={{ 
            p: 3, 
            borderRadius: 6, 
            cursor: 'pointer',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.paper, 0.8),
            '&:hover': { 
              transform: 'translateY(-10px)',
              boxShadow: `0 20px 40px -12px ${alpha(theme.palette.primary.main, 0.15)}`,
              borderColor: theme.palette.primary.main,
              '& .member-avatar-container': { transform: 'scale(1.05) rotate(2deg)' }
            }
          }}
        >
          {/* Decorative Top Gradient */}
          <Box sx={{ 
            position: 'absolute', top: 0, left: 0, right: 0, height: 4, 
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            opacity: 0.8
          }} />

          <Stack alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
            <Box className="member-avatar-container" sx={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <Avatar 
                sx={{ 
                    width: 72, height: 72, 
                    borderRadius: 4, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    color: theme.palette.primary.main,
                    fontWeight: 900,
                    fontSize: '1.75rem',
                    boxShadow: `0 8px 20px -6px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
                >
                {member.name?.charAt(0).toUpperCase()}
                </Avatar>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em', mb: 0.5 }}>{member.name}</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <Typography variant="caption" color="primary" fontWeight={900} sx={{ letterSpacing: 1 }}>
                    {member.memberId || 'NO ID'}
                    </Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {member.branch || 'Main'}
                    </Typography>
                </Stack>
            </Box>
            {getStatusChip(member.status)}
          </Stack>

          <Divider sx={{ my: 2, opacity: 0.3, borderStyle: 'dashed' }} />
          
          <Stack spacing={2}>
             <Box 
                onClick={(e) => { e.stopPropagation(); handleOpenDetails(member, 2); }}
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    color: theme.palette.text.secondary,
                    p: 1,
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main } 
                }}
             >
                <Mail size={16} />
                <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>{member.email || 'No email'}</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: theme.palette.text.secondary, px: 1 }}>
                <Phone size={16} />
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{member.phone || 'N/A'}</Typography>
             </Box>
          </Stack>
        </Card>
      </motion.div>
    </Grid>
  );

  return (
    <Box sx={{ pb: 8 }}>
      
      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        mb: 4, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 8,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`
           : alpha(theme.palette.primary.main, 0.05),
        overflow: 'hidden'
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Chip icon={<Sparkles size={14} />} label="Global Directory" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                    Church Members
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                    Manage and connect with the congregation. View profiles, track attendance eligibility, and update contact information.
                </Typography>
                
                <Button 
                  size="small" 
                  startIcon={<Clock size={14} />} 
                  onClick={syncMemberIds}
                  sx={{ mt: 3, fontWeight: 700, borderRadius: 2 }}
                  color="inherit"
                >
                  Sync Member IDs
                </Button>
            </motion.div>
        </Container>
        
        {/* Background blobs */}
        <Box sx={{ position: 'absolute', top: -100, left: '10%', width: 300, height: 300, borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.05), filter: 'blur(60px)' }} />
        <Box sx={{ position: 'absolute', top: 50, right: '10%', width: 200, height: 200, borderRadius: '50%', background: alpha(theme.palette.secondary.main, 0.05), filter: 'blur(40px)' }} />
      </Box>

      {/* --- COMMAND BAR (Sticky) --- */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 6, 
          mb: 5, 
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
          bgcolor: alpha(theme.palette.background.paper, 0.8), 
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 20,
          zIndex: 10,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} strokeWidth={2.5} color={theme.palette.primary.main} />
                  </InputAdornment>
                ),
                sx: { 
                    borderRadius: 4, 
                    bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.5),
                    transition: 'all 0.3s',
                    '&.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}` }
                }
              }}
              variant="outlined"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
             <FormControl fullWidth size="medium">
                <Select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 4, bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.5) }}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  <MenuItem value="Langma">Langma</MenuItem>
                  <MenuItem value="Mallam">Mallam</MenuItem>
                  <MenuItem value="Kokrobitey">Kokrobitey</MenuItem>
                  <MenuItem value="Diaspora">Diaspora</MenuItem>
                </Select>

             </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
             <FormControl fullWidth size="medium">
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 4, bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.5) }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
             </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'space-between', md: 'flex-end' }, gap: 1.5 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, v) => v && setViewMode(v)}
                size="medium"
                sx={{ bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.5), borderRadius: 4, p: 0.5 }}
              >
                <ToggleButton value="grid" sx={{ px: 2, border: 'none', borderRadius: '12px !important' }}><LayoutGrid size={18} /></ToggleButton>
                <ToggleButton value="table" sx={{ px: 2, border: 'none', borderRadius: '12px !important' }}><TableIcon size={18} /></ToggleButton>
              </ToggleButtonGroup>

              <Button 
                variant="outlined" 
                startIcon={<Download size={18} />}
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                sx={{ borderRadius: 4, px: 2, fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Export
              </Button>
              <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                  <MenuItem onClick={() => handleExport('pdf')} sx={{ gap: 1.5, fontWeight: 600 }}><FileText size={18} /> Export as PDF</MenuItem>
                  <MenuItem onClick={() => handleExport('excel')} sx={{ gap: 1.5, fontWeight: 600 }}><FileSpreadsheet size={18} /> Export as Excel</MenuItem>
              </Menu>

              <Tooltip title="Add New Member">
                <Button 
                    variant="contained" 
                    onClick={() => setOpenAddMemberDialog(true)}
                    sx={{ 
                        borderRadius: 4, minWidth: 56, height: 56, fontWeight: 800,
                        boxShadow: `0 12px 24px -6px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': { boxShadow: `0 16px 32px -8px ${alpha(theme.palette.primary.main, 0.5)}` }
                    }}
                >
                    <UserPlus size={22} />
                </Button>
              </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* --- CONTENT AREA --- */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Grid container spacing={3}>
               {[1, 2, 3, 4, 5, 6].map(i => <Grid key={i} size={{ xs: 12, md: 4 }}><Skeleton variant="rectangular" height={260} sx={{ borderRadius: 6 }} /></Grid>)}
             </Grid>
          </motion.div>
        ) : filteredMembers.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 8 }}>
              <UserX size={64} color={theme.palette.text.disabled} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="text.secondary">No members found</Typography>
              <Typography variant="body2" color="text.secondary">Adjust your filters to see results.</Typography>
              <Button sx={{ mt: 3, fontWeight: 700 }} onClick={() => { setSearchTerm(''); setSelectedBranch(''); setSelectedStatus('all'); }}>Clear Filters</Button>
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
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableRow>
                    {['ID', 'Member', 'Contact', 'Location', 'Joined', 'Status', ''].map((h, i) => (
                        <TableCell key={i} sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: theme.palette.text.secondary }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} hover onClick={() => handleOpenDetails(member)} sx={{ cursor: 'pointer', transition: 'background 0.1s' }}>
                      <TableCell>
                        <Typography variant="caption" fontWeight={800} color="primary">
                          {member.memberId || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 800 }}>{member.name?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800}>{member.name}</Typography>
                            <Typography variant="caption" color="text.secondary">#{member.id?.toString().slice(-4)}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                         <Stack direction="row" spacing={1} alignItems="center">
                            <Box>
                                <Typography variant="body2" fontWeight={600}>{member.email || '—'}</Typography>
                                <Typography variant="caption" color="text.secondary">{member.phone}</Typography>
                            </Box>
                            {member.email && (
                                <IconButton 
                                    size="small" 
                                    color="primary" 
                                    onClick={(e) => { e.stopPropagation(); handleOpenDetails(member, 2); }}
                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                                >
                                    <Mail size={14} />
                                </IconButton>
                            )}
                         </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={member.branch || 'Main'} size="small" sx={{ borderRadius: 1, fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                      </TableCell>
                      <TableCell>
                         <Typography variant="body2" fontWeight={500}>
                            {member.createdAt ? format(safeParseDate(member.createdAt), 'MMM yyyy') : '—'}
                         </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(member.status)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small"><MoreVertical size={16} /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}
      </AnimatePresence>

      <AddMemberDialog open={openAddMemberDialog} onClose={() => setOpenAddMemberDialog(false)} onAddMember={handleAddMember} />
      <MemberDetailsDialog 
        open={selectedMember !== null} 
        onClose={() => setSelectedMember(null)} 
        member={selectedMember} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        initialTab={dialogTab}
      />

    </Box>
  );
};

export default Members;