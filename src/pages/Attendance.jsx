import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, subDays, isSameDay } from 'date-fns';
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
  useMediaQuery,
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
  Paper,
  Stack
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
  BarChart2,
  QrCode,
  Camera,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import QRCode from 'react-qr-code';

import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { safeParseDate } from '../utils/dateUtils';

const Attendance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [scannerMode, setScannerMode] = useState(false);
  const [serviceQrOpen, setServiceQrOpen] = useState(false);

  const filteredMembers = useMemo(() => filterData(members), [members, filterData]);
  const filteredRecords = useMemo(() => {
    let records = filterData(attendanceRecords);
    if (selectedBranch) {
      records = records.filter(r => 
        String(r.branch || '').toLowerCase() === String(selectedBranch).toLowerCase()
      );
    }
    return records;
  }, [attendanceRecords, filterData, selectedBranch]);

  const safeFormat = (dateVal, formatStr) => {
    try {
      return format(safeParseDate(dateVal), formatStr);
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getAbsentMembers = (record) => {
    if (!record || !filteredMembers) return [];
    
    // Filter relevant members for this branch to ensure stats are relative
    const recordBranch = record.branch || '';
    const relevantMembers = filteredMembers.filter(m => {
      if (!recordBranch) return true;
      return String(m.branch).toLowerCase() === String(recordBranch).toLowerCase();
    });

    const attendees = record.attendees || [];
    const presentIds = new Set(attendees.filter(a => a && a.id).map(a => a.id));
    return relevantMembers.filter(m => m && m.id && !presentIds.has(m.id));
  };

  const fetchData = useCallback(async () => {
    try {
      if (members.length === 0) setLoading(true); 
      
      const [membersSnapshot, attendanceSnapshot] = await Promise.all([
        getDocs(collection(db, "members")),
        getDocs(collection(db, "attendance"))
      ]);
      
      const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const attendanceData = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setMembers(membersData || []); 
      
      const sortedRecords = attendanceData.sort((a, b) => 
        safeParseDate(b.date) - safeParseDate(a.date)
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

  useEffect(() => {
    let scanner = null;
    if (scannerMode) {
      const timer = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner("reader", { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          }, false);

          scanner.render((decodedText) => {
            const member = members.find(m => 
              String(m.memberId || '').trim().toLowerCase() === String(decodedText).trim().toLowerCase() ||
              String(m.id || '').trim().toLowerCase() === String(decodedText).trim().toLowerCase()
            );

            if (member) {
              setSelectedAttendees(prev => {
                if (prev.has(member.id)) return prev;
                const newSet = new Set(prev);
                newSet.add(member.id);
                showNotification(`Checked in: ${member.name}`, "success");
                if (navigator.vibrate) navigator.vibrate(200);
                return newSet;
              });
            } else {
              showNotification("Unknown Member Code", "warning");
            }
          }, (err) => {
            // Scanning...
          });
        } catch (e) {
          console.error("Scanner Initialization Error", e);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(err => console.error("Scanner cleanup failed", err));
        }
      };
    }
  }, [scannerMode, members, showNotification]);

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
      // Use the selected date string to create a Date object at noon UTC to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const recordDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

      const recordData = {
        date: recordDate.toISOString(),
        attendees: attendeesList,
        branch: isBranchRestricted ? userBranch : selectedBranch,
        createdAt: new Date().toISOString()
      };

      const recordId = `${selectedDate}_${(isBranchRestricted ? userBranch : selectedBranch) || 'All'}`;
      await setDoc(doc(db, "attendance", recordId), recordData, { merge: true });
      
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

      const { id, ...dataToSave } = updatedRecord;
      await setDoc(doc(db, "attendance", id), dataToSave, { merge: true });

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
          await deleteDoc(doc(db, "attendance", selectedRecord.id));
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

  const downloadServiceQRCode = () => {
    const svg = document.getElementById("ServiceQRCode");
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
      downloadLink.download = `Service_QR_${selectedDate}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // --- HEATMAP ACTUAL DATA ---
  const heatmapData = useMemo(() => {
      return Array.from({ length: 28 }).map((_, i) => {
          const date = subDays(new Date(), 27 - i);
          const record = filteredRecords.find(r => isSameDay(safeParseDate(r.date), date));
          return { 
            date, 
            count: record ? (record.attendees?.length || 0) : 0 
          };
      });
  }, [filteredRecords]);

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

      {/* --- COMMAND BAR --- */}
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
        className="no-print"
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ position: 'relative' }}>
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ 
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
                        borderRadius: 16,
                        padding: '0 16px',
                        fontFamily: 'inherit', 
                        fontWeight: 700,
                        width: '100%',
                        height: 56,
                        fontSize: '0.9rem',
                        backgroundColor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.5),
                        color: theme.palette.text.primary,
                        outline: 'none'
                    }}
                />
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="medium" disabled={isBranchRestricted}>
                <Select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)} 
                    displayEmpty
                    sx={{ borderRadius: 4, height: 56, bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.5) }}
                >
                    <MenuItem value="">All Branches</MenuItem>
                    <MenuItem value="Langma">Langma</MenuItem>
                    <MenuItem value="Mallam">Mallam</MenuItem>
                    <MenuItem value="Kokrobitey">Kokrobitey</MenuItem>
                    <MenuItem value="Diaspora">Diaspora</MenuItem>
                </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 7 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Tooltip title="Self Check-in QR">
                  <Button 
                      onClick={() => setServiceQrOpen(true)}
                      variant="outlined"
                      sx={{ 
                          borderRadius: 4,
                          height: 56,
                          px: isMobile ? 2 : 3,
                          fontWeight: 800,
                          borderColor: alpha(theme.palette.secondary.main, 0.2),
                          color: theme.palette.secondary.main,
                          '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05), borderColor: theme.palette.secondary.main }
                      }}
                  >
                      <QrCode size={22} />
                      {!isMobile && <Typography variant="button" sx={{ ml: 1 }}>Check-in QR</Typography>}
                  </Button>
              </Tooltip>

              <Button 
                  onClick={() => setScannerMode(!scannerMode)} 
                  variant={scannerMode ? "contained" : "outlined"}
                  color={scannerMode ? "primary" : "inherit"}
                  sx={{ 
                      borderRadius: 4,
                      height: 56,
                      px: isMobile ? 2 : 3,
                      fontWeight: 800,
                      boxShadow: scannerMode ? `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.4)}` : 'none'
                  }}
              >
                  {scannerMode ? <X size={22} /> : <Camera size={22} />}
                  {!isMobile && <Typography variant="button" sx={{ ml: 1 }}>{scannerMode ? "Close Scanner" : "Scan QR"}</Typography>}
              </Button>

              <Button 
                  variant="contained" 
                  onClick={handleSave} 
                  disabled={submitting || selectedAttendees.size === 0}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={22} />}
                  sx={{ 
                      borderRadius: 4,
                      height: 56,
                      px: isMobile ? 2 : 4,
                      fontWeight: 800,
                      boxShadow: `0 12px 24px -6px ${alpha(theme.palette.primary.main, 0.4)}`,
                      '&:hover': { 
                          boxShadow: `0 16px 32px -8px ${alpha(theme.palette.primary.main, 0.5)}`,
                          transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
              >
                  {!isMobile && `Submit Record (${selectedAttendees.size})`}
                  {isMobile && selectedAttendees.size}
              </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- CONTENT GRID --- */}
      <Grid container spacing={4} className="no-print">
        
        {/* --- LEFT COL: MARK ATTENDANCE --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 6, overflow: 'hidden', boxShadow: theme.shadows[4], border: `1px solid ${theme.palette.divider}` }}>
            {/* Header / Title */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5), display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, width: 44, height: 44, borderRadius: 3 }}>
                    <Users size={22} />
                </Avatar>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Attendance Registry</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>Mark present members for today's service</Typography>
                </Box>
            </Box>

            {/* --- QR SCANNER COMPONENT --- */}
            <AnimatePresence>
                {scannerMode && (
                    <Box 
                        component={motion.div}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        sx={{ px: 3, pt: 3, pb: 2, overflow: 'hidden', bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                    >
                        <Box id="reader" sx={{ 
                            borderRadius: 4, 
                            overflow: 'hidden', 
                            border: `2px solid ${theme.palette.primary.main}`,
                            boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.2)}`,
                            '& #reader__dashboard_section_csr button': {
                                bgcolor: theme.palette.primary.main,
                                color: '#fff',
                                border: 'none',
                                borderRadius: 1.5,
                                padding: '10px 20px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                marginTop: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: 1
                            }
                        }} />
                        <Typography variant="body2" sx={{ display: 'block', textAlign: 'center', mt: 2, fontWeight: 700, color: theme.palette.primary.main }}>
                            READY TO SCAN • ALIGN QR CODE IN FRAME
                        </Typography>
                        <Divider sx={{ mt: 3 }} />
                    </Box>
                )}
            </AnimatePresence>

            {/* Member List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 4, maxHeight: '700px', minHeight: '400px' }}>
              {loading ? (
                 Array.from(new Array(6)).map((_, index) => (
                   <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                     <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2, borderRadius: 2 }} />
                     <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="40%" height={24} />
                        <Skeleton variant="text" width="60%" height={20} />
                     </Box>
                   </Box>
                 ))
              ) : (
                <Grid container spacing={2}>
                  {filteredMembers.filter(m => {
                    if (!selectedBranch) return true;
                    return String(m.branch).toLowerCase() === String(selectedBranch).toLowerCase();
                  }).map((member) => {
                    const isSelected = selectedAttendees.has(member.id);
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={member.id}>
                        <ListItemButton 
                            onClick={() => handleToggle(member.id)}
                            sx={{ 
                                p: 2,
                                borderRadius: 4, 
                                border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
                                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { 
                                    transform: 'scale(1.02)',
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.02),
                                    borderColor: theme.palette.primary.main
                                }
                            }}
                        >
                            <ListItemAvatar>
                            <Avatar sx={{ 
                                width: 44, height: 44,
                                bgcolor: isSelected ? theme.palette.primary.main : alpha(theme.palette.action.hover, 0.1), 
                                color: isSelected ? '#FFF' : theme.palette.text.secondary,
                                fontWeight: 900,
                                borderRadius: 2.5,
                                fontSize: '1.1rem'
                            }}>
                                {(member.name || "?").charAt(0).toUpperCase()}
                            </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={<Typography variant="subtitle2" fontWeight={800}>{member.name}</Typography>} 
                                secondary={<Typography variant="caption" fontWeight={600} color="text.secondary">{member.memberId || 'NO ID'}</Typography>} 
                            />
                            {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <CheckCircle size={24} color={theme.palette.primary.main} />
                                </motion.div>
                            )}
                        </ListItemButton>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>

        {/* --- RIGHT COL: HISTORY LOG --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 6, maxHeight: '800px', overflow: 'hidden', boxShadow: theme.shadows[3], border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, width: 44, height: 44, borderRadius: 3 }}><History size={22} /></Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>Service History</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>Previous attendance records</Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {filteredRecords.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5, opacity: 0.5 }}>
                    <History size={48} style={{ marginBottom: 16 }} />
                    <Typography fontWeight={700}>No history found</Typography>
                </Box>
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
                      p: 3, mb: 2, borderRadius: 5, 
                      bgcolor: theme.palette.background.paper, 
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8], borderColor: theme.palette.primary.main },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: theme.palette.primary.main, opacity: 0.8 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {safeFormat(record.date, 'MMM dd, yyyy')}
                        </Typography>
                        <Chip label={record.branch || 'Main'} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main }} />
                    </Box>
                    <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography variant="h4" color="text.primary" fontWeight={900} sx={{ letterSpacing: -1 }}>
                            {record.attendees ? record.attendees.length : 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                            Attendees Present
                        </Typography>
                    </Stack>
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
        PaperProps={{ sx: { borderRadius: 6, overflow: 'hidden' } }}
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Box>
                <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>
                  {isEditing ? 'Modify Registry' : 'Service Report'}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Calendar size={14} color={theme.palette.primary.main} />
                    <Typography variant="body2" color="text.secondary" fontWeight={800}>
                    {safeFormat(selectedRecord.date, 'EEEE, MMMM do, yyyy')}
                    </Typography>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'divider' }} />
                    <Typography variant="caption" fontWeight={900} color="primary" sx={{ textTransform: 'uppercase' }}>{selectedRecord.branch || 'Global'}</Typography>
                </Stack>
              </Box>
              <IconButton onClick={() => setSelectedRecord(null)} sx={{ bgcolor: theme.palette.action.hover, borderRadius: 3 }}>
                <X size={20} />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              {isEditing ? (
                <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                  <Grid container spacing={2}>
                    {filteredMembers.filter(m => {
                      const recordBranch = selectedRecord?.branch || '';
                      if (!recordBranch) return true;
                      return String(m.branch).toLowerCase() === String(recordBranch).toLowerCase();
                    }).map((member) => {
                      const isSelected = editedAttendees.has(member.id);
                      return (
                        <Grid size={{ xs: 12, sm: 6 }} key={member.id}>
                            <ListItemButton 
                            onClick={() => handleToggleEdited(member.id)}
                            sx={{ 
                                p: 2,
                                borderRadius: 4, 
                                mb: 1, 
                                border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
                                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
                                transition: 'all 0.2s'
                            }}
                            >
                            <ListItemAvatar>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: isSelected ? theme.palette.primary.main : alpha(theme.palette.action.hover, 0.1), color: isSelected ? '#FFF' : theme.palette.text.secondary, borderRadius: 2, fontWeight: 800 }}>
                                {(member.name || "?").charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={<Typography fontWeight={800}>{member.name}</Typography>} />
                            {isSelected && <CheckCircle size={22} color={theme.palette.primary.main} />}
                            </ListItemButton>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ) : (
                <>
                  <Box sx={{ bgcolor: theme.palette.background.default, p: 4, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 6 }}>
                        <Card elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.08), color: theme.palette.success.main, border: `2px solid ${alpha(theme.palette.success.main, 0.1)}`, borderRadius: 5 }}>
                          <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: -2, mb: 0.5 }}>{selectedRecord.attendees ? selectedRecord.attendees.length : 0}</Typography>
                          <Typography variant="caption" fontWeight={900} sx={{ letterSpacing: 1.5, opacity: 0.8 }}>PRESENT MEMBERS</Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Card elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.08), color: theme.palette.error.main, border: `2px solid ${alpha(theme.palette.error.main, 0.1)}`, borderRadius: 5 }}>
                          <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: -2, mb: 0.5 }}>{getAbsentMembers(selectedRecord).length}</Typography>
                          <Typography variant="caption" fontWeight={900} sx={{ letterSpacing: 1.5, opacity: 0.8 }}>ABSENT MEMBERS</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  <Tabs 
                    value={reportTab} 
                    onChange={(e, v) => setReportTab(v)} 
                    variant="fullWidth" 
                    sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        '& .MuiTabs-indicator': { height: 3 }
                    }}
                  >
                    <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle size={16} /> Present</Box>} sx={{ fontWeight: 800, minHeight: 60 }} />
                    <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><X size={16} /> Absent</Box>} sx={{ fontWeight: 800, minHeight: 60 }} />
                  </Tabs>

                  <Box sx={{ p: 0, maxHeight: '45vh', overflowY: 'auto' }}>
                    {reportTab === 0 ? (
                      <List sx={{ px: 2 }}>
                        {selectedRecord.attendees && selectedRecord.attendees.filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} sx={{ px: 2, py: 1.5, borderRadius: 3, mb: 0.5, '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.02) } }}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontSize: '0.9rem', fontWeight: 900, borderRadius: 2 }}>{(m.name || "?").charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={<Typography fontWeight={800}>{m.name || "Unknown"}</Typography>} 
                                secondary={<Typography variant="caption" fontWeight={700} color="text.secondary">{m.memberId || 'NO ID'}</Typography>}
                            />
                            <Chip label="PRESENT" size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, borderRadius: 1 }} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <List sx={{ px: 2 }}>
                        {getAbsentMembers(selectedRecord).filter(m => m).map((m, i) => (
                          <ListItem key={m.id || i} sx={{ px: 2, py: 1.5, borderRadius: 3, mb: 0.5, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.02) } }}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, fontSize: '0.9rem', fontWeight: 900, borderRadius: 2 }}>{(m.name || "?").charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={<Typography fontWeight={800}>{m.name || "Unknown"}</Typography>} 
                                secondary={<Typography variant="caption" fontWeight={700} color="text.secondary">{m.memberId || 'NO ID'}</Typography>}
                            />
                            <Chip label="ABSENT" size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, borderRadius: 1 }} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.8), backdropFilter: 'blur(10px)', gap: 1.5 }}>
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}>Cancel</Button>
                  <Button variant="contained" onClick={handleUpdate} disabled={submitting} sx={{ borderRadius: 2.5, fontWeight: 900, px: 4, boxShadow: theme.shadows[4] }}>
                    {submitting ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button color="error" startIcon={<Trash2 size={18}/>} onClick={handleDelete} sx={{ mr: 'auto', fontWeight: 800, borderRadius: 2.5 }}>Delete</Button>
                  <Button variant="outlined" startIcon={<Edit size={18}/>} onClick={() => setIsEditing(true)} sx={{ borderRadius: 2.5, fontWeight: 800, px: 3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>Edit</Button>
                  <Button variant="contained" startIcon={<Printer size={18}/>} onClick={handlePrint} sx={{ borderRadius: 2.5, fontWeight: 900, px: 3, boxShadow: theme.shadows[4] }}>Print Report</Button>
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

      {/* --- SERVICE QR DIALOG --- */}
      <Dialog 
        open={serviceQrOpen} 
        onClose={() => setServiceQrOpen(false)}
        PaperProps={{ sx: { borderRadius: 6, p: 2, textAlign: 'center' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Service Check-in QR</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Members can scan this code to access the self check-in page for <strong>{selectedDate}</strong> ({selectedBranch || 'All Branches'}).
            </Typography>
            
            <Paper elevation={0} sx={{ p: 4, bgcolor: '#fff', borderRadius: 4, display: 'inline-block', border: `1px solid ${theme.palette.divider}` }}>
                <QRCode 
                    id="ServiceQRCode"
                    value={`${window.location.origin}/checkin?date=${selectedDate}&branch=${selectedBranch || 'All'}`} 
                    size={250}
                    level="H"
                />
            </Paper>
            
            <Typography variant="h6" fontWeight={800} sx={{ mt: 3, color: theme.palette.primary.main }}>
                Scan to Check-in
            </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
            <Button onClick={() => setServiceQrOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
            <Button 
                variant="contained" 
                startIcon={<Download size={18} />} 
                onClick={downloadServiceQRCode}
                sx={{ borderRadius: 2, fontWeight: 800 }}
            >
                Download QR
            </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Attendance;