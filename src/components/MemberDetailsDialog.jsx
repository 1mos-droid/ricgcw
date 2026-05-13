import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { safeParseDate } from '../utils/dateUtils';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Box,
  IconButton,
  Typography,
  useTheme,
  Avatar,
  Grid,
  TextField,
  Slide,
  InputAdornment,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Card,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  alpha,
  Stack,
  CircularProgress,
  Autocomplete,
  Paper
} from '@mui/material';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ArrowLeft,
  DollarSign,
  HeartHandshake,
  Plus,
  Building,
  Cake,
  Users,
  Briefcase,
  History,
  Globe,
  Send,
  Loader2,
  QrCode,
  Download,
  Printer,
  Waves,
  Cross,
  Heart,
  Baby
} from 'lucide-react';
import { getDepartmentByAge } from '../utils/dateUtils';
import QRCode from 'react-qr-code';

import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import emailjs from '@emailjs/browser';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MemberDetailsDialog = ({ open, onClose, member, onEdit, onDelete, initialTab = 0 }) => {
  const theme = useTheme();
  const { showNotification } = useWorkspace();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(initialTab);
  const [contributions, setContributions] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  
  const [newContribution, setNewContribution] = useState({ 
    type: 'tithe', 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    dob: '', 
    status: '',
    branch: '', 
    department: '', 
    position: '',
    baptismDate: '',
    confirmationDate: '',
    occupation: '',
    spouseId: null,
    childrenIds: [],
    spouseName: '',
    childrenNames: ''
  });

  const getStatusChip = (status) => {
    const statusMap = {
      active: { label: 'Active', color: 'success' },
      inactive: { label: 'Inactive', color: 'warning' },
      discontinued: { label: 'Discontinued', color: 'error' },
    };
    const { label, color } = statusMap[status] || { label: 'Unknown', color: 'secondary' };

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
          color: theme.palette[color]?.main || theme.palette.primary.main,
          fontWeight: 700,
          borderRadius: 1,
          textTransform: 'uppercase',
          fontSize: '0.65rem'
        }}
      />
    );
  };

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "members"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, memberId: doc.data().memberId }));
        setAllMembers(data);
      } catch (err) {
        console.error("Fetch members error:", err);
      }
    };
    if (open) fetchMembers();
  }, [open]);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        country: member.country || '',
        dob: member.dob || '',
        status: member.status || 'active',
        branch: member.branch || '', 
        department: member.department || '', 
        cellGroup: member.cellGroup || '',
        position: member.position || '',
        baptismDate: member.baptismDate || '',
        confirmationDate: member.confirmationDate || '',
        occupation: member.occupation || '',
        spouseId: member.spouseId || null,
        childrenIds: member.childrenIds || [],
        spouseName: member.spouseName || '',
        childrenNames: member.childrenNames || ''
      });
      setErrors({});
      setIsEditing(false);
      setTabValue(initialTab);
      setMessageBody('');
    }
  }, [member, open, initialTab]);

  const fetchContributions = useCallback(async () => {
    if (!member) return;
    setLoadingContributions(true);
    try {
      const querySnapshot = await getDocs(collection(db, "transactions"));
      const allTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const memberContributions = allTransactions.filter(
        item => String(item.memberId) === String(member.id)
      );
      setContributions(memberContributions);
    } catch (err) {
      console.log("Error fetching contributions:", err);
      setContributions([]);
    } finally {
      setLoadingContributions(false);
    }
  }, [member]);

  useEffect(() => {
    if (member && open) {
      fetchContributions();
    }
  }, [member, open, tabValue, fetchContributions]);

  const handleAddContribution = async () => {
    if (!newContribution.amount || !member) return;
    const payload = {
      ...newContribution,
      memberId: String(member.id), 
      memberName: member.name,
      amount: Number(newContribution.amount),
      isPrivateMemberRecord: true 
    };

    try {
      await addDoc(collection(db, "transactions"), payload);
      setNewContribution({ type: 'tithe', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchContributions();
      showNotification("Contribution recorded successfully", "success");
    } catch (err) {
      console.error("Firestore save failed:", err);
      showNotification("Failed to save contribution", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto-assign department based on age if DOB is changed
    if (name === 'dob' && value) {
      const suggestedDept = getDepartmentByAge(value);
      if (suggestedDept) {
        newFormData.department = suggestedDept;
      }
    }

    setFormData(newFormData);
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!String(formData.name || "").trim()) tempErrors.name = "Name is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onEdit(member.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        country: member.country || '',
        dob: member.dob || '',
        status: member.status || 'active',
        branch: member.branch || '', 
        department: member.department || '', 
        cellGroup: member.cellGroup || '',
        position: member.position || '',
        baptismDate: member.baptismDate || '',
        confirmationDate: member.confirmationDate || '',
        occupation: member.occupation || '',
        spouseId: member.spouseId || null,
        childrenIds: member.childrenIds || [],
        spouseName: member.spouseName || '',
        childrenNames: member.childrenNames || ''
    });
    setIsEditing(false);
    setErrors({});
  };

  const handleSendMessage = async () => {
    const emailTo = formData.email?.trim();
    
    if (!emailTo) {
      showNotification("This member does not have a valid email address.", "warning");
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTo)) {
      showNotification("The member's email address is invalid.", "warning");
      return;
    }

    if (!messageBody.trim()) {
      showNotification("Please enter a message.", "warning");
      return;
    }

    setSendingEmail(true);

    const senderName = user?.name || user?.email || 'Unknown Sender';
    const senderBranch = user?.branch === 'all' ? 'Main Sanctuary' : (user?.branch || 'Unknown Branch');
    
    // Check for EmailJS configuration
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || serviceId === 'your_service_id' || !templateId || !publicKey) {
      showNotification("EmailJS is not properly configured.", "error");
      setSendingEmail(false);
      return;
    }

    const templateParams = {
      to_email: emailTo,
      to_name: formData.name,
      from_name: senderName,
      branch: senderBranch,
      message: messageBody,
      subject: `Official Communication from ${senderBranch}`
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      showNotification(`Message sent to ${formData.name}!`, "success");
      setMessageBody('');
      setTabValue(0); // Return to profile tab after sending
    } catch (error) {
      console.error("EmailJS Error:", error);
      showNotification("Failed to send message. Please check the recipient's email address and try again.", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const formatDOB = (dobString) => {
    if (!dobString) return 'N/A';
    try {
      return format(safeParseDate(dobString), 'MMM do, yyyy');
    } catch {
      return dobString;
    }
  };

  const totalTithe = contributions
    .filter(c => c.type === 'tithe')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    
  const totalWelfare = contributions
    .filter(c => c.type === 'welfare')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const downloadQRCode = () => {
    const svg = document.getElementById("MemberQRCode");
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
      downloadLink.download = `${member.name}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };
  
  if (!member) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: 'none',
          overflow: 'hidden'
        }
      }}
    >
      {/* --- HEADER --- */}
      <Box sx={{
        px: 3,
        py: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.03)
      }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
                sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: theme.palette.primary.main, 
                    color: '#fff', 
                    fontWeight: 800,
                    borderRadius: 1.5,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
            >
              {member.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {isEditing ? 'Update Profile' : member.name}
                </Typography>
                {!isEditing && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    {getStatusChip(member.status)}
                    <Typography variant="caption" color="primary" fontWeight={800}>{member.memberId || 'NO ID'}</Typography>
                </Stack>
                )}
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: theme.palette.action.hover }}>
            <X size={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 0 }}>
        <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)} 
            sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                px: 3,
                '& .MuiTab-root': { fontWeight: 700, minHeight: 64 }
            }}
        >
          <Tab label="Profile Details" />
          <Tab label="Contributions" />
          <Tab label="Message" />
          <Tab label="QR ID" />
        </Tabs>

        {tabValue === 0 ? (
        <Box sx={{ p: 4 }}>
          {isEditing ? (
            <Grid container spacing={2.5}>
                {/* --- SECTION 1: IDENTITY --- */}
                <Grid size={{ xs: 12 }}>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>1. IDENTITY & CONTACT</Typography>
                    <Divider sx={{ mb: 3, mt: 0.5, opacity: 0.6 }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                      autoFocus 
                      label="Full Name" 
                      name="name" 
                      fullWidth 
                      required
                      value={formData.name} 
                      onChange={handleChange} 
                      error={!!errors.name}
                      helperText={errors.name}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                      label="Email Address" 
                      name="email" 
                      type="email" 
                      fullWidth 
                      value={formData.email} 
                      onChange={handleChange} 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                      label="Phone Number" 
                      name="phone" 
                      type="tel" 
                      fullWidth 
                      value={formData.phone} 
                      onChange={handleChange} 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                      label="Birth Date" 
                      name="dob" 
                      type="date" 
                      fullWidth 
                      value={formData.dob} 
                      onChange={handleChange} 
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                  </Grid>

                  {formData.branch === 'Diaspora' && (
                  <Grid size={{ xs: 12 }}>
                      <TextField
                      fullWidth
                      label="Country of Residence"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                  </Grid>
                  )}

                {/* --- SECTION 2: CHURCH LIFE --- */}
                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>2. CHURCH LIFE</Typography>
                    <Divider sx={{ mb: 3, mt: 0.5, opacity: 0.6 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={formData.branch}
                      onChange={handleChange}
                      label="Branch"
                      name="branch"
                      sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value="Langma">Langma</MenuItem>
                      <MenuItem value="Mallam">Mallam</MenuItem>
                      <MenuItem value="Kokrobitey">Kokrobitey</MenuItem>
                      <MenuItem value="Diaspora">Diaspora</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department}
                      onChange={handleChange}
                      label="Department"
                      name="department"
                      sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Children's Court">Children's Court</MenuItem>
                      <MenuItem value="Youth">Youth</MenuItem>
                      <MenuItem value="Mens">Mens</MenuItem>
                      <MenuItem value="Women">Women</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Position</InputLabel>
                    <Select
                      value={formData.position}
                      onChange={handleChange}
                      label="Position"
                      name="position"
                      sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Youth Pastor">Youth Pastor</MenuItem>
                      <MenuItem value="Head Pastor">Head Pastor</MenuItem>
                      <MenuItem value="Branch Pastor">Branch Pastor</MenuItem>
                      <MenuItem value="Instrumentalist">Instrumentalist</MenuItem>
                      <MenuItem value="Singer">Singer</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                      name="status"
                      sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="discontinued">Discontinued</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* --- SECTION 3: SPIRITUAL MILESTONES --- */}
                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>3. SPIRITUAL MILESTONES</Typography>
                    <Divider sx={{ mb: 3, mt: 0.5, opacity: 0.6 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                      label="Baptism Date" 
                      name="baptismDate" 
                      type="date" 
                      fullWidth 
                      value={formData.baptismDate} 
                      onChange={handleChange} 
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                      label="Confirmation Date" 
                      name="confirmationDate" 
                      type="date" 
                      fullWidth 
                      value={formData.confirmationDate} 
                      onChange={handleChange} 
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>

                {/* --- SECTION 4: FAMILY & PROFESSIONAL --- */}
                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>4. FAMILY & PROFESSIONAL</Typography>
                    <Divider sx={{ mb: 3, mt: 0.5, opacity: 0.6 }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Spouse Name (Text)"
                        name="spouseName"
                        value={formData.spouseName}
                        onChange={handleChange}
                        placeholder="Manual entry if not linked"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Children's Names (Text)"
                        name="childrenNames"
                        value={formData.childrenNames}
                        onChange={handleChange}
                        placeholder="Manual entry if not linked"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                        options={allMembers.filter(m => m.id !== member.id)}
                        getOptionLabel={(option) => option.name || ""}
                        value={allMembers.find(m => m.id === formData.spouseId) || null}
                        onChange={(_, newValue) => setFormData({ ...formData, spouseId: newValue ? newValue.id : null })}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Spouse" 
                                placeholder="Search members..."
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <Heart size={18} color={theme.palette.text.secondary} />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                        multiple
                        options={allMembers.filter(m => m.id !== member.id)}
                        getOptionLabel={(option) => option.name || ""}
                        value={allMembers.filter(m => formData.childrenIds?.includes(m.id))}
                        onChange={(_, newValue) => setFormData({ ...formData, childrenIds: newValue.map(v => v.id) })}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Children" 
                                placeholder="Link children..."
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <Baby size={18} color={theme.palette.text.secondary} />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                </Grid>
            </Grid>
          ) : (
            <Stack spacing={4}>
                {/* --- SECTION 1: IDENTITY & CONTACT --- */}
                <Box>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5, mb: 1.5, display: 'block' }}>1. IDENTITY & CONTACT</Typography>
                    <Grid container spacing={2}>
                        {[
                            { icon: <Mail size={18}/>, label: 'EMAIL', value: member.email },
                            { icon: <Phone size={18}/>, label: 'PHONE', value: member.phone },
                            { icon: <MapPin size={18}/>, label: 'ADDRESS', value: member.address },
                            { icon: <Globe size={18}/>, label: 'COUNTRY', value: member.country },
                            { icon: <Cake size={18}/>, label: 'DATE OF BIRTH', value: formatDOB(member.dob) }
                        ].map((item, idx) => (
                            <Grid size={{ xs: 12, sm: idx === 2 ? 12 : 6 }} key={idx}>
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: 1.5, 
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    height: '100%'
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, display: 'flex' }}>{item.icon}</Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5, fontSize: '0.65rem' }}>{item.label}</Typography>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: item.value ? 'text.primary' : 'text.disabled' }}>{item.value || 'Not provided'}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* --- SECTION 2: CHURCH LIFE --- */}
                <Box>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5, mb: 1.5, display: 'block' }}>2. CHURCH LIFE</Typography>
                    <Grid container spacing={2}>
                        {[
                            { icon: <Building size={18}/>, label: 'BRANCH', value: member.branch },
                            { icon: <Users size={18}/>, label: 'DEPARTMENT', value: member.department },
                            { icon: <Users size={18}/>, label: 'CELL/GROUP', value: member.cellGroup },
                            { icon: <Briefcase size={18}/>, label: 'POSITION', value: member.position }
                        ].map((item, idx) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: 1.5, 
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    height: '100%'
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, display: 'flex' }}>{item.icon}</Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5, fontSize: '0.65rem' }}>{item.label}</Typography>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: item.value ? 'text.primary' : 'text.disabled' }}>{item.value || 'Not provided'}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* --- SECTION 3: SPIRITUAL MILESTONES --- */}
                <Box>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5, mb: 1.5, display: 'block' }}>3. SPIRITUAL MILESTONES</Typography>
                    <Grid container spacing={2}>
                        {[
                            { icon: <Waves size={18}/>, label: 'BAPTISM DATE', value: formatDOB(member.baptismDate) },
                            { icon: <Cross size={18}/>, label: 'CONFIRMATION DATE', value: formatDOB(member.confirmationDate) }
                        ].map((item, idx) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: 1.5, 
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    height: '100%'
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, display: 'flex' }}>{item.icon}</Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5, fontSize: '0.65rem' }}>{item.label}</Typography>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: item.value ? 'text.primary' : 'text.disabled' }}>{item.value || 'Not provided'}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* --- SECTION 4: FAMILY & PROFESSIONAL --- */}
                <Box>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5, mb: 1.5, display: 'block' }}>4. FAMILY & PROFESSIONAL</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, display: 'flex' }}><Briefcase size={18}/></Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5, fontSize: '0.65rem' }}>OCCUPATION</Typography>
                                        <Typography variant="body2" fontWeight={700} sx={{ color: member.occupation ? 'text.primary' : 'text.disabled' }}>{member.occupation || 'Not provided'}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, display: 'flex' }}><Heart size={18}/></Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5, fontSize: '0.65rem' }}>SPOUSE</Typography>
                                        {member.spouseId ? (
                                            <Chip 
                                                label={allMembers.find(m => m.id === member.spouseId)?.name || "Linked Profile"} 
                                                size="small" 
                                                onClick={() => {
                                                    const spouse = allMembers.find(m => m.id === member.spouseId);
                                                    if (spouse) {
                                                        showNotification(`Viewing ${spouse.name}'s profile...`, "info");
                                                    }
                                                }}
                                                sx={{ mt: 0.5, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}
                                            />
                                        ) : member.spouseName ? (
                                            <Typography variant="body2" fontWeight={700}>{member.spouseName}</Typography>
                                        ) : (
                                            <Typography variant="body2" fontWeight={700} color="text.disabled">No spouse linked</Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, display: 'flex' }}><Baby size={18}/></Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5, fontSize: '0.65rem' }}>CHILDREN</Typography>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                                            {member.childrenIds && member.childrenIds.length > 0 ? (
                                                member.childrenIds.map(childId => (
                                                    <Chip 
                                                        key={childId}
                                                        label={allMembers.find(m => m.id === childId)?.name || "Child Profile"} 
                                                        size="small"
                                                        sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mb: 0.5 }}
                                                    />
                                                ))
                                            ) : member.childrenNames ? (
                                                <Typography variant="body2" fontWeight={700}>{member.childrenNames}</Typography>
                                            ) : (
                                                <Typography variant="body2" fontWeight={700} color="text.disabled">No children linked</Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                
                <Box sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                    <Typography variant="caption" fontWeight={800} color="primary" sx={{ display: 'block', mb: 2, letterSpacing: 1 }}>QUICK ACTIONS</Typography>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        startIcon={<Send size={18} />}
                        onClick={() => setTabValue(2)}
                        sx={{ 
                            borderRadius: 1.5, 
                            py: 1.5, 
                            fontWeight: 800,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:hover': { boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}` }
                        }}
                    >
                        Send a Message
                    </Button>
                </Box>
            </Stack>
          )}
        </Box>

        ) : tabValue === 1 ? (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}><DollarSign size={18}/></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL TITHE</Typography>
                      <Typography variant="h6" fontWeight={800}>GHC{totalTithe.toLocaleString()}</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.03) }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.success.main, width: 32, height: 32 }}><HeartHandshake size={18}/></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>WELFARE</Typography>
                      <Typography variant="h6" fontWeight={800}>GHC{totalWelfare.toLocaleString()}</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Plus size={16} /> LOG CONTRIBUTION
                </Typography>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        value={newContribution.type}
                        onChange={(e) => setNewContribution({ ...newContribution, type: e.target.value })}
                        SelectProps={{ native: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    >
                        <option value="tithe">Tithe</option>
                        <option value="welfare">Welfare</option>
                        <option value="other">Other</option>
                    </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={newContribution.amount}
                        onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                        InputProps={{ startAdornment: <InputAdornment position="start">GHC</InputAdornment> }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={handleAddContribution}
                        sx={{ height: 56, borderRadius: 1, fontWeight: 700, boxShadow: 'none' }}
                    >
                        Save Entry
                    </Button>
                    </Grid>
                </Grid>
                </Card>
            </Box>

            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History size={16} /> RECENT TRANSACTIONS
            </Typography>
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
                {loadingContributions ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24}/></Box>
                ) : contributions.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="body2" color="text.secondary" fontWeight={500}>No history found.</Typography></Box>
                ) : (
                    contributions.map((c, index) => (
                    <React.Fragment key={c.id || index}>
                        <ListItem sx={{ py: 2, px: 3, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                            <ListItemText
                                primary={<Typography variant="body2" fontWeight={700}>GHC{Number(c.amount).toLocaleString()}</Typography>}
                                secondary={format(safeParseDate(c.date || Date.now()), 'MMM dd, yyyy • p')}
                                secondaryTypographyProps={{ fontWeight: 500 }}
                            />
                            <Chip 
                                label={c.type.toUpperCase()} 
                                size="small" 
                                sx={{ 
                                    fontWeight: 800, 
                                    fontSize: '0.6rem', 
                                    borderRadius: 1,
                                    bgcolor: c.type === 'tithe' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                    color: c.type === 'tithe' ? theme.palette.primary.main : theme.palette.success.main
                                }}
                            />
                        </ListItem>
                        {index < contributions.length - 1 && <Divider />}
                    </React.Fragment>
                    ))
                )}
                </List>
            </Card>
          </Box>
        ) : tabValue === 2 ? (
          <Box sx={{ p: 4 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={16} /> COMPOSE MESSAGE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Send a direct message to <strong>{member.name}</strong> via Gmail. The subject will automatically include your name and branch for identification.
            </Typography>
            
            <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Type your message here..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': { borderRadius: 1 }
                }}
            />

            <Button 
                variant="contained" 
                fullWidth 
                startIcon={sendingEmail ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                onClick={handleSendMessage}
                disabled={!formData.email?.trim() || sendingEmail || !messageBody.trim()}
                sx={{
                   height: 56,                    borderRadius: 1, 
                    fontWeight: 800,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
            >
                {sendingEmail ? 'Sending...' : 'Send Message'}
            </Button>
            {!formData.email?.trim() && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center', fontWeight: 600 }}>
                    Member has no email address on file.
                </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <QrCode size={18} /> DIGITAL IDENTITY
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, display: 'inline-block', borderRadius: 4, bgcolor: '#fff', mb: 4 }}>
                <QRCode 
                    id="MemberQRCode"
                    value={member.memberId || member.id} 
                    size={200}
                    level="H"
                />
            </Paper>

            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{member.memberId || 'NO ID'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                This unique QR code contains the member's digital identity and can be scanned for automated attendance check-ins.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                    variant="outlined" 
                    startIcon={<Download size={18} />}
                    onClick={downloadQRCode}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                    Save Image
                </Button>
                <Button 
                    variant="contained" 
                    startIcon={<Printer size={18} />}
                    onClick={() => window.print()}
                    sx={{ borderRadius: 2, fontWeight: 800 }}
                >
                    Print ID Card
                </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        {isEditing ? (
            <Stack direction="row" spacing={2} sx={{ width: '100%' }} justifyContent="flex-end">
                <Button onClick={handleCancelEdit} sx={{ borderRadius: 1.5, fontWeight: 700, color: theme.palette.text.secondary }}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 1.5, fontWeight: 800, px: 4, boxShadow: theme.shadows[4] }}>Update Member</Button>
            </Stack>
        ) : (
            <Stack direction="row" spacing={2} sx={{ width: '100%' }} justifyContent="space-between">
                <Button onClick={() => onDelete(member.id)} color="error" startIcon={<Trash2 size={18} />} sx={{ fontWeight: 700, borderRadius: 1.5 }}>Revoke</Button>
                <Button onClick={() => setIsEditing(true)} variant="contained" startIcon={<Edit size={18} />} sx={{ fontWeight: 800, borderRadius: 1.5, px: 4, boxShadow: theme.shadows[4] }}>Modify Profile</Button>
            </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailsDialog;
