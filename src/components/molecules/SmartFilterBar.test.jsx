import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import SmartFilterBar from './SmartFilterBar';

describe('SmartFilterBar Molecule Unit Tests', () => {
  const theme = createTheme();
  
  const mockFilterSchema = [
    { 
      id: 'branch', 
      label: 'Branch', 
      options: [
        { value: 'Mallam', label: 'Mallam' },
        { value: 'Kokrobitey', label: 'Kokrobitey' }
      ] 
    },
    { 
      id: 'status', 
      label: 'Status', 
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ] 
    }
  ];

  const defaultProps = {
    searchPlaceholder: "Search members...",
    searchValue: "",
    onSearchChange: vi.fn(),
    filterSchema: mockFilterSchema,
    activeFilters: { branch: "", status: "" },
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    totalResults: 42,
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <SmartFilterBar {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  it('renders search input and dropdown selects correctly', () => {
    renderComponent();
    
    // Check search input presence
    expect(screen.getByPlaceholderText('Search members...')).toBeInTheDocument();
    
    // Check branch and status selectors exist
    expect(screen.getByLabelText('Branch')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading is true', () => {
    renderComponent({ loading: true });
    
    // Should display skeleton layout
    expect(screen.getByTestId('filter-bar-skeleton')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search members...')).not.toBeInTheDocument();
  });

  it('debounces the search change callback', async () => {
    renderComponent({ debounceMs: 100 });
    
    const input = screen.getByPlaceholderText('Search members...');
    fireEvent.change(input, { target: { value: 'Kwame' } });
    
    // Instantly should NOT trigger callback
    expect(defaultProps.onSearchChange).not.toHaveBeenCalled();
    
    // Wait for debounce period (100ms + margin)
    await waitFor(() => {
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('Kwame');
    });
  });

  it('triggers onFilterChange when a select option is selected', () => {
    renderComponent();
    
    // Trigger branch change (simulate select interaction)
    const selectEl = screen.getByLabelText('Branch');
    fireEvent.mouseDown(selectEl); // Open select dropdown
    
    // Wait for the dropdown options and click Kokrobitey
    const option = screen.getByRole('option', { name: 'Kokrobitey' });
    fireEvent.click(option);
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('branch', 'Kokrobitey');
  });

  it('displays active filter chips and allows removing them', () => {
    renderComponent({
      searchValue: "Kwame",
      activeFilters: { branch: "Mallam", status: "" }
    });

    // Check chips
    expect(screen.getByText('Search: "Kwame"')).toBeInTheDocument();
    expect(screen.getByText('Branch: Mallam')).toBeInTheDocument();

    // Verify total results displayed
    expect(screen.getByText('Found 42 results')).toBeInTheDocument();

    // Click remove branch chip
    const branchChip = screen.getByText('Branch: Mallam').closest('.MuiChip-root');
    const deleteBranchBtn = branchChip.querySelector('.MuiChip-deleteIcon');
    fireEvent.click(deleteBranchBtn);
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('branch', '');

    // Click remove search chip (which clears search text)
    const searchChip = screen.getByText('Search: "Kwame"').closest('.MuiChip-root');
    const deleteSearchBtn = searchChip.querySelector('.MuiChip-deleteIcon');
    fireEvent.click(deleteSearchBtn);
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
  });

  it('triggers onClearFilters when Clear All button is clicked', () => {
    renderComponent({
      searchValue: "Kwame",
      activeFilters: { branch: "Mallam", status: "" }
    });

    const clearAllBtn = screen.getByRole('button', { name: 'Clear all active filters' });
    fireEvent.click(clearAllBtn);
    
    expect(defaultProps.onClearFilters).toHaveBeenCalled();
  });
});
