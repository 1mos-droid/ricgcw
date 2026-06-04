import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopAppBar from './TopAppBar';
import { ThemeProvider, createTheme } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';

// Mock contexts
vi.mock('../../context/WorkspaceContext', () => ({
  useWorkspace: () => ({
    workspace: 'main',
    currentDepartment: 'Sanctuary',
    userBranch: 'all',
    userRole: 'admin',
    mimicData: null,
    startMimicking: vi.fn(),
    stopMimicking: vi.fn(),
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com', role: 'admin', branch: 'all' },
  }),
}));

describe('TopAppBar Upgrades', () => {
  const theme = createTheme();

  const renderTopAppBar = (props = {}) => {
    return render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <TopAppBar
            open={true}
            isMobile={false}
            workspace="main"
            currentDepartment="Sanctuary"
            user={{ name: 'Test User', email: 'test@example.com', role: 'admin', branch: 'all' }}
            onProfileClick={vi.fn()}
            {...props}
          />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('renders active campus and department status', () => {
    renderTopAppBar();
    expect(screen.getByText('Sanctuary')).toBeInTheDocument();
  });

  it('renders system health operational indicator', () => {
    renderTopAppBar();
    expect(screen.getByText(/System: Healthy/i)).toBeInTheDocument();
  });

  it('renders campus switcher dropdown and handles change', () => {
    renderTopAppBar();
    
    // Check if campus switcher button exists
    const switcher = screen.getByLabelText(/Select Campus/i);
    expect(switcher).toBeInTheDocument();

    // Click to open selection
    fireEvent.mouseDown(switcher);
    
    // Check for campus names in dropdown options
    expect(screen.getByText('Kokrobitey')).toBeInTheDocument();
    expect(screen.getByText('Mallam')).toBeInTheDocument();
    expect(screen.getByText('Langma')).toBeInTheDocument();
  });

  it('renders search icon button on mobile screen', () => {
    renderTopAppBar({ isMobile: true });
    const searchButton = screen.getByRole('button', { name: /open search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('does not render search icon button on desktop screen', () => {
    renderTopAppBar({ isMobile: false });
    const searchButton = screen.queryByRole('button', { name: /open search/i });
    expect(searchButton).not.toBeInTheDocument();
  });

  it('does not render system health text on mobile screen', () => {
    renderTopAppBar({ isMobile: true });
    expect(screen.queryByText(/System: Healthy/i)).not.toBeInTheDocument();
  });

  it('opens search command palette on Cmd+K keyboard shortcut', () => {
    renderTopAppBar();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByPlaceholderText(/Type a command or search.../i)).toBeInTheDocument();
  });
});
