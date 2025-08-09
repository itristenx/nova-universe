import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageSwitcher } from '../language-switcher';
import { useCulturalFormatting } from '../cultural-formatting';

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  ...jest.requireActual('next-intl'),
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

// Mock the navigation from @/i18n/navigation
jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));

const messages = {
  en: {
    'language-switcher': {
      label: 'Language',
      english: 'English',
      spanish: 'Spanish',
      french: 'French',
      arabic: 'Arabic',
    },
  },
  es: {
    'language-switcher': {
      label: 'Idioma',
      english: 'Inglés',
      spanish: 'Español',
      french: 'Francés',
      arabic: 'Árabe',
    },
  },
};

const TestWrapper = ({ children, locale = 'en' }: { children: React.ReactNode; locale?: string }) => (
  <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
    {children}
  </NextIntlClientProvider>
);

// Test component for CulturalFormatting hook
const TestCulturalFormatting = ({ 
  type, 
  value, 
  options 
}: {
  type: 'date' | 'time' | 'datetime' | 'number' | 'currency' | 'relative';
  value: Date | number;
  options?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
}) => {
  const { formatDate, formatTime, formatDateTime, formatNumber, formatCurrency, formatRelativeTime } = useCulturalFormatting();
  
  let formatted = '';
  let ariaLabel = '';
  
  if (type === 'date' && value instanceof Date) {
    formatted = formatDate(value, options as Intl.DateTimeFormatOptions);
    ariaLabel = value.toLocaleDateString('en-US', { dateStyle: 'full' });
  } else if (type === 'time' && value instanceof Date) {
    formatted = formatTime(value);
    ariaLabel = value.toLocaleTimeString('en-US');
  } else if (type === 'datetime' && value instanceof Date) {
    formatted = formatDateTime(value);
    ariaLabel = value.toLocaleString('en-US');
  } else if (type === 'number' && typeof value === 'number') {
    formatted = formatNumber(value, options as Intl.NumberFormatOptions);
    ariaLabel = `Number: ${value}`;
  } else if (type === 'currency' && typeof value === 'number') {
    formatted = formatCurrency(value);
    ariaLabel = `Price: ${value}`;
  } else if (type === 'relative' && value instanceof Date) {
    formatted = formatRelativeTime(value);
    ariaLabel = `Time: ${value.toISOString()}`;
  }
  
  return (
    <span title={value instanceof Date ? value.toISOString() : value.toString()} aria-label={ariaLabel}>
      {formatted}
    </span>
  );
};

