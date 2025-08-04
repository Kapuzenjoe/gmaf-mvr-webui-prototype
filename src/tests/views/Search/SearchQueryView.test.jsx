import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchQueryView from '../../../views/Search/SearchQueryView';


describe('SearchQueryView', () => {
  test('parses and adds keywords on Enter, displays them, allows removal', () => {
    render(<SearchQueryView onSearchResults={jest.fn()} />);

    const input = screen.getByPlaceholderText(/enter keywords/i);
    fireEvent.change(input, { target: { value: 'foo;bar' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('×')[0]);
    expect(screen.queryByText('foo')).not.toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  test('reset button clears keywords and input', () => {
    render(<SearchQueryView onSearchResults={jest.fn()} />);
    const input = screen.getByPlaceholderText(/enter keywords/i);

    fireEvent.change(input, { target: { value: 'resetMe' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.queryByText('resetMe')).not.toBeInTheDocument();
    expect(input.value).toBe('');
  });
});
