// @ts-nocheck
// Use tsconfig.test.json for test globals and Node types
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateTaskModal from '../src/components/TaskCard/CreateTaskModal';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
const currentUser = users[0];

describe('CreateTaskModal', () => {
  it('renders modal and form fields', () => {
    render(<CreateTaskModal open={true} onClose={() => {}} onCreate={() => {}} users={users} currentUser={currentUser} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assign to/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CreateTaskModal open={true} onClose={() => {}} onCreate={vi.fn()} users={users} currentUser={currentUser} />);
    fireEvent.click(screen.getByText(/create/i));
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it('calls onCreate with correct data', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateTaskModal open={true} onClose={() => {}} onCreate={onCreate} users={users} currentUser={currentUser} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Details' } });
    fireEvent.change(screen.getByLabelText(/assign to/i), { target: { value: '2' } });
    fireEvent.click(screen.getByText(/create/i));
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({ title: 'New Task', description: 'Details', userId: 2 });
    });
  });

  it('shows error on create failure', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Failed to create task.'));
    render(<CreateTaskModal open={true} onClose={() => {}} onCreate={onCreate} users={users} currentUser={currentUser} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Details' } });
    fireEvent.click(screen.getByText(/create/i));
    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
    });
  });
}); 