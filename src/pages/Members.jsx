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
  CircularProgress
} from '@mui/material';
import { 
  UserPlus, 
  Printer, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import AddMemberDialog from '../components/AddMemberDialog';

const API_BASE_URL = 'http://localhost:3002/api';

const Members = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- FETCH DATA ---
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/members`);
      setMembers(response.data);
    } catch (err) {
      console.error("Directory Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- HANDLERS ---
  const handleAddMember = async (newMember) => {
    try {
      await axios.post(`${API_BASE_URL}/members`, newMember);
      fetchMembers();
      setOpenAddMemberDialog(false);
    } catch (err) {
      alert('Failed to add entry.');
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
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            Member Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage {members.length} active records
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Printer size={16} />}
            onClick={() => alert("Printing feature coming soon")}
            sx={{ borderRadius: 2 }}
          >
            Print
          </Button>
          <Button 
            variant="contained" 
            startIcon={<UserPlus size={16} />}
            onClick={() => setOpenAddMemberDialog(true)}
            sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {/* --- SEARCH & TABLE CARD --- */}
      <Card sx={{ overflow: 'hidden' }}>
        
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
                '& fieldset': { border: 'none' } 
              } 
            }}
          />
        </Box>

        {/* Data Table */}
        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 600 }}>Contact Info</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Location</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.background.paper, fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.background.paper }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No members found matching "{searchTerm}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow 
                    key={member.id} 
                    hover 
                    sx={{ cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    {/* Name Column */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, fontWeight: 600 }}>
                          {member.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{member.id.toString().slice(-4)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Contact Column */}
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

                    {/* Location Column */}
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <MapPin size={14} />
                        <Typography variant="body2">{member.address}</Typography>
                      </Box>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      <Chip 
                        label="Active" 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                        sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.dark, border: 'none', fontWeight: 600 }} 
                      />
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <MoreVertical size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog */}
      <AddMemberDialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        onAddMember={handleAddMember}
      />
    </Box>
  );
};

export default Members;