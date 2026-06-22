import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import Attendance from './Attendance';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  }),
}));

// Mock WorkspaceContext
const mockShowConfirmation = vi.fn();
const mockShowNotification = vi.fn();

vi.mock('../context/WorkspaceContext', () => ({
  useWorkspace: () => ({
    filterData: (data) => data,
    showNotification: mockShowNotification,
    showConfirmation: mockShowConfirmation,
    userBranch: 'all',
    isBranchRestricted: false,
  }),
}));

// Mock firebase/firestore
let mockMembers = [
  { id: 'm1', memberId: 'M001', name: 'Kwame Mensah', branch: 'Mallam', status: 'Active' },
  { id: 'm2', memberId: 'K002', name: 'Ama Osei', branch: 'Kokrobitey', status: 'Active' }
];

let mockAttendanceRecords = [
  {
    id: '2026-06-20_Mallam',
    date: '2026-06-20T12:00:00Z',
    branch: 'Mallam',
    // Simulate a corrupted/incomplete record where one of the attendees is null
    attendees: [
      { id: 'm1', name: 'Kwame Mensah', memberId: 'M001' },
      null, // Corrupted entry!
      { id: 'm2', name: 'Ama Osei', memberId: 'K002' }
    ]
  }
];

const mockDeleteDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, path) => ({ path })),
  getDocs: vi.fn((colRef) => {
    if (colRef.path === 'members') {
      return Promise.resolve({
        docs: mockMembers.map(item => ({
          id: item.id,
          data: () => item
        }))
      });
    }
    if (colRef.path === 'attendance') {
      return Promise.resolve({
        docs: mockAttendanceRecords.map(item => ({
          id: item.id,
          data: () => item
        }))
      });
    }
    return Promise.resolve({ docs: [] });
  }),
  doc: vi.fn((db, path, id) => ({ path, id })),
  deleteDoc: vi.fn((docRef) => {
    mockDeleteDoc(docRef.id);
    return Promise.resolve();
  }),
  setDoc: vi.fn((docRef, data, options) => {
    mockSetDoc(docRef.id, data, options);
    return Promise.resolve();
  }),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn(() => Promise.resolve())
  }))
}));

vi.mock('../firebase', () => ({
  db: {}
}));

describe('Attendance Page Integration Checks', () => {
  const theme = createTheme();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Attendance />
      </ThemeProvider>
    );
  };

  it('renders loading states and then loads members and history', async () => {
    renderPage();
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Kwame Mensah')).toBeInTheDocument();
    });

    // Check header and list items
    expect(screen.getByText('Attendance Tracker')).toBeInTheDocument();
    expect(screen.getByText('Service History')).toBeInTheDocument();

    // Verifies service history logs display the record correctly
    expect(screen.getByText('Jun 20, 2026')).toBeInTheDocument();
  }, 20000);

  it('safely handles selection of attendance records containing null/corrupted attendee values without crashing', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Jun 20, 2026')).toBeInTheDocument();
    });

    const recordCard = screen.getByText('Jun 20, 2026');
    
    // Clicking the record card should trigger selection and open the Dialog.
    // If it crashes, this action throws an unhandled error.
    fireEvent.click(recordCard);

    // Verify report Dialog has opened with stats
    await waitFor(() => {
      expect(screen.getByText('Service Report')).toBeInTheDocument();
    });

    // Check if the present count is correct (should render present count excluding nulls if count filtering is added, or length of attendees)
    // The presenter filters m => m, so we should see the two valid members
    expect(screen.getAllByText('Kwame Mensah').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ama Osei').length).toBeGreaterThan(0);

    // Verify no crashing occurred and print report layout is rendered in background
    const printHeading = document.getElementById('printable-report');
    expect(printHeading).toBeInTheDocument();
  }, 20000);

  it('allows toggling present status and saving a new record', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Kwame Mensah').length).toBeGreaterThan(0);
    });

    // Toggle Kwame Mensah checklist item
    const kwameBtn = screen.getAllByText('Kwame Mensah')[0].closest('[role="button"]') || screen.getAllByText('Kwame Mensah')[0].closest('.MuiButtonBase-root');
    fireEvent.click(kwameBtn);

    // Click submit button (should be Submit Record (1) or Submit (1))
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);

    // Wait for the firebase call
    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalled();
    });
  }, 20000);
});
