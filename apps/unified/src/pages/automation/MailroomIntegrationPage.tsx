import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EnvelopeIcon,
  InboxArrowDownIcon,
  UserIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

// Types
interface EmailMessage {
  id: string;
  messageId: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  bodyHtml?: string;
  receivedAt: string;
  processedAt?: string;
  status: 'unprocessed' | 'processing' | 'processed' | 'failed' | 'manual_review';
  category?: 'incident' | 'request' | 'change' | 'inquiry' | 'spam';
  confidence: number;
  extractedData?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    ticketType?: string;
    department?: string;
    keywords?: string[];
    attachments?: string[];
  };
  automationResult?: {
    ticketCreated?: string;
    assignedTo?: string;
    category?: string;
    actions?: string[];
  };
  flags: string[];
  attachments: Array<{
    id: string;
    filename: string;
    size: number;
    contentType: string;
  }>;
}

interface ProcessingRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    config: any;
  }>;
  priority: number;
  isActive: boolean;
  matchCount: number;
  lastTriggered?: string;
}

export default function MailroomIntegrationPage() {
  const { t } = useTranslation(['mailroom', 'common']);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [processingRules, setProcessingRules] = useState<ProcessingRule[]>([]);
  const [activeTab, setActiveTab] = useState<'inbox' | 'processed' | 'rules' | 'analytics'>(
    'inbox',
  );
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadMailroomData();
  }, []);

  const loadMailroomData = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/mailroom');
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
        setProcessingRules(data.rules || []);
      } else {
        // Fallback to empty state if API fails
        setEmails([]);
        setProcessingRules([]);
      }
    } catch (_error) {
      console.warn('Mailroom API unavailable, using fallback data:', error);
      // Fallback to empty state
      setEmails([]);
      setProcessingRules([]);
    }

    setLoading(false);
  };

  const processEmail = async (emailId: string) => {
    setIsProcessing(true);

    // Simulate email processing
    setTimeout(() => {
      setEmails((prev) =>
        prev.map((email) =>
          email.id === emailId
            ? {
                ...email,
                status: 'processed',
                processedAt: new Date().toISOString(),
                automationResult: {
                  ticketCreated: `REQ-2024-${Math.floor(Math.random() * 1000)
                    .toString()
                    .padStart(3, '0')}`,
                  assignedTo: 'it-support',
                  category: 'general',
                  actions: ['created_ticket', 'assigned_team'],
                },
              }
            : email,
        ),
      );
      setIsProcessing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return (
          <div className="h-5 w-5">
            <LoadingSpinner size="sm" />
          </div>
        );
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'manual_review':
        return <EyeIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InboxArrowDownIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'manual_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const unprocessedCount = emails.filter((e) => e.status === 'unprocessed').length;
  const processingCount = emails.filter((e) => e.status === 'processing').length;
  const processedCount = emails.filter((e) => e.status === 'processed').length;
  const reviewCount = emails.filter((e) => e.status === 'manual_review').length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-8 text-white">
        <div className="mb-2 flex items-center space-x-3">
          <EnvelopeIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('mailroom:title')}</h1>
        </div>
        <p className="text-blue-100">{t('mailroom:subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <InboxArrowDownIcon className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {unprocessedCount}
              </div>
              <div className="text-sm text-gray-500">{t('mailroom:unprocessed')}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {processingCount}
              </div>
              <div className="text-sm text-gray-500">{t('mailroom:processing')}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {processedCount}
              </div>
              <div className="text-sm text-gray-500">{t('mailroom:processed')}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <EyeIcon className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reviewCount}</div>
              <div className="text-sm text-gray-500">{t('mailroom:needsReview')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        <nav className="flex space-x-1">
          {(['inbox', 'processed', 'rules', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t(`mailroom:tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {(activeTab === 'inbox' || activeTab === 'processed') && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === 'inbox' ? t('mailroom:incomingEmails') : t('mailroom:processedEmails')}
            </h2>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {
                  emails.filter((e) =>
                    activeTab === 'inbox'
                      ? ['unprocessed', 'processing', 'manual_review'].includes(e.status)
                      : e.status === 'processed',
                  ).length
                }{' '}
                {t('mailroom:emails')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {emails
              .filter((email) =>
                activeTab === 'inbox'
                  ? ['unprocessed', 'processing', 'manual_review'].includes(email.status)
                  : email.status === 'processed',
              )
              .map((email) => (
                <div
                  key={email.id}
                  className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start space-x-3">
                      {getStatusIcon(email.status)}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <h3 className="truncate font-medium text-gray-900 dark:text-white">
                            {email.subject}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${getStatusColor(email.status)}`}
                          >
                            {t(`mailroom:status.${email.status}`)}
                          </span>
                          {email.extractedData?.priority && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(email.extractedData.priority)}`}
                            >
                              {t(`mailroom:priority.${email.extractedData.priority}`)}
                            </span>
                          )}
                          {email.category && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {t(`mailroom:category.${email.category}`)}
                            </span>
                          )}
                        </div>

                        <div className="mb-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-4 w-4" />
                            <span>
                              {email.from.name} ({email.from.email})
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{email.receivedAt}</span>
                          </div>
                          {email.confidence && (
                            <div className="flex items-center space-x-1">
                              <span>Confidence: {Math.round(email.confidence * 100)}%</span>
                            </div>
                          )}
                        </div>

                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {email.body}
                        </p>

                        {/* Automation Results */}
                        {email.automationResult && (
                          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                            <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                              {t('mailroom:automationResults')}:
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {email.automationResult.ticketCreated && (
                                <span>Ticket: {email.automationResult.ticketCreated}</span>
                              )}
                              {email.automationResult.assignedTo && (
                                <span>Assigned: {email.automationResult.assignedTo}</span>
                              )}
                              {email.automationResult.actions && (
                                <span>Actions: {email.automationResult.actions.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Flags */}
                        {email.flags.length > 0 && (
                          <div className="mt-2 flex items-center space-x-2">
                            {email.flags.map((flag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center space-x-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                              >
                                <TagIcon className="h-3 w-3" />
                                <span>{flag}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {email.status === 'unprocessed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          processEmail(email.id);
                        }}
                        disabled={isProcessing}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="flex items-center space-x-1">
                            <LoadingSpinner size="sm" />
                            <span>{t('mailroom:processing')}</span>
                          </div>
                        ) : (
                          t('mailroom:process')
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('mailroom:processingRules')}
            </h2>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              {t('mailroom:createRule')}
            </button>
          </div>

          <div className="space-y-4">
            {processingRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {rule.isActive ? t('mailroom:active') : t('mailroom:inactive')}
                      </span>
                      <span className="text-xs text-gray-500">Priority {rule.priority}</span>
                    </div>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {rule.description}
                    </p>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <div className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                          {t('mailroom:conditions')}:
                        </div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          {rule.conditions.map((condition, index) => (
                            <li key={index} className="text-xs">
                              {condition.field} {condition.operator} "{condition.value}"
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                          {t('mailroom:actions')}:
                        </div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          {rule.actions.map((action, index) => (
                            <li key={index} className="text-xs">
                              {action.type}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-gray-600">
                  <div>
                    {t('mailroom:matched')}: {rule.matchCount} {t('mailroom:emails')}
                  </div>
                  {rule.lastTriggered && (
                    <div>
                      {t('mailroom:lastTriggered')}: {rule.lastTriggered}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {t('mailroom:analytics')}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round((processedCount / emails.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('mailroom:automationRate')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">2.3min</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('mailroom:avgProcessingTime')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">87%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('mailroom:accuracyRate')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedEmail.subject}
                </h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>{t('mailroom:from')}:</strong> {selectedEmail.from.name} (
                    {selectedEmail.from.email})
                  </div>
                  <div>
                    <strong>{t('mailroom:received')}:</strong> {selectedEmail.receivedAt}
                  </div>
                  <div>
                    <strong>{t('mailroom:status')}:</strong>
                    <span
                      className={`ml-2 rounded-full px-2 py-1 text-xs ${getStatusColor(selectedEmail.status)}`}
                    >
                      {t(`mailroom:status.${selectedEmail.status}`)}
                    </span>
                  </div>
                  {selectedEmail.processedAt && (
                    <div>
                      <strong>{t('mailroom:processed')}:</strong> {selectedEmail.processedAt}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-600">
                  <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {selectedEmail.body}
                  </div>
                </div>

                {selectedEmail.extractedData && (
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-600">
                    <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                      {t('mailroom:extractedData')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedEmail.extractedData.priority && (
                        <div>
                          <strong>{t('mailroom:priorityLabel')}:</strong>
                          <span
                            className={`ml-2 rounded-full px-2 py-1 text-xs ${getPriorityColor(selectedEmail.extractedData.priority)}`}
                          >
                            {t(`mailroom:priority.${selectedEmail.extractedData.priority}`)}
                          </span>
                        </div>
                      )}
                      {selectedEmail.extractedData.department && (
                        <div>
                          <strong>{t('mailroom:department')}:</strong>{' '}
                          {selectedEmail.extractedData.department}
                        </div>
                      )}
                      {selectedEmail.extractedData.keywords && (
                        <div className="col-span-2">
                          <strong>{t('mailroom:keywords')}:</strong>{' '}
                          {selectedEmail.extractedData.keywords.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedEmail.automationResult && (
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-600">
                    <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                      {t('mailroom:automationResults')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedEmail.automationResult.ticketCreated && (
                        <div>
                          <strong>{t('mailroom:ticketCreated')}:</strong>{' '}
                          {selectedEmail.automationResult.ticketCreated}
                        </div>
                      )}
                      {selectedEmail.automationResult.assignedTo && (
                        <div>
                          <strong>{t('mailroom:assignedTo')}:</strong>{' '}
                          {selectedEmail.automationResult.assignedTo}
                        </div>
                      )}
                      {selectedEmail.automationResult.actions && (
                        <div className="col-span-2">
                          <strong>{t('mailroom:actionsPerformed')}:</strong>{' '}
                          {selectedEmail.automationResult.actions.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
