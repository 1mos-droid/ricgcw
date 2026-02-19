import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, isValid, parseISO } from 'date-fns';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  List, 
  ListItem, // Imported native MUI ListItem
  ListItemButton, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Divider, 
  useTheme, 
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton, // Fixed: Was missing
  FormControl, // NEW
  InputLabel, // NEW
  Select, // NEW
  MenuItem // NEW
} from '@mui/material';
import { 
  Calendar, 
  CheckCircle, 
  Save, 
  History, 
  Users, 
  AlertCircle,
  Clock,
  Printer,
  XCircle,
  X,
  Trash2,
  Edit
} from 'lucide-react';
import { motion } from 'framer-motion';

import { API_BASE_URL } from '../config';

const Attendance = () => {
  const theme = useTheme();
  const { filterData, isBranchRestricted, userBranch } = useWorkspace();
  
  // --- STATE ---
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedAttendees, setSelectedAttendees] = useState(new Set());
  const [selectedBranch, setSelectedBranch] = useState(isBranchRestricted ? userBranch : ''); // NEW: State for selected branch
  
  // ... rest of state
  
  // Report / Dialog State
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [reportTab, setReportTab] = useState(0); 
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttendees, setEditedAttendees] = useState(new Set());

  // 🟢 Filtered Data
  const filteredMembers = useMemo(() => filterData(members), [members, filterData]);
  const filteredRecords = useMemo(() => filterData(attendanceRecords), [attendanceRecords, filterData]);

  // --- HELPER: SAFE DATE PARSER ---
  const parseDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (dateVal._seconds) return new Date(dateVal._seconds * 1000); 
    const d = new Date(dateVal);
    return isValid(d) ? d : new Date();
  };

  // --- HELPER: SAFE DATE FORMATTER ---
  const safeFormat = (dateVal, formatStr) => {
    try {
      return format(parseDate(dateVal), formatStr);
    } catch (e) {
      return "Invalid Date";
    }
  };

  // --- HELPER: CALCULATE ABSENT (CRASH PROOF) ---
  const getAbsentMembers = (record) => {
    if (!record || !filteredMembers) return [];
    
    // 1. Safely get attendees, defaulting to empty array
    const attendees = record.attendees || [];
    
    // 2. Create Set of IDs, filtering out any null/bad entries
    const presentIds = new Set(
        attendees
        .filter(a => a && a.id) // Only keep valid objects with IDs
        .map(a => a.id)
    );

    // 3. Filter members, ensuring member object exists
    return filteredMembers.filter(m => m && m.id && !presentIds.has(m.id));
  };

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      // Only set loading if we don't have data yet to prevent UI flickering
      if (members.length === 0) setLoading(true); 
      
      const [membersRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/members`),
        axios.get(`${API_BASE_URL}/attendance`)
      ]);
      
      setMembers(membersRes.data || []); 
      
      const sortedRecords = (attendanceRes.data || []).sort((a, b) => 
        parseDate(b.date) - parseDate(a.date)
      );
      
      setAttendanceRecords(sortedRecords);
    } catch (err) {
      console.error("Sync Error:", err);
      showSnackbar("Failed to load data. Check connection.", "error");
    } finally {
      setLoading(false);
    }
  }, []); // Fixed: Removed members.length dependency to prevent infinite loop

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const handleToggle = (id) => {
    const newSet = new Set(selectedAttendees);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAttendees(newSet);
  };

  const handleToggleEdited = (id) => {
    const newSet = new Set(editedAttendees);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setEditedAttendees(newSet);
  };

  const handleSave = async () => {
    if (selectedAttendees.size === 0) {
      showSnackbar("Please select at least one member.", "warning");
      return;
    }
    
    setSubmitting(true);
    // Filter to ensure we don't save broken member data
    const attendeesList = members.filter(m => m && m.id && selectedAttendees.has(m.id));

    try {
      // Create a date object that respects the selected string date
      // Appending T12:00:00 avoids timezone "previous day" issues when converting to ISO
      const recordDate = new Date(`${selectedDate}T12:00:00`);

      const recordData = {
        date: recordDate.toISOString(),
        attendees: attendeesList,
        branch: isBranchRestricted ? userBranch : selectedBranch, // 🟢 Add branch info
        createdAt: new Date().toISOString()
      };

      await axios.post(`${API_BASE_URL}/attendance`, recordData);
      
      setSelectedAttendees(new Set());
      await fetchData(); 
      showSnackbar("Attendance saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to save attendance.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRecord || !selectedRecord.id) return;

    setSubmitting(true);
    const attendeesList = members.filter(m => m && m.id && editedAttendees.has(m.id));

    try {
      const updatedRecord = {
        ...selectedRecord,
        attendees: attendeesList,
      };

      await axios.put(`${API_BASE_URL}/attendance/${selectedRecord.id}`, updatedRecord);

      await fetchData(); 
      showSnackbar("Attendance updated successfully!", "success");
      setIsEditing(false); // Exit edit mode
      setSelectedRecord(updatedRecord); // Update the selected record in the UI
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to update attendance.", "error");
    } finally {
      setSubmitting(false);
    }
  };


  const handleDelete = async () => {
    if (!selectedRecord || !selectedRecord.id) return;
    
    setSubmitting(true);
    try {
      await axios.delete(`${API_BASE_URL}/attendance/${selectedRecord.id}`);
      setDeleteDialogOpen(false);
      setSelectedRecord(null);
      await fetchData();
      showSnackbar("Attendance record deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete attendance record.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handlePrint = () => {
    window.print();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- INJECT PRINT STYLES --- */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-report, #printable-report * { visibility: visible; }
            #printable-report { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 20px; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* --- HEADER --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }} className="no-print">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Attendance Register
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Track daily presence & engagement
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Card sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, width: { xs: '100%', sm: 'auto' }, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 1, bgcolor: theme.palette.primary.light, borderRadius: 2, color: theme.palette.primary.contrastText }}>
              <Calendar size={18} />
            </Box>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '14px', color: theme.palette.text.primary, outline: 'none', cursor: 'pointer', width: '100%' }}
            />
          </Card>

          <FormControl sx={{ width: { xs: '100%', sm: 200 } }} size="small" disabled={isBranchRestricted}>
            <InputLabel id="branch-select-label">Branch</InputLabel>
            <Select
              labelId="branch-select-label"
              id="branch-select"
              value={selectedBranch}
              label="Branch"
              onChange={(e) => setSelectedBranch(e.target.value)}
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">
                <em>All Branches</em>
              </MenuItem>
              <MenuItem value="Langma">Langma</MenuItem>
              <MenuItem value="Mallam">Mallam</MenuItem>
              <MenuItem value="Kokrobetey">Kokrobetey</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* --- CONTENT GRID --- */}
      <Grid container spacing={3} className="no-print">
        
        {/* --- LEFT COL: MARK ATTENDANCE --- */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
            <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}><Users size={18} /></Avatar>
                <Typography variant="h6">Mark Present</Typography>
              </Box>
              <Chip label={`${selectedAttendees.size} Selected`} color="primary" variant={selectedAttendees.size > 0 ? "filled" : "outlined"} size="small" />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1, maxHeight: '60vh', minHeight: '300px' }}>
              {loading ? (
                 Array.from(new Array(5)).map((_, index) => (
                   <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2 }}>
                     <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                     <Skeleton variant="text" width="60%" />
                   </Box>
                 ))
              ) : filteredMembers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}><Typography>No members found</Typography></Box>
              ) : (
                <List>
                  {filteredMembers.filter(m => m && m.name && (selectedBranch === '' || m.branch === selectedBranch)).map((member) => {
                    const isSelected = selectedAttendees.has(member.id);
                    return (
                      <ListItemButton 
                        key={member.id} 
                        onClick={() => handleToggle(member.id)}
                        sx={{ borderRadius: 2, mb: 1, border: isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent', bgcolor: isSelected ? theme.palette.action.selected : 'transparent' }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: isSelected ? theme.palette.primary.main : theme.palette.grey[200], color: isSelected ? '#FFF' : theme.palette.text.secondary }}>
                            {(member.name || "?").charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={member.name} secondary={member.email} />
                        {isSelected && <CheckCircle size={20} color={theme.palette.primary.main} />}
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </Box>

            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button variant="contained" fullWidth size="large" disabled={submitting || selectedAttendees.size === 0 || loading} onClick={handleSave} sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}>
                {submitting ? <CircularProgress size={24} color="inherit"/> : <Box sx={{ display: 'flex', gap: 1 }}><Save size={20} /><span>Save Record</span></Box>}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: HISTORY LOG --- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 3, maxHeight: '80vh' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}><History size={18} /></Avatar>
              <Typography variant="h6">Recent Logs</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {filteredRecords.length === 0 && !loading ? (
                <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}><Typography>No records found.</Typography></Box>
              ) : (
                filteredRecords.map((record, index) => (
                  <Box 
                    key={record.id || index} 
                    onClick={() => {
                      setSelectedRecord(record);
                      // Pre-populate the edited attendees when opening the dialog
                      const attendeeIds = new Set((record.attendees || []).map(a => a.id));
                      setEditedAttendees(attendeeIds);
                    }}
                    sx={{ 
                      p: 2, mb: 2, borderRadius: 2, 
                      bgcolor: theme.palette.background.default, 
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[2] },
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: theme.palette.text.secondary }}>
                      <Clock size={14} />
                      <Typography variant="caption" fontWeight={600}>
                        {safeFormat(record.date, 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary.main" fontWeight={700}>
                        {/* 🔴 SAFE LENGTH CHECK */}
                        {record.attendees ? record.attendees.length : 0} Present
                      </Typography>
                      <Button size="small" variant="text" endIcon={<Edit size={14}/>}>Edit</Button>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* --- DETAIL DIALOG (REPORT MODAL) --- */}
      <Dialog 
        open={!!selectedRecord} 
        onClose={() => {
          setSelectedRecord(null);
          setIsEditing(false); // Reset edit mode on close
        }}
        maxWidth="md"
        fullWidth
        className="no-print"
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {isEditing ? 'Edit Attendance' : 'Attendance Report'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {safeFormat(selectedRecord.date, 'EEEE, MMMM do, yyyy')}
                </Typography>
              </Box>
              <IconButton onClick={() => {
                if (isEditing) {
                  setIsEditing(false); // Just exit edit mode, don't close dialog
                  // Reset changes to original state
                  const originalAttendeeIds = new Set((selectedRecord.attendees || []).map(a => a.id));
                  setEditedAttendees(originalAttendeeIds);
                } else {
                  setSelectedRecord(null); // Close dialog
                }
              }}>
                <X />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              {isEditing ? (
                <Box sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
                  <List>
                    {filteredMembers.map((member) => {
                      const isSelected = editedAttendees.has(member.id);
                      return (
                        <ListItemButton 
                          key={member.id} 
                          onClick={() => handleToggleEdited(member.id)}
                          sx={{ borderRadius: 2, mb: 1, border: isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent', bgcolor: isSelected ? theme.palette.action.selected : 'transparent' }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: isSelected ? theme.palette.primary.main : theme.palette.grey[200], color: isSelected ? '#FFF' : theme.palette.text.secondary }}>
                              {(member.name || "?").charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={member.name} secondary={member.email} />
                          {isSelected && <CheckCircle size={20} color={theme.palette.primary.main} />}
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Box>
              ) : (
                <>
                  <Box sx={{ bgcolor: theme.palette.background.default, p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.success.light, color: theme.palette.success.dark }}>
                          <Typography variant="h4" fontWeight={800}>{selectedRecord.attendees ? selectedRecord.attendees.length : 0}</Typography>
                          <Typography variant="caption" fontWeight={700}>PRESENT</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.error.light, color: theme.palette.error.dark }}>
                          <Typography variant="h4" fontWeight={800}>{getAbsentMembers(selectedRecord).length}</Typography>
                          <Typography variant="caption" fontWeight={700}>ABSENT</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  <Tabs value={reportTab} onChange={(e, v) => setReportTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Present List" icon={<CheckCircle size={16}/>} iconPosition="start" />
                    <Tab label="Absent List" icon={<XCircle size={16}/>} iconPosition="start" />
                  </Tabs>

                  <Box sx={{ p: 2, maxHeight: '40vh', overflowY: 'auto' }}>
                    {reportTab === 0 ? (
                      // PRESENT LIST
                      <List dense>
                        {selectedRecord.attendees && selectedRecord.attendees.filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 30, height: 30, bgcolor: theme.palette.success.main, fontSize: 14 }}>
                                {(m.name || "?").charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={m.name || "Unknown"} secondary={m.email} />
                          </ListItem>
                        ))}
                        {(!selectedRecord.attendees || selectedRecord.attendees.length === 0) && <Typography sx={{p:2, opacity:0.6}}>No one marked present.</Typography>}
                      </List>
                    ) : (
                      // ABSENT LIST
                      <List dense>
                        {getAbsentMembers(selectedRecord).filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 30, height: 30, bgcolor: theme.palette.error.main, fontSize: 14 }}>
                                {(m.name || "?").charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={m.name || "Unknown"} secondary={m.email} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              {isEditing ? (
                <>
                  <Button onClick={() => {
                    setIsEditing(false);
                    // Restore original attendees
                    const originalAttendeeIds = new Set((selectedRecord.attendees || []).map(a => a.id));
                    setEditedAttendees(originalAttendeeIds);
                  }}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleUpdate} disabled={submitting}>
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="error" 
                    startIcon={<Trash2 size={18}/>} 
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ mr: 'auto' }} // Pushes this button to the far left
                  >
                    Delete
                  </Button>
                  <Button 
                    variant="outlined"
                    startIcon={<Edit size={18}/>}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button onClick={() => {
                    setSelectedRecord(null);
                    setIsEditing(false);
                  }}>Close</Button>
                  <Button variant="contained" startIcon={<Printer size={18}/>} onClick={handlePrint}>
                    Print Report
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* --- HIDDEN PRINTABLE SECTION --- */}
      {selectedRecord && (
        <div id="printable-report">
          <Box sx={{ mb: 4, textAlign: 'center', borderBottom: '2px solid #000', pb: 2 }}>
            <Typography variant="h4" fontWeight={800}>Attendance Report</Typography>
            <Typography variant="h6">{safeFormat(selectedRecord.date, 'EEEE, MMMM do, yyyy')}</Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Present ({selectedRecord.attendees ? selectedRecord.attendees.length : 0})
                </Typography>
                <Table size="small">
                  <TableBody>
                    {selectedRecord.attendees && selectedRecord.attendees.filter(m => m).map((m, i) => (
                      <TableRow key={i}><TableCell>{i+1}. {m.name || "Unknown"}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'error.main' }}>
                  Absent ({getAbsentMembers(selectedRecord).length})
                </Typography>
                <Table size="small">
                  <TableBody>
                    {getAbsentMembers(selectedRecord).filter(m => m).map((m, i) => (
                      <TableRow key={i}><TableCell>{i+1}. {m.name || "Unknown"}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="caption" sx={{ mt: 4, display: 'block', textAlign: 'center', opacity: 0.6 }}>
            Generated by The Gathering Place App
          </Typography>
        </div>
      )}

      {/* --- SNACKBAR --- */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Attendance Record?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the attendance record for {selectedRecord && safeFormat(selectedRecord.date, 'MMMM dd, yyyy')}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={handleDelete} 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Trash2 size={18}/>}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance;