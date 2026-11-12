import React from 'react';
import { Box, Typography } from '@mui/material';
import Loader from './ui/kokonut/Loader';

export default function BrandLoader({ label = 'Preparing your workspace' }) {
  return (
    <Box role="status" aria-live="polite" sx={{ minHeight: '55dvh', display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 2, p: 3 }}>
      <Loader title="RICGCW" subtitle={label}>
        <img src="/ricgcw.png" alt="" width="36" height="36" />
      </Loader>
      <Typography variant="caption" color="text.secondary">CHURCH • PEOPLE • PURPOSE</Typography>
    </Box>
  );
}
