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
  CircularProgress
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
  Loader2
} from 'lucide-react';

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
    position: ''    
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
          borderRadius: '6px',
          textTransform: 'uppercase',
          fontSize: '0.65rem'
        }}
      />
    );
  };

  const [errors, setErrors] = useState({});

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
        position: member.position || ''      
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
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
        position: member.position || ''       
    });
    setIsEditing(false);
    setErrors({});
  };

  const handleSendMessage = async () => {
    if (!member.email) {
      showNotification("This member doesn't have an email address.", "warning");
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

    if (!serviceId || serviceId === 'your_service_id') {
      showNotification("EmailJS is not configured. Please check your environment variables.", "error");
      setSendingEmail(false);
      return;
    }

    const templateParams = {
      to_email: member.email,
      to_name: member.name,
      from_name: senderName,
      branch: senderBranch,
      message: messageBody,
      subject: `Official Communication from ${senderBranch}`
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      showNotification(`Message sent to ${member.name}!`, "success");
      setMessageBody('');
      setTabValue(0); // Return to profile tab after sending
    } catch (error) {
      console.error("EmailJS Error:", error);
      showNotification("Failed to send message. Please try again later.", "error");
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
          borderRadius: 4,
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
                    borderRadius: 3,
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
        </Tabs>

        {tabValue === 0 ? (
        <Box sx={{ p: 4 }}>
          {isEditing ? (
            <Grid container spacing={3}>
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
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) } }}
                  />
                </Grid>
                {/* ID is not editable as per requirements */}
                <Grid size={{ xs: 12 }}>
                   <Box sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette.action.disabledBackground, 0.05), border: `1px dashed ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>MEMBER ID: {member.memberId || 'N/A'}</Typography>
                   </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                      label="Email Address" 
                      name="email" 
                      type="email" 
                      fullWidth 
                      value={formData.email} 
                      onChange={handleChange} 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) } }}
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
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) } }}
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
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) } }}
                      />
                  </Grid>
                  )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                      label="Birth Date" 
                      name="dob" 
                      type="date" 
                      fullWidth 
                      value={formData.dob} 
                      onChange={handleChange} 
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={formData.branch}
                      onChange={handleChange}
                      label="Branch"
                      name="branch"
                      sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) }}
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
                      sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Children's Department">Children's Dept</MenuItem>
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
                      sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.4) }}
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
            </Grid>
          ) : (
            <Stack spacing={4}>
                <Grid container spacing={3}>
                {[
                    { icon: <Mail size={18}/>, label: 'EMAIL', value: member.email },
                    { icon: <Phone size={18}/>, label: 'PHONE', value: member.phone },
                    { icon: <MapPin size={18}/>, label: 'ADDRESS', value: member.address },
                    { icon: <Globe size={18}/>, label: 'COUNTRY', value: member.country },
                    { icon: <Cake size={18}/>, label: 'DATE OF BIRTH', value: formatDOB(member.dob) },
                    { icon: <Building size={18}/>, label: 'BRANCH', value: member.branch },
                    { icon: <Users size={18}/>, label: 'DEPARTMENT', value: member.department },
                    { icon: <Briefcase size={18}/>, label: 'POSITION', value: member.position }
                ].map((item, idx) => (
                    <Grid size={{ xs: 12, sm: idx === 2 ? 12 : 6 }} key={idx}>
                    <Box sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        bgcolor: alpha(theme.palette.background.default, 0.4),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02), borderColor: alpha(theme.palette.primary.main, 0.1) }
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ 
                                p: 1, 
                                borderRadius: 2, 
                                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                                color: theme.palette.primary.main,
                                display: 'flex'
                            }}>
                                {item.icon}
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5, fontSize: '0.65rem' }}>{item.label}</Typography>
                                <Typography variant="body2" fontWeight={700} sx={{ color: item.value ? 'text.primary' : 'text.disabled' }}>{item.value || 'Not provided'}</Typography>
                            </Box>
                        </Stack>
                    </Box>
                    </Grid>
                ))}
                </Grid>
                
                <Box sx={{ 
                    p: 3, 
                    borderRadius: 4, 
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
                            borderRadius: 3, 
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
                <Card variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
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
                <Card variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.03) }}>
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
                <Card variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        value={newContribution.type}
                        onChange={(e) => setNewContribution({ ...newContribution, type: e.target.value })}
                        SelectProps={{ native: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={handleAddContribution}
                        sx={{ height: 56, borderRadius: 2, fontWeight: 700, boxShadow: 'none' }}
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
            <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
        ) : (
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
                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                }}
            />

            <Button 
                variant="contained" 
                fullWidth 
                startIcon={sendingEmail ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                onClick={handleSendMessage}
                disabled={!member.email || sendingEmail || !messageBody.trim()}
                sx={{ 
                    height: 56, 
                    borderRadius: 3, 
                    fontWeight: 800,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
            >
                {sendingEmail ? 'Sending...' : 'Send Message'}
            </Button>
            {!member.email && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center', fontWeight: 600 }}>
                    Member has no email address on file.
                </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        {isEditing ? (
            <Stack direction="row" spacing={2} sx={{ width: '100%' }} justifyContent="flex-end">
                <Button onClick={handleCancelEdit} sx={{ borderRadius: 2.5, fontWeight: 700, color: theme.palette.text.secondary }}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2.5, fontWeight: 800, px: 4, boxShadow: theme.shadows[4] }}>Update Member</Button>
            </Stack>
        ) : (
            <Stack direction="row" spacing={2} sx={{ width: '100%' }} justifyContent="space-between">
                <Button onClick={() => onDelete(member.id)} color="error" startIcon={<Trash2 size={18} />} sx={{ fontWeight: 700, borderRadius: 2.5 }}>Revoke</Button>
                <Button onClick={() => setIsEditing(true)} variant="contained" startIcon={<Edit size={18} />} sx={{ fontWeight: 800, borderRadius: 2.5, px: 4, boxShadow: theme.shadows[4] }}>Modify Profile</Button>
            </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailsDialog;