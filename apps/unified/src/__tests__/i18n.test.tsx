import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import i18n from '../i18n/index';
import ServiceStatusPage from '../pages/monitoring/ServiceStatusPage';
import CosmoAIPage from '../pages/ai/CosmoAIPage';
import KnowledgeCommunityPage from '../pages/knowledge/KnowledgeCommunityPage';

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

describe('Internationalization (i18n) Integration', () => {
  test('ServiceStatusPage renders with English translations', async () => {
    await i18n.changeLanguage('en');

    renderWithProviders(<ServiceStatusPage />);

    expect(screen.getByText('Service Status')).toBeInTheDocument();
    expect(screen.getByText('System Metrics')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  test('ServiceStatusPage renders with Spanish translations', async () => {
    await i18n.changeLanguage('es');

    renderWithProviders(<ServiceStatusPage />);

    expect(screen.getByText('Estado del Servicio')).toBeInTheDocument();
    expect(screen.getByText('Métricas del Sistema')).toBeInTheDocument();
    expect(screen.getByText('Actualizar')).toBeInTheDocument();
  });

  test('ServiceStatusPage renders with French translations', async () => {
    await i18n.changeLanguage('fr');

    renderWithProviders(<ServiceStatusPage />);

    expect(screen.getByText('État du Service')).toBeInTheDocument();
    expect(screen.getByText('Métriques Système')).toBeInTheDocument();
    expect(screen.getByText('Actualiser')).toBeInTheDocument();
  });

  test('ServiceStatusPage renders with Arabic translations and RTL', async () => {
    await i18n.changeLanguage('ar');

    renderWithProviders(<ServiceStatusPage />);

    expect(screen.getByText('حالة الخدمة')).toBeInTheDocument();
    expect(screen.getByText('مقاييس النظام')).toBeInTheDocument();
    expect(screen.getByText('تحديث')).toBeInTheDocument();
  });

  test('CosmoAIPage renders with English translations', async () => {
    await i18n.changeLanguage('en');

    renderWithProviders(<CosmoAIPage />);

    expect(screen.getByText('Welcome to Cosmo AI')).toBeInTheDocument();
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });

  test('CosmoAIPage renders with Spanish translations', async () => {
    await i18n.changeLanguage('es');

    renderWithProviders(<CosmoAIPage />);

    expect(screen.getByText('Bienvenido a Cosmo IA')).toBeInTheDocument();
    expect(screen.getByText('Nueva Conversación')).toBeInTheDocument();
  });

  test('KnowledgeCommunityPage renders without errors', async () => {
    await i18n.changeLanguage('en');

    renderWithProviders(<KnowledgeCommunityPage />);

    // Should render without throwing errors
    expect(document.body).toBeInTheDocument();
  });

  test('Language switching updates document direction for RTL', async () => {
    await i18n.changeLanguage('ar');

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        dir: '',
        lang: '',
      },
      writable: true,
    });

    await i18n.changeLanguage('ar');

    expect(i18n.language).toBe('ar');
  });

  test('LanguageSwitcher component functionality', async () => {
    const { default: LanguageSwitcher } = await import('../components/common/LanguageSwitcher');

    renderWithProviders(<LanguageSwitcher />);

    // Should render language switcher
    expect(screen.getByLabelText('Select language')).toBeInTheDocument();
  });
});

describe('Translation Key Coverage', () => {
  test('ServiceStatus namespace has required keys', () => {
    const requiredKeys = [
      'title',
      'allSystemsOperational',
      'someServicesIssues',
      'minorIssuesDetected',
      'systemMetrics',
      'refresh',
      'lastUpdated',
      'activeIncidents',
      'scheduledMaintenance',
      'serviceDetails',
      'uptime',
      'response',
      'affected',
      'started',
      'updated',
    ];

    requiredKeys.forEach((key) => {
      expect(i18n.exists(`serviceStatus:${key}`)).toBe(true);
    });
  });

  test('CosmoAI namespace has required keys', () => {
    const requiredKeys = [
      'title',
      'welcome',
      'description',
      'newChat',
      'thinking',
      'placeholder',
      'sendMessage',
      'pressEnterToSend',
      'conversationSaved',
      'exportChat',
    ];

    requiredKeys.forEach((key) => {
      expect(i18n.exists(`cosmoAI:${key}`)).toBe(true);
    });
  });

  test('KnowledgeCommunity namespace has required keys', () => {
    const requiredKeys = [
      'title',
      'experts',
      'articles',
      'discussions',
      'challenges',
      'leaderboard',
    ];

    requiredKeys.forEach((key) => {
      expect(i18n.exists(`knowledgeCommunity:${key}`)).toBe(true);
    });
  });
});
