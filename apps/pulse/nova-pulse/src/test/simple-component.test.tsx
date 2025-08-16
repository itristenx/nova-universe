import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component that doesn't need providers
const TestComponent: React.FC = () => {
  return (
    <div>
      <h1>Hello Test</h1>
      <p>This is a simple test component</p>
    </div>
  );
};

/* eslint-env jest */

describe('Simple Component Tests', () => {
  test('renders basic component without providers', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
    expect(screen.getByText('This is a simple test component')).toBeInTheDocument();
  });

  test('basic Jest functionality works', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
