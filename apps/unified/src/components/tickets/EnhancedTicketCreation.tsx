import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';
import { ticketService } from '@services/tickets';
import { SLAStatusBadge } from './SLAStatus';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  priority: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'date';
    required: boolean;
    options?: string[];
    defaultValue?: string;
  }>;
}

interface Classification {
  category: string;
  subcategory: string;
  priority: string;
  urgency: string;
  impact: string;
  confidence: number;
  reasoning: string;
  suggestedAssignee?: string;
  similarTickets: Array<{
    id: string;
    ticketNumber: string;
    title: string;
    resolution?: string;
  }>;
}

interface EnhancedTicketCreationProps {
  onSuccess?: (ticket: any) => void;
  onCancel?: () => void;
  requestedFor?: string;
  prefilledData?: Partial<{
    title: string;
    description: string;
    category: string;
    priority: string;
  }>;
}

export function EnhancedTicketCreation({
  onSuccess,
  onCancel,
  requestedFor,
  prefilledData,
}: EnhancedTicketCreationProps) {
  const queryClient = useQueryClient();
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [classification, setClassification] = useState<Classification | null>(null);
  const [formData, setFormData] = useState({
    title: prefilledData?.title || '',
    description: prefilledData?.description || '',
    category: prefilledData?.category || '',
    subcategory: '',
    priority: prefilledData?.priority || '',
    urgency: '',
    impact: '',
    requestedFor: requestedFor || '',
    contactMethod: 'EMAIL',
    location: '',
    businessJustification: '',
    templateVariables: {} as Record<string, any>,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [showClassification, setShowClassification] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  // Load available templates
  const { data: templates = [] } = useQuery({
    queryKey: ['ticket-templates'],
    queryFn: () => ticketService.getTemplates(),
    enabled: useTemplate,
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return ticketService.createTicket(data);
    },
    onSuccess: (ticket) => {
      toast.success('Ticket created successfully');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      onSuccess?.(ticket);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create ticket');
    },
  });

  // Auto-classify ticket
  const classifyTicket = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please provide title and description for classification');
      return;
    }

    setIsClassifying(true);
    try {
      const result = await ticketService.classifyTicket({
        title: formData.title,
        description: formData.description,
      });

      setClassification(result);
      setShowClassification(true);

      // Auto-fill form with classification results
      setFormData((prev) => ({
        ...prev,
        category: prev.category || result.category,
        subcategory: prev.subcategory || result.subcategory,
        priority: prev.priority || result.priority,
        urgency: prev.urgency || result.urgency,
        impact: prev.impact || result.impact,
      }));

      toast.success(`Classification complete (${Math.round(result.confidence * 100)}% confidence)`);
    } catch (error: any) {
      toast.error(error.message || 'Classification failed');
    } finally {
      setIsClassifying(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: TicketTemplate) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      category: template.category,
      subcategory: template.subcategory,
      priority: template.priority,
      templateVariables: {},
    }));
  };

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();

    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'templateVariables') {
        submitData.append(key, JSON.stringify(value));
      } else {
        submitData.append(key, String(value));
      }
    });

    // Add template ID if using template
    if (selectedTemplate) {
      submitData.append('templateId', selectedTemplate.id);
    }

    // Add files
    files.forEach((file) => {
      submitData.append('attachments', file);
    });

    createTicketMutation.mutate(submitData);
  };

  const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'SECURITY', 'ACCOUNT', 'GENERAL'];

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH'];

  const impactLevels = ['LOW', 'MEDIUM', 'HIGH'];

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUseTemplate(!useTemplate)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              useTemplate
                ? 'border border-blue-300 bg-blue-100 text-blue-700'
                : 'border border-gray-300 bg-gray-100 text-gray-700',
            )}
          >
            <DocumentTextIcon className="mr-1 inline h-4 w-4" />
            Use Template
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        {useTemplate && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select Template</label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className={cn(
                    'rounded-md border p-3 text-left transition-colors hover:border-blue-300',
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200',
                  )}
                >
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {template.category}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {template.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <button
                type="button"
                onClick={classifyTicket}
                disabled={isClassifying || !formData.title || !formData.description}
                className="flex items-center gap-1 rounded border border-blue-300 bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                {isClassifying ? (
                  <LoadingSpinner size="xs" />
                ) : (
                  <SparklesIcon className="h-3 w-3" />
                )}
                Auto-Classify
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Detailed description of the issue, including steps to reproduce, error messages, etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Priority</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Urgency</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData((prev) => ({ ...prev, urgency: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Urgency</option>
              {urgencyLevels.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {urgency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Impact</label>
            <select
              value={formData.impact}
              onChange={(e) => setFormData((prev) => ({ ...prev, impact: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Impact</option>
              {impactLevels.map((impact) => (
                <option key={impact} value={impact}>
                  {impact}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Attachments */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Attachments</label>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
              <CloudArrowUpIcon className="h-4 w-4" />
              Add Files
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
              />
            </label>
            <span className="text-sm text-gray-500">Max 5 files, 10MB each</span>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2"
                >
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Classification Results */}
        {showClassification && classification && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <SparklesIcon className="mt-0.5 h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">Auto-Classification Results</h4>
                <p className="mt-1 text-sm text-blue-700">{classification.reasoning}</p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    Confidence: {Math.round(classification.confidence * 100)}%
                  </span>
                  {classification.suggestedAssignee && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                      Suggested assignee found
                    </span>
                  )}
                </div>

                {classification.similarTickets.length > 0 && (
                  <div className="mt-3">
                    <h5 className="mb-2 text-xs font-medium text-blue-900">Similar Tickets:</h5>
                    <div className="space-y-1">
                      {classification.similarTickets.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="text-xs text-blue-700">
                          #{ticket.ticketNumber}: {ticket.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createTicketMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createTicketMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                Create Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EnhancedTicketCreation;
