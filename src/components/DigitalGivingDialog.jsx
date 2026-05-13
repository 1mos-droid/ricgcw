import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Stack, 
  Typography, 
  InputAdornment, 
  Box,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import { CreditCard, Wallet, HeartHandshake } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useWorkspace } from '../context/WorkspaceContext';

const DigitalGivingDialog = ({ open, onClose, user, memberProfile }) => {
  const theme = useTheme();
  const { showNotification } = useWorkspace();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('tithe');
  const [loading, setLoading] = useState(false);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email,
    amount: Number(amount) * 100, // Paystack works in pesewas/kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: 'GHS',
    metadata: {
        memberName: memberProfile?.name || user?.name,
        memberId: memberProfile?.id,
        givingType: type
    }
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference) => {
    setLoading(true);
    try {
        const payload = {
            amount: Number(amount),
            description: `${type.toUpperCase()} - Digital Giving`,
            type: 'contribution',
            category: memberProfile?.branch || user?.branch || 'Main',
            date: new Date().toISOString(),
            memberId: memberProfile?.id,
            memberName: memberProfile?.name || user?.name,
            paymentReference: reference.reference,
            givingType: type,
            isDigital: true
        };

        await addDoc(collection(db, "transactions"), payload);
        showNotification(`Thank you! Your ${type} has been recorded.`, "success");
        setAmount('');
        onClose();
    } catch (err) {
        console.error("Firestore save failed after payment:", err);
        showNotification("Payment successful, but failed to record in database. Please contact support.", "error");
    } finally {
        setLoading(false);
    }
  };

  const onCanceled = () => {
    showNotification("Payment canceled.", "info");
  };

  const handlePay = () => {
    if (!amount || Number(amount) <= 0) {
        showNotification("Please enter a valid amount.", "warning");
        return;
    }
    if (!config.publicKey || config.publicKey.includes('your_public_key')) {
        showNotification("Paystack is not properly configured.", "error");
        return;
    }
    initializePayment(onSuccess, onCanceled);
  };

  return (
    <Dialog 
        open={open} 
        onClose={onClose}
        PaperProps={{ sx: { borderRadius: 6, width: '100%', maxWidth: 400, p: 1 } }}
    >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 1 }}>
            Secure Digital Giving
        </DialogTitle>
        <DialogContent>
            <Box sx={{ mb: 3, p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontWeight: 600 }}>
                    Support the ministry via MoMo or Card. Transactions are processed securely by Paystack.
                </Typography>
            </Box>
            
            <Stack spacing={3}>
                <TextField 
                    fullWidth 
                    select 
                    label="Giving Category" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                >
                    <MenuItem value="tithe">Tithe</MenuItem>
                    <MenuItem value="welfare">Welfare</MenuItem>
                    <MenuItem value="offering">Offering</MenuItem>
                    <MenuItem value="pledge">Pledge</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </TextField>

                <TextField 
                    fullWidth 
                    label="Amount" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    InputProps={{ 
                        startAdornment: <InputAdornment position="start">GHC</InputAdornment> 
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                />

                <Box sx={{ p: 2, borderRadius: 3, border: `1px dashed ${theme.palette.divider}` }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Wallet size={16} color={theme.palette.text.secondary} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                            Supported: MTN MoMo, Telecel, AT, Cards
                        </Typography>
                    </Stack>
                </Box>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={onClose} sx={{ fontWeight: 700, borderRadius: 4, color: 'text.secondary' }}>Cancel</Button>
            <Button 
                variant="contained" 
                fullWidth
                onClick={handlePay} 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CreditCard size={18} />}
                sx={{ fontWeight: 800, borderRadius: 4, py: 1.5 }}
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </Button>
        </DialogActions>
    </Dialog>
  );
};

export default DigitalGivingDialog;
