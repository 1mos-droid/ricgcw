import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, isValid, subDays, isSameDay } from 'date-fns';
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
  Select,
  MenuItem,
  alpha,
  Tooltip,
  Container,
  Paper
} from '@mui/material';
import { 
  Calendar, 
  CheckCircle, 
  Save, 
  History, 
  Users, 
  Clock,
  Printer,
  X,
  Trash2,
  Edit,
  TrendingUp,
  BarChart2
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
    const presentIds = new Set(attendees.filter(a => a && a.id).map(a => a.id));
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
      console.error("Attendance Sync Error:", err);
      showNotification("Failed to load data.", "error");
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
      console.error("Save Attendance Error:", err);
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
      console.error("Update Attendance Error:", err);
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
          console.error("Delete Attendance Error:", err);
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

  // --- HEATMAP MOCK DATA ---
  // Generate last 30 days status (randomized for demo)
  const heatmapData = useMemo(() => {
      return Array.from({ length: 28 }).map((_, i) => {
          const date = subDays(new Date(), 27 - i);
          const hasRecord = attendanceRecords.some(r => isSameDay(new Date(r.date), date));
          return { date, count: hasRecord ? Math.floor(Math.random() * 50) + 20 : 0 };
      });
  }, [attendanceRecords]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
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

      {/* --- HERO HEADER --- */}
      <Box sx={{ 
        py: { xs: 4, md: 5 }, 
        mb: 6, 
        textAlign: 'center',
        position: 'relative',
        borderRadius: 8,
        background: theme.palette.mode === 'light' 
           ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`
           : alpha(theme.palette.primary.main, 0.05),
      }} className="no-print">
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Chip icon={<BarChart2 size={14} />} label="Analytics & Registry" size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: theme.palette.background.paper }} />
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
                Attendance Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Monitor congregation engagement and maintain accurate service records.
            </Typography>
        </Container>
      </Box>

      {/* --- HEATMAP SECTION --- */}
      <Card className="no-print" sx={{ p: 3, mb: 5, borderRadius: 5, boxShadow: theme.shadows[3], border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={800}>Attendance Trends</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">Less</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {[0.2, 0.4, 0.6, 0.8, 1].map(op => (
                          <Box key={op} sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: alpha(theme.palette.primary.main, op) }} />
                      ))}
                  </Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">More</Typography>
              </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5, overflowX: 'auto', pb: 1 }}>
              {heatmapData.map((d, i) => (
                  <Tooltip key={i} title={`${format(d.date, 'MMM dd')}: ${d.count} Attendees`}>
                    <Box sx={{ 
                        flex: 1, minWidth: 8, height: 40, borderRadius: 1, 
                        bgcolor: d.count > 0 ? alpha(theme.palette.primary.main, Math.min(d.count / 60, 1)) : alpha(theme.palette.action.disabled, 0.1),
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scaleY(1.2)' }
                    }} />
                  </Tooltip>
              ))}
          </Box>
      </Card>

      {/* --- CONTENT GRID --- */}
      <Grid container spacing={4} className="no-print">
        
        {/* --- LEFT COL: MARK ATTENDANCE --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 5, overflow: 'hidden', boxShadow: theme.shadows[4] }}>
            {/* Toolbar */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle size={20} color={theme.palette.success.main} /> New Record
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', gap: 2 }}>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ 
                                border: `1px solid ${theme.palette.divider}`, 
                                borderRadius: 12,
                                padding: '8px 12px',
                                fontFamily: 'inherit', 
                                fontWeight: 600,
                                flex: 1
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select 
                                value={selectedBranch} 
                                onChange={(e) => setSelectedBranch(e.target.value)} 
                                displayEmpty
                                sx={{ borderRadius: 3 }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="Main">Main</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Member List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 3, maxHeight: '600px', minHeight: '400px' }}>
              {loading ? (
                 Array.from(new Array(5)).map((_, index) => (
                   <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                     <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                     <Skeleton variant="text" width="60%" />
                   </Box>
                 ))
              ) : (
                <Grid container spacing={1.5}>
                  {filteredMembers.filter(m => !selectedBranch || m.branch === selectedBranch).map((member) => {
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
                                fontWeight: 800,
                                borderRadius: 2
                            }}>
                                {(member.name || "?").charAt(0).toUpperCase()}
                            </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={member.name} 
                                primaryTypographyProps={{ fontWeight: isSelected ? 700 : 600 }}
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
              <Button variant="contained" fullWidth size="large" disabled={submitting || selectedAttendees.size === 0} onClick={handleSave} sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, boxShadow: theme.shadows[4] }}>
                {submitting ? <CircularProgress size={24} color="inherit"/> : `Submit (${selectedAttendees.size})`}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: HISTORY LOG --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 5, maxHeight: '800px', overflow: 'hidden', boxShadow: theme.shadows[3] }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, width: 40, height: 40, borderRadius: 3 }}><History size={20} /></Avatar>
              <Typography variant="h6" fontWeight={800}>History</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {filteredRecords.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}><Typography>No history yet.</Typography></Box>
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
                      p: 2.5, mb: 2, borderRadius: 4, 
                      bgcolor: theme.palette.background.paper, 
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4], borderColor: theme.palette.primary.main },
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: theme.palette.primary.main }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {safeFormat(record.date, 'MMM dd, yyyy')}
                        </Typography>
                        <Chip label={record.branch || 'Main'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, borderRadius: 1 }} />
                    </Box>
                    <Typography variant="h5" color="text.primary" fontWeight={800}>
                        {record.attendees ? record.attendees.length : 0} <Typography component="span" variant="body2" color="text.secondary" fontWeight={600}>Present</Typography>
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* --- DETAIL DIALOG --- */}
      <Dialog 
        open={!!selectedRecord} 
        onClose={() => { setSelectedRecord(null); setIsEditing(false); }}
        maxWidth="md"
        fullWidth
        className="no-print"
        PaperProps={{ sx: { borderRadius: 5 } }}
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, p: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  {isEditing ? 'Edit Record' : 'Attendance Report'}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {safeFormat(selectedRecord.date, 'EEEE, MMMM do')}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedRecord(null)} sx={{ bgcolor: theme.palette.action.hover }}>
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
                            <ListItemText primary={member.name} primaryTypographyProps={{ fontWeight: 700 }} />
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
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, borderRadius: 4 }}>
                          <Typography variant="h3" fontWeight={800} letterSpacing={-1}>{selectedRecord.attendees ? selectedRecord.attendees.length : 0}</Typography>
                          <Typography variant="caption" fontWeight={800} letterSpacing={1}>PRESENT</Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 4 }}>
                          <Typography variant="h3" fontWeight={800} letterSpacing={-1}>{getAbsentMembers(selectedRecord).length}</Typography>
                          <Typography variant="caption" fontWeight={800} letterSpacing={1}>ABSENT</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  <Tabs value={reportTab} onChange={(e, v) => setReportTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Present List" sx={{ fontWeight: 700 }} />
                    <Tab label="Absent List" sx={{ fontWeight: 700 }} />
                  </Tabs>

                  <Box sx={{ p: 0, maxHeight: '40vh', overflowY: 'auto' }}>
                    {reportTab === 0 ? (
                      <List>
                        {selectedRecord.attendees && selectedRecord.attendees.filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.success.main, fontSize: 14, fontWeight: 700, borderRadius: 2 }}>{(m.name || "?").charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={m.name || "Unknown"} primaryTypographyProps={{ fontWeight: 700 }} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <List>
                        {getAbsentMembers(selectedRecord).filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.error.main, fontSize: 14, fontWeight: 700, borderRadius: 2 }}>{(m.name || "?").charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={m.name || "Unknown"} primaryTypographyProps={{ fontWeight: 700 }} />
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
                  <Button onClick={() => setIsEditing(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                  <Button variant="contained" onClick={handleUpdate} disabled={submitting} sx={{ borderRadius: 2, fontWeight: 700 }}>
                    {submitting ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button color="error" startIcon={<Trash2 size={18}/>} onClick={handleDelete} sx={{ mr: 'auto', fontWeight: 700 }}>Delete</Button>
                  <Button variant="outlined" startIcon={<Edit size={18}/>} onClick={() => setIsEditing(true)} sx={{ borderRadius: 2, fontWeight: 700 }}>Edit</Button>
                  <Button variant="contained" startIcon={<Printer size={18}/>} onClick={handlePrint} sx={{ borderRadius: 2, fontWeight: 700 }}>Print</Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* --- HIDDEN PRINTABLE SECTION --- */}
      {selectedRecord && (
        <div id="printable-report">
          {/* Plain HTML structure for printing */}
          <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid black' }}>
              <h1>Attendance Report</h1>
              <h3>{safeFormat(selectedRecord.date, 'EEEE, MMMM do, yyyy')}</h3>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                  <h4>Present ({selectedRecord.attendees?.length || 0})</h4>
                  <ul>{selectedRecord.attendees?.map((m, i) => <li key={i}>{m.name}</li>)}</ul>
              </div>
              <div style={{ flex: 1 }}>
                  <h4>Absent ({getAbsentMembers(selectedRecord).length})</h4>
                  <ul>{getAbsentMembers(selectedRecord).map((m, i) => <li key={i}>{m.name}</li>)}</ul>
              </div>
          </div>
        </div>
      )}

    </Box>
  );
};

export default Attendance;