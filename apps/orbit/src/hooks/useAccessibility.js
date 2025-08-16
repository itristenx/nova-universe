import { useEffect, useRef, useState } from 'react';

/**
 * Hook for managing focus within a component for accessibility
 */
export function useFocusManagement(shouldFocus = false) {
  const focusRef = useRef(null);

  useEffect(() => {
    if (shouldFocus && focusRef.current) {
      focusRef.current.focus();
    }
  }, [shouldFocus]);

  return focusRef;
}

/**
 * Hook for announcing content to screen readers
 */
export function useAnnouncer() {
  const announcerRef = useRef(null);

  const announce = (message, priority = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
      announcerRef.current.setAttribute('aria-live', priority);
    }
  };

  const Announcer = () => (
    <div
      ref={announcerRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );

  return { announce, Announcer };
}

/**
 * Hook for managing keyboard navigation
 */
export function useKeyboardNavigation(items, onSelect) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && onSelect) {
          onSelect(items[focusedIndex]);
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  };

  return { focusedIndex, setFocusedIndex, handleKeyDown };
}

/**
 * Hook for managing ARIA attributes
 */
export function useAriaAttributes(options = {}) {
  const { role, labelledBy, describedBy, expanded, selected, disabled, invalid, required } =
    options;

  const ariaProps = {};

  if (role) ariaProps.role = role;
  if (labelledBy) ariaProps['aria-labelledby'] = labelledBy;
  if (describedBy) ariaProps['aria-describedby'] = describedBy;
  if (expanded !== undefined) ariaProps['aria-expanded'] = expanded;
  if (selected !== undefined) ariaProps['aria-selected'] = selected;
  if (disabled !== undefined) ariaProps['aria-disabled'] = disabled;
  if (invalid !== undefined) ariaProps['aria-invalid'] = invalid;
  if (required !== undefined) ariaProps['aria-required'] = required;

  return ariaProps;
}

/**
 * Hook for managing skip links
 */
export function useSkipLinks() {
  const skipLinkRef = useRef(null);

  const SkipLink = ({ href, children }) => (
    <a
      ref={skipLinkRef}
      href={href}
      className="bg-primary text-primary-foreground focus:ring-ring sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:ring-2 focus:outline-none"
      onFocus={() => skipLinkRef.current?.scrollIntoView()}
    >
      {children}
    </a>
  );

  return { SkipLink };
}

/**
 * Hook for color contrast checking (development tool)
 */
export function useColorContrast() {
  const checkContrast = (foreground, background) => {
    // Simple contrast ratio calculation
    const getLuminance = (color) => {
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      const sRGB = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: ratio.toFixed(2),
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7,
      wcagAALarge: ratio >= 3,
    };
  };

  return { checkContrast };
}
