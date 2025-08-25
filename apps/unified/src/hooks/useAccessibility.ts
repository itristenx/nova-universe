/**
 * Enhanced Accessibility Hook - Phase 1 Implementation
 * WCAG 2.2 AA+ compliance utilities and features
 */
import { useEffect, useState, useCallback, useRef } from 'react';

// Accessibility preferences state
interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  screenReader: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

// Focus management utilities
interface FocusManagement {
  trapFocus: (container: HTMLElement) => () => void;
  restoreFocus: (element?: HTMLElement) => void;
  announceLive: (message: string, priority?: 'polite' | 'assertive') => void;
  manageFocusOutline: (visible: boolean) => void;
}

// Keyboard navigation
interface KeyboardNavigation {
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options?: {
      loop?: boolean;
      vertical?: boolean;
      horizontal?: boolean;
    },
  ) => number;
  handleEscapeKey: (callback: () => void) => (event: KeyboardEvent) => void;
  handleEnterSpace: (callback: () => void) => (event: KeyboardEvent) => void;
}

export function useAccessibility(): {
  preferences: AccessibilityPreferences;
  focus: FocusManagement;
  keyboard: KeyboardNavigation;
  announcer: (message: string, priority?: 'polite' | 'assertive') => void;
  isScreenReaderActive: boolean;
} {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    focusVisible: true,
    screenReader: false,
    colorBlindness: 'none',
  });

  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const announcerRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Detect user preferences
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-reduced-data: reduce)'),
    };

    const updatePreferences = () => {
      setPreferences((prev) => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches,
      }));
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    Object.values(mediaQueries).forEach((mq) => {
      mq.addEventListener('change', updatePreferences);
    });

    return () => {
      Object.values(mediaQueries).forEach((mq) => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  // Detect screen reader usage
  useEffect(() => {
    // Check for screen reader indicators
    const checkScreenReader = () => {
      // Check for NVDA, JAWS, VoiceOver, etc.
      const userAgent = navigator.userAgent.toLowerCase();
      const hasScreenReaderUA =
        userAgent.includes('nvda') || userAgent.includes('jaws') || userAgent.includes('dragon');

      // Check for assistive technology APIs
      const hasAssistiveTech = 'speechSynthesis' in window;

      // Check for reduced motion + tab navigation pattern
      const hasA11yPattern = preferences.reducedMotion && document.activeElement !== document.body;

      setIsScreenReaderActive(hasScreenReaderUA || hasAssistiveTech || hasA11yPattern);
    };

    checkScreenReader();

    // Re-check on focus changes
    document.addEventListener('focusin', checkScreenReader);
    return () => document.removeEventListener('focusin', checkScreenReader);
  }, [preferences.reducedMotion]);

  // Focus trap implementation
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

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
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element initially
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Focus restoration
  const restoreFocus = useCallback((element?: HTMLElement) => {
    const elementToFocus = element || lastFocusedElement.current;
    if (elementToFocus && document.contains(elementToFocus)) {
      elementToFocus.focus();
    }
  }, []);

  // Live announcements
  const announceLive = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announcerRef.current) {
        // Create announcer element if it doesn't exist
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
        document.body.appendChild(announcer);
        announcerRef.current = announcer;
      }

      // Clear and set new message
      announcerRef.current.textContent = '';
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);
    },
    [],
  );

  // Focus outline management
  const manageFocusOutline = useCallback((visible: boolean) => {
    const style = document.getElementById('focus-outline-style') || document.createElement('style');
    style.id = 'focus-outline-style';

    if (visible) {
      style.textContent = `
        *:focus-visible {
          outline: 2px solid #007AFF !important;
          outline-offset: 2px !important;
          border-radius: 4px !important;
        }
        
        .focus-ring {
          box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #007AFF !important;
        }
      `;
    } else {
      style.textContent = `
        *:focus {
          outline: none !important;
        }
      `;
    }

    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
  }, []);

  // Arrow key navigation
  const handleArrowNavigation = useCallback(
    (
      event: KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
      options: {
        loop?: boolean;
        vertical?: boolean;
        horizontal?: boolean;
      } = {},
    ) => {
      const { loop = true, vertical = true, horizontal = true } = options;
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (vertical) {
            event.preventDefault();
            newIndex = loop
              ? (currentIndex + 1) % items.length
              : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowUp':
          if (vertical) {
            event.preventDefault();
            newIndex = loop
              ? currentIndex === 0
                ? items.length - 1
                : currentIndex - 1
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'ArrowRight':
          if (horizontal) {
            event.preventDefault();
            newIndex = loop
              ? (currentIndex + 1) % items.length
              : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowLeft':
          if (horizontal) {
            event.preventDefault();
            newIndex = loop
              ? currentIndex === 0
                ? items.length - 1
                : currentIndex - 1
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
      }

      if (newIndex !== currentIndex && items[newIndex]) {
        items[newIndex].focus();
      }

      return newIndex;
    },
    [],
  );

  // Escape key handler
  const handleEscapeKey = useCallback((callback: () => void) => {
    return (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        callback();
      }
    };
  }, []);

  // Enter/Space key handler
  const handleEnterSpace = useCallback((callback: () => void) => {
    return (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
      }
    };
  }, []);

  // Store last focused element before modals/dialogs
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest('[role="dialog"]') && !target.closest('.modal')) {
        lastFocusedElement.current = target;
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement;

    // Reduced motion
    if (preferences.reducedMotion) {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // High contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (preferences.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Focus visible
    manageFocusOutline(preferences.focusVisible);
  }, [preferences, manageFocusOutline]);

  return {
    preferences,
    focus: {
      trapFocus,
      restoreFocus,
      announceLive,
      manageFocusOutline,
    },
    keyboard: {
      handleArrowNavigation,
      handleEscapeKey,
      handleEnterSpace,
    },
    announcer: announceLive,
    isScreenReaderActive,
  };
}

// Hook for managing skip links
export function useSkipLinks() {
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #007AFF;
      color: white;
      padding: 8px;
      z-index: 1000;
      text-decoration: none;
      border-radius: 4px;
      transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (document.body.contains(skipLink)) {
        document.body.removeChild(skipLink);
      }
    };
  }, []);
}

// Hook for color contrast checking
export function useColorContrast() {
  const checkContrast = useCallback(
    (
      foreground: string,
      background: string,
    ): {
      ratio: number;
      aa: boolean;
      aaa: boolean;
    } => {
      // Convert hex to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
      };

      // Calculate relative luminance
      const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      const fg = hexToRgb(foreground);
      const bg = hexToRgb(background);

      if (!fg || !bg) {
        return { ratio: 0, aa: false, aaa: false };
      }

      const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
      const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);
      const ratio = (lighter + 0.05) / (darker + 0.05);

      return {
        ratio,
        aa: ratio >= 4.5,
        aaa: ratio >= 7.0,
      };
    },
    [],
  );

  return { checkContrast };
}

export default useAccessibility;
