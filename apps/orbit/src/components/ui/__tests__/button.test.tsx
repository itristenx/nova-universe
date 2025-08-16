import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../button';

describe('Button', () => {
  it('applies a visible focus ring for accessibility', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    btn.focus();
    expect(btn).toHaveClass('focus-visible:ring-[3px]');
  });

  it('meets tap target size', () => {
    render(<Button>Tap</Button>);
    const btn = screen.getByRole('button', { name: /tap/i });
    // Height class should be h-11 by default
    expect(btn.className).toMatch(/h-11/);
  });
});
