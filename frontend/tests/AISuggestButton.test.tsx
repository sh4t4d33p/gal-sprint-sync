// @ts-nocheck
// Use tsconfig.test.json for test globals and Node types
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AISuggestButton from '../src/components/TaskCard/AISuggestButton';
import { suggestDescriptionAI } from 'src/utils/api';

vi.mock('src/utils/api', () => ({
  suggestDescriptionAI: vi.fn(async (title: string) => `AI suggestion for ${title}`),
}));

describe('AISuggestButton', () => {
  it('renders button and tooltip', () => {
    render(<AISuggestButton title="Test" onSuggestion={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/suggest description/i)).toBeInTheDocument();
  });

  it('calls onSuggestion with AI result when clicked', async () => {
    const onSuggestion = vi.fn();
    render(<AISuggestButton title="Test" onSuggestion={onSuggestion} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(suggestDescriptionAI).toHaveBeenCalledWith('Test');
      expect(onSuggestion).toHaveBeenCalledWith('AI suggestion for Test');
    });
  });

  it('is disabled when title is empty', () => {
    render(<AISuggestButton title="" onSuggestion={() => {}} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading indicator when clicked', async () => {
    render(<AISuggestButton title="Test" onSuggestion={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  });
}); 