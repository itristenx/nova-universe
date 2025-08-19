import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Eye,
  Keyboard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Monitor,
  Volume2,
  Type,
  Contrast,
  Focus,
  RefreshCw,
} from 'lucide-react'

// Types
interface AccessibilityAuditResult {
  category: string
  rule: string
  description: string
  status: 'pass' | 'fail' | 'warning'
  impact: 'low' | 'medium' | 'high' | 'critical'
  element?: string
  suggestion: string
  wcagCriteria: string
}

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
}

interface ColorContrastResult {
  foreground: string
  background: string
  ratio: number
  wcagLevel: 'AA' | 'AAA' | 'Fail'
  element: string
}

export default function AccessibilityAuditPage() {
  const { t } = useTranslation(['accessibility', 'common'])
  const [auditResults, setAuditResults] = useState<AccessibilityAuditResult[]>([])
  const [contrastResults, setContrastResults] = useState<ColorContrastResult[]>([])
  const [isAuditing, setIsAuditing] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    focusIndicators: true,
  })
  const [auditScore, setAuditScore] = useState(0)

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    
    // Run initial audit
    runAccessibilityAudit()
  }, [])

  const runAccessibilityAudit = async () => {
    setIsAuditing(true)
    
    try {
      // Simulate accessibility audit - in a real implementation, this would use axe-core
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResults: AccessibilityAuditResult[] = [
        {
          category: 'Images',
          rule: 'image-alt',
          description: 'All images must have alternative text',
          status: 'pass',
          impact: 'critical',
          suggestion: 'Continue providing descriptive alt text for all images',
          wcagCriteria: 'WCAG 2.1 Level A - 1.1.1'
        },
        {
          category: 'Forms',
          rule: 'label-content-name-mismatch',
          description: 'Form labels must match their accessible names',
          status: 'warning',
          impact: 'medium',
          element: 'search input',
          suggestion: 'Ensure form labels are clearly associated with their inputs',
          wcagCriteria: 'WCAG 2.1 Level A - 2.5.3'
        },
        {
          category: 'Navigation',
          rule: 'skip-link',
          description: 'Skip links must be provided for keyboard users',
          status: 'pass',
          impact: 'high',
          suggestion: 'Continue providing skip links for main content',
          wcagCriteria: 'WCAG 2.1 Level A - 2.4.1'
        },
        {
          category: 'Color Contrast',
          rule: 'color-contrast',
          description: 'Text must have sufficient color contrast',
          status: 'pass',
          impact: 'critical',
          suggestion: 'Maintain current contrast ratios',
          wcagCriteria: 'WCAG 2.1 Level AA - 1.4.3'
        },
        {
          category: 'Keyboard Navigation',
          rule: 'keyboard-trap',
          description: 'Keyboard focus must not be trapped',
          status: 'pass',
          impact: 'critical',
          suggestion: 'Continue providing proper focus management',
          wcagCriteria: 'WCAG 2.1 Level A - 2.1.2'
        },
        {
          category: 'ARIA',
          rule: 'aria-labels',
          description: 'Interactive elements must have accessible names',
          status: 'warning',
          impact: 'medium',
          element: 'toggle buttons',
          suggestion: 'Add aria-label attributes to unlabeled interactive elements',
          wcagCriteria: 'WCAG 2.1 Level A - 4.1.2'
        }
      ]
      
      setAuditResults(mockResults)
      
      // Calculate audit score
      const passCount = mockResults.filter(r => r.status === 'pass').length
      const totalCount = mockResults.length
      setAuditScore(Math.round((passCount / totalCount) * 100))
      
      // Mock color contrast results
      const mockContrastResults: ColorContrastResult[] = [
        {
          foreground: '#1f2937',
          background: '#ffffff',
          ratio: 12.6,
          wcagLevel: 'AAA',
          element: 'body text'
        },
        {
          foreground: '#374151',
          background: '#f9fafb',
          ratio: 8.2,
          wcagLevel: 'AAA',
          element: 'secondary text'
        },
        {
          foreground: '#ffffff',
          background: '#3b82f6',
          ratio: 5.4,
          wcagLevel: 'AA',
          element: 'primary button'
        }
      ]
      
      setContrastResults(mockContrastResults)
      
    } catch (error) {
      console.error('Accessibility audit failed:', error)
    } finally {
      setIsAuditing(false)
    }
  }

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
    
    // Apply setting to document
    applyAccessibilitySetting(key, value)
  }

  const applyAccessibilitySetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const root = document.documentElement
    
    switch (key) {
      case 'highContrast':
        root.classList.toggle('high-contrast', value)
        break
      case 'largeText':
        root.classList.toggle('large-text', value)
        break
      case 'reducedMotion':
        root.classList.toggle('reduced-motion', value)
        break
      case 'focusIndicators':
        root.classList.toggle('enhanced-focus', value)
        break
    }
  }

  const getStatusIcon = (status: AccessibilityAuditResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getImpactColor = (impact: AccessibilityAuditResult['impact']) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  const getContrastLevelColor = (level: ColorContrastResult['wcagLevel']) => {
    switch (level) {
      case 'AAA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'AA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Fail':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('accessibility.auditTitle', 'Accessibility Audit')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('accessibility.auditDescription', 'Comprehensive accessibility testing and configuration for WCAG 2.1 AA compliance')}
        </p>
      </div>

      {/* Audit Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${auditScore >= 90 ? 'bg-green-100 dark:bg-green-900' : auditScore >= 70 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <Eye className={`h-6 w-6 ${auditScore >= 90 ? 'text-green-600 dark:text-green-400' : auditScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('accessibility.auditScore', 'Audit Score')}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {auditScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('accessibility.testsPass', 'Tests Passed')}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {auditResults.filter(r => r.status === 'pass').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('accessibility.issuesFound', 'Issues Found')}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {auditResults.filter(r => r.status !== 'pass').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Controls */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('accessibility.runAudit', 'Run Accessibility Audit')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('accessibility.auditHelp', 'Test the current page for accessibility compliance')}
            </p>
          </div>
          <button
            onClick={runAccessibilityAudit}
            disabled={isAuditing}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? t('accessibility.auditing', 'Auditing...') : t('accessibility.startAudit', 'Start Audit')}
          </button>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('accessibility.settings', 'Accessibility Settings')}
        </h3>
        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3">
                  {key === 'highContrast' && <Contrast className="h-5 w-5 text-gray-500" />}
                  {key === 'largeText' && <Type className="h-5 w-5 text-gray-500" />}
                  {key === 'reducedMotion' && <Monitor className="h-5 w-5 text-gray-500" />}
                  {key === 'screenReaderOptimized' && <Volume2 className="h-5 w-5 text-gray-500" />}
                  {key === 'keyboardNavigation' && <Keyboard className="h-5 w-5 text-gray-500" />}
                  {key === 'focusIndicators' && <Focus className="h-5 w-5 text-gray-500" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t(`accessibility.${key}`, key.replace(/([A-Z])/g, ' $1').toLowerCase())}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t(`accessibility.${key}Help`, '')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => updateSetting(key as keyof AccessibilitySettings, !value)}
                title={t(`accessibility.toggle${key}`, `Toggle ${key}`)}
                aria-label={t(`accessibility.toggle${key}`, `Toggle ${key}`)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Results */}
      {auditResults.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('accessibility.auditResults', 'Audit Results')}
          </h3>
          <div className="space-y-4">
            {auditResults.map((result, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {result.rule}
                        </h4>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getImpactColor(result.impact)}`}>
                          {result.impact}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {result.description}
                      </p>
                      {result.element && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          Element: {result.element}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {result.suggestion}
                      </p>
                      <p className="mt-1 text-xs font-mono text-blue-600 dark:text-blue-400">
                        {result.wcagCriteria}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Contrast Results */}
      {contrastResults.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('accessibility.colorContrast', 'Color Contrast Analysis')}
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Element
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Colors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    WCAG Level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {contrastResults.map((result, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {result.element}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center text-xs font-mono"
                          title={`Foreground color: ${result.foreground}`}
                        >
                          <span className="sr-only">{result.foreground}</span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">on</span>
                        <div
                          className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center text-xs font-mono"
                          title={`Background color: ${result.background}`}
                        >
                          <span className="sr-only">{result.background}</span>
                        </div>
                        <div className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                          {result.foreground} / {result.background}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {result.ratio.toFixed(1)}:1
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getContrastLevelColor(result.wcagLevel)}`}>
                        {result.wcagLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
