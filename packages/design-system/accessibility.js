/**
 * Nova Universe Accessibility Implementation
 * Phase 3 Implementation - WCAG 2.1 AA compliance and accessibility features
 */

import React from 'react';

// Accessibility utilities and enhancements
export const AccessibilityProvider = ({ children }) => {
  React.useEffect(() => {
    // Add accessibility styles globally
    const accessibilityStyles = `
      /* High Contrast Mode Support */
      @media (prefers-contrast: high) {
        :root {
          --color-content: #000000;
          --color-background: #ffffff;
          --color-surface: #ffffff;
          --color-muted: #000000;
          --color-primary: #0000ff;
          --color-error: #ff0000;
          --color-warning: #ff8c00;
          --color-success: #008000;
          --color-info: #0000ff;
        }
        
        [data-theme="dark"] {
          --color-content: #ffffff;
          --color-background: #000000;
          --color-surface: #000000;
          --color-muted: #ffffff;
        }
        
        button, .button {
          border: 2px solid currentColor !important;
        }
        
        input, textarea, select {
          border: 2px solid #000000 !important;
        }
        
        [data-theme="dark"] input,
        [data-theme="dark"] textarea,
        [data-theme="dark"] select {
          border: 2px solid #ffffff !important;
        }
      }
      
      /* Reduced Motion Support */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
      
      /* Focus Management */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 9999;
        font-weight: bold;
      }
      
      .skip-link:focus {
        top: 6px;
      }
      
      /* Enhanced Focus Indicators */
      .focus-visible:focus-visible,
      .focus-visible:focus {
        outline: 3px solid var(--color-primary);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--color-background), 0 0 0 5px var(--color-primary);
      }
      
      button:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible,
      [role="button"]:focus-visible,
      [role="tab"]:focus-visible,
      [role="menuitem"]:focus-visible {
        outline: 3px solid var(--color-primary);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--color-background), 0 0 0 5px var(--color-primary);
      }
      
      /* High contrast focus for high contrast mode */
      @media (prefers-contrast: high) {
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible,
        [role="button"]:focus-visible,
        [role="tab"]:focus-visible,
        [role="menuitem"]:focus-visible {
          outline: 4px solid #000000;
          outline-offset: 2px;
        }
        
        [data-theme="dark"] button:focus-visible,
        [data-theme="dark"] input:focus-visible,
        [data-theme="dark"] textarea:focus-visible,
        [data-theme="dark"] select:focus-visible,
        [data-theme="dark"] [role="button"]:focus-visible,
        [data-theme="dark"] [role="tab"]:focus-visible,
        [data-theme="dark"] [role="menuitem"]:focus-visible {
          outline: 4px solid #ffffff;
        }
      }
      
      /* Ensure minimum touch target size (44px) */
      button,
      input[type="button"],
      input[type="submit"],
      input[type="reset"],
      [role="button"],
      [role="tab"],
      [role="menuitem"] {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Enhanced error and validation styling */
      .error-field {
        border-color: var(--color-error) !important;
        box-shadow: 0 0 0 2px var(--color-error)20;
      }
      
      .error-message {
        color: var(--color-error);
        font-size: var(--text-sm);
        margin-top: var(--space-1);
        display: flex;
        align-items: center;
        gap: var(--space-1);
      }
      
      .error-message::before {
        content: "⚠️";
        font-size: var(--text-base);
      }
      
      /* Status announcements */
      .status-announcement {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      
      /* Loading states accessibility */
      .loading-indicator {
        position: relative;
      }
      
      .loading-indicator::after {
        content: "Loading...";
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      
      /* Ensure sufficient color contrast */
      .text-contrast-check {
        color: var(--color-content);
        background-color: var(--color-background);
      }
      
      /* Modal and dialog accessibility */
      .modal-backdrop {
        background-color: rgba(0, 0, 0, 0.75);
      }
      
      .modal-content {
        position: relative;
      }
      
      .modal-content:focus {
        outline: none;
      }
      
      /* Table accessibility */
      table {
        border-collapse: collapse;
      }
      
      th[scope="col"],
      th[scope="row"] {
        background-color: var(--color-muted)10;
      }
      
      /* List accessibility */
      ul[role="list"],
      ol[role="list"] {
        list-style: none;
        padding: 0;
      }
      
      /* Card accessibility */
      .card[role="article"],
      .card[role="region"] {
        border: 1px solid var(--color-muted)40;
      }
      
      /* Form accessibility */
      fieldset {
        border: 2px solid var(--color-muted)40;
        border-radius: var(--radius-md);
        padding: var(--space-4);
        margin-bottom: var(--space-4);
      }
      
      legend {
        font-weight: var(--font-semibold);
        color: var(--color-content);
        padding: 0 var(--space-2);
      }
      
      /* Progress bar accessibility */
      .progress-bar {
        background-color: var(--color-muted)20;
        border-radius: var(--radius-full);
        overflow: hidden;
        position: relative;
      }
      
      .progress-bar::after {
        content: attr(aria-valuenow) "% complete";
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      
      /* Tooltip accessibility */
      .tooltip {
        position: relative;
      }
      
      .tooltip-content {
        position: absolute;
        z-index: 1000;
        background-color: var(--color-content);
        color: var(--color-background);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        white-space: nowrap;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: var(--space-1);
      }
      
      .tooltip-content::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: var(--color-content) transparent transparent transparent;
      }
      
      /* Print accessibility */
      @media print {
        .no-print {
          display: none !important;
        }
        
        .print-only {
          display: block !important;
        }
        
        * {
          color: #000000 !important;
          background: #ffffff !important;
        }
        
        a[href]:after {
          content: " (" attr(href) ")";
          font-size: 0.8em;
        }
      }
      
      /* Font size preferences */
      @media (min-resolution: 192dpi) {
        body {
          font-size: calc(var(--text-base) * 1.1);
        }
      }
      
      /* Windows High Contrast mode */
      @media (-ms-high-contrast: active) {
        button,
        input,
        textarea,
        select {
          border: 2px solid ButtonText;
        }
        
        .card,
        .modal-content {
          border: 1px solid WindowText;
        }
      }
      
      /* Forced colors mode (Windows/Edge) */
      @media (forced-colors: active) {
        button {
          forced-color-adjust: none;
          border: 2px solid ButtonText;
          background-color: ButtonFace;
          color: ButtonText;
        }
        
        button:hover {
          background-color: Highlight;
          color: HighlightText;
        }
        
        .card {
          border: 1px solid CanvasText;
          background-color: Canvas;
          color: CanvasText;
        }
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = accessibilityStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <>
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Screen Reader Announcements */}
      <div id="aria-live-region" aria-live="polite" aria-atomic="true" className="sr-only"></div>
      <div id="aria-live-region-assertive" aria-live="assertive" aria-atomic="true" className="sr-only"></div>
      
      {children}
    </>
  );
};

// Utility functions for accessibility
export const announceToScreenReader = (message, priority = 'polite') => {
  const region = document.getElementById(
    priority === 'assertive' ? 'aria-live-region-assertive' : 'aria-live-region'
  );
  
  if (region) {
    region.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }
};

// Enhanced Button component with accessibility
export const AccessibleButton = React.forwardRef(({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}, ref) => {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
      announceToScreenReader('Button activated');
    }
  };

  const handleKeyDown = (e) => {
    // Handle space key for button activation
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`button button--${variant} button--${size} focus-visible ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="sr-only">Loading, please wait</span>
      )}
      {children}
    </button>
  );
});

