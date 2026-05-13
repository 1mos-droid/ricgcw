import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  TextField, 
  Button, 
  CircularProgress, 
  Stack, 
  alpha, 
  useTheme,
  Paper,
  InputAdornment,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider
} from '@mui/material';
import { 
  UserPlus, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Cake, 
  Building, 
  Users, 
  Briefcase, 
  Globe,
  CheckCircle2,
  Heart,
  Waves,
  Cross,
  Baby
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useWorkspace } from '../context/WorkspaceContext';
import { getDepartmentByAge } from '../utils/dateUtils';

const Join = () => {
  const theme = useTheme();
  const { showNotification } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    dob: '', 
    branch: '', 
    department: '', 
    position: '',   
    membershipType: 'Member',
    baptismDate: '',
    confirmationDate: '',
    occupation: '',
    spouseName: '',
    childrenNames: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
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
    if (!formData.branch) tempErrors.branch = "Please select a branch";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      try {
        const payload = {
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          email: String(formData.email || "").trim() || null,
          phone: String(formData.phone || "").trim() || null,
          address: String(formData.address || "").trim() || null,
          country: String(formData.country || "").trim() || null,
          dob: formData.dob || null,
          department: formData.department || null,
          cellGroup: String(formData.cellGroup || "").trim() || null,
          position: formData.position || null,
          baptismDate: formData.baptismDate || null,
          confirmationDate: formData.confirmationDate || null,
          occupation: String(formData.occupation || "").trim() || null,
          spouseName: String(formData.spouseName || "").trim() || null,
          childrenNames: String(formData.childrenNames || "").trim() || null
        };
        await addDoc(collection(db, "members"), payload);
        setSubmitted(true);
        showNotification("Welcome! Your registration is complete.", "success");
      } catch (err) {
        console.error("Submission error:", err);
        showNotification("Failed to register. Please check your connection.", "error");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Box sx={{ 
            p: 6, 
            borderRadius: 8, 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            mb: 4,
            boxShadow: theme.shadows[10]
          }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: theme.palette.primary.main, mx: 'auto', mb: 3 }}>
                <CheckCircle2 size={50} color="#fff" />
            </Avatar>
            <Typography variant="h3" fontWeight={900} gutterBottom>Welcome to the Family!</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, fontSize: '1.1rem' }}>
                Your details have been successfully added to our directory. We are thrilled to have you as part of <strong>Rhema Inner Court Gospel Church</strong>.
            </Typography>
            <Divider sx={{ my: 4 }} />
            <Typography variant="body2" color="primary" fontWeight={800} sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
                RICGCW IT Administration
            </Typography>
          </Box>
        </motion.div>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Box
                component="img"
                src="/ricgcw.png"
                alt="RICGCW Logo"
                sx={{
                width: 80,
                height: 80,
                mb: 3,
                objectFit: 'contain',
                filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.2)})`
                }}
            />
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={3}>NEW MEMBER REGISTRATION</Typography>
            <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: '-0.03em', mt: 1, mb: 2 }}>Join the Congregation</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
                Welcome home! Please take a moment to provide your details so we can connect with you and serve you better.
            </Typography>
        </Box>

        <Card 
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            sx={{ p: { xs: 3, md: 6 }, borderRadius: 6, boxShadow: theme.shadows[15], border: `1px solid ${theme.palette.divider}` }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 5 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <UserPlus size={24} />
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight={900}>Registry Form</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>COMPLETE ALL REQUIRED FIELDS</Typography>
            </Box>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                {/* --- SECTION 1: IDENTITY --- */}
                <Grid size={{ xs: 12 }}>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>1. IDENTITY & CONTACT</Typography>
                    <Divider sx={{ mb: 3, mt: 0.5, opacity: 0.6 }} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField
                        label="Full Name"
                        name="name"
                        fullWidth
                        required
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><User size={18} color={theme.palette.primary.main} /></InputAdornment>
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
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Mail size={18} color={theme.palette.text.secondary} /></InputAdornment>
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
                            startAdornment: <InputAdornment position="start"><Phone size={18} color={theme.palette.text.secondary} /></InputAdornment>
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
                            startAdornment: <InputAdornment position="start"><Cake size={18} color={theme.palette.text.secondary} /></InputAdornment>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Full Address"
                        name="address"
                        fullWidth
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House Number, Street, City"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><MapPin size={18} color={theme.palette.text.secondary} /></InputAdornment>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Globe size={18} color={theme.palette.text.secondary} /></InputAdornment>
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Grid>
                )}

                {/* --- SECTION 2: CHURCH LIFE --- */}
                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>2. CHURCH LIFE</Typography>
                    <Divider sx={{ mb: 3, mt: 0.5, opacity: 0.6 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required error={!!errors.branch}>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            label="Branch"
                            name="branch"
                            value={formData.branch}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><Building size={18} color={theme.palette.text.secondary} /></InputAdornment>}
                            sx={{ borderRadius: 3 }}
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
                    <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                            label="Department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><Users size={18} color={theme.palette.text.secondary} /></InputAdornment>}
                            sx={{ borderRadius: 3 }}
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
                        <InputLabel>Position (if any)</InputLabel>
                        <Select
                            label="Position (if any)"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><Briefcase size={18} color={theme.palette.text.secondary} /></InputAdornment>}
                            sx={{ borderRadius: 3 }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="Instrumentalist">Instrumentalist</MenuItem>
                            <MenuItem value="Singer">Singer</MenuItem>
                            <MenuItem value="Prayer Warrior">Prayer Warrior</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <FormLabel sx={{ fontWeight: 800, fontSize: '0.75rem', mb: 1, textTransform: 'uppercase', display: 'block' }}>Membership Type</FormLabel>
                        <RadioGroup row name="membershipType" value={formData.membershipType} onChange={handleChange}>
                            <FormControlLabel value="Member" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={700}>Member</Typography>} />
                            <FormControlLabel value="Visitor" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={700}>Visitor</Typography>} />
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
                            startAdornment: <InputAdornment position="start"><Waves size={18} color={theme.palette.text.secondary} /></InputAdornment>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                            startAdornment: <InputAdornment position="start"><Cross size={18} color={theme.palette.text.secondary} /></InputAdornment>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                            startAdornment: <InputAdornment position="start"><Briefcase size={18} color={theme.palette.text.secondary} /></InputAdornment>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Spouse Name"
                        name="spouseName"
                        fullWidth
                        value={formData.spouseName}
                        onChange={handleChange}
                        placeholder="Name of spouse (if any)"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Heart size={18} color={theme.palette.text.secondary} /></InputAdornment>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Children's Names"
                        name="childrenNames"
                        fullWidth
                        value={formData.childrenNames}
                        onChange={handleChange}
                        placeholder="Names of children (comma separated)"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Baby size={18} color={theme.palette.text.secondary} /></InputAdornment>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </Grid>

                <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
                    <Button 
                        fullWidth 
                        type="submit" 
                        variant="contained" 
                        size="large"
                        disabled={submitting}
                        sx={{ 
                            py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                            boxShadow: `0 12px 24px -6px ${alpha(theme.palette.primary.main, 0.4)}`,
                            '&:hover': { boxShadow: `0 16px 32px -8px ${alpha(theme.palette.primary.main, 0.5)}` }
                        }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
                    </Button>
                </Grid>
            </Grid>
          </form>
        </Card>

        <Box sx={{ mt: 8, textAlign: 'center', opacity: 0.6 }}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <Heart size={16} fill={theme.palette.error.main} color={theme.palette.error.main} />
                <Typography variant="body2" fontWeight={800}>Rhema Inner Court Gospel Church - Word Assembly</Typography>
            </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Join;
