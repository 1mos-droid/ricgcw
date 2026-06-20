import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import EventsGateway from './EventsGateway';
import { getDocs } from 'firebase/firestore';

// Mock firebase
vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn()
}));

vi.mock('../../utils/eventFilters', () => ({
  getUpcomingEvents: vi.fn((events) => events)
}));

describe('EventsGateway Component', () => {
  const theme = createTheme();
  const mockOnProceed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <EventsGateway open={true} onProceed={mockOnProceed} {...props} />
      </ThemeProvider>
    );
  };

  it('renders loading state initially', async () => {
    // Keep it loading
    getDocs.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Syncing ecclesiastical calendar...')).toBeInTheDocument();
  });

  it('renders upcoming events list after load', async () => {
    const mockDocs = [
      {
        id: '1',
        data: () => ({
          name: 'Sunday Morning Service',
          date: '2026-06-21T09:00:00.000Z',
          time: '09:00',
          location: 'Main Sanctuary'
        })
      }
    ];
    getDocs.mockResolvedValue({
      docs: mockDocs
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Sunday Morning Service')).toBeInTheDocument();
    });
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('Main Sanctuary')).toBeInTheDocument();
  });

  it('renders fallback when no events are found', async () => {
    getDocs.mockResolvedValue({
      docs: []
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('There are no upcoming events scheduled at this moment.')).toBeInTheDocument();
    });
  });

  it('calls onProceed when clicking Enter Portal', async () => {
    getDocs.mockResolvedValue({
      docs: []
    });

    renderComponent();

    const proceedButton = await screen.findByRole('button', { name: /Enter Portal/i });
    fireEvent.click(proceedButton);

    expect(mockOnProceed).toHaveBeenCalledTimes(1);
  });
});
