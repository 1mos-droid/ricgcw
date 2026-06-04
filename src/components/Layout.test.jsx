import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import AppLayout from './Layout';

// Mock contexts
vi.mock('../context/WorkspaceContext', () => ({
  useWorkspace: () => ({
    userRole: 'admin',
    workspace: 'main',
    currentDepartment: 'Sanctuary',
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    logout: vi.fn(),
  }),
}));

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

describe('AppLayout Responsiveness and Styling', () => {
  const theme = createTheme();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLayout = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <AppLayout>
            <div data-testid="child-content">Main Content</div>
          </AppLayout>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('renders bottom navigation on mobile screen', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    renderLayout();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('does not render bottom navigation on desktop screen', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    renderLayout();

    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('applies premium glassmorphism styling to bottom navigation on mobile', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    renderLayout();

    const bottomNav = screen.getByText('Home').closest('.MuiBottomNavigation-root');
    expect(bottomNav).toBeInTheDocument();
    expect(bottomNav).toHaveStyle({
      backdropFilter: 'blur(20px)',
    });
  });

  it('opens mobile more menu when clicking More tab', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    renderLayout();

    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    expect(screen.getByText('Explore')).toBeInTheDocument();
  });
});
