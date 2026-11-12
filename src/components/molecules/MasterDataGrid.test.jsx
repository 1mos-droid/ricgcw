import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MasterDataGrid from './MasterDataGrid';

const columns = [{ id: 'name', label: 'Name' }, { id: 'amount', label: 'Amount' }];
const rows = [{ id: '1', name: 'Zoe', amount: 20 }, { id: '2', name: 'Ama', amount: 100 }];
describe('MasterDataGrid interactions', () => {
  it('sorts names and numeric amounts instead of only changing the sort indicator', () => {
    render(<MasterDataGrid title="Members" columns={columns} rows={rows} />);
    fireEvent.click(screen.getByText('Name'));
    expect(within(screen.getAllByRole('row')[1]).getByText('Ama')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Amount'));
    expect(within(screen.getAllByRole('row')[1]).getByText('Zoe')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Amount'));
    expect(within(screen.getAllByRole('row')[1]).getByText('Ama')).toBeInTheDocument();
  });

  it('opens a record from the keyboard while checkbox selection stays independent', () => {
    const open = vi.fn();
    render(<MasterDataGrid title="Members" columns={columns} rows={rows} onRowClick={open} />);
    fireEvent.click(screen.getByLabelText('Select Zoe'));
    expect(open).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByText('Zoe').closest('tr'), { key: 'Enter' });
    expect(open).toHaveBeenCalledWith('1');
  });

  it('keeps filtered records visible if the current page disappears', () => {
    const many = Array.from({ length: 12 }, (_, index) => ({ id: String(index), name: `Member ${index}`, amount: index }));
    const { rerender } = render(<MasterDataGrid columns={columns} rows={many} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(screen.getByText('Member 10')).toBeInTheDocument();
    rerender(<MasterDataGrid columns={columns} rows={[many[0]]} />);
    expect(screen.getByText('Member 0')).toBeInTheDocument();
  });
});
