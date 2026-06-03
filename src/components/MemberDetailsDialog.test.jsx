import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MemberDetailsDialog from './MemberDetailsDialog';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock contexts
vi.mock('../context/WorkspaceContext', () => ({
  useWorkspace: () => ({
    showNotification: vi.fn(),
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  }),
}));

describe('MemberDetailsDialog Multi-Tab Profile View', () => {
  const theme = createTheme();

  const mockMember = {
    id: '123',
    name: 'Brother Kwesi',
    email: 'kwesi@example.com',
    phone: '0241112222',
    address: '123 Accra St',
    dob: '1995-05-15',
    status: 'active',
    branch: 'Mallam',
    department: 'Youth',
    baptismDate: '2020-04-12',
    salvationStory: 'Accepted Christ during Easter convention.',
    customFields: { tShirtSize: 'L', preferredService: 'First Service' },
    timeline: [
      { date: '2024-03-01', event: 'Joined Church' },
      { date: '2024-05-10', event: 'Assigned to Youth Group' }
    ],
    completedClasses: ['New Members Class', 'Baptismal Class'],
    volunteerRoles: ['Youth Usher'],
    spiritualGifts: ['Exhortation', 'Giving'],
    family: {
      unitId: 'fam-777',
      primaryContact: 'Brother Kwesi',
      spouse: 'Sister Efua',
      children: ['Kojo Kwesi'],
      emergencyPickups: ['Sister Efua', 'Grandma Mercy']
    }
  };

  const renderDialog = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <MemberDetailsDialog
          open={true}
          onClose={vi.fn()}
          member={mockMember}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          {...props}
        />
      </ThemeProvider>
    );
  };

  it('renders and defaults to the Bio Tab (Profile Details)', () => {
    renderDialog();
    expect(screen.getByText('Brother Kwesi')).toBeInTheDocument();
    expect(screen.getByText('Bio Details')).toBeInTheDocument();
    expect(screen.getByText(/Accepted Christ during Easter convention/i)).toBeInTheDocument();
  });

  it('renders Timeline Tab and displays journey audit trail', () => {
    renderDialog();
    const timelineTab = screen.getByText('Timeline');
    fireEvent.click(timelineTab);

    expect(screen.getByText('Joined Church')).toBeInTheDocument();
    expect(screen.getByText('Assigned to Youth Group')).toBeInTheDocument();
  });

  it('renders Engagement Tab and displays completed classes and gifts', () => {
    renderDialog();
    const engagementTab = screen.getByText('Engagement');
    fireEvent.click(engagementTab);

    expect(screen.getByText('New Members Class')).toBeInTheDocument();
    expect(screen.getByText('Exhortation')).toBeInTheDocument();
    expect(screen.getByText('Youth Usher')).toBeInTheDocument();
  });

  it('renders Family Tab and displays household relationships', () => {
    renderDialog();
    const familyTab = screen.getByText('Family');
    fireEvent.click(familyTab);

    expect(screen.getAllByText('Sister Efua').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Kojo Kwesi')).toBeInTheDocument();
    expect(screen.getByText(/Emergency Pick-up/i)).toBeInTheDocument();
  });
});
