import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommandPalette from './CommandPalette';

describe('CommandPalette Component', () => {
  const mockMembers = [
    { id: '1', name: 'John Doe', branch: 'Mallam', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', branch: 'Kokrobitey', email: 'jane@example.com' },
  ];

  it('renders nothing when closed', () => {
    const { container } = render(
      <CommandPalette
        open={false}
        onClose={vi.fn()}
        members={mockMembers}
        onNavigate={vi.fn()}
        onSelectMember={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when open is true', () => {
    render(
      <CommandPalette
        open={true}
        onClose={vi.fn()}
        members={mockMembers}
        onNavigate={vi.fn()}
        onSelectMember={vi.fn()}
      />
    );
    // Should see search input placeholder
    expect(screen.getByPlaceholderText(/Type a command or search.../i)).toBeInTheDocument();
  });

  it('filters navigation items and members based on input', () => {
    render(
      <CommandPalette
        open={true}
        onClose={vi.fn()}
        members={mockMembers}
        onNavigate={vi.fn()}
        onSelectMember={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Type a command or search.../i);
    
    // Type 'Members' to match navigation item
    fireEvent.change(input, { target: { value: 'Members' } });
    expect(screen.getByText('Go to Members')).toBeInTheDocument();

    // Type 'John' to match member John Doe
    fireEvent.change(input, { target: { value: 'John' } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('triggers onNavigate when a navigation option is clicked', () => {
    const onNavigate = vi.fn();
    render(
      <CommandPalette
        open={true}
        onClose={vi.fn()}
        members={mockMembers}
        onNavigate={onNavigate}
        onSelectMember={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Type a command or search.../i);
    fireEvent.change(input, { target: { value: 'Dashboard' } });

    const option = screen.getByText('Go to Dashboard');
    fireEvent.click(option);

    expect(onNavigate).toHaveBeenCalledWith('/');
  });

  it('triggers onSelectMember when a member profile is clicked', () => {
    const onSelectMember = vi.fn();
    render(
      <CommandPalette
        open={true}
        onClose={vi.fn()}
        members={mockMembers}
        onNavigate={vi.fn()}
        onSelectMember={onSelectMember}
      />
    );

    const input = screen.getByPlaceholderText(/Type a command or search.../i);
    fireEvent.change(input, { target: { value: 'Jane' } });

    const option = screen.getByText('Jane Smith');
    fireEvent.click(option);

    expect(onSelectMember).toHaveBeenCalledWith(mockMembers[1]);
  });

  it('triggers onClose when close button or overlay is clicked', () => {
    const onClose = vi.fn();
    render(
      <CommandPalette
        open={true}
        onClose={onClose}
        members={mockMembers}
        onNavigate={vi.fn()}
        onSelectMember={vi.fn()}
      />
    );

    // Click close button or backdrop wrapper
    const backdrop = screen.getByTestId('command-palette-backdrop');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
