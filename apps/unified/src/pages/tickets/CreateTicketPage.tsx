import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaperClipIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTicketStore } from '@stores/tickets';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { RichTextEditor } from '@components/forms/RichTextEditor';
import { EnhancedFileUpload } from '@components/files';
import type { UploadedFile } from '@services/fileStorage';
import { UserSelect } from '@components/forms/UserSelect';
import { TagInput } from '@components/forms/TagInput';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';
import type { CreateTicketData } from '@services/tickets';

// Form validation schema
const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum([
    'incident',
    'request',
    'problem',
    'change',
    'task',
    'hr',
    'ops',
    'isac',
    'feedback',
  ]),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical']),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  assigneeId: z.string().optional(),
  assignedGroupId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

const ticketTypes = [
  {
    value: 'incident',
    label: 'Incident',
    description: 'Unplanned interruption or reduction in service quality',
  },
  {
    value: 'request',
    label: 'Service Request',
    description: 'Request for information, advice, or standard service',
  },
  { value: 'problem', label: 'Problem', description: 'Root cause of one or more incidents' },
  {
    value: 'change',
    label: 'Change Request',
    description: 'Request to modify IT infrastructure or services',
  },
  { value: 'task', label: 'Task', description: 'Work item or activity to be completed' },
  { value: 'hr', label: 'HR Request', description: 'Human resources related request' },
  { value: 'ops', label: 'Operations', description: 'Operational task or request' },
  { value: 'isac', label: 'Security', description: 'Information security related issue' },
  { value: 'feedback', label: 'Feedback', description: 'User feedback or suggestion' },
];

