/* eslint-env jest */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = () => {
  return <div>Hello Test</div>;
};

describe('Basic React Test', () => {
  test('renders a simple component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});
