// @ts-nocheck
// Use tsconfig.test.json for test globals and Node types
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../src/components/TaskCard/TaskCard';

describe('TaskCard', () => {
  it('renders title and description', () => {
    render(<TaskCard title="Test Task" description="Test Description" />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<TaskCard title="Test" description="Desc" onClick={handleClick} />);
    // The card uses aria-label={`Task: ${title}`}
    fireEvent.click(screen.getByLabelText(/Task:/));
    expect(handleClick).toHaveBeenCalled();
  });
}); 