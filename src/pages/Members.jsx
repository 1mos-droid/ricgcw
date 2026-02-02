import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
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
  Skeleton
} from '@mui/material';
import { 
  UserPlus, 
  Printer, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  UserX // Icon for empty state
} from 'lucide-react';
import AddMemberDialog from '../components/AddMemberDialog';
import MemberDetailsDialog from '../components/MemberDetailsDialog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

const Members = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // --- STATE ---
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Feedback State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- FETCH DATA ---
  const fetchMembers = useCallback(async () => {
    try {
      if(members.length === 0) setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/members`);
      setMembers(response.data);
    } catch (err) {
      console.error("Directory Sync Error:", err);
      showSnackbar("Failed to load member directory.", "error");
    } finally {
      setLoading(false);
    }
  }, [members.length]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- HANDLERS ---
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddMember = async (newMember) => {
    try {
      await axios.post(`${API_BASE_URL}/members`, newMember);
      await fetchMembers();
      setOpenAddMemberDialog(false);
      showSnackbar("Member added successfully!");
    } catch (err) {
      showSnackbar("Failed to add member.", "error");
    }
  };

  const handleEdit = async (id, updatedMember) => {
    try {
      await axios.put(`${API_BASE_URL}/members/${id}`, updatedMember);
      await fetchMembers();
      setSelectedMember(null);
      showSnackbar("Member profile updated.");
    } catch (err) {
      showSnackbar("Failed to update member.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE_URL}/members/${id}`);
        await fetchMembers();
        setSelectedMember(null);
        showSnackbar("Member deleted.", "info");
      } catch (err) {
        showSnackbar("Failed to delete member.", "error");
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- HEADER --- */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'flex-end' }, 
        gap: 2 
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            Member Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage {members.length} active records
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Button 
            variant="outlined" 
            startIcon={<Printer size={16} />}
            onClick={() => window.print()}
            sx={{ borderRadius: 2, flex: { xs: 1, md: 'none' } }}
            disabled={members.length === 0}
          >
            Print
          </Button>
          <Button 
            variant="contained" 
            startIcon={<UserPlus size={16} />}
            onClick={() => setOpenAddMemberDialog(true)}
            sx={{ borderRadius: 2, boxShadow: theme.shadows[2], flex: { xs: 1, md: 'none' } }}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {/* --- SEARCH & CONTENT --- */}
      <Card sx={{ overflow: 'hidden', boxShadow: theme.shadows[3], borderRadius: 3 }}>
        
        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: theme.palette.action.hover,
                borderRadius: 2,
                '& fieldset': { border: 'none' } 
              } 
            }}
          />
        </Box>

        {loading ? (
            // SKELETON LOADING
            <Box sx={{ p: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ width: '30%' }}><Skeleton variant="text" width="80%" /><Skeleton variant="text" width="50%" /></Box>
                        <Box sx={{ width: '30%', display: { xs: 'none', md: 'block' } }}><Skeleton variant="text" width="90%" /></Box>
                        <Box sx={{ width: '20%', display: { xs: 'none', md: 'block' } }}><Skeleton variant="text" width="60%" /></Box>
                    </Box>
                ))}
            </Box>
        ) : filteredMembers.length === 0 ? (
          // EMPTY STATE
          <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
            <UserX size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6">No members found</Typography>
            <Typography variant="body2">Try adjusting your search terms</Typography>
          </Box>
        ) : isMobile ? (
          // MOBILE LIST VIEW
          <Grid container spacing={2} sx={{ p: 2 }}>
            {filteredMembers.map(member => (
              <Grid item xs={12} key={member.id}>
                <Card 
                    sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: 'none' 
                    }}
                >
                  <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, fontWeight: 700, mr: 2 }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{member.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Mail size={12}/> {member.email}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setSelectedMember(member)}>
                    <MoreVertical size={18} />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          // DESKTOP TABLE VIEW
          <div className="printable-area">
            <TableContainer sx={{ maxHeight: '65vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 700 }}>Contact Info</TableCell>
                    <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: theme.palette.background.paper }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow 
                      key={member.id} 
                      hover 
                      sx={{ cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => setSelectedMember(member)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, fontWeight: 700 }}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: #{member.id.toString().slice(-4)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: 'text.primary' }}>
                            <Mail size={12} color={theme.palette.text.secondary} />
                            {member.email}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: 'text.secondary' }}>
                            <Phone size={12} />
                            {member.phone}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <MapPin size={14} />
                          <Typography variant="body2">{member.address}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip 
                          label="Active" 
                          size="small" 
                          color="success" 
                          variant="outlined" 
                          sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.dark, border: 'none', fontWeight: 700 }} 
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}>
                            <MoreVertical size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </Card>

      {/* --- DIALOGS & FEEDBACK --- */}
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

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Members;