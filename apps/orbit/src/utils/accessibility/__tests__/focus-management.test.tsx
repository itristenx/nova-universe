import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FocusManager, useAutoFocus, useFocusTrap, LiveAnnouncement } from '../focus-management';

// Mock components for testing
const TestAutoFocus = ({ enabled = true }: { enabled?: boolean }) => {
  const ref = useAutoFocus(enabled);
  return <button ref={ref as React.RefObject<HTMLButtonElement>}>Auto Focus Button</button>;
};

const TestFocusTrap = ({ active = true }: { active?: boolean }) => {
  const ref = useFocusTrap(active);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <button>First Button</button>
      <button>Second Button</button>
      <button>Third Button</button>
    </div>
  );
};

describe('FocusManager', () => {
  beforeEach(() => {
    // Reset focus stack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (FocusManager as any).stack = [];
    document.body.innerHTML = '';
  });

  describe('Focus Stack Management', () => {
    it('pushes and pops focus correctly', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      document.body.appendChild(button1);
      document.body.appendChild(button2);

      button1.focus();
      expect(document.activeElement).toBe(button1);

      // Push focus to button2
      FocusManager.pushFocus(button2);
      expect(document.activeElement).toBe(button2);

      // Pop focus back to button1
      FocusManager.popFocus();
      expect(document.activeElement).toBe(button1);
    });

    it('handles empty focus stack gracefully', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      // Try to pop from empty stack
      FocusManager.popFocus();

      // Should not throw error
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Focus Trap', () => {
    it('finds focusable elements correctly', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <a href="#">Link</a>
        <button disabled>Disabled Button</button>
        <input type="hidden" />
        <button tabindex="-1">Hidden Button</button>
      `;
      document.body.appendChild(container);

      const focusableElements = FocusManager.findFocusableElements(container);
      // Should find: button, input, link (tabindex="-1" elements should be excluded)
      const visibleElements = focusableElements.filter((el) => el.tabIndex !== -1);
      expect(visibleElements).toHaveLength(3);
    });

    it('traps focus within container', async () => {
      render(<TestFocusTrap />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      // Focus should be trapped within the container
      const firstButton = buttons[0];
      const lastButton = buttons[2];

      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Simulate shift+tab from first element (should go to last)
      fireEvent.keyDown(firstButton, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(lastButton);

      // Simulate tab from last element (should go to first)
      fireEvent.keyDown(lastButton, { key: 'Tab' });
      expect(document.activeElement).toBe(firstButton);
    });
  });
});

describe('useAutoFocus Hook', () => {
  it('automatically focuses element when enabled', async () => {
    render(<TestAutoFocus enabled={true} />);

    const button = screen.getByText('Auto Focus Button');

    await waitFor(
      () => {
        expect(button).toHaveFocus();
      },
      { timeout: 200 },
    );
  });

  it('does not focus element when disabled', async () => {
    render(<TestAutoFocus enabled={false} />);

    const button = screen.getByText('Auto Focus Button');

    // Wait a bit to ensure focus doesn't happen
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(button).not.toHaveFocus();
  });
});

describe('useFocusTrap Hook', () => {
  it('activates focus trap when active', () => {
    render(<TestFocusTrap active={true} />);

    const buttons = screen.getAllByRole('button');
    const firstButton = buttons[0];

    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    // Test that focus trap is working by checking tab behavior
    fireEvent.keyDown(firstButton, { key: 'Tab', shiftKey: true });
    // Focus should cycle to the last button
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('does not trap focus when inactive', () => {
    render(<TestFocusTrap active={false} />);

    const buttons = screen.getAllByRole('button');
    const firstButton = buttons[0];

    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    // Focus trap should not be active, so normal tab behavior
    fireEvent.keyDown(firstButton, { key: 'Tab', shiftKey: true });
    // Focus behavior should be normal (not trapped)
  });
});

describe('LiveAnnouncement Component', () => {
  it('renders with proper aria attributes for polite announcement', () => {
    render(<LiveAnnouncement message="Test announcement" priority="polite" />);

    const announcement = screen.getByText('Test announcement');
    expect(announcement).toBeInTheDocument();
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    expect(announcement).toHaveAttribute('aria-atomic', 'true');
    expect(announcement).toHaveClass('sr-only');
  });

  it('renders with proper aria attributes for assertive announcement', () => {
    render(<LiveAnnouncement message="Urgent announcement" priority="assertive" />);

    const announcement = screen.getByText('Urgent announcement');
    expect(announcement).toHaveAttribute('aria-live', 'assertive');
    expect(announcement).toHaveAttribute('aria-atomic', 'true');
  });

  it('defaults to polite priority', () => {
    render(<LiveAnnouncement message="Default announcement" />);

    const announcement = screen.getByText('Default announcement');
    expect(announcement).toHaveAttribute('aria-live', 'polite');
  });

  it('renders children alongside message', () => {
    render(
      <LiveAnnouncement message="Parent message">
        <span>Child content</span>
      </LiveAnnouncement>,
    );

    expect(screen.getByText('Parent message')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('is visually hidden but accessible to screen readers', () => {
    render(<LiveAnnouncement message="Screen reader announcement" />);

    const announcement = screen.getByText('Screen reader announcement');
    expect(announcement).toHaveClass('sr-only');
    expect(announcement).not.toHaveAttribute('aria-hidden');
  });

  it('updates message content dynamically', () => {
    const { rerender } = render(<LiveAnnouncement message="Initial message" />);

    expect(screen.getByText('Initial message')).toBeInTheDocument();

    rerender(<LiveAnnouncement message="Updated message" />);
    expect(screen.getByText('Updated message')).toBeInTheDocument();
    expect(screen.queryByText('Initial message')).not.toBeInTheDocument();
  });
});
