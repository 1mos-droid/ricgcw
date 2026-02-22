import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, isValid } from 'date-fns';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  List, 
  ListItem,
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
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha
} from '@mui/material';
import { 
  Calendar, 
  CheckCircle, 
  Save, 
  History, 
  Users, 
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
  const { filterData, isBranchRestricted, userBranch, showNotification, showConfirmation } = useWorkspace();
  
  // --- STATE ---
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedAttendees, setSelectedAttendees] = useState(new Set());
  const [selectedBranch, setSelectedBranch] = useState(isBranchRestricted ? userBranch : '');
  
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [reportTab, setReportTab] = useState(0); 
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttendees, setEditedAttendees] = useState(new Set());

  const filteredMembers = useMemo(() => filterData(members), [members, filterData]);
  const filteredRecords = useMemo(() => filterData(attendanceRecords), [attendanceRecords, filterData]);

  const parseDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (dateVal._seconds) return new Date(dateVal._seconds * 1000); 
    const d = new Date(dateVal);
    return isValid(d) ? d : new Date();
  };

  const safeFormat = (dateVal, formatStr) => {
    try {
      return format(parseDate(dateVal), formatStr);
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getAbsentMembers = (record) => {
    if (!record || !filteredMembers) return [];
    const attendees = record.attendees || [];
    const presentIds = new Set(
        attendees
        .filter(a => a && a.id)
        .map(a => a.id)
    );
    return filteredMembers.filter(m => m && m.id && !presentIds.has(m.id));
  };

  const fetchData = useCallback(async () => {
    try {
      if (members.length === 0) setLoading(true); 
      
      const [membersRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/members/`),
        axios.get(`${API_BASE_URL}/attendance/`)
      ]);
      
      setMembers(membersRes.data || []); 
      
      const sortedRecords = (attendanceRes.data || []).sort((a, b) => 
        parseDate(b.date) - parseDate(a.date)
      );
      
      setAttendanceRecords(sortedRecords);
    } catch (err) {
      console.error("Attendance Sync Error:", err.response?.data || err.message);
      showNotification("Failed to load data. Check connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification, members.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      showNotification("Please select at least one member.", "warning");
      return;
    }
    
    setSubmitting(true);
    const attendeesList = members.filter(m => m && m.id && selectedAttendees.has(m.id));

    try {
      const recordDate = new Date(`${selectedDate}T12:00:00`);

      const recordData = {
        date: recordDate.toISOString(),
        attendees: attendeesList,
        branch: isBranchRestricted ? userBranch : selectedBranch,
        createdAt: new Date().toISOString()
      };

      await axios.post(`${API_BASE_URL}/attendance/`, recordData);
      
      setSelectedAttendees(new Set());
      await fetchData(); 
      showNotification("Attendance saved successfully!", "success");
    } catch (err) {
      console.error("Save Attendance Error:", err.response?.data || err.message);
      showNotification("Failed to save attendance.", "error");
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

      await axios.put(`${API_BASE_URL}/attendance/${selectedRecord.id}/`, updatedRecord);

      await fetchData(); 
      showNotification("Attendance updated successfully!", "success");
      setIsEditing(false);
      setSelectedRecord(updatedRecord);
    } catch (err) {
      console.error("Update Attendance Error:", err.response?.data || err.message);
      showNotification("Failed to update attendance.", "error");
    } finally {
      setSubmitting(false);
    }
  };


  const handleDelete = async () => {
    if (!selectedRecord || !selectedRecord.id) return;
    
    showConfirmation({
      title: "Delete Attendance",
      message: `Are you sure you want to delete the attendance record for ${safeFormat(selectedRecord.date, 'MMMM dd, yyyy')}? This action cannot be undone.`,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await axios.delete(`${API_BASE_URL}/attendance/${selectedRecord.id}/`);
          setSelectedRecord(null);
          await fetchData();
          showNotification("Attendance record deleted successfully!", "success");
        } catch (err) {
          console.error("Delete Attendance Error:", err.response?.data || err.message);
          showNotification("Failed to delete attendance record.", "error");
        } finally {
          setSubmitting(false);
        }
      }
    });
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
          <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.2}>
            REGISTRY
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Attendance
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Card sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, width: { xs: '100%', sm: 'auto' }, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <Box sx={{ p: 1, bgcolor: theme.palette.primary.light, borderRadius: 2, color: theme.palette.primary.main }}>
              <Calendar size={18} />
            </Box>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: theme.palette.text.primary, outline: 'none', cursor: 'pointer', width: '100%' }}
            />
          </Card>

          <FormControl sx={{ width: { xs: '100%', sm: 200 } }} size="small" disabled={isBranchRestricted}>
            <Select
              displayEmpty
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              sx={{ borderRadius: 3 }}
              renderValue={(selected) => {
                if (selected === '') return <Typography color="text.secondary">All Branches</Typography>;
                return selected;
              }}
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
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40, borderRadius: 3 }}>
                    <Users size={20} />
                </Avatar>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Mark Present</Typography>
                    <Typography variant="caption" color="text.secondary">Tap to select members</Typography>
                </Box>
              </Box>
              <Chip label={`${selectedAttendees.size} Selected`} color="primary" sx={{ fontWeight: 700, borderRadius: 2 }} />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 2, maxHeight: '60vh', minHeight: '400px' }}>
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
                <Grid container spacing={1}>
                  {filteredMembers.filter(m => m && m.name && (selectedBranch === '' || m.branch === selectedBranch)).map((member) => {
                    const isSelected = selectedAttendees.has(member.id);
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={member.id}>
                        <ListItemButton 
                            onClick={() => handleToggle(member.id)}
                            sx={{ 
                                borderRadius: 3, 
                                border: isSelected ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`, 
                                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.12) : theme.palette.action.hover }
                            }}
                        >
                            <ListItemAvatar>
                            <Avatar sx={{ 
                                bgcolor: isSelected ? theme.palette.primary.main : theme.palette.action.hover, 
                                color: isSelected ? '#FFF' : theme.palette.text.secondary,
                                fontWeight: 700,
                                borderRadius: 2
                            }}>
                                {(member.name || "?").charAt(0).toUpperCase()}
                            </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={member.name} 
                                primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }}
                                secondary={member.email} 
                            />
                            {isSelected && <CheckCircle size={20} color={theme.palette.primary.main} />}
                        </ListItemButton>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>

            <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
              <Button variant="contained" fullWidth size="large" disabled={submitting || selectedAttendees.size === 0 || loading} onClick={handleSave} sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}>
                {submitting ? <CircularProgress size={24} color="inherit"/> : <Box sx={{ display: 'flex', gap: 1 }}><Save size={20} /><span>Save Record</span></Box>}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: HISTORY LOG --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 4, maxHeight: '80vh', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, width: 40, height: 40, borderRadius: 3 }}><History size={20} /></Avatar>
              <Typography variant="h6" fontWeight={700}>Recent Logs</Typography>
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
                      const attendeeIds = new Set((record.attendees || []).map(a => a.id));
                      setEditedAttendees(attendeeIds);
                    }}
                    sx={{ 
                      p: 2, mb: 2, borderRadius: 3, 
                      bgcolor: theme.palette.background.paper, 
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[3], borderColor: theme.palette.primary.main },
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: theme.palette.primary.main }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: theme.palette.text.secondary }}>
                      <Clock size={14} />
                      <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {safeFormat(record.date, 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 1 }}>
                      <Typography variant="h6" color="text.primary" fontWeight={800}>
                        {record.attendees ? record.attendees.length : 0} <Typography component="span" variant="body2" color="text.secondary">Present</Typography>
                      </Typography>
                      <Button size="small" variant="outlined" sx={{ borderRadius: 2, minWidth: 0, p: 0.5 }}><Edit size={14}/></Button>
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
          setIsEditing(false); 
        }}
        maxWidth="md"
        fullWidth
        className="no-print"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, p: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  {isEditing ? 'Edit Attendance' : 'Attendance Report'}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {safeFormat(selectedRecord.date, 'EEEE, MMMM do, yyyy')}
                </Typography>
              </Box>
              <IconButton onClick={() => {
                if (isEditing) {
                  setIsEditing(false); 
                  const originalAttendeeIds = new Set((selectedRecord.attendees || []).map(a => a.id));
                  setEditedAttendees(originalAttendeeIds);
                } else {
                  setSelectedRecord(null); 
                }
              }} sx={{ bgcolor: theme.palette.action.hover }}>
                <X />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              {isEditing ? (
                <Box sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
                  <Grid container spacing={1}>
                    {filteredMembers.map((member) => {
                      const isSelected = editedAttendees.has(member.id);
                      return (
                        <Grid size={{ xs: 12, sm: 6 }} key={member.id}>
                            <ListItemButton 
                            onClick={() => handleToggleEdited(member.id)}
                            sx={{ borderRadius: 3, mb: 1, border: isSelected ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`, bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent' }}
                            >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: isSelected ? theme.palette.primary.main : theme.palette.grey[200], color: isSelected ? '#FFF' : theme.palette.text.secondary, borderRadius: 2 }}>
                                {(member.name || "?").charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={member.name} secondary={member.email} />
                            {isSelected && <CheckCircle size={20} color={theme.palette.primary.main} />}
                            </ListItemButton>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ) : (
                <>
                  <Box sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                          <Typography variant="h3" fontWeight={800} letterSpacing={-1}>{selectedRecord.attendees ? selectedRecord.attendees.length : 0}</Typography>
                          <Typography variant="caption" fontWeight={700} letterSpacing={1}>PRESENT</Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                          <Typography variant="h3" fontWeight={800} letterSpacing={-1}>{getAbsentMembers(selectedRecord).length}</Typography>
                          <Typography variant="caption" fontWeight={700} letterSpacing={1}>ABSENT</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  <Tabs value={reportTab} onChange={(e, v) => setReportTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Present List" />
                    <Tab label="Absent List" />
                  </Tabs>

                  <Box sx={{ p: 0, maxHeight: '40vh', overflowY: 'auto' }}>
                    {reportTab === 0 ? (
                      // PRESENT LIST
                      <List>
                        {selectedRecord.attendees && selectedRecord.attendees.filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.success.main, fontSize: 14, fontWeight: 700, borderRadius: 2 }}>
                                {(m.name || "?").charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={m.name || "Unknown"} primaryTypographyProps={{ fontWeight: 600 }} secondary={m.email} />
                          </ListItem>
                        ))}
                        {(!selectedRecord.attendees || selectedRecord.attendees.length === 0) && <Typography sx={{p:3, opacity:0.6, textAlign: 'center'}}>No one marked present.</Typography>}
                      </List>
                    ) : (
                      // ABSENT LIST
                      <List>
                        {getAbsentMembers(selectedRecord).filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.error.main, fontSize: 14, fontWeight: 700, borderRadius: 2 }}>
                                {(m.name || "?").charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={m.name || "Unknown"} primaryTypographyProps={{ fontWeight: 600 }} secondary={m.email} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
              {isEditing ? (
                <>
                  <Button onClick={() => {
                    setIsEditing(false);
                    const originalAttendeeIds = new Set((selectedRecord.attendees || []).map(a => a.id));
                    setEditedAttendees(originalAttendeeIds);
                  }} sx={{ borderRadius: 2, fontWeight: 600 }}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleUpdate} disabled={submitting} sx={{ borderRadius: 2, fontWeight: 600, boxShadow: theme.shadows[2] }}>
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="error" 
                    startIcon={<Trash2 size={18}/>} 
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ mr: 'auto', fontWeight: 600, borderRadius: 2 }} 
                  >
                    Delete
                  </Button>
                  <Button 
                    variant="outlined"
                    startIcon={<Edit size={18}/>}
                    onClick={() => setIsEditing(true)}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Edit
                  </Button>
                  <Button variant="contained" startIcon={<Printer size={18}/>} onClick={handlePrint} sx={{ borderRadius: 2, fontWeight: 600, boxShadow: theme.shadows[2] }}>
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
            <Grid size={{ xs: 6 }}>
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
            <Grid size={{ xs: 6 }}>
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

    </Box>
  );
};

export default Attendance;