import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

test('talks about a bat hole', () => {
  const { getByText } = render(<App />);
  const element = getByText(/bat hole/i);
  expect(element).toBeInTheDocument();
});
