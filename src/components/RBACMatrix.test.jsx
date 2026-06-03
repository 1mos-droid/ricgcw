import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RBACMatrix from './RBACMatrix';
import { ThemeProvider, createTheme } from '@mui/material';

describe('RBACMatrix Configuration Screen', () => {
  const theme = createTheme();
  
  const mockRoles = ['admin', 'branch_admin', 'youth_leader', 'guest'];
  const mockPermissions = {
    'view_phone': { admin: true, branch_admin: true, youth_leader: true, guest: false },
    'view_financials': { admin: true, branch_admin: true, youth_leader: false, guest: false },
    'edit_members': { admin: true, branch_admin: true, youth_leader: false, guest: false },
  };

  const renderMatrix = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <RBACMatrix
          roles={mockRoles}
          initialPermissions={mockPermissions}
          onSave={vi.fn()}
          {...props}
        />
      </ThemeProvider>
    );
  };

  it('renders a grid table with roles and permission keys', () => {
    renderMatrix();
    // Headers
    expect(screen.getByText('Permissions Matrix')).toBeInTheDocument();
    expect(screen.getByText('youth_leader')).toBeInTheDocument();
    
    // Rows
    expect(screen.getByText('view_financials')).toBeInTheDocument();
  });

  it('updates permissions when checkboxes are clicked and triggers save', () => {
    const onSave = vi.fn();
    renderMatrix({ onSave });

    // Find checkbox for view_financials for youth_leader (which is initially false)
    const checkbox = screen.getByTestId('cb-view_financials-youth_leader').querySelector('input');
    expect(checkbox.checked).toBe(false);

    // Toggle it
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Save
    const saveBtn = screen.getByText('Save Permissions');
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalled();
    const savedConfig = onSave.mock.calls[0][0];
    expect(savedConfig['view_financials']['youth_leader']).toBe(true);
  });
});
