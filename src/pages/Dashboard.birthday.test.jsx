import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './Dashboard';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Admin User', email: 'admin@example.com', role: 'admin', branch: 'all' }
  })
}));

// Mock WorkspaceContext
vi.mock('../context/WorkspaceContext', () => ({
  useWorkspace: () => ({
    workspace: 'main',
    filterData: (data) => data,
    showNotification: vi.fn(),
    userRole: 'admin',
  })
}));

// Mock firebase/firestore
let mockMembers = [];
let mockEvents = [];
const mockAddDoc = vi.fn();

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((db, path) => ({ path })),
    getDocs: vi.fn((colRef) => {
      let data = [];
      if (colRef.path === 'members') data = mockMembers;
      else if (colRef.path === 'events') data = mockEvents;
      const docs = data.map(item => ({
        id: item.id,
        data: () => item
      }));
      return Promise.resolve({
        docs,
        forEach: (callback) => docs.forEach(callback)
      });
    }),
    addDoc: vi.fn((colRef, data) => {
      mockAddDoc(colRef, data);
      return Promise.resolve({ id: 'new-id' });
    }),
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

// Mock Recharts
vi.mock('recharts', () => ({
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
}));

describe('Dashboard Birthday Reminders Range & Timezone Checks', () => {
  const theme = createTheme();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockMembers = [];
    mockEvents = [];
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('creates a birthday event for a birthday exactly 7 days away', async () => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 7);
    
    // Construct local ISO date parts
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const targetDateISO = `${year}-${month}-${day}`;
    
    // Member whose birthday is on targetDate (birth year doesn't matter for remainder checks)
    mockMembers = [
      { id: 'm1', name: 'Kwame Birthday7', dob: `1990-${month}-${day}`, branch: 'Mallam' }
    ];

    renderDashboard();

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
    });

    const addedEvent = mockAddDoc.mock.calls[0][1];
    expect(addedEvent.name).toBe('🎂 Birthday: Kwame Birthday7');
    expect(addedEvent.date.split('T')[0]).toBe(targetDateISO);
  }, 15000);

  it('creates a birthday event for a birthday 3 days away (range check)', async () => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const targetDateISO = `${year}-${month}-${day}`;

    mockMembers = [
      { id: 'm2', name: 'Ama Birthday3', dob: `1995-${month}-${day}`, branch: 'Kokrobitey' }
    ];

    renderDashboard();

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
    });

    const addedEvent = mockAddDoc.mock.calls[0][1];
    expect(addedEvent.name).toBe('🎂 Birthday: Ama Birthday3');
    expect(addedEvent.date.split('T')[0]).toBe(targetDateISO);
  }, 15000);

  it('does not recreate a birthday event if it already exists', async () => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 5);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const targetDateISO = `${year}-${month}-${day}`;

    mockMembers = [
      { id: 'm3', name: 'John Existing', dob: `1985-${month}-${day}`, branch: 'Mallam' }
    ];

    // Event already exists in Firestore events list
    mockEvents = [
      { id: 'e_existing', name: '🎂 Birthday: John Existing', date: `${targetDateISO}T00:00:00.000Z`, branch: 'Mallam' }
    ];

    renderDashboard();

    // Give it a bit of time to run, then check that addDoc was NOT called
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(mockAddDoc).not.toHaveBeenCalled();
  }, 15000);
});
