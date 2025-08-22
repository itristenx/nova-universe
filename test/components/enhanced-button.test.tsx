/**
 * Enhanced Button Component Tests
 * Testing Apple-inspired design system components
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button, ButtonGroup } from '../../packages/design-system/src/components/Button/EnhancedButton';

describe('Enhanced Button Component', () => {
  describe('Basic Rendering', () => {
    test('renders button with default props', () => {
      render(<Button data-testid="test-button">Click me</Button>);
      const button = screen.getByTestId('test-button');
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-600'); // primary variant
      expect(button).toHaveClass('h-10'); // md size
    });

    test('renders button with custom text', () => {
      render(<Button data-testid="test-button">Custom Button Text</Button>);
      expect(screen.getByText('Custom Button Text')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<Button data-testid="test-button" className="custom-class">Button</Button>);
      const button = screen.getByTestId('test-button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    test('renders primary variant correctly', () => {
      render(<Button data-testid="primary-button" variant="primary">Primary</Button>);
      const button = screen.getByTestId('primary-button');
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    test('renders secondary variant correctly', () => {
      render(<Button data-testid="secondary-button" variant="secondary">Secondary</Button>);
      const button = screen.getByTestId('secondary-button');
      expect(button).toHaveClass('bg-gray-100', 'text-gray-900');
    });

    test('renders destructive variant correctly', () => {
      render(<Button data-testid="destructive-button" variant="destructive">Delete</Button>);
      const button = screen.getByTestId('destructive-button');
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });

    test('renders ghost variant correctly', () => {
      render(<Button data-testid="ghost-button" variant="ghost">Ghost</Button>);
      const button = screen.getByTestId('ghost-button');
      expect(button).toHaveClass('text-gray-700');
      expect(button).not.toHaveClass('bg-blue-600');
    });

    test('renders outline variant correctly', () => {
      render(<Button data-testid="outline-button" variant="outline">Outline</Button>);
      const button = screen.getByTestId('outline-button');
      expect(button).toHaveClass('border', 'border-gray-300', 'bg-transparent');
    });
  });

  describe('Sizes', () => {
    test('renders small size correctly', () => {
      render(<Button data-testid="small-button" size="sm">Small</Button>);
      const button = screen.getByTestId('small-button');
      expect(button).toHaveClass('h-8', 'px-3', 'text-xs');
    });

    test('renders medium size correctly (default)', () => {
      render(<Button data-testid="medium-button" size="md">Medium</Button>);
      const button = screen.getByTestId('medium-button');
      expect(button).toHaveClass('h-10', 'px-4', 'text-sm');
    });

    test('renders large size correctly', () => {
      render(<Button data-testid="large-button" size="lg">Large</Button>);
      const button = screen.getByTestId('large-button');
      expect(button).toHaveClass('h-12', 'px-6', 'text-base');
    });

    test('renders extra large size correctly', () => {
      render(<Button data-testid="xl-button" size="xl">Extra Large</Button>);
      const button = screen.getByTestId('xl-button');
      expect(button).toHaveClass('h-14', 'px-8', 'text-lg');
    });

    test('renders icon sizes correctly', () => {
      render(<Button data-testid="icon-button" size="icon-md" aria-label="Icon button">🔍</Button>);
      const button = screen.getByTestId('icon-button');
      expect(button).toHaveClass('h-10', 'w-10', 'p-0');
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner when loading is true', () => {
      render(<Button data-testid="loading-button" loading>Loading</Button>);
      const button = screen.getByTestId('loading-button');
      
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass('cursor-not-allowed', 'opacity-70');
      
      // Check for spinner presence
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    test('shows custom loading text', () => {
      render(<Button data-testid="loading-text-button" loading loadingText="Saving...">Save</Button>);
      expect(screen.getAllByText('Saving...')).toHaveLength(2); // visible and sr-only
    });

    test('prevents click when loading', async () => {
      const handleClick = jest.fn();
      render(<Button data-testid="loading-click-button" loading onClick={handleClick}>Loading</Button>);
      
      const button = screen.getByTestId('loading-click-button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    test('applies disabled styles when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass('opacity-50');
    });

    test('prevents click when disabled', async () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    test('renders left icon correctly', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={<LeftIcon />}>With Icon</Button>);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    test('renders right icon correctly', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={<RightIcon />}>With Icon</Button>);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    test('hides right icon when loading', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button loading rightIcon={<RightIcon />}>Loading</Button>);
      
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    test('applies full width class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Accessibility', () => {
    test('has proper aria-label when provided', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    test('uses button text as aria-label fallback', () => {
      render(<Button>Button Text</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Button Text');
    });

    test('has focus-visible styles', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    test('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await userEvent.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Handling', () => {
    test('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('passes event object to onClick handler', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Ref Forwarding', () => {
    test('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });
});

describe('ButtonGroup Component', () => {
  test('renders button group with children', () => {
    render(
      <ButtonGroup>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonGroup>
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  test('applies horizontal orientation by default', () => {
    render(
      <ButtonGroup data-testid="button-group">
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>
    );

    const group = screen.getByTestId('button-group');
    expect(group).toHaveClass('flex-row');
  });

  test('applies vertical orientation when specified', () => {
    render(
      <ButtonGroup orientation="vertical" data-testid="button-group">
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>
    );

    const group = screen.getByTestId('button-group');
    expect(group).toHaveClass('flex-col');
  });

  test('has proper role attribute', () => {
    render(
      <ButtonGroup data-testid="button-group">
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>
    );

    const group = screen.getByTestId('button-group');
    expect(group).toHaveAttribute('role', 'group');
  });
});

describe('Button Animation States', () => {
  test('applies active scale transform on press', async () => {
    render(<Button>Press me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('active:scale-[0.98]');
  });

  test('has transition classes for smooth animations', () => {
    render(<Button>Animated</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('transition-all', 'duration-200', 'ease-in-out');
  });
});

describe('Button Hover States', () => {
  test('has hover styles for primary variant', () => {
    render(<Button variant="primary">Hover me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('hover:bg-blue-700', 'hover:shadow-md');
  });

  test('has hover styles for secondary variant', () => {
    render(<Button variant="secondary">Hover me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('hover:bg-gray-200', 'hover:shadow-md');
  });
});
