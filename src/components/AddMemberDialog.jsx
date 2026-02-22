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
  CircularProgress
} from '@mui/material';
import { X, UserPlus, User, Mail, Phone, MapPin, Cake, Building, Users, Briefcase } from 'lucide-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddMemberDialog = ({ open, onClose, onAddMember }) => {
  const theme = useTheme();
  const { userBranch, isBranchRestricted } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '', 
    branch: isBranchRestricted ? userBranch : '', 
    department: '', 
    position: '',   
    membershipType: 'Member',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        dob: '', 
        branch: isBranchRestricted ? userBranch : '', 
        department: '', 
        position: '',   
        membershipType: 'Member' 
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [open, isBranchRestricted, userBranch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Full Name is required";
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
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          dob: formData.dob || null,
          department: formData.department || null,
          position: formData.position || null
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
          borderRadius: 4,
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
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40, borderRadius: 2.5 }}>
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

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2.5}>
            
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Residential Address"
                name="address"
                fullWidth
                value={formData.address}
                onChange={handleChange}
                placeholder="City / Area"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
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
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="Langma">Langma</MenuItem>
                  <MenuItem value="Mallam">Mallam</MenuItem>
                  <MenuItem value="Kokrobetey">Kokrobetey</MenuItem>
                </Select>
                {errors.branch && <FormHelperText>{errors.branch}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
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
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Children's Department">Children's Dept</MenuItem>
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
                  sx={{ borderRadius: 3 }}
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
              <Card variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
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

          </Grid>
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={submitting}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 3, color: theme.palette.text.secondary }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || submitting}
          sx={{ 
            borderRadius: 2.5, 
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