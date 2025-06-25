// @ts-nocheck
// Use tsconfig.test.json for test globals and Node types
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskModal from '../src/components/TaskCard/TaskModal';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
const task = {
  id: 1,
  title: 'Task 1',
  description: 'Desc',
  totalMinutes: 30,
  status: 'todo',
  userId: 1,
  user: users[0],
};
const statuses = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

describe('TaskModal', () => {
  it('renders modal and fields', () => {
    render(<TaskModal open={true} onClose={() => {}} task={task} onSave={() => {}} onDelete={() => {}} statuses={statuses} users={users} isAdmin={true} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total minutes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument();
  });

  it('calls onSave with updated data', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<TaskModal open={true} onClose={() => {}} task={task} onSave={onSave} onDelete={() => {}} statuses={statuses} users={users} isAdmin={true} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Updated Desc' } });
    fireEvent.change(screen.getByLabelText(/total minutes/i), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'done' } });
    fireEvent.change(screen.getByLabelText(/assigned to/i), { target: { value: '2' } });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ title: 'Updated Task', description: 'Updated Desc', totalMinutes: 45, status: 'done', userId: 2 });
    });
  });

  it('calls onDelete when delete is clicked', () => {
    const onDelete = vi.fn();
    render(<TaskModal open={true} onClose={() => {}} task={task} onSave={() => {}} onDelete={onDelete} statuses={statuses} users={users} isAdmin={true} />);
    fireEvent.click(screen.getByText(/delete/i));
    expect(onDelete).toHaveBeenCalled();
  });

  it('shows error on invalid input', async () => {
    render(<TaskModal open={true} onClose={() => {}} task={task} onSave={vi.fn()} onDelete={vi.fn()} statuses={statuses} users={users} isAdmin={true} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });
}); 