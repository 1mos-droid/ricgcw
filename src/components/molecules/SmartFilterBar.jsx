import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Skeleton,
  alpha,
  useTheme
} from '@mui/material';
import { Search, X, Filter } from 'lucide-react';

/**
 * SmartFilterBar Component
 * A highly accessible, responsive, and reusable filter manager.
 * Features:
 * - Local debounced search input to optimize performance under large data sets.
 * - Dynamic generation of select dropdowns based on schema configurations.
 * - Active filter tracking with removable chips.
 * - ARIA keyboard accessible focus management.
 * - Responsive grid mapping.
 */
const SmartFilterBar = ({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filterSchema = [], // Array of: { id, label, options: [{ value, label }] }
  activeFilters = {}, // Object of: { [filterId]: value }
  onFilterChange,
  onClearFilters,
  loading = false,
  totalResults = null,
  debounceMs = 300
}) => {
  const theme = useTheme();
  
  // Local state for search input to allow smooth, instant typing
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Sync local search state with parent prop updates
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Debounced search logic to prevent execution bottlenecks on keypress
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearchChange && localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange, debounceMs, searchValue]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleRemoveFilter = (filterId) => {
    if (onFilterChange) {
      onFilterChange(filterId, '');
    }
  };

  // Determine if there is any active filter or search term
  const hasActiveFilters = Object.values(activeFilters).some((val) => val !== '') || localSearch !== '';

  if (loading) {
    return (
      <Box sx={{ width: '100%', mb: 4 }} data-testid="filter-bar-skeleton">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 3, flexGrow: 3 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 3, flexGrow: 1, minWidth: 150 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 3, flexGrow: 1, minWidth: 150 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box 
      component="section" 
      aria-label="Data filters" 
      sx={{ 
        width: '100%', 
        mb: 4,
        p: 2.5,
        borderRadius: 5,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.02)}`
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: hasActiveFilters ? 2 : 0 }}>
        {/* Search Input Container */}
        <Box role="search" sx={{ flexGrow: 3, width: '100%' }}>
          <TextField
            fullWidth
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={handleSearchChange}
            aria-label={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={theme.palette.primary.main} />
                </InputAdornment>
              ),
              endAdornment: localSearch && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={handleClearSearch}
                    aria-label="Clear search text"
                    sx={{ color: 'text.secondary' }}
                  >
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 3.5, 
                height: 56,
                bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.4)
              }
            }}
          />
        </Box>

        {/* Dynamic Select Filters */}
        {filterSchema.map((filter) => (
          <FormControl 
            key={filter.id} 
            sx={{ 
              minWidth: { xs: '100%', md: 170 },
              flexGrow: 1 
            }}
          >
            <InputLabel id={`label-${filter.id}`}>{filter.label}</InputLabel>
            <Select
              labelId={`label-${filter.id}`}
              id={`select-${filter.id}`}
              value={activeFilters[filter.id] || ''}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              label={filter.label}
              sx={{ 
                borderRadius: 3.5, 
                height: 56,
                bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.default, 0.4)
              }}
            >
              <MenuItem value=""><em>All {filter.label}s</em></MenuItem>
              {filter.options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Stack>

      {/* Active Filter Chips & Results Count */}
      {hasActiveFilters && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 2,
            pt: 2,
            borderTop: `1px dashed ${alpha(theme.palette.divider, 0.15)}`
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Filter size={14} style={{ opacity: 0.6 }} />
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mr: 1 }}>
              Active Filters:
            </Typography>

            {/* Render search term chip */}
            {localSearch && (
              <Chip
                label={`Search: "${localSearch}"`}
                size="small"
                onDelete={handleClearSearch}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            )}

            {/* Render filter values chips */}
            {Object.entries(activeFilters).map(([filterId, val]) => {
              if (!val) return null;
              const schema = filterSchema.find(f => f.id === filterId);
              const option = schema?.options.find(o => o.value === val);
              const label = option ? option.label : val;
              
              return (
                <Chip
                  key={filterId}
                  label={`${schema?.label}: ${label}`}
                  size="small"
                  onDelete={() => handleRemoveFilter(filterId)}
                  color="secondary"
                  variant="outlined"
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                />
              );
            })}

            {/* Clear All button */}
            <Typography 
              variant="caption" 
              onClick={onClearFilters}
              tabIndex={0}
              role="button"
              aria-label="Clear all active filters"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClearFilters(); }}
              sx={{ 
                fontWeight: 900, 
                color: theme.palette.error.main, 
                cursor: 'pointer',
                pl: 1,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Clear All
            </Typography>
          </Stack>

          {/* Results Tracker */}
          {totalResults !== null && (
            <Typography 
              variant="body2" 
              fontWeight={700} 
              color="text.secondary"
              aria-live="polite"
            >
              Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SmartFilterBar;
