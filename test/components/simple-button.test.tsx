import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../../packages/design-system/src/components/Button/EnhancedButton';

describe('Simple Button Test', () => {
  test('basic button test', () => {
    render(<Button data-testid="simple-button">Test</Button>);
    const button = screen.getByTestId('simple-button');
    expect(button).toBeInTheDocument();
  });
});