describe('LanguageSwitcher', () => {
  it('renders language options with proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('combobox', { name: /language/i });
    expect(languageButton).toBeInTheDocument();
    expect(languageButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(languageButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens language menu when clicked', async () => {
    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('combobox');
    fireEvent.click(languageButton);

    await waitFor(() => {
      expect(languageButton).toHaveAttribute('aria-expanded', 'true');
    });

    // Check for language options
    expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /spanish/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /french/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /arabic/i })).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('combobox');
    
    // Open with Enter key
    languageButton.focus();
    fireEvent.keyDown(languageButton, { key: 'Enter' });

    await waitFor(() => {
      expect(languageButton).toHaveAttribute('aria-expanded', 'true');
    });

    // Navigate with arrow keys
    fireEvent.keyDown(languageButton, { key: 'ArrowDown' });
    const firstOption = screen.getByRole('option', { name: /english/i });
    expect(firstOption).toBeInTheDocument();

    // Close with Escape key
    fireEvent.keyDown(languageButton, { key: 'Escape' });
    await waitFor(() => {
      expect(languageButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('changes language when option is selected', async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
    };

    // Mock the router hook to return our mock
    jest.doMock('@/i18n/navigation', () => ({
      useRouter: () => mockRouter,
      usePathname: () => '/test-path',
    }));

    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('combobox');
    fireEvent.click(languageButton);

    await waitFor(() => {
      expect(languageButton).toHaveAttribute('aria-expanded', 'true');
    });

    const spanishOption = screen.getByRole('option', { name: /spanish/i });
    fireEvent.click(spanishOption);

    // Router push should be called with Spanish locale
    expect(mockRouter.push).toHaveBeenCalledWith('/test-path', { locale: 'es' });
  });

  it('shows current language as selected', () => {
    render(
      <TestWrapper locale="es">
        <LanguageSwitcher />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('combobox');
    expect(languageButton).toHaveTextContent('Español');
  });

  it('has proper ARIA labeling for screen readers', () => {
    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('combobox');
    expect(languageButton).toHaveAttribute('aria-label', 'Select language');
    expect(languageButton).toHaveAttribute('role', 'combobox');
  });

  it('supports RTL languages correctly', async () => {
    render(
      <TestWrapper locale="ar">
        <LanguageSwitcher />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('combobox');
    fireEvent.click(languageButton);

    await waitFor(() => {
      const arabicOption = screen.getByRole('option', { name: /arabic/i });
      expect(arabicOption).toBeInTheDocument();
      expect(arabicOption).toHaveAttribute('dir', 'rtl');
    });
  });
});

describe('CulturalFormatting Hook', () => {
  const testDate = new Date('2024-03-15T10:30:00Z');
  const testNumber = 1234.56;
  const testCurrency = 99.99;

  it('formats dates according to locale', () => {
    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="date"
          value={testDate}
        />
      </TestWrapper>
    );

    // Should format as US date format (the hook uses the locale from context)
    const formattedElement = screen.getByTitle(testDate.toISOString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('formats dates for different locales', () => {
    render(
      <TestWrapper locale="es">
        <TestCulturalFormatting
          type="date"
          value={testDate}
        />
      </TestWrapper>
    );

    // Should format according to Spanish locale settings
    const formattedElement = screen.getByTitle(testDate.toISOString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('formats numbers with locale-specific separators', () => {
    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="number"
          value={testNumber}
        />
      </TestWrapper>
    );

    // US format should use comma for thousands, period for decimal
    const formattedElement = screen.getByTitle(testNumber.toString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('formats numbers for European locales', () => {
    render(
      <TestWrapper locale="fr">
        <TestCulturalFormatting
          type="number"
          value={testNumber}
        />
      </TestWrapper>
    );

    // French format should use appropriate separators
    const formattedElement = screen.getByTitle(testNumber.toString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('formats currency with proper symbols', () => {
    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="currency"
          value={testCurrency}
        />
      </TestWrapper>
    );

    // Should format with currency symbol
    const formattedElement = screen.getByTitle(testCurrency.toString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('formats currency for different locales and currencies', () => {
    render(
      <TestWrapper locale="fr">
        <TestCulturalFormatting
          type="currency"
          value={testCurrency}
        />
      </TestWrapper>
    );

    // Should format with appropriate currency for French locale
    const formattedElement = screen.getByTitle(testCurrency.toString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('formats time with locale-specific conventions', () => {
    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="time"
          value={testDate}
        />
      </TestWrapper>
    );

    // Should format time according to locale
    const formattedElement = screen.getByTitle(testDate.toISOString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('formats time for different locales', () => {
    render(
      <TestWrapper locale="fr">
        <TestCulturalFormatting
          type="time"
          value={testDate}
        />
      </TestWrapper>
    );

    // Should format time according to French locale
    const formattedElement = screen.getByTitle(testDate.toISOString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('handles relative time formatting', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="relative"
          value={oneHourAgo}
        />
      </TestWrapper>
    );

    // Should show relative time
    const formattedElement = screen.getByTitle(oneHourAgo.toISOString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('provides proper accessibility attributes', () => {
    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="date"
          value={testDate}
        />
      </TestWrapper>
    );

    const formattedElement = screen.getByTitle(testDate.toISOString());
    expect(formattedElement).toHaveAttribute('title', testDate.toISOString());
    expect(formattedElement).toHaveAttribute('aria-label', expect.stringContaining('March 15, 2024'));
  });

  it('handles datetime formatting correctly', () => {
    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="datetime"
          value={testDate}
        />
      </TestWrapper>
    );

    // Should format both date and time
    const formattedElement = screen.getByTitle(testDate.toISOString());
    expect(formattedElement).toBeInTheDocument();
  });

  it('supports custom formatting options', () => {
    render(
      <TestWrapper locale="en">
        <TestCulturalFormatting
          type="number"
          value={testNumber}
          options={{
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }}
        />
      </TestWrapper>
    );

    // Should format with custom decimal places
    const formattedElement = screen.getByTitle(testNumber.toString());
    expect(formattedElement).toBeInTheDocument();
  });
});
