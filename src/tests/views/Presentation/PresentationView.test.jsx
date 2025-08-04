import React from 'react';
import { render } from '@testing-library/react';
import PresentationView from '../../../views/Presentation/PresentationView';

describe('PresentationView integration', () => {
  test('renders without crashing with a ZIP item', () => {
    const fakeItem = {
      mimeType: 'application/zip',
      fileUrl: 'http://example.com/fake.zip',
      generalMetadata: { id: 'abc', fileName: 'bundle.zip' },
    };
    render(<PresentationView item={fakeItem} />);
  });
});
