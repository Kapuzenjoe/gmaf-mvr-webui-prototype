import '@testing-library/jest-dom';

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectModal from '../../../views/Connect/ConnectModal';

describe('ConnectModal', () => {
  test('should render input fields and trigger onSave', () => {
    const mockOnSave = jest.fn();
    const mockOnClose = jest.fn();

    render(
      <ConnectModal
        config={{ mmirUrl: 'http://localhost', appKey: 'abc123' }}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Check input elements
    const urlInput = screen.getByDisplayValue('http://localhost');
    const keyInput = screen.getByDisplayValue('abc123');
    expect(urlInput).toBeInTheDocument();
    expect(keyInput).toBeInTheDocument();

    // Simulate click on save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
  });
});
