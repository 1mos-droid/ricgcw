import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  useTheme,
  alpha,
  Card,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const RBACMatrix = ({ roles = [], initialPermissions = {}, onSave }) => {
  const theme = useTheme();
  const [permissions, setPermissions] = useState(initialPermissions);

  const handleCheckboxChange = (permKey, role) => {
    setPermissions((prev) => {
      const updatedPerm = { ...prev[permKey] };
      updatedPerm[role] = !updatedPerm[role];
      return {
        ...prev,
        [permKey]: updatedPerm,
      };
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(permissions);
    }
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1]
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Permissions Matrix
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Specify access control thresholds for pages and member profile fields.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
        >
          Save Permissions
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Permission / Field Scope
              </TableCell>
              {roles.map((role) => (
                <TableCell
                  key={role}
                  align="center"
                  sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  {role}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(permissions).map((permKey) => (
              <TableRow key={permKey} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {permKey}
                </TableCell>
                {roles.map((role) => {
                  const isChecked = !!permissions[permKey]?.[role];
                  return (
                    <TableCell key={role} align="center">
                      <Checkbox
                        data-testid={`cb-${permKey}-${role}`}
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(permKey, role)}
                        color="primary"
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default RBACMatrix;
