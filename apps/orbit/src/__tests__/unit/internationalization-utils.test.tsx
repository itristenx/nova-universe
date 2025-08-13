import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock utility functions for testing
const formatCurrency = (value: number, currency: string, locale: string): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  } catch {
    // Fallback to USD if invalid currency
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
};

const formatDate = (date: Date, locale: string, options?: Intl.DateTimeFormatOptions): string => {
  try {
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return 'Invalid Date';
  }
};

const formatNumber = (value: number, locale: string, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

const detectUserLanguage = (supportedLanguages?: string[]): string => {
  const browserLanguage = window.navigator.language || 'en-US';
  const browserLanguages = (window.navigator as unknown as { languages?: string[] }).languages || [browserLanguage];
  
  if (supportedLanguages) {
    for (const lang of browserLanguages) {
      if (supportedLanguages.includes(lang)) {
        return lang;
      }
    }
    return supportedLanguages[0] || 'en-US';
  }
  
  return browserLanguage;
};

const getStoredLanguage = (): string | null => {
  try {
    return localStorage.getItem('preferred-language');
  } catch {
    return null;
  }
};

const setStoredLanguage = (language: string): void => {
  try {
    localStorage.setItem('preferred-language', language);
  } catch {
    // Handle localStorage errors gracefully
  }
};

const validateMessage = (message: string | null | undefined): boolean => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return false;
  }
  
  // Check for potential XSS
  if (/<script|javascript:|data:/i.test(message)) {
    return false;
  }
  
  // Check for unmatched brackets
  const openBrackets = (message.match(/\{/g) || []).length;
  const closeBrackets = (message.match(/\}/g) || []).length;
  
  return openBrackets === closeBrackets;
};

const sanitizeMessage = (message: string | null | undefined): string => {
  if (!message || typeof message !== 'string') {
    return '';
  }
  
  // Remove script tags and event handlers
  let sanitized = message.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html[^,]*,/gi, '');
  
  return sanitized;
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.language
Object.defineProperty(window.navigator, 'language', {
  writable: true,
  value: 'en-US',
});

