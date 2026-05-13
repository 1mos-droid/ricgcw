import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  Box,
  IconButton,
  Typography,
  useTheme,
  Grid,
  Slide,
  InputAdornment,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  alpha,
  Stack,
  Avatar,
  Card,
  CircularProgress,
  Autocomplete,
  Divider
} from '@mui/material';
import { X, UserPlus, User, Mail, Phone, MapPin, Cake, Building, Users, Briefcase, Globe, Waves, Cross, Heart, Baby } from 'lucide-react';
import { getDepartmentByAge } from '../utils/dateUtils';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddMemberDialog = ({ open, onClose, onAddMember }) => {
  const theme = useTheme();
  const { userBranch, isBranchRestricted, currentDepartment, isDepartmentRestricted } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    dob: '', 
    branch: isBranchRestricted ? userBranch : '', 
    department: isDepartmentRestricted ? currentDepartment : '', 
    position: '',   
    membershipType: 'Member',
    baptismDate: '',
    confirmationDate: '',
    occupation: '',
    spouseId: null,
    childrenIds: [],
    spouseName: '',
    childrenNames: ''
  });

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
    if (!open) {
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        country: '',
        dob: '', 
        branch: isBranchRestricted ? userBranch : '', 
        department: isDepartmentRestricted ? currentDepartment : '', 
        position: '',   
        membershipType: 'Member',
        baptismDate: '',
        confirmationDate: '',
        occupation: '',
        spouseId: null,
        childrenIds: [],
        spouseName: '',
        childrenNames: ''
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [open, isBranchRestricted, userBranch, isDepartmentRestricted, currentDepartment]);

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
    if (!String(formData.name || "").trim()) tempErrors.name = "Full Name is required";
    if (!formData.branch) tempErrors.branch = "Branch is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setSubmitting(true);
      try {
        const payload = {
          ...formData,
          status: 'active',
          // Clean up empty strings for optional fields to avoid cluttering DB
          email: String(formData.email || "").trim() || null,
          phone: String(formData.phone || "").trim() || null,
          address: String(formData.address || "").trim() || null,
          country: String(formData.country || "").trim() || null,
          dob: formData.dob || null,
          department: formData.department || null,
          position: formData.position || null,
          baptismDate: formData.baptismDate || null,
          confirmationDate: formData.confirmationDate || null,
          occupation: String(formData.occupation || "").trim() || null,
          spouseId: formData.spouseId || null,
          childrenIds: formData.childrenIds || [],
          spouseName: String(formData.spouseName || "").trim() || null,
          childrenNames: String(formData.childrenNames || "").trim() || null
        };
        await onAddMember(payload);
        // The parent will set open=false upon success, triggering the reset useEffect
      } catch (err) {
        console.error("Submission error:", err);
        setSubmitting(false);
      }
    }
  };

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
        py: 2.5, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.03)
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40, borderRadius: 1.5 }}>
            <UserPlus size={20} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800}>Register Member</Typography>
            <Typography variant="caption" color="text.secondary">Create a new registry entry</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: theme.palette.action.hover }}>
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Box component="form" noValidate autoComplete="off">
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
                placeholder="e.g. John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color={theme.palette.primary.main} />
                    </InputAdornment>
                  ),
                }}
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
                placeholder="john@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
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
                placeholder="+233 XX XXX XXXX"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                fullWidth
                value={formData.dob}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Cake size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Full Address"
                name="address"
                fullWidth
                value={formData.address}
                onChange={handleChange}
                placeholder="House Number, Street, City"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            {formData.branch === 'Diaspora' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Country of Residence"
                  name="country"
                  fullWidth
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. United Kingdom, USA, etc."
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Globe size={18} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                  }}
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
              <FormControl fullWidth required error={!!errors.branch} disabled={isBranchRestricted}>
                <InputLabel id="branch-select-label">Branch</InputLabel>
                <Select
                  labelId="branch-select-label"
                  id="branch-select"
                  value={formData.branch}
                  onChange={handleChange}
                  label="Branch"
                  name="branch"
                  startAdornment={
                    <InputAdornment position="start">
                      <Building size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="Langma">Langma</MenuItem>
                  <MenuItem value="Mallam">Mallam</MenuItem>
                  <MenuItem value="Kokrobitey">Kokrobitey</MenuItem>
                  <MenuItem value="Diaspora">Diaspora</MenuItem>
                </Select>

                {errors.branch && <FormHelperText>{errors.branch}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={isDepartmentRestricted}>
                <InputLabel id="department-select-label">Department</InputLabel>
                <Select
                  labelId="department-select-label"
                  id="department-select"
                  value={formData.department}
                  onChange={handleChange}
                  label="Department"
                  name="department"
                  startAdornment={
                    <InputAdornment position="start">
                      <Users size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  }
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

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="position-select-label">Position</InputLabel>
                <Select
                  labelId="position-select-label"
                  id="position-select"
                  value={formData.position}
                  onChange={handleChange}
                  label="Position"
                  name="position"
                  startAdornment={
                    <InputAdornment position="start">
                      <Briefcase size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Youth Pastor">Youth Pastor</MenuItem>
                  <MenuItem value="Head Pastor">Head Pastor</MenuItem>
                  <MenuItem value="Branch Pastor">Branch Pastor</MenuItem>
                  <MenuItem value="Instrumentalist">Instrumentalist</MenuItem>
                  <MenuItem value="Singer">Singer</MenuItem>
                  <MenuItem value="Prayer Warrior">Prayer Warrior</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1, textTransform: 'uppercase', color: theme.palette.text.secondary }}>Membership Type</FormLabel>
                <RadioGroup
                  row
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Member" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={600}>Member</Typography>} />
                  <FormControlLabel value="Visitor" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={600}>Visitor</Typography>} />
                </RadioGroup>
              </Card>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Waves size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Cross size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
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
                label="Occupation / Profession"
                name="occupation"
                fullWidth
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Software Engineer, Teacher, Merchant"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Briefcase size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Spouse Name (Manual)"
                name="spouseName"
                fullWidth
                value={formData.spouseName}
                onChange={handleChange}
                placeholder="Entry if not linked"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Heart size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Children's Names (Manual)"
                name="childrenNames"
                fullWidth
                value={formData.childrenNames}
                onChange={handleChange}
                placeholder="Entry if not linked"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Baby size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                    options={allMembers.filter(m => m.id !== formData.spouseId)}
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
                    options={allMembers}
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
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={submitting}
          sx={{ borderRadius: 1.5, fontWeight: 700, px: 3, color: theme.palette.text.secondary }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || submitting}
          sx={{ 
            borderRadius: 1.5, 
            fontWeight: 800, 
            px: 4, 
            py: 1.2, 
            boxShadow: theme.shadows[4],
            minWidth: 150
          }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;