import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@ricgcw.org', name: 'Admin', role: 'admin', branch: 'Main' }
  })
}));

vi.mock('../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => () => {}),
  setDoc: vi.fn()
}));

const TestConsumer = () => {
  const { showNotification, showConfirmation } = useWorkspace();

  return (
    <div>
      <button 
        onClick={() => showNotification('Test message', 'success', 3000)}
        data-testid="notify-btn"
      >
        Notify
      </button>
      <button 
        onClick={() => showConfirmation({
          title: 'Confirm Delete',
          message: 'Are you sure?',
          onConfirm: vi.fn()
        })}
        data-testid="confirm-btn"
      >
        Confirm
      </button>
    </div>
  );
};

describe('WorkspaceContext notification & confirmation queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children and provides showNotification', () => {
    render(
      <WorkspaceProvider>
        <TestConsumer />
      </WorkspaceProvider>
    );

    expect(screen.getByTestId('notify-btn')).toBeInTheDocument();
  });

  it('displays notification banner when showNotification is called', () => {
    render(
      <WorkspaceProvider>
        <TestConsumer />
      </WorkspaceProvider>
    );

    fireEvent.click(screen.getByTestId('notify-btn'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('opens confirmation modal when showConfirmation is called', () => {
    render(
      <WorkspaceProvider>
        <TestConsumer />
      </WorkspaceProvider>
    );

    fireEvent.click(screen.getByTestId('confirm-btn'));
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });
});
