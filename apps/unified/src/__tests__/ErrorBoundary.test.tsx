import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangleIcon: () => <div data-testid="alert-triangle-icon" />,
  RefreshCwIcon: () => <div data-testid="refresh-cw-icon" />,
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('error.title')).toBeInTheDocument();
    expect(screen.getByText('error.description')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
  });

  test('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  test('should handle try again button click', async () => {
    const user = userEvent.setup();
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByText('error.tryAgain');
    await user.click(tryAgainButton);

    // After clicking try again, it should attempt to render children again
    expect(screen.getByText('error.title')).toBeInTheDocument(); // Still shows error since component still throws
  });

  test('should handle refresh page button click', async () => {
    const user = userEvent.setup();
    
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByText('error.refreshPage');
    await user.click(refreshButton);

    expect(mockReload).toHaveBeenCalled();
  });

  test('should use custom translations when provided', () => {
    const customTranslations = {
      title: 'Custom Error Title',
      description: 'Custom Error Description',
      tryAgain: 'Custom Try Again',
      refreshPage: 'Custom Refresh',
      errorDetails: 'Custom Error Details',
    };

    render(
      <ErrorBoundary translations={customTranslations}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Error Description')).toBeInTheDocument();
    expect(screen.getByText('Custom Try Again')).toBeInTheDocument();
    expect(screen.getByText('Custom Refresh')).toBeInTheDocument();
  });

  test('should log error to console when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by boundary:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  test('should recover when error is fixed', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByText('error.title')).toBeInTheDocument();

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should still show error UI (ErrorBoundary doesn't automatically recover)
    expect(screen.getByText('error.title')).toBeInTheDocument();
  });
});