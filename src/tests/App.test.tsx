import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

test('renders learn react link', () => {
  render(<ParentSize>{() => <App />}</ParentSize>);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
