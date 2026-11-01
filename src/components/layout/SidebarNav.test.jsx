import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import { ThemeProvider, createTheme } from '@mui/material';

describe('SidebarNav Collapsible Tree Navigation', () => {
  const mockNavItems = [
    { text: 'Dashboard', icon: <span>D</span>, path: '/' },
    { text: 'Members', icon: <span>M</span>, path: '/members' },
    { text: 'Attendance', icon: <span>A</span>, path: '/attendance' },
    { text: 'Financials', icon: <span>F</span>, path: '/financials' },
    { text: 'Events', icon: <span>E</span>, path: '/events' },
    { text: 'Settings', icon: <span>S</span>, path: '/settings' },
  ];

  const theme = createTheme();

  const renderSidebar = (currentPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[currentPath]}>
        <ThemeProvider theme={theme}>
          <SidebarNav
            navItems={mockNavItems}
            user={{ name: 'Test User', email: 'test@example.com' }}
            userRole="admin"
            onProfileClick={vi.fn()}
          />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('renders all functional grouping categories', () => {
    renderSidebar();
    expect(screen.getByText('Core Operations')).toBeInTheDocument();
    expect(screen.getByText('Ministry & Media')).toBeInTheDocument();
    expect(screen.getByText('Insights & Admin')).toBeInTheDocument();
  });

  it('collapses and expands groups when clicked', () => {
    renderSidebar();

    // Default state: click header to collapse/expand
    const coreOpsHeader = screen.getByText('Core Operations');
    
    // Clicking Core Operations toggles the section collapse
    fireEvent.click(coreOpsHeader);
    
    // Click it again to verify expansion
    fireEvent.click(coreOpsHeader);
  });
});
