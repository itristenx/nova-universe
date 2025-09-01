import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  test('should render with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  test('should render with custom text', () => {
    render(<LoadingSpinner text="Please wait..." />);
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });

  test('should render spinner with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByText('loading')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByText('loading')).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  test('should have correct structure', () => {
    render(<LoadingSpinner />);
    
    const container = screen.getByText('loading').parentElement;
    expect(container).toBeInTheDocument();
    
    // Should have a spinner div
    const spinner = container?.querySelector('div');
    expect(spinner).toBeInTheDocument();
  });

  test('should display text content correctly', () => {
    const customText = "Processing your request...";
    render(<LoadingSpinner text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  test('should render without crashing for all size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<LoadingSpinner size={size} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
      unmount();
    });
  });
});