const priorities = [
  {
    value: 'low',
    label: 'Low',
    color: 'text-gray-600 bg-gray-100',
    description: 'Minor issues with workarounds',
  },
  {
    value: 'normal',
    label: 'Normal',
    color: 'text-blue-600 bg-blue-100',
    description: 'Standard business impact',
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-orange-600 bg-orange-100',
    description: 'Significant business impact',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    color: 'text-red-600 bg-red-100',
    description: 'Critical business functions affected',
  },
  {
    value: 'critical',
    label: 'Critical',
    color: 'text-red-800 bg-red-200',
    description: 'Business operations stopped',
  },
];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { createTicket, isLoading } = useTicketStore();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      type: 'request',
      priority: 'normal',
      tags: [],
      customFields: {},
    },
  });

  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedType = watch('type');

  const onSubmit = async (data: CreateTicketFormData) => {
    try {
      const ticketData: CreateTicketData = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        ...(data.category && { category: data.category }),
        ...(data.subcategory && { subcategory: data.subcategory }),
        ...(data.assigneeId && { assigneeId: data.assigneeId }),
        ...(data.assignedGroupId && { assignedGroupId: data.assignedGroupId }),
        ...(data.tags && { tags: data.tags }),
        ...(data.customFields && { customFields: data.customFields }),
        attachments,
      };

      const ticket = await createTicket(ticketData);
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${ticket.id}`);
    } catch (_error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    // In a real app, this would load template data from API
    setSelectedTemplate(templateId);
    toast('Template loaded');
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    // Convert to File objects for form submission compatibility if needed
    const fileObjects = files.map((f) => new File([], f.originalName, { type: f.contentType }));
    setAttachments((prev) => [...prev, ...fileObjects]);
  };

  const handleFileRemove = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedTypeInfo = ticketTypes.find((type) => type.value === watchedType);
  const selectedPriorityInfo = priorities.find((priority) => priority.value === watch('priority'));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Ticket</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Submit a service request or report an incident
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Template selector */}
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="btn btn-secondary"
            aria-label="Choose ticket template"
          >
            <option value="">Choose Template</option>
            <option value="password-reset">Password Reset</option>
            <option value="software-request">Software Request</option>
            <option value="hardware-issue">Hardware Issue</option>
            <option value="access-request">Access Request</option>
          </select>

          {/* AI suggestions button */}
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="btn btn-secondary"
            disabled={!watchedTitle && !watchedDescription}
          >
            <SparklesIcon className="h-4 w-4" />
            AI Suggestions
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Main form card */}
        <div className="card p-6">
          <div className="space-y-6">
            {/* Title and Type Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className={cn('input mt-1', errors.title && 'input-error')}
                  placeholder="Brief description of the issue or request"
                  autoFocus
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Type *
                </label>
                <select
                  {...register('type')}
                  className={cn('input mt-1', errors.type && 'input-error')}
                >
                  {ticketTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {selectedTypeInfo && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedTypeInfo.description}
                  </p>
                )}
              </div>
            </div>

            {/* Priority and Assignment Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Priority *
                </label>
                <select
                  {...register('priority')}
                  className={cn('input mt-1', errors.priority && 'input-error')}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
                {selectedPriorityInfo && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={cn('badge', selectedPriorityInfo.color)}>
                      {selectedPriorityInfo.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPriorityInfo.description}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="assigneeId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Assign to User
                </label>
                <Controller
                  name="assigneeId"
                  control={control}
                  render={({ field }) => (
                    <UserSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select user..."
                      className="mt-1"
                    />
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="assignedGroupId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Assign to Group
                </label>
                <select {...register('assignedGroupId')} className="input mt-1">
                  <option value="">Select group...</option>
                  <option value="it-support">IT Support</option>
                  <option value="network-team">Network Team</option>
                  <option value="security-team">Security Team</option>
                  <option value="hr-team">HR Team</option>
                </select>
              </div>
            </div>

            {/* Category Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Category
                </label>
                <select {...register('category')} className="input mt-1">
                  <option value="">Select category...</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="security">Security</option>
                  <option value="access">Access & Permissions</option>
                  <option value="email">Email & Communication</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="subcategory"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Subcategory
                </label>
                <select {...register('subcategory')} className="input mt-1">
                  <option value="">Select subcategory...</option>
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="printer">Printer</option>
                  <option value="mobile">Mobile Device</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description *
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Provide detailed information about the issue or request..."
                    className={cn('mt-1', errors.description && 'border-red-500')}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tags
              </label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Add tags to categorize this ticket..."
                    className="mt-1"
                  />
                )}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Press Enter or comma to add tags
              </p>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Attachments</h3>

          <EnhancedFileUpload
            onFilesUploaded={handleFilesUploaded}
            context="ticketAttachments"
            maxFiles={10}
            maxFileSize={10 * 1024 * 1024} // 10MB
            acceptedFileTypes={{
              'image/*': [],
              'application/pdf': [],
              'application/msword': [],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
              'text/plain': [],
              'application/zip': [],
            }}
          />

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <PaperClipIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFileRemove(index)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    title="Remove attachment"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        {showSuggestions && (watchedTitle || watchedDescription) && (
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              <SparklesIcon className="text-nova-600 h-5 w-5" />
              AI Suggestions
            </h3>

            <div className="space-y-4">
              <div className="bg-nova-50 dark:bg-nova-900/20 rounded-lg p-4">
                <h4 className="text-nova-900 dark:text-nova-100 font-medium">
                  Similar Tickets Found
                </h4>
                <p className="text-nova-700 dark:text-nova-300 mt-1 text-sm">
                  We found 3 similar tickets. Consider checking these solutions first.
                </p>
                <button className="text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300 mt-2 text-sm">
                  View Similar Tickets →
                </button>
              </div>

              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Suggested Category
                </h4>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Based on your description, this looks like a "Software" issue.
                </p>
                <button
                  type="button"
                  onClick={() => setValue('category', 'software')}
                  className="mt-2 text-sm text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300"
                >
                  Apply Suggestion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-secondary" disabled={isSubmitting}>
              Save as Draft
            </button>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating Ticket...
                </>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
