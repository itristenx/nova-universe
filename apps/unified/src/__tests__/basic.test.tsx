import { render, screen } from '@testing-library/react';

describe('Basic Component Test', () => {
  test('should render a simple component', () => {
    const TestComponent = () => <div>Hello World</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });
});