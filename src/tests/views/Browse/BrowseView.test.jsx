import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BrowseView from '../../../views/Browse/BrowseView';

const testResults = [
    {
        generalMetadata: { id: '1', fileName: 'b.mp4', fileReference: 'b.mp4' },
        mimeType: 'video/mp4',
        fileUrl: 'blob://b.mp4'
    },
    {
        generalMetadata: { id: '2', fileName: 'a.jpg', fileReference: 'a.jpg' },
        mimeType: 'image/jpeg',
        fileUrl: 'blob://a.jpg'
    },
    {
        generalMetadata: { id: '3', fileName: 'z.csv', fileReference: 'z.csv' },
        mimeType: 'text/csv',
        fileUrl: 'blob://z.csv'
    }
];

describe('BrowseView', () => {
    test('sorts items alphabetically (az)', () => {
        render(<BrowseView results={testResults} />);

        const buttons = screen.getAllByRole('button');

        fireEvent.click(buttons[1]);
        const fileNameEls = screen.getAllByText(/\.mp4|\.jpg|\.csv/);

        const names = fileNameEls.map(el => el.textContent);
        expect(names).toEqual(['a.jpg', 'b.mp4', 'z.csv']);
    });

    test('sorts items alphabetically (za)', () => {
        render(<BrowseView results={testResults} />);

        const buttons = screen.getAllByRole('button');
        // Klicke auf Z-A (dritter Button, Index 2)
        fireEvent.click(buttons[2]);

        const fileNameEls = screen.getAllByText(/\.mp4|\.jpg|\.csv/);
        const names = fileNameEls.map(el => el.textContent);
        // Sollte ['z.csv', 'b.mp4', 'a.jpg'] sein
        expect(names).toEqual(['z.csv', 'b.mp4', 'a.jpg']);
    });
});

