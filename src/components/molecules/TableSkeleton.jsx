import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
  useTheme,
  alpha
} from '@mui/material';

/**
 * Reusable table skeleton loader matching MasterDataGrid styling.
 * Prevents layout shifts during asynchronous data fetches per decision D-06.
 *
 * @param {Object} props
 * @param {number} [props.rows=5] - Number of skeleton rows to render
 * @param {number} [props.columns=4] - Number of skeleton columns per row
 * @param {number} [props.height=48] - Row height in pixels
 * @param {boolean} [props.showHeader=true] - Whether to render a skeleton header row
 * @param {Object} [props.sx] - Additional MUI styling overrides
 */
const TableSkeleton = ({
  rows = 5,
  columns = 4,
  height = 48,
  showHeader = true,
  sx = {}
}) => {
  const theme = useTheme();

  // Deterministic varying cell widths to mimic natural data variation
  const getCellWidth = (rowIndex, colIndex) => {
    const widths = ['85%', '60%', '95%', '70%', '50%', '75%'];
    return widths[(rowIndex + colIndex) % widths.length];
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        overflow: 'hidden',
        ...sx
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        {showHeader && (
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.text.primary, 0.02) }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`header-${colIndex}`} sx={{ py: 1.5 }}>
                  <Skeleton
                    variant="text"
                    width={colIndex === 0 ? '70%' : '50%'}
                    height={24}
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow
              key={`row-${rowIndex}`}
              sx={{
                height,
                '&:last-child td, &:last-child th': { border: 0 },
                '&:nth-of-type(even)': {
                  bgcolor: alpha(theme.palette.text.primary, 0.01)
                }
              }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`} sx={{ py: 1.5 }}>
                  <Skeleton
                    variant="rounded"
                    width={getCellWidth(rowIndex, colIndex)}
                    height={20}
                    sx={{
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.text.primary, 0.05)
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;
