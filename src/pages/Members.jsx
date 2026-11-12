import Button from '../components/ui/kokonut/SlideTextButton';
import WorkspacePageHeader from '../components/organisms/WorkspacePageHeader';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { safeParseDate, calculateAge } from '../utils/dateUtils';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Chip,
  IconButton,
  useTheme,
  Grid,
  useMediaQuery,
  Skeleton,
  MenuItem,
  alpha,
  Paper,
  Stack,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Mail, 
  UserX,
  LayoutGrid,
  Table as TableIcon,
  Download,
  FileText,
  FileSpreadsheet,
  Clock,
  QrCode,
  Rows3
} from 'lucide-react';
import AddMemberDialog from '../components/AddMemberDialog';
import MemberDetailsDialog from '../components/MemberDetailsDialog';
import MemberDirectory from '../components/member/MemberDirectory';
import ContinuousTabs from '../components/ui/watermelon/ContinuousTabs';
import { normalizeDirectoryText, sortMembersAlphabetically } from '../utils/memberDirectory';
import QRCode from 'react-qr-code';

import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// New Components
import StatusBadge from '../components/atoms/StatusBadge';
import UserAvatar from '../components/atoms/UserAvatar';
import MasterDataGrid from '../components/molecules/MasterDataGrid';
import TableSkeleton from '../components/molecules/TableSkeleton';
import EmptyState from '../components/molecules/EmptyState';
import { createMember, updateMember, deleteMember, getMembers } from '../services/memberService';

