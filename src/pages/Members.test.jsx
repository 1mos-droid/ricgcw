import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import Members from './Members';

// Mock AuthContext (required by sub-components like MemberDetailsDialog)
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
  { id: 'm1', memberId: 'M001', name: 'Kwame Mensah', email: 'kwame@example.com', phone: '1234567890', branch: 'Mallam', status: 'Active', createdAt: '2026-06-01T00:00:00Z', dob: '1990-01-01' },
  { id: 'm2', memberId: 'K002', name: 'Ama Osei', email: 'ama@example.com', phone: '0987654321', branch: 'Kokrobitey', status: 'Active', createdAt: '2026-06-02T00:00:00Z', dob: '1995-05-15' }
];

const mockDeleteDoc = vi.fn();

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
    return Promise.resolve({ docs: [] });
  }),
  doc: vi.fn((db, path, id) => ({ path, id })),
  deleteDoc: vi.fn((docRef) => {
    mockDeleteDoc(docRef.id);
    return Promise.resolve();
  }),
  setDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-id' })),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn(() => Promise.resolve())
  }))
}));

vi.mock('../firebase', () => ({
  db: {}
}));

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    setFontSize: vi.fn(),
    save: vi.fn(),
  })),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

vi.mock('react-qr-code', () => ({
  default: () => <div data-testid="qr-code" />
}));

describe('Members Page - List View Details, Selection and Deletion', () => {
  const theme = createTheme();

  beforeEach(() => {
    vi.clearAllMocks();
    mockMembers = [
      { id: 'm1', memberId: 'M001', name: 'Kwame Mensah', email: 'kwame@example.com', phone: '1234567890', branch: 'Mallam', status: 'Active', createdAt: '2026-06-01T00:00:00Z', dob: '1990-01-01' },
      { id: 'm2', memberId: 'K002', name: 'Ama Osei', email: 'ama@example.com', phone: '0987654321', branch: 'Kokrobitey', status: 'Active', createdAt: '2026-06-02T00:00:00Z', dob: '1995-05-15' }
    ];
  });

  const renderPage = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Members />
      </ThemeProvider>
    );
  };

  it('renders in list view (table) by default on desktop', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Kwame Mensah')).toBeInTheDocument();
    });
    // Check if table headers are present
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  }, 15000);

  it('row click opens member details drawer', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Kwame Mensah')).toBeInTheDocument();
    });

    const rowNameCell = screen.getByText('Kwame Mensah');
    fireEvent.click(rowNameCell);

    // Verify detail drawer with member info opened
    await waitFor(() => {
      const drawers = screen.getAllByText('M001');
      expect(drawers.length).toBeGreaterThan(0);
    });
  }, 15000);

  it('checking a checkbox toggles selection without opening details drawer', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Kwame Mensah')).toBeInTheDocument();
    });

    const rowNameCell = screen.getByText('Kwame Mensah');
    const row = rowNameCell.closest('tr');
    const kwameCheckbox = row.querySelector('input[type="checkbox"]');

    fireEvent.click(kwameCheckbox.closest('.MuiTableCell-root'));

    // Verify details drawer is NOT opened (Bio tab should not be in document)
    const bioTab = screen.queryByText('Bio');
    expect(bioTab).toBeNull();
  }, 15000);

  it('selecting members shows Delete Selected button and allows bulk deletion', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Kwame Mensah')).toBeInTheDocument();
    });

    const rowNameCell = screen.getByText('Kwame Mensah');
    const row = rowNameCell.closest('tr');
    const kwameCheckbox = row.querySelector('input[type="checkbox"]');
    fireEvent.click(kwameCheckbox.closest('.MuiTableCell-root'));

    // "Delete (1)" button should appear in the command bar
    let deleteBtn;
    await waitFor(() => {
      deleteBtn = screen.getByRole('button', { name: /Delete \(1\)/i });
      expect(deleteBtn).toBeInTheDocument();
    });

    // Set up confirmation behavior
    mockShowConfirmation.mockImplementationOnce(({ onConfirm }) => onConfirm());

    // Click bulk delete
    fireEvent.click(deleteBtn);

    // Verify confirmation and deleteDoc calls
    expect(mockShowConfirmation).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalledWith('m1');
    });
  }, 15000);

  it('action menu allows individual row View Details and Delete', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Kwame Mensah')).toBeInTheDocument();
    });

    // The last cell of Kwame's row contains the action button.
    const rowNameCell = screen.getByText('Kwame Mensah');
    const row = rowNameCell.closest('tr');
    const actionBtn = row.querySelector('.lucide-ellipsis-vertical').closest('button');

    // Click action button to open menu
    fireEvent.click(actionBtn);

    // "View Details" and "Delete" menu options should be visible
    const viewDetailsOption = await screen.findByText('View Details');
    const deleteOption = await screen.findByText('Delete');
    expect(viewDetailsOption).toBeInTheDocument();
    expect(deleteOption).toBeInTheDocument();

    // Click View Details
    fireEvent.click(viewDetailsOption);
    await waitFor(() => {
      const drawers = screen.getAllByText('M001');
      expect(drawers.length).toBeGreaterThan(0);
    });

    // Open menu again for Delete test
    fireEvent.click(actionBtn);
    const deleteOption2 = await screen.findByText('Delete');
    
    mockShowConfirmation.mockImplementationOnce(({ onConfirm }) => onConfirm());
    fireEvent.click(deleteOption2);

    expect(mockShowConfirmation).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalledWith('m1');
    });
  }, 15000);
});
