import React from 'react';
import { Box, Typography, Paper, Stack, useTheme } from '@mui/material';

const KanbanBoard = ({ columns = [], data = {} }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, minHeight: '500px' }}>
      {columns.map((column) => (
        <Box
          key={column.id}
          sx={{
            minWidth: '300px',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {column.title.toUpperCase()}
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              {data[column.id]?.length || 0}
            </Box>
          </Box>

          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            {data[column.id]?.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  cursor: 'grab',
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'light' 
                      ? '0 10px 20px rgba(0,0,0,0.05)' 
                      : '0 10px 20px rgba(0,0,0,0.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {item.content}
              </Paper>
            ))}
            
            {(!data[column.id] || data[column.id].length === 0) && (
              <Box
                sx={{
                  height: '100px',
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
                  Empty
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

export default KanbanBoard;
