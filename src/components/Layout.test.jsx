import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

const mockLogout = vi.fn();
let mockUser = { name: 'Test User', email: 'test@example.com' };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    get user() { return mockUser; },
    logout: mockLogout,
  }),
}));

vi.mock('./layout/EventsGateway', () => ({
  default: vi.fn(({ open, onProceed }) => 
    open ? <div data-testid="events-gateway" onClick={onProceed}>Events Gateway Mock</div> : null
  )
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
      backdropFilter: 'blur(30px) saturate(180%)',
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

describe('AppLayout Inactivity Timeout and Events Gateway', () => {
  const theme = createTheme();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUser = { name: 'Test User', email: 'test@example.com' };
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

  it('renders EventsGateway on login when not yet seen', () => {
    renderLayout();
    expect(screen.getByTestId('events-gateway')).toBeInTheDocument();
  });

  it('dismisses EventsGateway and sets sessionStorage flag when proceeded', () => {
    renderLayout();
    const gateway = screen.getByTestId('events-gateway');
    expect(gateway).toBeInTheDocument();

    fireEvent.click(gateway);

    expect(screen.queryByTestId('events-gateway')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('ricgcw_has_seen_events')).toBe('true');
  });

  it('does not render EventsGateway if already seen in sessionStorage', () => {
    sessionStorage.setItem('ricgcw_has_seen_events', 'true');
    renderLayout();
    expect(screen.queryByTestId('events-gateway')).not.toBeInTheDocument();
  });

  it('logs out the user and clears seen events flag on inactivity timeout', () => {
    vi.useFakeTimers();
    sessionStorage.setItem('ricgcw_has_seen_events', 'true');

    renderLayout();

    // Advance time by 15 minutes (15 * 60 * 1000 = 900000ms)
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000);
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('ricgcw_has_seen_events')).toBeNull();
    vi.useRealTimers();
  });
});
