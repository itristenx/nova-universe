import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// Mock fetch for tests
global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>{component}</BrowserRouter>
    </I18nextProvider>,
  );
};

describe('Basic App Tests', () => {
  test('Should run basic test successfully', () => {
    expect(true).toBe(true);
  });

  test('i18n should be configured', () => {
    expect(i18n).toBeDefined();
    expect(i18n.language).toBeDefined();
  });

  test('Environment should be properly configured', () => {
    // Test that mock data is disabled in test environment
    expect(process.env.VITE_USE_MOCK_DATA).toBe('false');
  });
});