describe('Internationalization Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Formatting Utilities', () => {
    describe('formatCurrency', () => {
      it('formats USD currency correctly', () => {
        const result = formatCurrency(1234.56, 'USD', 'en-US');
        expect(result).toBe('$1,234.56');
      });

      it('formats EUR currency correctly', () => {
        const result = formatCurrency(1234.56, 'EUR', 'de-DE');
        // Account for different currency symbol spacing
        expect(result).toMatch(/1\.234,56\s*€/);
      });

      it('formats JPY currency correctly', () => {
        const result = formatCurrency(1234, 'JPY', 'ja-JP');
        // Account for different yen symbol representations
        expect(result).toMatch(/[¥￥]1,234/);
      });

      it('handles edge cases', () => {
        expect(formatCurrency(0, 'USD', 'en-US')).toBe('$0.00');
        expect(formatCurrency(-100, 'USD', 'en-US')).toBe('-$100.00');
      });

      it('falls back to USD for invalid currency', () => {
        const result = formatCurrency(100, 'INVALID', 'en-US');
        expect(result).toBe('$100.00');
      });
    });

    describe('formatDate', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');

      it('formats date in US format', () => {
        const result = formatDate(testDate, 'en-US');
        expect(result).toMatch(/1\/15\/2024/);
      });

      it('formats date in German format', () => {
        const result = formatDate(testDate, 'de-DE');
        expect(result).toMatch(/15\.1\.2024/);
      });

      it('formats date with custom options', () => {
        const result = formatDate(testDate, 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        expect(result).toBe('January 15, 2024');
      });

      it('handles invalid dates', () => {
        const result = formatDate(new Date('invalid'), 'en-US');
        expect(result).toBe('Invalid Date');
      });
    });

    describe('formatNumber', () => {
      it('formats numbers with US locale', () => {
        expect(formatNumber(1234.56, 'en-US')).toBe('1,234.56');
        expect(formatNumber(1000000, 'en-US')).toBe('1,000,000');
      });

      it('formats numbers with German locale', () => {
        expect(formatNumber(1234.56, 'de-DE')).toBe('1.234,56');
      });

      it('formats percentages', () => {
        const result = formatNumber(0.1234, 'en-US', { 
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        });
        expect(result).toBe('12.34%');
      });

      it('formats with custom precision', () => {
        const result = formatNumber(1234.56789, 'en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        expect(result).toBe('1,234.57');
      });
    });
  });

  describe('Language Detection Utilities', () => {
    describe('detectUserLanguage', () => {
      it('detects browser language', () => {
        Object.defineProperty(window.navigator, 'language', {
          writable: true,
          value: 'fr-FR',
        });
        const result = detectUserLanguage();
        expect(result).toBe('fr-FR');
      });

      it('falls back to supported languages', () => {
        Object.defineProperty(window.navigator, 'language', {
          writable: true,
          value: 'zh-CN',
        });
        const supportedLanguages = ['en-US', 'es-ES', 'de-DE'];
        const result = detectUserLanguage(supportedLanguages);
        expect(result).toBe('en-US'); // Should fallback to first supported
      });

      it('handles browser languages array', () => {
        Object.defineProperty(window.navigator, 'languages', {
          writable: true,
          value: ['es-ES', 'en-US'],
        });
        const supportedLanguages = ['en-US', 'es-ES', 'de-DE'];
        const result = detectUserLanguage(supportedLanguages);
        expect(result).toBe('es-ES'); // Should pick first supported from languages array
      });

      it('handles missing navigator.language gracefully', () => {
        const originalLanguage = window.navigator.language;
        Object.defineProperty(window.navigator, 'language', {
          writable: true,
          value: undefined,
        });
        
        const result = detectUserLanguage();
        expect(result).toBe('en-US'); // Should fallback to default
        
        // Restore original value
        Object.defineProperty(window.navigator, 'language', {
          writable: true,
          value: originalLanguage,
        });
      });
    });

    describe('getStoredLanguage', () => {
      it('returns stored language from localStorage', () => {
        localStorageMock.getItem.mockReturnValue('fr-FR');
        const result = getStoredLanguage();
        expect(result).toBe('fr-FR');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('preferred-language');
      });

      it('returns null when no language is stored', () => {
        localStorageMock.getItem.mockReturnValue(null);
        const result = getStoredLanguage();
        expect(result).toBeNull();
      });

      it('handles localStorage errors gracefully', () => {
        localStorageMock.getItem.mockImplementation(() => {
          throw new Error('localStorage not available');
        });
        const result = getStoredLanguage();
        expect(result).toBeNull();
      });
    });

    describe('setStoredLanguage', () => {
      it('stores language in localStorage', () => {
        setStoredLanguage('de-DE');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('preferred-language', 'de-DE');
      });

      it('handles localStorage errors gracefully', () => {
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error('localStorage not available');
        });
        
        // Should not throw
        expect(() => setStoredLanguage('de-DE')).not.toThrow();
      });
    });
  });

  describe('Message Validation Utilities', () => {
    describe('validateMessage', () => {
      it('validates simple messages', () => {
        expect(validateMessage('Hello world')).toBe(true);
        expect(validateMessage('Hola mundo')).toBe(true);
        expect(validateMessage('Bonjour le monde')).toBe(true);
      });

      it('validates messages with placeholders', () => {
        expect(validateMessage('Hello {name}')).toBe(true);
        expect(validateMessage('Welcome {user.name} to {app.name}')).toBe(true);
        expect(validateMessage('You have {count} new messages')).toBe(true);
      });

      it('validates ICU message format', () => {
        expect(validateMessage('{count, plural, one {# item} other {# items}}')).toBe(true);
        expect(validateMessage('{gender, select, male {he} female {she} other {they}}')).toBe(true);
      });

      it('rejects invalid messages', () => {
        expect(validateMessage('<script>alert("xss")</script>')).toBe(false);
        expect(validateMessage('Hello {unclosed')).toBe(false);
        expect(validateMessage('Invalid } bracket')).toBe(false);
      });

      it('rejects empty or null messages', () => {
        expect(validateMessage('')).toBe(false);
        expect(validateMessage(null)).toBe(false);
        expect(validateMessage(undefined)).toBe(false);
      });

      it('validates messages with special characters', () => {
        expect(validateMessage('Héllo wörld')).toBe(true);
        expect(validateMessage('こんにちは世界')).toBe(true);
        expect(validateMessage('مرحبا بالعالم')).toBe(true);
        expect(validateMessage('Здравствуй мир')).toBe(true);
      });
    });

    describe('sanitizeMessage', () => {
      it('removes potentially harmful HTML', () => {
        expect(sanitizeMessage('<script>alert("xss")</script>Hello')).toBe('Hello');
        expect(sanitizeMessage('<img src="x" onerror="alert(1)">Text')).toBe('Text');
        expect(sanitizeMessage('<div onclick="evil()">Safe text</div>')).toBe('Safe text');
      });

      it('preserves safe content', () => {
        expect(sanitizeMessage('Hello world')).toBe('Hello world');
        expect(sanitizeMessage('Text with {placeholder}')).toBe('Text with {placeholder}');
        expect(sanitizeMessage('Safe text with numbers 123')).toBe('Safe text with numbers 123');
      });

      it('handles special characters properly', () => {
        expect(sanitizeMessage('Café & Restaurant')).toBe('Café & Restaurant');
        expect(sanitizeMessage('Price: $10.99')).toBe('Price: $10.99');
        // Note: sanitizeMessage removes < and > as potential HTML
        expect(sanitizeMessage('Math: 2 < 5 > 1')).toBe('Math: 2  1');
      });

      it('removes suspicious URL patterns', () => {
        expect(sanitizeMessage('Visit javascript:alert(1)')).toBe('Visit alert(1)');
        expect(sanitizeMessage('Click data:text/html,<script>alert(1)</script>')).toBe('Click ');
      });

      it('preserves legitimate URLs', () => {
        expect(sanitizeMessage('Visit https://example.com')).toBe('Visit https://example.com');
        expect(sanitizeMessage('Email: mailto:user@example.com')).toBe('Email: mailto:user@example.com');
      });

      it('handles null and undefined input', () => {
        expect(sanitizeMessage(null)).toBe('');
        expect(sanitizeMessage(undefined)).toBe('');
      });
    });
  });

  describe('Component Integration Tests', () => {
    const TestComponent = () => {
      return (
        <div>
          <span data-testid="currency">{formatCurrency(1234.56, 'USD', 'en-US')}</span>
          <span data-testid="date">{formatDate(new Date('2024-01-15'), 'en-US')}</span>
          <span data-testid="number">{formatNumber(1234.56, 'en-US')}</span>
        </div>
      );
    };

    it('renders formatted content correctly', () => {
      render(<TestComponent />);

      expect(screen.getByTestId('currency')).toHaveTextContent('$1,234.56');
      // Be more flexible with date format as it depends on timezone
      expect(screen.getByTestId('date')).toHaveTextContent(/1\/1[45]\/2024/);
      expect(screen.getByTestId('number')).toHaveTextContent('1,234.56');
    });

    it('handles language changes', async () => {
      const TestComponentWithButton = () => {
        return (
          <div>
            <button onClick={() => setStoredLanguage('de-DE')}>
              Change to German
            </button>
            <span data-testid="currency">{formatCurrency(1234.56, 'EUR', 'de-DE')}</span>
          </div>
        );
      };

      render(<TestComponentWithButton />);

      const changeButton = screen.getByRole('button', { name: /change to german/i });
      await userEvent.click(changeButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('preferred-language', 'de-DE');
      expect(screen.getByTestId('currency')).toHaveTextContent(/1\.234,56\s*€/);
    });
  });
});
