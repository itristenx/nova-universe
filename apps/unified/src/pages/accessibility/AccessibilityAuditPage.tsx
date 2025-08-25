import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EyeIcon,
  SpeakerWaveIcon,
  CursorArrowRaysIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

// Types
interface AccessibilityRule {
  id: string;
  guideline: string;
  level: 'A' | 'AA' | 'AAA';
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  title: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagReference: string;
}

interface AccessibilityAuditResult {
  id: string;
  ruleId: string;
  status: 'pass' | 'fail' | 'warning' | 'manual';
  element?: string;
  message: string;
  helpUrl?: string;
  screenshot?: string;
  suggestions: string[];
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: number;
}

export default function AccessibilityAuditPage() {
  const { t } = useTranslation(['accessibility', 'common']);
  const [auditResults, setAuditResults] = useState<AccessibilityAuditResult[]>([]);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindness: 'none',
    fontSize: 16,
  });
  const [activeTab, setActiveTab] = useState<'audit' | 'settings' | 'guidelines'>('audit');
  const [loading, setLoading] = useState(false);
  const [auditRunning, setAuditRunning] = useState(false);

  useEffect(() => {
    loadAccessibilitySettings();
  }, []);

  const loadAccessibilitySettings = async () => {
    try {
      const response = await fetch('/api/accessibility/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (_error) {
      console.warn('Accessibility API not available, using defaults:', error);
    }
  };

  const runAccessibilityAudit = async () => {
    setAuditRunning(true);
    setLoading(true);

    try {
      const response = await fetch('/api/accessibility/audit', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setAuditResults(data.results || []);
      } else {
        // Fallback to empty state if API fails
        setAuditResults([]);
      }
    } catch (_error) {
      console.warn('Accessibility audit API unavailable, using fallback data:', error);
      // Fallback to empty state
      setAuditResults([]);
    }

    setAuditRunning(false);
    setLoading(false);
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Apply settings to document
    applyAccessibilitySettings(newSettings);
  };

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // High contrast
    root.classList.toggle('high-contrast', newSettings.highContrast);

    // Large text
    root.classList.toggle('large-text', newSettings.largeText);

    // Reduced motion
    root.classList.toggle('reduce-motion', newSettings.reduceMotion);

    // Font size
    root.style.fontSize = `${newSettings.fontSize}px`;

    // Color blindness simulation
    root.setAttribute('data-colorblind', newSettings.colorBlindness);

    // Focus indicators
    root.classList.toggle('enhanced-focus', newSettings.focusIndicators);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'manual':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'serious':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'minor':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const wcagGuidelines = [
    {
      principle: 'Perceivable',
      guidelines: [
        {
          id: '1.1',
          title: 'Text Alternatives',
          description: 'Provide text alternatives for non-text content',
        },
        {
          id: '1.2',
          title: 'Time-based Media',
          description: 'Provide alternatives for time-based media',
        },
        {
          id: '1.3',
          title: 'Adaptable',
          description:
            'Create content that can be presented in different ways without losing meaning',
        },
        {
          id: '1.4',
          title: 'Distinguishable',
          description: 'Make it easier for users to see and hear content',
        },
      ],
    },
    {
      principle: 'Operable',
      guidelines: [
        {
          id: '2.1',
          title: 'Keyboard Accessible',
          description: 'Make all functionality available from a keyboard',
        },
        {
          id: '2.2',
          title: 'Enough Time',
          description: 'Provide users enough time to read and use content',
        },
        {
          id: '2.3',
          title: 'Seizures and Physical Reactions',
          description: 'Do not design content that causes seizures',
        },
        {
          id: '2.4',
          title: 'Navigable',
          description: 'Provide ways to help users navigate and find content',
        },
        {
          id: '2.5',
          title: 'Input Modalities',
          description: 'Make it easier for users to operate functionality through various inputs',
        },
      ],
    },
    {
      principle: 'Understandable',
      guidelines: [
        {
          id: '3.1',
          title: 'Readable',
          description: 'Make text content readable and understandable',
        },
        {
          id: '3.2',
          title: 'Predictable',
          description: 'Make web pages appear and operate in predictable ways',
        },
        {
          id: '3.3',
          title: 'Input Assistance',
          description: 'Help users avoid and correct mistakes',
        },
      ],
    },
    {
      principle: 'Robust',
      guidelines: [
        {
          id: '4.1',
          title: 'Compatible',
          description: 'Maximize compatibility with assistive technologies',
        },
      ],
    },
  ];

  const passCount = auditResults.filter((r) => r.status === 'pass').length;
  const failCount = auditResults.filter((r) => r.status === 'fail').length;
  const warningCount = auditResults.filter((r) => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-6 py-8 text-white">
        <div className="mb-2 flex items-center space-x-3">
          <EyeIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('accessibility:title')}</h1>
        </div>
        <p className="text-green-100">{t('accessibility:subtitle')}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        <nav className="flex space-x-1">
          {(['audit', 'settings', 'guidelines'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t(`accessibility:tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Audit Controls */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {t('accessibility:wcagAudit')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('accessibility:auditDescription')}
                </p>
              </div>
              <button
                onClick={runAccessibilityAudit}
                disabled={auditRunning}
                className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {auditRunning ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>{t('accessibility:auditing')}</span>
                  </div>
                ) : (
                  t('accessibility:runAudit')
                )}
              </button>
            </div>

            {/* Audit Summary */}
            {auditResults.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {passCount}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {t('accessibility:passed')}
                  </div>
                </div>
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {failCount}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {t('accessibility:failed')}
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {warningCount}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    {t('accessibility:warnings')}
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((passCount / auditResults.length) * 100)}%
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {t('accessibility:compliance')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Results */}
          {auditResults.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t('accessibility:auditResults')}
              </h3>

              <div className="space-y-4">
                {auditResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="mb-1 flex items-center space-x-3">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {result.ruleId}
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${getImpactColor(result.impact)}`}
                            >
                              {t(`accessibility:impact.${result.impact}`)}
                            </span>
                          </div>
                          {result.element && (
                            <div className="mb-2 font-mono text-xs text-gray-500">
                              Element: {result.element}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {result.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    {result.suggestions.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                        <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('accessibility:suggestions')}:
                        </div>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {result.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="mt-1 text-blue-500">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.helpUrl && (
                      <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                        <a
                          href={result.helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {t('accessibility:learnMore')} →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {t('accessibility:accessibilitySettings')}
          </h2>

          <div className="space-y-6">
            {/* Visual Settings */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                {t('accessibility:visualSettings')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('accessibility:highContrast')}
                    </label>
                    <p className="text-xs text-gray-500">{t('accessibility:highContrastDesc')}</p>
                  </div>
                  <button
                    onClick={() => updateSetting('highContrast', !settings.highContrast)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('accessibility:largeText')}
                    </label>
                    <p className="text-xs text-gray-500">{t('accessibility:largeTextDesc')}</p>
                  </div>
                  <button
                    onClick={() => updateSetting('largeText', !settings.largeText)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.largeText ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.largeText ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('accessibility:fontSize')}: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('accessibility:colorBlindness')}
                  </label>
                  <select
                    value={settings.colorBlindness}
                    onChange={(e) => updateSetting('colorBlindness', e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">{t('accessibility:none')}</option>
                    <option value="protanopia">{t('accessibility:protanopia')}</option>
                    <option value="deuteranopia">{t('accessibility:deuteranopia')}</option>
                    <option value="tritanopia">{t('accessibility:tritanopia')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Motion Settings */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                {t('accessibility:motionSettings')}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('accessibility:reduceMotion')}
                  </label>
                  <p className="text-xs text-gray-500">{t('accessibility:reduceMotionDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reduceMotion ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Interaction Settings */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                {t('accessibility:interactionSettings')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('accessibility:enhancedFocus')}
                    </label>
                    <p className="text-xs text-gray-500">{t('accessibility:enhancedFocusDesc')}</p>
                  </div>
                  <button
                    onClick={() => updateSetting('focusIndicators', !settings.focusIndicators)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.focusIndicators ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.focusIndicators ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('accessibility:keyboardNavigation')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('accessibility:keyboardNavigationDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting('keyboardNavigation', !settings.keyboardNavigation)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('accessibility:wcagGuidelines')}
            </h2>
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {t('accessibility:viewFullGuidelines')} →
            </a>
          </div>

          <div className="space-y-6">
            {wcagGuidelines.map((section) => (
              <div key={section.principle}>
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  {section.principle}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.guidelines.map((guideline) => (
                    <div
                      key={guideline.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {guideline.id}
                          </span>
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium text-gray-900 dark:text-white">
                            {guideline.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {guideline.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
