import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Tab,
  Tabs,
  Card,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
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
  Building
} from 'lucide-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// 🔴 THE WORKING URL YOU CONFIRMED
const API_BASE_URL = "https://us-central1-thegatheringplace-app.cloudfunctions.net/api";

const MemberDetailsDialog = ({ open, onClose, member, onEdit, onDelete }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [contributions, setContributions] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(false);
  
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
    status: '',
    branch: '' // NEW: Added branch to formData
  });

  const getStatusChip = (status) => {
    const statusMap = {
      active: { label: 'Active', color: 'success' },
      inactive: { label: 'Inactive', color: 'warning' },
      discontinued: { label: 'Discontinued', color: 'error' },
    };
    const { label, color } = statusMap[status] || { label: 'Unknown', color: 'default' };

    return (
      <Chip
        label={label}
        size="small"
        color={color}
        variant="outlined"
        sx={{
          bgcolor: theme.palette[color]?.light || theme.palette.grey[200],
          color: theme.palette[color]?.dark || theme.palette.text.secondary,
          border: 'none',
          fontWeight: 700,
          textTransform: 'capitalize',
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
        status: member.status || 'active',
        branch: member.branch || '' // NEW: Set branch from member data
      });
      setErrors({});
      setIsEditing(false);
      setTabValue(0);
    }
  }, [member, open]);

  useEffect(() => {
    if (member && open) {
      fetchContributions();
    }
  }, [member, open, tabValue]);

  // 🔴 FAIL-SAFE FETCH: Get all transactions and filter for this member locally
  const fetchContributions = async () => {
    if (!member) return;
    setLoadingContributions(true);
    try {
      // We fetch from the main transactions endpoint
      const response = await axios.get(`${API_BASE_URL}/transactions`);
      
      // We filter right here to ensure we ONLY see this member's data
      // This works even if the backend filter failed to deploy
      const memberContributions = response.data.filter(
        item => String(item.memberId) === String(member.id)
      );
      
      setContributions(memberContributions);
    } catch (err) {
      console.log("Error fetching contributions:", err);
      setContributions([]);
    } finally {
      setLoadingContributions(false);
    }
  };

  // 🔴 FAIL-SAFE SAVE: Save to transactions with the 'Private' flag
  const handleAddContribution = async () => {
    if (!newContribution.amount || !member) return;
    
    // Optimistic Update (Show it immediately)
    const tempId = Date.now().toString();
    const payload = {
      ...newContribution,
      memberId: String(member.id), // Ensure ID is a string
      memberName: member.name,
      amount: Number(newContribution.amount),
      isPrivateMemberRecord: true // <--- THIS HIDES IT FROM DASHBOARD TOTALS
    };

    setContributions(prev => [...prev, { ...payload, id: tempId }]);

    // Reset Form
    setNewContribution({ 
        type: 'tithe', 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0] 
    });

    try {
      // Save to the working URL
      await axios.post(`${API_BASE_URL}/transactions`, payload);
      console.log("Saved successfully to server!");
      // Optionally refresh to get the real ID, but not strictly necessary immediately
    } catch (err) {
      console.error("Server save failed:", err);
      alert("Saved locally. Server update failed.");
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
    if (!formData.name.trim()) tempErrors.name = "Name is required";
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
        status: member.status || 'active'
    });
    setIsEditing(false);
    setErrors({});
  };

  // Calculate totals for THIS member only
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
          borderRadius: 3,
          backgroundImage: 'none',
          boxShadow: theme.shadows[10],
          bgcolor: theme.palette.background.paper
        }
      }}
    >
      {/* --- HEADER --- */}
      <Box sx={{
        px: 3,
        py: 2.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'transparent'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isEditing && (
            <Avatar sx={{ bgcolor: theme.palette.primary.main, color: '#fff', fontWeight: 700, width: 40, height: 40 }}>
              {member.name.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" fontWeight={700}>
                {isEditing ? 'Edit Profile' : member.name}
            </Typography>
            {!isEditing && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {getStatusChip(member.status)}
                <Typography variant="caption" color="text.secondary">Member ID: #{member.id}</Typography>
              </Box>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tab label="Profile" icon={<User size={16} />} iconPosition="start" />
          <Tab label="Contributions" icon={<DollarSign size={16} />} iconPosition="start" />
        </Tabs>

        {tabValue === 0 ? (
        <Box sx={{ p: 4 }}>
          {isEditing ? (
            // EDIT MODE FORM
            <Box component="form" noValidate autoComplete="off">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField 
                      autoFocus 
                      label="Full Name" 
                      name="name" 
                      fullWidth 
                      required
                      variant="outlined" 
                      value={formData.name} 
                      onChange={handleChange} 
                      error={!!errors.name}
                      helperText={errors.name}
                      InputProps={{
                          startAdornment: <InputAdornment position="start"><User size={18} color={theme.palette.text.secondary}/></InputAdornment>
                      }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                      label="Email Address" 
                      name="email" 
                      type="email" 
                      fullWidth 
                      variant="outlined" 
                      value={formData.email} 
                      onChange={handleChange} 
                      InputProps={{
                          startAdornment: <InputAdornment position="start"><Mail size={18} color={theme.palette.text.secondary}/></InputAdornment>
                      }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                      label="Phone Number" 
                      name="phone" 
                      type="tel" 
                      fullWidth 
                      variant="outlined" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      InputProps={{
                          startAdornment: <InputAdornment position="start"><Phone size={18} color={theme.palette.text.secondary}/></InputAdornment>
                      }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                      label="Residential Address" 
                      name="address" 
                      fullWidth 
                      variant="outlined" 
                      value={formData.address} 
                      onChange={handleChange} 
                      InputProps={{
                          startAdornment: <InputAdornment position="start"><MapPin size={18} color={theme.palette.text.secondary}/></InputAdornment>
                      }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="branch-select-label">Branch Attending</InputLabel>
                    <Select
                      labelId="branch-select-label"
                      id="branch-select"
                      value={formData.branch}
                      onChange={handleChange}
                      label="Branch Attending"
                      name="branch"
                      startAdornment={
                        <InputAdornment position="start">
                          <Building size={18} color={theme.palette.text.secondary} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="Langma">Langma</MenuItem>
                      <MenuItem value="Mallam">Mallam</MenuItem>
                      <MenuItem value="Kokrobetey">Kokrobetey</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          ) : (
            // VIEW MODE DETAILS
            <Grid container spacing={3}>
              <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Mail size={18} color={theme.palette.text.secondary} />
                      <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>EMAIL</Typography>
                          <Typography variant="body1">{member.email || 'N/A'}</Typography>
                      </Box>
                  </Box>
              </Grid>
              <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Phone size={18} color={theme.palette.text.secondary} />
                      <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>PHONE</Typography>
                          <Typography variant="body1">{member.phone || 'N/A'}</Typography>
                      </Box>
                  </Box>
              </Grid>
              <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <MapPin size={18} color={theme.palette.text.secondary} />
                      <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>ADDRESS</Typography>
                          <Typography variant="body1">{member.address || 'N/A'}</Typography>
                      </Box>
                  </Box>
              </Grid>
              <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Building size={18} color={theme.palette.text.secondary} />
                      <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>BRANCH</Typography>
                          <Typography variant="body1">{member.branch || 'N/A'}</Typography>
                      </Box>
                  </Box>
              </Grid>
            </Grid>
          )}
        </Box>
        ) : (
          // CONTRIBUTIONS TAB
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: theme.palette.primary.light, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DollarSign size={20} color={theme.palette.primary.main} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Tithe</Typography>
                      <Typography variant="h6" fontWeight={700}>GHC{totalTithe.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: theme.palette.success.light, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HeartHandshake size={20} color={theme.palette.success.main} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Welfare</Typography>
                      <Typography variant="h6" fontWeight={700}>GHC{totalWelfare.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Add New Contribution</Typography>
            <Card sx={{ p: 2, mb: 3, bgcolor: theme.palette.action.hover }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    value={newContribution.type}
                    onChange={(e) => setNewContribution({ ...newContribution, type: e.target.value })}
                    SelectProps={{ native: true }}
                    size="small"
                  >
                    <option value="tithe">Tithe</option>
                    <option value="welfare">Welfare</option>
                    <option value="other">Other</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={newContribution.amount}
                    onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">GHC</InputAdornment>
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={newContribution.description}
                    onChange={(e) => setNewContribution({ ...newContribution, description: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddContribution} fullWidth>
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Card>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Contribution History</Typography>
            <List sx={{ maxHeight: 250, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
              {loadingContributions ? (
                <ListItem><Typography variant="body2">Loading...</Typography></ListItem>
              ) : contributions.length === 0 ? (
                <ListItem><Typography variant="body2" color="text.secondary">No contributions recorded yet.</Typography></ListItem>
              ) : (
                contributions.map((c, index) => (
                  <React.Fragment key={c.id || index}>
                    <ListItem sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Chip 
                          label={c.type.charAt(0).toUpperCase() + c.type.slice(1)} 
                          size="small" 
                          color={c.type === 'tithe' ? 'primary' : c.type === 'welfare' ? 'success' : 'default'}
                          variant="outlined"
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={600}>GHC{Number(c.amount).toLocaleString()}</Typography>
                          {c.description && <Typography variant="caption" color="text.secondary">{c.description}</Typography>}
                        </Box>
                        <Typography variant="caption" color="text.secondary">{c.date}</Typography>
                      </Box>
                    </ListItem>
                    {index < contributions.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, pt: 1, justifyContent: 'space-between' }}>
        {isEditing ? (
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleCancelEdit} variant="outlined" color="inherit" startIcon={<ArrowLeft size={16}/>}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" startIcon={<Save size={16}/>}>Save Changes</Button>
            </Box>
        ) : (
            <>
                <Button onClick={() => onDelete(member.id)} variant="outlined" color="error" startIcon={<Trash2 size={16} />}>Delete Member</Button>
                <Button onClick={() => setIsEditing(true)} variant="contained" color="primary" startIcon={<Edit size={16} />}>Edit Profile</Button>
            </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailsDialog;