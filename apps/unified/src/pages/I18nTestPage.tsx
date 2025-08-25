import { useTranslation } from 'react-i18next';
import LanguageSwitcher, { useRTL } from '../components/LanguageSwitcher';
import { useCulturalFormatting, FORMAT_PRESETS } from '../utils/culturalFormatting';

export default function I18nTestPage() {
  const { t } = useTranslation();
  const { isRTL, direction, language } = useRTL();
  const formatting = useCulturalFormatting();

  // Sample data for formatting demonstrations
  const sampleDate = new Date('2024-01-15T14:30:00');
  const sampleAmount = 1234.56;
  const samplePercentage = 0.8456;
  const sampleFileSize = 1048576; // 1MB

  return (
    <div
      className={`min-h-screen bg-gray-50 p-8 ${isRTL ? 'text-right' : 'text-left'}`}
      dir={direction}
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('app.name')} - {t('language.switcher.title')}
            </h1>
            <LanguageSwitcher variant="button" size="md" />
          </div>
          <p className="text-gray-600">{t('app.tagline')}</p>
        </header>

        <div className="space-y-8">
          {/* Current Language Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">{t('language.switcher.current')}</h2>
            <div className="space-y-2">
              <p>
                <strong>Code:</strong> {language.code}
              </p>
              <p>
                <strong>Name:</strong> {language.name}
              </p>
              <p>
                <strong>Native Name:</strong> {language.nativeName}
              </p>
              <p>
                <strong>Direction:</strong> {direction}
              </p>
              <p>
                <strong>Is RTL:</strong> {isRTL ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {/* Navigation Translations */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">{t('navigation.menu')}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p>
                  <strong>{t('navigation.dashboard')}</strong>
                </p>
                <p>
                  <strong>{t('navigation.tickets')}</strong>
                </p>
                <p>
                  <strong>{t('navigation.assets')}</strong>
                </p>
                <p>
                  <strong>{t('navigation.users')}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>{t('navigation.reports')}</strong>
                </p>
                <p>
                  <strong>{t('navigation.settings')}</strong>
                </p>
                <p>
                  <strong>{t('navigation.admin')}</strong>
                </p>
                <p>
                  <strong>{t('navigation.help')}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Form Translations */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">{t('forms.required')}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  placeholder={t('auth.email')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('auth.password')} *
                </label>
                <input
                  type="password"
                  placeholder={t('auth.password')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  {t('auth.login')}
                </button>
                <button className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Priorities and Statuses */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">{t('tickets.title')}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">{t('tickets.priority')}</h3>
                <ul className="space-y-1">
                  <li>🔴 {t('tickets.priorities.critical')}</li>
                  <li>🟠 {t('tickets.priorities.urgent')}</li>
                  <li>🟡 {t('tickets.priorities.high')}</li>
                  <li>🔵 {t('tickets.priorities.medium')}</li>
                  <li>⚪ {t('tickets.priorities.low')}</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-medium">{t('tickets.status')}</h3>
                <ul className="space-y-1">
                  <li>🆕 {t('tickets.statuses.new')}</li>
                  <li>🔓 {t('tickets.statuses.open')}</li>
                  <li>⚙️ {t('tickets.statuses.inProgress')}</li>
                  <li>⏸️ {t('tickets.statuses.pending')}</li>
                  <li>✅ {t('tickets.statuses.resolved')}</li>
                  <li>🔒 {t('tickets.statuses.closed')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Language Switcher Variants */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Language Switcher Variants</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium">Dropdown (Default)</p>
                <LanguageSwitcher variant="dropdown" />
              </div>
              <div>
                <p className="mb-2 font-medium">Button</p>
                <LanguageSwitcher variant="button" />
              </div>
              <div>
                <p className="mb-2 font-medium">Minimal</p>
                <LanguageSwitcher variant="minimal" />
              </div>
            </div>
          </div>

          {/* Error Messages */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">{t('common.error')}</h2>
            <div className="space-y-2">
              <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
                {t('errors.network')}
              </div>
              <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-yellow-700">
                {t('errors.validation')}
              </div>
              <div className="rounded border border-green-200 bg-green-50 p-3 text-green-700">
                {t('auth.loginSuccess')}
              </div>
            </div>
          </div>

          {/* Cultural Formatting Demonstration */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Cultural Formatting</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Date & Time Formatting</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Date:</strong> {formatting.formatDate(sampleDate)}
                  </p>
                  <p>
                    <strong>Short Date:</strong>{' '}
                    {formatting.formatDate(sampleDate, FORMAT_PRESETS.shortDate)}
                  </p>
                  <p>
                    <strong>Long Date:</strong>{' '}
                    {formatting.formatDate(sampleDate, FORMAT_PRESETS.longDate)}
                  </p>
                  <p>
                    <strong>Time:</strong> {formatting.formatTime(sampleDate)}
                  </p>
                  <p>
                    <strong>Date & Time:</strong> {formatting.formatDateTime(sampleDate)}
                  </p>
                  <p>
                    <strong>Relative:</strong>{' '}
                    {formatting.formatRelativeTime(new Date(Date.now() - 3600000))}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Number & Currency Formatting</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Number:</strong> {formatting.formatNumber(sampleAmount)}
                  </p>
                  <p>
                    <strong>Currency:</strong> {formatting.formatCurrency(sampleAmount)}
                  </p>
                  <p>
                    <strong>Percentage:</strong> {formatting.formatPercentage(samplePercentage)}
                  </p>
                  <p>
                    <strong>Compact:</strong>{' '}
                    {formatting.formatNumber(1234567, FORMAT_PRESETS.compactNumber)}
                  </p>
                  <p>
                    <strong>File Size:</strong> {formatting.formatFileSize(sampleFileSize)}
                  </p>
                  <p>
                    <strong>Locale:</strong> {formatting.locale}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
