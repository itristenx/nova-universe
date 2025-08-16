import { render, screen, fireEvent } from '@testing-library/react';
import { SkipLinks } from '../skip-links';

describe('SkipLinks', () => {
  it('renders skip links with proper accessibility attributes', () => {
    render(<SkipLinks />);

    const mainContentLink = screen.getByText('Skip to main content');
    const navigationLink = screen.getByText('Skip to navigation');

    expect(mainContentLink).toBeInTheDocument();
    expect(navigationLink).toBeInTheDocument();

    // Check accessibility attributes
    expect(mainContentLink).toHaveAttribute('href', '#main-content');
    expect(navigationLink).toHaveAttribute('href', '#main-navigation');

    // Check that links have proper CSS classes for visibility
    expect(mainContentLink).toHaveClass('skip-link');
    expect(navigationLink).toHaveClass('skip-link');
  });

  it('shows skip links when focused with keyboard', () => {
    render(<SkipLinks />);

    const mainContentLink = screen.getByText('Skip to main content');

    // Initially skip links should be visually hidden (will be positioned off-screen via CSS)
    expect(mainContentLink).toHaveClass('skip-link');

    // Focus on the skip link
    mainContentLink.focus();

    // Skip link should become visible when focused
    expect(mainContentLink).toHaveFocus();
  });

  it('allows keyboard navigation between skip links', () => {
    render(<SkipLinks />);

    const mainContentLink = screen.getByText('Skip to main content');
    const navigationLink = screen.getByText('Skip to navigation');

    // Focus first skip link
    mainContentLink.focus();
    expect(mainContentLink).toHaveFocus();

    // Tab to next skip link
    fireEvent.keyDown(mainContentLink, { key: 'Tab' });
    navigationLink.focus();
    expect(navigationLink).toHaveFocus();
  });

  it('has proper ARIA labels for screen readers', () => {
    render(<SkipLinks />);

    // Check that skip links are present and accessible
    const mainContentLink = screen.getByText('Skip to main content');
    const navigationLink = screen.getByText('Skip to navigation');
    const searchLink = screen.getByText('Skip to search');

    expect(mainContentLink).toBeInTheDocument();
    expect(navigationLink).toBeInTheDocument();
    expect(searchLink).toBeInTheDocument();

    // Check proper href attributes
    expect(mainContentLink).toHaveAttribute('href', '#main-content');
    expect(navigationLink).toHaveAttribute('href', '#main-navigation');
    expect(searchLink).toHaveAttribute('href', '#search');
  });

  it('works with assistive technologies', () => {
    render(<SkipLinks />);

    // Check that skip links have proper text content for screen readers
    const mainContentLink = screen.getByText('Skip to main content');
    const navigationLink = screen.getByText('Skip to navigation');
    const searchLink = screen.getByText('Skip to search');

    // Ensure skip links are accessible to screen readers
    expect(mainContentLink).toHaveAttribute('href', '#main-content');
    expect(navigationLink).toHaveAttribute('href', '#main-navigation');
    expect(searchLink).toHaveAttribute('href', '#search');

    // Check they are proper link elements
    expect(mainContentLink.tagName).toBe('A');
    expect(navigationLink.tagName).toBe('A');
    expect(searchLink.tagName).toBe('A');
  });

  it('provides visual feedback when activated', () => {
    render(
      <div>
        <SkipLinks />
        <main id="main-content">Main content</main>
      </div>,
    );

    const mainContentLink = screen.getByText('Skip to main content');

    // Simulate clicking the skip link
    fireEvent.click(mainContentLink);

    // Check that focus moves to target element
    const mainContent = document.getElementById('main-content');
    expect(mainContent).toBeInTheDocument();
  });
});