const Members = () => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { filterData, showNotification, showConfirmation, userBranch, isBranchRestricted } = useWorkspace();
  
  // --- STATE ---
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('ricgcw.members.view');
    return ['pills', 'grid', 'table'].includes(saved) ? saved : isMobile ? 'pills' : 'table';
  });
  const changeView = (value) => {
    setViewMode(value);
    localStorage.setItem('ricgcw.members.view', value);
  };
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(() => searchParams.get('action') === 'new');
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogTab, setDialogTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(isBranchRestricted ? userBranch : '');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [registrationQrOpen, setRegistrationQrOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [rowMenuAnchor, setRowMenuAnchor] = useState(null);
  const [rowMenuMember, setRowMenuMember] = useState(null);

  // Page Title
  useEffect(() => {
    document.title = 'Member Directory | RICGCW';
  }, []);

  const handleRowMenuOpen = (event, member) => {
    event.stopPropagation();
    setRowMenuAnchor(event.currentTarget);
    setRowMenuMember(member);
  };

  const handleRowMenuClose = () => {
    setRowMenuAnchor(null);
    setRowMenuMember(null);
  };

  const downloadRegistrationQRCode = () => {
    const svg = document.getElementById("RegistrationQRCode");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Onboarding_QR.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // --- HANDLERS ---
  const handleOpenDetails = (member, tab = 0) => {
    setDialogTab(tab);
    setSelectedMember(member);
  };

  // --- FETCH DATA ---
  const fetchMembers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const result = await getMembers();
      if (result.success) {
        const membersData = result.data;
        // Sort members by 'createdAt' (newest first)
        const sortedMembers = (membersData || []).sort((a, b) => {
          const dateA = safeParseDate(a.createdAt || 0);
          const dateB = safeParseDate(b.createdAt || 0);
          return dateB - dateA;
        });
        setMembers(sortedMembers);
      } else {
        showNotification(result.error || "Failed to sync member database.", "error");
      }
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
      
      const result = await createMember({
        ...newMember,
        memberId
      });
      if (!result.success) throw new Error(result.error);
      
      await fetchMembers(true); 
      setOpenAddMemberDialog(false);
      showNotification(`Member registered with ID: ${memberId}`, "success");
      return { id: result.data.id, ...newMember, memberId };
    } catch (err) {
      showNotification(`Failed to register: ${err.message}`, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, updatedMember) => {
    try {
      const result = await updateMember(id, updatedMember);
      if (!result.success) throw new Error(result.error);
      await fetchMembers(true);
      setSelectedMember(prev => prev && prev.id === id ? { ...prev, ...updatedMember } : prev);
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
          const result = await deleteMember(id);
          if (!result.success) throw new Error(result.error);
          await fetchMembers(true);
          setSelectedMember(null);
          setSelectedMemberIds(prev => prev.filter(mId => mId !== id));
          showNotification("Member removed.", "info");
        } catch {
          showNotification("Delete failed.", "error");
        }
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedMemberIds.length === 0) return;
    
    showConfirmation({
      title: "Remove Selected Members",
      message: `Permanently remove these ${selectedMemberIds.length} members?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await Promise.all(selectedMemberIds.map(id => deleteMember(id)));
          await fetchMembers(true);
          setSelectedMemberIds([]);
          showNotification("Selected members removed.", "info");
        } catch {
          showNotification("Delete failed.", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const filteredMembers = useMemo(() => {
    const search = normalizeDirectoryText(searchTerm);
    const branch = normalizeDirectoryText(selectedBranch);
    const status = selectedStatus === 'all' ? '' : normalizeDirectoryText(selectedStatus);
    const authorized = filterData(members) || [];
    return sortMembersAlphabetically(authorized.filter((member) => {
      if (!member) return false;
      if (branch && normalizeDirectoryText(member.branch) !== branch) return false;
      if (status && normalizeDirectoryText(member.status || 'active') !== status) return false;
      return !search || [member.name, member.email, member.memberId, member.phone]
        .some((value) => normalizeDirectoryText(value).includes(search));
    }));
  }, [members, searchTerm, selectedBranch, selectedStatus, filterData]);
  const hasFilters = Boolean(searchTerm.trim() || (!isBranchRestricted && selectedBranch) || selectedStatus !== 'all');
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBranch(isBranchRestricted ? userBranch : '');
    setSelectedStatus('all');
  };
  const visibleIds = new Set(filteredMembers.map((member) => member.id));
  const selectedVisibleCount = selectedMemberIds.filter((id) => visibleIds.has(id)).length;
  const selectAllVisible = () => setSelectedMemberIds((previous) => Array.from(new Set([...previous, ...filteredMembers.map((member) => member.id)])));

  // --- COLUMNS ---
  const columns = [
    { 
      id: 'memberId', 
      label: 'ID',
      render: (val) => (
        <Typography variant="caption" fontWeight={800} color="primary">
          {val || '-'}
        </Typography>
      )
    },
    { 
      id: 'name', 
      label: 'Member',
      render: (val, row) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <UserAvatar name={val} size={40} />
          <Box>
            <Typography variant="body2" fontWeight={600}>{val}</Typography>
            <Typography variant="caption" color="text.secondary">
              #{row.id?.toString().slice(-4)}
              {row.dob && ` • ${calculateAge(row.dob)} yrs old`}
            </Typography>
          </Box>
        </Stack>
      )
    },
    { 
      id: 'contact', 
      label: 'Contact',
      render: (_, row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.email || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">{row.phone}</Typography>
          </Box>
          {row.email && (
            <IconButton 
              size="small" 
              color="primary" 
              onClick={(e) => { e.stopPropagation(); handleOpenDetails(row, 2); }}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <Mail size={14} />
            </IconButton>
          )}
        </Stack>
      )
    },
    { 
      id: 'branch', 
      label: 'Location',
      render: (val) => <Chip label={val || 'Main'} size="small" sx={{ borderRadius: 1, fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
    },
    { 
      id: 'createdAt', 
      label: 'Joined',
      render: (val) => (
        <Typography variant="body2" fontWeight={500}>
          {val ? format(safeParseDate(val), 'MMM yyyy') : '-'}
        </Typography>
      )
    },
    { 
      id: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge label={val || 'Active'} status={val || 'active'} />
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <IconButton 
          size="small"
          onClick={(e) => handleRowMenuOpen(e, row)}
        >
          <MoreVertical size={16} />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ pb: 8 }}>
      
      <WorkspacePageHeader section="People & community" title="Church Members" description="Manage profiles, stay connected, and care for every member." actions={<Button startIcon={<Clock size={14} />} onClick={syncMemberIds}>Sync Member IDs</Button>} />

      <Paper elevation={0} className="members-toolbar">
        <TextField placeholder="Search directory..." label="Find a member" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={17} /></InputAdornment> } }} />
        <TextField select label="Branch" value={selectedBranch} disabled={isBranchRestricted} onChange={(event) => setSelectedBranch(event.target.value)} slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true, renderValue: (value) => value || (isMobile ? 'All' : 'All branches') } }}>
          <MenuItem value="">All branches</MenuItem>{['Langma', 'Mallam', 'Kokrobitey', 'Diaspora'].map((branch) => <MenuItem key={branch} value={branch}>{branch}</MenuItem>)}
        </TextField>
        <TextField select label="Status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} slotProps={{ select: { renderValue: (value) => value === 'all' ? (isMobile ? 'All' : 'All statuses') : value.charAt(0).toUpperCase() + value.slice(1) } }}>
          <MenuItem value="all">All statuses</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem><MenuItem value="discontinued">Discontinued</MenuItem>
        </TextField>
        <div className="members-toolbar-actions">
          <div><Button variant="text" startIcon={<Download size={15} />} onClick={(event) => setExportAnchorEl(event.currentTarget)}>Export</Button><Button variant="text" startIcon={<QrCode size={15} />} onClick={() => setRegistrationQrOpen(true)}>Join QR</Button>{hasFilters && <Button variant="text" onClick={clearFilters}>Clear filters</Button>}</div>
          <Button variant="contained" startIcon={<UserPlus size={16} />} onClick={() => setOpenAddMemberDialog(true)}>Add Member</Button>
        </div>
      </Paper>
      <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
        <MenuItem onClick={() => handleExport('pdf')} sx={{ gap: 1.5 }}><FileText size={17} />Export as PDF</MenuItem><MenuItem onClick={() => handleExport('excel')} sx={{ gap: 1.5 }}><FileSpreadsheet size={17} />Export as Excel</MenuItem>
      </Menu>
      <div className="members-directory-summary">
        <div><h2 aria-live="polite">{loading ? 'Loading directory…' : filteredMembers.length + (filteredMembers.length === 1 ? ' member' : ' members')}</h2><p>{hasFilters ? 'All matching members shown' : 'All members shown'} · A–Z by name{viewMode !== 'table' && ' · Jump to a letter below'}</p></div>
        <ContinuousTabs label="Directory layout" value={viewMode} onChange={changeView} tabs={[
          { id: 'pills', label: <span className="directory-view-label"><Rows3 size={15} aria-hidden="true" />Pills</span> },
          { id: 'grid', label: <span className="directory-view-label"><LayoutGrid size={15} aria-hidden="true" />Grid</span> },
          { id: 'table', label: <span className="directory-view-label"><TableIcon size={15} aria-hidden="true" />List</span> },
        ]} />
      </div>
      {!loading && filteredMembers.length > 0 && <div className="members-selection">
        <strong>{selectedMemberIds.length ? selectedMemberIds.length + ' selected' : 'Directory'}{selectedMemberIds.length > selectedVisibleCount ? ' · ' + (selectedMemberIds.length - selectedVisibleCount) + ' outside current filters' : ''}</strong>
        <Button variant="text" size="small" onClick={selectAllVisible} disabled={selectedVisibleCount === filteredMembers.length}>Select all {hasFilters ? 'results' : 'members'}</Button>
        {selectedMemberIds.length > 0 && <><Button variant="text" size="small" onClick={() => setSelectedMemberIds([])}>Clear selection</Button><Button variant="outlined" color="error" size="small" startIcon={<UserX size={15} />} onClick={handleDeleteSelected}>Delete ({selectedMemberIds.length})</Button></>}
      </div>}
      {/* --- CONTENT AREA --- */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {viewMode === 'table' ? (
              <TableSkeleton rows={8} columns={5} />
            ) : (
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map(i => <Grid key={i} size={{ xs: 12, md: 4 }}><Skeleton variant="rectangular" height={260} sx={{ borderRadius: 6 }} /></Grid>)}
              </Grid>
            )}
          </motion.div>
        ) : filteredMembers.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <EmptyState 
              icon={<UserX size={40} />}
              title="No members found"
              description={hasFilters ? "No members match your active filters. Try adjusting your query or clear filters." : "Your congregation registry is empty. Add your first member to begin tracking attendance and engagement."}
              actionLabel={hasFilters ? "Clear Filters" : "Add New Member"}
              onAction={hasFilters ? clearFilters : () => setOpenAddMemberDialog(true)}
            />
          </motion.div>
        ) : viewMode !== 'table' ? (
          <MemberDirectory members={filteredMembers} mode={viewMode} selectedIds={selectedMemberIds} onSelectionChange={setSelectedMemberIds} onOpen={handleOpenDetails} onMenu={handleRowMenuOpen} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <MasterDataGrid 
              columns={columns}
              pagination={false}
              sortable={false}
              rows={filteredMembers}
              selected={selectedMemberIds}
              onSelectionChange={setSelectedMemberIds}
              onRowClick={(id) => handleOpenDetails(filteredMembers.find(m => m.id === id))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AddMemberDialog open={openAddMemberDialog} onClose={() => setOpenAddMemberDialog(false)} onAddMember={handleAddMember} />
      
      {selectedMember && (
        <MemberDetailsDialog 
          open={selectedMember !== null} 
          onClose={() => setSelectedMember(null)} 
          member={selectedMember} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          initialTab={dialogTab}
        />
      )}

      {/* --- ONBOARDING QR DIALOG --- */}
      <Dialog 
        open={registrationQrOpen} 
        onClose={() => setRegistrationQrOpen(false)}
        PaperProps={{ sx: { borderRadius: 6, p: 2, textAlign: 'center' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Member Onboarding QR</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                New members can scan this code to register their details directly into the church database.
            </Typography>
            
            <Paper elevation={0} sx={{ p: 4, bgcolor: '#fff', borderRadius: 4, display: 'inline-block', border: `1px solid ${theme.palette.divider}` }}>
                <QRCode 
                    id="RegistrationQRCode"
                    value={`${window.location.origin}/join`} 
                    size={250}
                    level="H"
                />
            </Paper>
            
            <Typography variant="h6" fontWeight={800} sx={{ mt: 3, color: theme.palette.secondary.main }}>
                Scan to Register
            </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
            <Button onClick={() => setRegistrationQrOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
            <Button 
                variant="contained" 
                color="secondary"
                startIcon={<Download size={18} />} 
                onClick={downloadRegistrationQRCode}
                sx={{ borderRadius: 2, fontWeight: 800 }}
            >
                Download QR
            </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={rowMenuAnchor}
        open={Boolean(rowMenuAnchor)}
        onClose={handleRowMenuClose}
      >
        <MenuItem 
          onClick={() => {
            if (rowMenuMember) handleOpenDetails(rowMenuMember);
            handleRowMenuClose();
          }}
          sx={{ fontWeight: 600, gap: 1 }}
        >
          View Details
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (rowMenuMember) handleDelete(rowMenuMember.id);
            handleRowMenuClose();
          }}
          sx={{ color: 'error.main', fontWeight: 600, gap: 1 }}
        >
          Delete
        </MenuItem>
      </Menu>

    </Box>
  );
};

export default Members;
