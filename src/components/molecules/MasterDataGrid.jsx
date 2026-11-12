import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TablePagination,
  TableSortLabel,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import ActionButton from '../atoms/ActionButton';

const MasterDataGrid = ({
  columns = [],
  rows = [],
  title,
  actions,
  onRowClick,
  selectable = true,
  selected = [],
  onSelectionChange,
  pagination = true,
  sortable = true,
}) => {
  const theme = useTheme();
  const [localSelected, setLocalSelected] = useState([]);
  const activeSelected = onSelectionChange ? selected : localSelected;
  const setActiveSelected = onSelectionChange ? onSelectionChange : setLocalSelected;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setActiveSelected(newSelected);
      return;
    }
    setActiveSelected([]);
  };

  const handleCheckboxClick = (id) => {
    const selectedIndex = activeSelected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(activeSelected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(activeSelected.slice(1));
    } else if (selectedIndex === activeSelected.length - 1) {
      newSelected = newSelected.concat(activeSelected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        activeSelected.slice(0, selectedIndex),
        activeSelected.slice(selectedIndex + 1)
      );
    }

    setActiveSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = (id) => activeSelected.indexOf(id) !== -1;
  const sortedRows = orderBy ? [...rows].sort((first, second) => {
    const left = first[orderBy] ?? '';
    const right = second[orderBy] ?? '';
    const comparison = typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right), undefined, { numeric: true });
    return order === 'asc' ? comparison : -comparison;
  }) : rows;
  const safePage = Math.min(page, Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1));

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden', boxShadow: 'none' }}>
        {(title || actions) && (
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>{actions}</Box>
          </Box>
        )}
        <TableContainer sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table sx={{ minWidth: 650 }} aria-label={title || 'Records'} size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)' }}>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={activeSelected.length > 0 && activeSelected.length < rows.length}
                      checked={rows.length > 0 && activeSelected.length === rows.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all items' }}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    padding={column.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === column.id ? order : false}
                    sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}
                  >
                    {sortable ? <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel> : column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(pagination ? sortedRows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage) : sortedRows)
                .map((row) => {
                  const isItemSelected = isSelected(row.id);

                  return (
                    <TableRow
                      hover
                      onClick={() => {
                        if (onRowClick) onRowClick(row.id);
                      }}
                      aria-selected={isItemSelected}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={(event) => {
                        if (event.target === event.currentTarget && onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          onRowClick(row.id);
                        }
                      }}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ 
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.mode === 'light' ? 'rgba(16, 52, 166, 0.04)' : 'rgba(212, 175, 55, 0.05)',
                        },
                        '&:hover': {
                           backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02) !important' : 'rgba(255,255,255,0.02) !important',
                        }
                      }}
                    >
                      {selectable && (
                        <TableCell 
                          padding="checkbox"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxClick(row.id);
                          }}
                        >
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onChange={() => {}}
                            inputProps={{ 'aria-label': `Select ${row.name || row.id}` }}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.align || 'left'}
                            sx={{ fontWeight: 600, color: 'text.primary' }}
                          >
                            {column.render ? column.render(value, row) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination && <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={safePage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 700,
              fontSize: '0.8rem',
            }
          }}
        />}
      </Paper>
    </Box>
  );
};

export default MasterDataGrid;