// Enhanced Input component with accessibility
export const AccessibleInput = React.forwardRef(({
  label,
  error,
  required,
  type = 'text',
  className = '',
  id,
  ariaDescribedBy,
  ...props
}, ref) => {
  const inputId = id || `input-${React.useId()}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && (
            <span className="required-indicator" aria-label="required">
              {' '}*
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`form-input focus-visible ${error ? 'error-field' : ''} ${className}`}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

// Enhanced Modal component with accessibility
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  const modalRef = React.useRef(null);
  const previousFocusRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus modal when opened
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      announceToScreenReader(`Dialog opened: ${title}`, 'assertive');
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Return focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus within modal
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        className={`modal-content modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close focus-visible"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced Table component with accessibility
export const AccessibleTable = ({
  columns,
  data,
  caption,
  className = ''
}) => {
  return (
    <div className="table-container" role="region" aria-label="Data table" tabIndex={0}>
      <table className={`accessible-table ${className}`} role="table">
        {caption && (
          <caption className="table-caption">
            {caption}
          </caption>
        )}
        <thead>
          <tr role="row">
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                role="columnheader"
                className="table-header"
                aria-sort={column.sortable ? 'none' : undefined}
              >
                {column.header}
                {column.sortable && (
                  <span className="sr-only">
                    {' '}(sortable column)
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} role="row">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  role={colIndex === 0 ? 'rowheader' : 'gridcell'}
                  scope={colIndex === 0 ? 'row' : undefined}
                  className="table-cell"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Enhanced Progress component with accessibility
export const AccessibleProgress = ({
  value,
  max = 100,
  label,
  variant = 'primary',
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={`progress-container ${className}`}>
      {label && (
        <div className="progress-label" id={`progress-label-${React.useId()}`}>
          {label}
        </div>
      )}
      <div
        className={`progress-bar progress-bar--${variant}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${percentage}% complete`}
        aria-labelledby={label ? `progress-label-${React.useId()}` : undefined}
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items, onSelect) => {
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleKeyDown = React.useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  }, [items, focusedIndex, onSelect]);

  return { focusedIndex, handleKeyDown };
};

// Screen reader testing utilities
export const screenReaderTestUtils = {
  // Test if element has proper label
  hasAccessibleName: (element) => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim()
    );
  },
  
  // Test if interactive element is keyboard accessible
  isKeyboardAccessible: (element) => {
    const tabIndex = element.getAttribute('tabindex');
    const isInteractive = [
      'button', 'input', 'select', 'textarea', 'a'
    ].includes(element.tagName.toLowerCase());
    
    return isInteractive || tabIndex === '0' || tabIndex === null;
  },
  
  // Test color contrast (basic check)
  hasGoodContrast: (element) => {
    const styles = getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // This is a simplified check - in production, use a proper contrast ratio calculator
    return color !== backgroundColor;
  }
};

export default AccessibilityProvider;
