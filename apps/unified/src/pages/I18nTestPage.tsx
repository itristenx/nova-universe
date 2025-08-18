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
    <div className={`min-h-screen bg-gray-50 p-8 ${isRTL ? 'text-right' : 'text-left'}`} dir={direction}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('app.name')} - {t('language.switcher.title')}
            </h1>
            <LanguageSwitcher variant="button" size="md" />
          </div>
          <p className="text-gray-600">
            {t('app.tagline')}
          </p>
        </header>

        <div className="space-y-8">
          {/* Current Language Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('language.switcher.current')}</h2>
            <div className="space-y-2">
              <p><strong>Code:</strong> {language.code}</p>
              <p><strong>Name:</strong> {language.name}</p>
              <p><strong>Native Name:</strong> {language.nativeName}</p>
              <p><strong>Direction:</strong> {direction}</p>
              <p><strong>Is RTL:</strong> {isRTL ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Navigation Translations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('navigation.menu')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p><strong>{t('navigation.dashboard')}</strong></p>
                <p><strong>{t('navigation.tickets')}</strong></p>
                <p><strong>{t('navigation.assets')}</strong></p>
                <p><strong>{t('navigation.users')}</strong></p>
              </div>
              <div className="space-y-2">
                <p><strong>{t('navigation.reports')}</strong></p>
                <p><strong>{t('navigation.settings')}</strong></p>
                <p><strong>{t('navigation.admin')}</strong></p>
                <p><strong>{t('navigation.help')}</strong></p>
              </div>
            </div>
          </div>

          {/* Form Translations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('forms.required')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')} *
                </label>
                <input 
                  type="email" 
                  placeholder={t('auth.email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.password')} *
                </label>
                <input 
                  type="password" 
                  placeholder={t('auth.password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {t('auth.login')}
                </button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Priorities and Statuses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('tickets.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">{t('tickets.priority')}</h3>
                <ul className="space-y-1">
                  <li>🔴 {t('tickets.priorities.critical')}</li>
                  <li>🟠 {t('tickets.priorities.urgent')}</li>
                  <li>🟡 {t('tickets.priorities.high')}</li>
                  <li>🔵 {t('tickets.priorities.medium')}</li>
                  <li>⚪ {t('tickets.priorities.low')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t('tickets.status')}</h3>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Language Switcher Variants</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Dropdown (Default)</p>
                <LanguageSwitcher variant="dropdown" />
              </div>
              <div>
                <p className="font-medium mb-2">Button</p>
                <LanguageSwitcher variant="button" />
              </div>
              <div>
                <p className="font-medium mb-2">Minimal</p>
                <LanguageSwitcher variant="minimal" />
              </div>
            </div>
          </div>

          {/* Error Messages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('common.error')}</h2>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                {t('errors.network')}
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                {t('errors.validation')}
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                {t('auth.loginSuccess')}
              </div>
            </div>
          </div>

          {/* Cultural Formatting Demonstration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cultural Formatting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Date & Time Formatting</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Date:</strong> {formatting.formatDate(sampleDate)}</p>
                  <p><strong>Short Date:</strong> {formatting.formatDate(sampleDate, FORMAT_PRESETS.shortDate)}</p>
                  <p><strong>Long Date:</strong> {formatting.formatDate(sampleDate, FORMAT_PRESETS.longDate)}</p>
                  <p><strong>Time:</strong> {formatting.formatTime(sampleDate)}</p>
                  <p><strong>Date & Time:</strong> {formatting.formatDateTime(sampleDate)}</p>
                  <p><strong>Relative:</strong> {formatting.formatRelativeTime(new Date(Date.now() - 3600000))}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Number & Currency Formatting</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Number:</strong> {formatting.formatNumber(sampleAmount)}</p>
                  <p><strong>Currency:</strong> {formatting.formatCurrency(sampleAmount)}</p>
                  <p><strong>Percentage:</strong> {formatting.formatPercentage(samplePercentage)}</p>
                  <p><strong>Compact:</strong> {formatting.formatNumber(1234567, FORMAT_PRESETS.compactNumber)}</p>
                  <p><strong>File Size:</strong> {formatting.formatFileSize(sampleFileSize)}</p>
                  <p><strong>Locale:</strong> {formatting.locale}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
