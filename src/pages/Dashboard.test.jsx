import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './Dashboard';

// Mock contexts with mutable values to switch role in tests
let currentRole = 'admin';
let currentUser = { name: 'Admin User', email: 'admin@example.com', role: 'admin', branch: 'all' };

vi.mock('../context/WorkspaceContext', () => ({
  useWorkspace: () => ({
    workspace: 'main',
    filterData: (data) => data,
    showNotification: vi.fn(),
    userRole: currentRole,
  })
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: currentUser
  })
}));

// Mock firebase/firestore
const mockMembers = [
  { id: 'm1', name: 'Kwame Mensah', email: 'kwame@example.com', role: 'member', dob: '1990-01-01', createdAt: '2026-01-01', branch: 'Mallam' },
  { id: 'm2', name: 'Ama Osei', email: 'ama@example.com', role: 'member', dob: '1985-05-05', createdAt: '2026-01-02', branch: 'Kokrobitey' }
];

const mockTransactions = [
  { id: 't1', amount: 500, type: 'contribution', category: 'Tithe', date: '2026-05-01T12:00:00Z', memberId: 'm1', branch: 'Mallam' },
  { id: 't2', amount: 1500, type: 'contribution', category: 'Offering', date: '2026-05-02T12:00:00Z', memberId: 'm2', branch: 'Kokrobitey' },
  { id: 't3', amount: 200, type: 'expense', category: 'Logistics', date: '2026-05-03T12:00:00Z', branch: 'Mallam' }
];

const mockEvents = [
  { id: 'e1', name: 'Youth Summit', date: '2026-06-10T00:00:00Z', time: '10:00', location: 'Main Auditorium', branch: 'Mallam' }
];

const mockAttendance = [
  { id: 'a1', date: '2026-05-24T08:00:00Z', attendees: [{ id: 'm1' }] }
];

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((db, path) => ({ path })),
    getDocs: vi.fn((colRef) => {
      let data = [];
      if (colRef.path === 'members') data = mockMembers;
      else if (colRef.path === 'transactions') data = mockTransactions;
      else if (colRef.path === 'events') data = mockEvents;
      else if (colRef.path === 'attendance') data = mockAttendance;
      const docs = data.map(item => ({
        id: item.id,
        data: () => item
      }));
      return Promise.resolve({
        docs,
        forEach: (callback) => docs.forEach(callback)
      });
    }),
    addDoc: vi.fn(() => Promise.resolve({ id: 'new-id' })),
    doc: vi.fn((db, path, id) => ({ path, id })),
    writeBatch: vi.fn(() => ({
      update: vi.fn(),
      commit: vi.fn(() => Promise.resolve())
    }))
  };
});

vi.mock('../firebase', () => ({
  db: {}
}));

// Mock Recharts to avoid rendering sizing issue
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }) => <div className="responsive-container">{children}</div>,
    AreaChart: ({ children }) => <div className="area-chart">{children}</div>,
    Area: () => <div className="area" />,
    CartesianGrid: () => <div className="cartesian-grid" />,
    XAxis: () => <div className="x-axis" />,
    YAxis: () => <div className="y-axis" />,
    Tooltip: () => <div className="tooltip" />,
    PieChart: ({ children }) => <div className="pie-chart">{children}</div>,
    Pie: ({ children }) => <div className="pie">{children}</div>,
    Cell: () => <div className="cell" />,
    Legend: () => <div className="legend" />,
    BarChart: ({ children }) => <div className="bar-chart">{children}</div>,
    Bar: () => <div className="bar" />
  };
});

describe('Dashboard Component TDD Checks', () => {
  const theme = createTheme();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders MemberDashboardView for a member role', async () => {
    currentRole = 'member';
    currentUser = { name: 'Kwame Mensah', email: 'kwame@example.com', role: 'member' };

    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Wait for the mock async load to complete
    await waitFor(() => {
      expect(screen.getByText(/MEMBER PORTAL/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Welcome Back, Kwame/i)).toBeInTheDocument();
    expect(screen.getByText(/My Giving History/i)).toBeInTheDocument();
    expect(screen.getByText('Prayer Request')).toBeInTheDocument();
  }, 15000);

  it('renders Admin Dashboard layout for an admin role', async () => {
    currentRole = 'admin';
    currentUser = { name: 'Admin User', email: 'admin@example.com', role: 'admin' };

    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/OFFICIAL PORTAL/i)).toBeInTheDocument();
    });

    // Check greeting
    expect(screen.getByText(/Good/i)).toBeInTheDocument();

    // Check comparative metrics
    expect(screen.getByText(/Active Membership/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();

    // Verify tabs exist
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /operations/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();

    // Operations widgets should NOT be in the document initially
    expect(screen.queryByText(/Child Safety Check-Ins/i)).not.toBeInTheDocument();

    // Click on Operations tab
    fireEvent.click(screen.getByRole('tab', { name: /operations/i }));
    
    // Now operations widgets should be visible
    expect(screen.getByText(/Child Safety Check-Ins/i)).toBeInTheDocument();
    expect(screen.getByText(/Volunteer Roster Slots/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Dual-Custody Deposit Audits/i)).toBeInTheDocument();

    // Click on Analytics tab
    fireEvent.click(screen.getByRole('tab', { name: /analytics/i }));

    // Now analytics widgets should be visible
    expect(screen.getByText(/Campus Comparative Logistics/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenue Overview/i)).toBeInTheDocument();
  }, 15000);
});
