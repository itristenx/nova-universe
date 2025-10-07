import React, { useState, useEffect } from 'react';
import {
  SmartForm,
  ContextPanel,
  ContextPanelSection,
  ContextPanelField,
  Timeline,
  StatusBadge,
  useDynamicIsland,
  type FormField,
  type TimelineEvent,
} from '@components/design-system';
import { Sparkles, AlertCircle, CheckCircle, TrendingUp, Copy } from 'lucide-react';
import type { Ticket } from '@/types';

interface SimilarTicket {
  id: string;
  number: string;
  title: string;
  status: string;
  similarity: number;
  resolvedBy?: string;
  resolution?: string;
}

interface AISuggestion {
  field: string;
  value: string;
  confidence: number;
  reason: string;
}

/**
 * AI-Powered Ticket Creation
 * Intelligent ticket creation with duplicate detection and auto-categorization
 */
export const AITicketCreationPage: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [similarTickets, setSimilarTickets] = useState<SimilarTicket[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dynamicIsland = useDynamicIsland();

  // Form fields
  const formFields: FormField[] = [
    {
      id: 'title',
      name: 'title',
      label: 'Issue Title',
      type: 'text',
      placeholder: 'Brief description of the issue',
      required: true,
      helpText: 'AI will analyze this to find similar tickets',
    },
    {
      id: 'description',
      name: 'description',
      label: 'Detailed Description',
      type: 'textarea',
      placeholder: 'Provide as much detail as possible',
      required: true,
      rows: 6,
      helpText: 'AI will suggest categories based on your description',
    },
    {
      id: 'urgency',
      name: 'urgency',
      label: 'Urgency',
      type: 'select',
      required: true,
      options: [
        { value: 'low', label: 'Low - No immediate impact' },
        { value: 'medium', label: 'Medium - Some impact' },
        { value: 'high', label: 'High - Significant impact' },
        { value: 'critical', label: 'Critical - System down' },
      ],
    },
    {
      id: 'impactedUsers',
      name: 'impactedUsers',
      label: 'Number of Impacted Users',
      type: 'select',
      options: [
        { value: 'one', label: 'Just me' },
        { value: 'few', label: 'A few users (2-10)' },
        { value: 'many', label: 'Many users (10+)' },
        { value: 'all', label: 'All users' },
      ],
    },
    {
      id: 'attachments',
      name: 'attachments',
      label: 'Attachments',
      type: 'text',
      helpText: 'Screenshots or logs help us resolve issues faster (upload feature coming soon)',
      disabled: true,
    },
  ];

  // Analyze ticket as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.description) {
        analyzeTicket();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  const analyzeTicket = async () => {
    setAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock similar tickets
      const mockSimilar: SimilarTicket[] = [
        {
          id: '1',
          number: 'INC-1234',
          title: 'Unable to access email on mobile device',
          status: 'resolved',
          similarity: 92,
          resolvedBy: 'Sarah Johnson',
          resolution: 'Reset password and reconfigured device settings',
        },
        {
          id: '2',
          number: 'INC-2345',
          title: 'Email not syncing on iPhone',
          status: 'resolved',
          similarity: 85,
          resolvedBy: 'Mike Chen',
          resolution: 'Updated iOS and reinstalled email profile',
        },
      ];

      // Mock AI suggestions
      const mockSuggestions: AISuggestion[] = [
        {
          field: 'category',
          value: 'Email & Communication',
          confidence: 89,
          reason: 'Based on keywords: email, mobile, access',
        },
        {
          field: 'priority',
          value: 'Medium',
          confidence: 75,
          reason: 'Single user impact, non-critical service',
        },
        {
          field: 'assignment_group',
          value: 'Email Support Team',
          confidence: 92,
          reason: 'Best suited for email-related issues',
        },
      ];

      setSimilarTickets(mockSimilar);
      setAiSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    setFormData((prev) => ({ ...prev, [suggestion.field]: suggestion.value }));
    dynamicIsland.success('Applied', `Set ${suggestion.field} to ${suggestion.value}`);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    dynamicIsland.loading('Creating', 'Creating ticket with AI insights...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      dynamicIsland.success('Success', 'Ticket created: INC-5678');
      
      // Reset form
      setFormData({});
      setSimilarTickets([]);
      setAiSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      dynamicIsland.error('Error', 'Failed to create ticket');
    }
  };

  // Timeline events for similar tickets
  const timelineEvents: TimelineEvent[] = similarTickets.map((ticket, index) => ({
    id: ticket.id,
    type: 'status_change',
    title: ticket.number,
    description: ticket.title,
    timestamp: new Date(Date.now() - index * 86400000).toISOString(),
    user: {
      name: ticket.resolvedBy || 'Unknown',
    },
    metadata: {
      similarity: `${ticket.similarity}% match`,
      resolution: ticket.resolution,
    },
  }));

  return (
    <div className="min-h-screen bg-apple-bg-primary dark:bg-apple-bg-primary-dark">
      {/* Header */}
      <div className="glass border-b border-gray-200/20 dark:border-gray-700/20 p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-apple-md bg-gradient-to-br from-purple-500 to-blue-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-sf-display font-bold text-gray-900 dark:text-white">
                AI-Powered Ticket Creation
              </h1>
              <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mt-1">
                Intelligent duplicate detection and auto-categorization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="glass rounded-apple-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-sf-display font-semibold text-gray-900 dark:text-white">
                  Create Ticket
                </h2>
                {analyzing && (
                  <div className="flex items-center gap-2 text-sm font-sf-text text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Analyzing...
                  </div>
                )}
              </div>

              <SmartForm
                fields={formFields}
                onSubmit={handleSubmit}
                submitLabel="Create Ticket"
              />
            </div>

            {/* Right: AI Insights */}
            <div className="space-y-6">
              {/* AI Suggestions */}
              {showSuggestions && aiSuggestions.length > 0 && (
                <div className="glass rounded-apple-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white">
                      AI Suggestions
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.field}
                        className="p-4 rounded-apple-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-sf-text font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {suggestion.field.replace('_', ' ')}
                              </span>
                              <StatusBadge
                                variant={suggestion.confidence > 85 ? 'success' : 'warning'}
                                label={`${suggestion.confidence}% confidence`}
                                size="xs"
                              />
                            </div>
                            <p className="text-base font-sf-display font-semibold text-gray-900 dark:text-white">
                              {suggestion.value}
                            </p>
                            <p className="text-xs font-sf-text text-gray-500 dark:text-gray-400 mt-1">
                              {suggestion.reason}
                            </p>
                          </div>
                          <button
                            onClick={() => applySuggestion(suggestion)}
                            className="ml-3 px-3 py-1.5 rounded-apple-sm bg-purple-600 hover:bg-purple-700 text-white text-xs font-sf-text font-medium transition-colors"
                            type="button"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Tickets Warning */}
              {showSuggestions && similarTickets.length > 0 && (
                <div className="glass rounded-apple-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white">
                      Similar Tickets Found
                    </h3>
                  </div>

                  <div className="mb-4 p-4 rounded-apple-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-sf-text text-yellow-800 dark:text-yellow-200">
                      We found {similarTickets.length} similar resolved ticket
                      {similarTickets.length > 1 ? 's' : ''}. Check if any of these match your
                      issue before creating a new ticket.
                    </p>
                  </div>

                  <Timeline events={timelineEvents} />

                  {similarTickets[0]?.resolution && (
                    <div className="mt-4 p-4 rounded-apple-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-sf-text font-medium text-green-900 dark:text-green-100 mb-1">
                            Top Match Resolution:
                          </p>
                          <p className="text-sm font-sf-text text-green-800 dark:text-green-200">
                            {similarTickets[0].resolution}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(similarTickets[0].resolution || '');
                              dynamicIsland.success('Copied', 'Resolution copied to clipboard');
                            }}
                            className="mt-2 px-3 py-1 rounded-apple-sm bg-green-600 hover:bg-green-700 text-white text-xs font-sf-text font-medium transition-colors inline-flex items-center gap-1"
                            type="button"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Resolution
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!showSuggestions && (
                <div className="glass rounded-apple-lg p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white mb-2">
                    AI is Ready to Help
                  </h3>
                  <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Start typing your issue and our AI will analyze it for similar tickets,
                    suggest categories, and help you create a better ticket.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITicketCreationPage;
