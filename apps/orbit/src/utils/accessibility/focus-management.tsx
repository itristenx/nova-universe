'use client';

import React, { useCallback, useEffect, useRef } from 'react';

// Focus management utilities
export class FocusManager {
  private static stack: HTMLElement[] = [];

  static pushFocus(element: HTMLElement) {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.stack.push(activeElement);
    }
    element.focus();
  }

  static popFocus() {
    const element = this.stack.pop();
    if (element) {
      element.focus();
    }
  }

  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  static findFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }
}

// Hook for auto-focus management
export function _useAutoFocus(enabled: boolean = true) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (enabled && ref.current) {
      const timer = setTimeout(() => {
        ref.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return ref;
}

// Hook for focus trap
export function _useFocusTrap(active: boolean = true) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (active && ref.current) {
      const cleanup = FocusManager.trapFocus(ref.current);
      return cleanup;
    }
  }, [active]);

  return ref;
}

// Hook for managing focus stack
export function _useFocusStack() {
  const push = (element: HTMLElement) => {
    FocusManager.pushFocus(element);
  };

  const pop = () => {
    FocusManager.popFocus();
  };

  return { push, pop };
}

// Component for announcing content to screen readers
interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  children?: React.ReactNode;
}

export function _LiveAnnouncement({ message, priority = 'polite', children }: AnnouncementProps) {
  if (priority === 'assertive') {
    return (
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {message}
        {children}
      </div>
    );
  }
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
      {children}
    </div>
  );
}

// Hook for keyboard navigation
export function _useKeyboardNavigation(
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void,
  onEnter?: () => void,
  onEscape?: () => void
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Component for accessible error boundaries
interface AccessibleErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class AccessibleErrorBoundary extends React.Component<
  AccessibleErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: AccessibleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Accessibility Error:', error, errorInfo);
    
    // Announce error to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.textContent = 'An error occurred. Please try refreshing the page.';
    announcement.className = 'sr-only';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 5000);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div role="alert" className="error-message">
            <h2>Something went wrong</h2>
            <p>An error occurred while loading this content. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
