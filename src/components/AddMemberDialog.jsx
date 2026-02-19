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
  FormLabel
} from '@mui/material';
import { X, UserPlus, User, Mail, Phone, MapPin, Cake, Building, Users, Briefcase } from 'lucide-react'; // 🟢 Added Icons

// Transition for the Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddMemberDialog = ({ open, onClose, onAddMember }) => {
  const theme = useTheme();
  const { userBranch, isBranchRestricted } = useWorkspace();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '', 
    branch: isBranchRestricted ? userBranch : '', 
    department: '', // 🟢 Added department state
    position: '',   // 🟢 Added position state
    membershipType: 'Member',
  });

  // Error State
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        dob: '', 
        branch: isBranchRestricted ? userBranch : '', 
        department: '', // 🟢 Reset
        position: '',   // 🟢 Reset
        membershipType: 'Member' 
      });
      setErrors({});
    }
  }, [open, isBranchRestricted, userBranch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Full Name is required";
    if (!formData.branch) tempErrors.branch = "Branch attending is required";
    // Optional: Add email/phone validation regex here if needed
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onAddMember(formData);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[10],
          bgcolor: theme.palette.background.paper,
          backgroundImage: 'none'
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
        bgcolor: theme.palette.primary.main,
        color: '#fff'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UserPlus size={22} color="#fff" />
          <Typography variant="h6" fontWeight={700}>Add New Member</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* --- CONTENT --- */}
      <DialogContent sx={{ p: 4 }}>
        <Box component="form" noValidate autoComplete="off">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the details below to register a new member into the directory.
          </Typography>

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
                placeholder="e.g. John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
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
                placeholder="john@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
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
                placeholder="+233 XX XXX XXXX"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* 🟢 NEW: Date of Birth Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.dob}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true, // Forces label to stay up
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Cake size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Address adjusted to share row or full width depending on your preference. 
                Here it shares a row if you want, or you can make Address full width. 
                Let's make Address share the row with DOB to keep it compact, or full width. 
                Below is sharing row (sm=6) to balance the grid. */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Residential Address"
                name="address"
                fullWidth
                variant="outlined"
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
              />
            </Grid>

            {/* 🟢 NEW: Branch Selection Field */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required error={!!errors.branch} disabled={isBranchRestricted}>
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
                {errors.branch && <FormHelperText>{errors.branch}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* 🟢 NEW: Department Selection Field */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
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
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Children's Department">Children's Department</MenuItem>
                  <MenuItem value="Youth">Youth</MenuItem>
                  <MenuItem value="Mens">Mens</MenuItem>
                  <MenuItem value="Women">Women</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 🟢 NEW: Position Selection Field */}
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth variant="outlined">
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
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Youth Pastor">Youth Pastor</MenuItem>
                  <MenuItem value="Head Pastor">Head Pastor</MenuItem>
                  <MenuItem value="Branch Pastor">Branch Pastor</MenuItem>
                  <MenuItem value="Instrumentalist">Instrumentalist</MenuItem>
                  <MenuItem value="Singer">Singer</MenuItem>
                  <MenuItem value="Prayer Warrior">Prayer Warrior</MenuItem>
                  <MenuItem value="Other">Other Positions</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Membership Type</FormLabel>
                <RadioGroup
                  row
                  aria-label="membership-type"
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Member" control={<Radio />} label="Member" />
                  <FormControlLabel value="Visitor" control={<Radio />} label="Visitor" />
                </RadioGroup>
              </FormControl>
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      {/* --- ACTIONS --- */}
      <DialogActions sx={{ px: 4, pb: 4, pt: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, border: `1px solid ${theme.palette.divider}` }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disableElevation
          disabled={!formData.name}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 4 }}
        >
          Save Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;