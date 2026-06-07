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

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden', boxShadow: 'none' }}>
        {(title || actions) && (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Box>{actions}</Box>
          </Box>
        )}
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
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
                    sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={() => {
                        if (onRowClick) onRowClick(row.id);
                      }}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
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
                            inputProps={{ 'aria-labelledby': labelId }}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 700,
              fontSize: '0.8rem',
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default MasterDataGrid;
