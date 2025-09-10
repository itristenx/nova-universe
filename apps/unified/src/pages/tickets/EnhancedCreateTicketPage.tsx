/**
 * Enhanced Apple-style Ticket Creation Form
 * Following Apple Human Interface Guidelines for Nova Universe ITSM
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PaperClipIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  TagIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTicketStore } from '@stores/tickets';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { AppleInput, AppleTextarea } from '@components/common/AppleInput';
import { PriorityBadge } from '@components/common/AppleBadges';
import { cn, formatTicketId } from '@utils/apple-utils';
import { fadeInAnimation, springAnimation } from '@utils/apple-utils';
import toast from 'react-hot-toast';

// Form validation schema with Apple-style validation messages
const createTicketSchema = z.object({
  title: z.string()
    .min(1, 'Please enter a title for your ticket')
    .max(200, 'Title should be less than 200 characters'),
  description: z.string()
    .min(10, 'Please provide more details (at least 10 characters)'),
  type: z.enum(['incident', 'request', 'problem', 'change', 'task', 'hr', 'ops', 'isac', 'feedback']),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical']),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

// Apple-style ticket types with visual icons and descriptions
const ticketTypes = [
  {
    value: 'incident',
    label: 'Incident',
    icon: '🚨',
    description: 'Service interruption or system issue',
    color: 'red'
  },
  {
    value: 'request', 
    label: 'Service Request',
    icon: '💼',
    description: 'Request for new service or access',
    color: 'blue'
  },
  {
    value: 'problem',
    label: 'Problem',
    icon: '🔍',
    description: 'Root cause investigation needed',
    color: 'orange'
  },
  {
    value: 'change',
    label: 'Change Request', 
    icon: '⚡',
    description: 'System or process modification',
    color: 'purple'
  },
  {
    value: 'task',
    label: 'Task',
    icon: '✅',
    description: 'Work item or assignment',
    color: 'green'
  }
];

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'green', description: 'Can wait, minor impact' },
  { value: 'normal', label: 'Normal', color: 'blue', description: 'Standard priority' },
  { value: 'high', label: 'High', color: 'orange', description: 'Important, needs attention' },
  { value: 'urgent', label: 'Urgent', color: 'red', description: 'Critical business impact' },
  { value: 'critical', label: 'Critical', color: 'red', description: 'System down, immediate action' }
];

// Categories following ServiceNow/Jira patterns
const categories = [
  { value: 'hardware', label: 'Hardware', subcategories: ['Desktop', 'Laptop', 'Printer', 'Phone'] },
  { value: 'software', label: 'Software', subcategories: ['Application', 'Operating System', 'License'] },
  { value: 'network', label: 'Network', subcategories: ['Internet', 'Wi-Fi', 'VPN', 'Email'] },
  { value: 'access', label: 'Access', subcategories: ['Account', 'Permission', 'Password Reset'] },
  { value: 'facilities', label: 'Facilities', subcategories: ['Office Setup', 'Meeting Room', 'Parking'] }
];

export default function EnhancedCreateTicketPage() {
  const navigate = useNavigate();
  const { createTicket, isLoading } = useTicketStore();
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const form = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      type: 'incident',
      priority: 'normal',
      tags: []
    }
  });

  const handleSubmit = async (data: CreateTicketFormData) => {
    try {
      const ticket = await createTicket({
        ...data,
        attachments
      });
      
      toast.success(
        `Ticket ${formatTicketId(ticket.id)} created successfully!`,
        {
          icon: '✅',
          duration: 5000,
        }
      );
      
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      toast.error('Failed to create ticket. Please try again.');
    }
  };

  const selectedTypeData = ticketTypes.find(t => t.value === selectedType);
  const selectedCategoryData = categories.find(c => c.value === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8" {...fadeInAnimation()}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create New Ticket
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your issue or request in detail. Our team will respond promptly.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Ticket Type Selection */}
          <GlassCard intensity="medium" hover="subtle" {...fadeInAnimation(0.1)}>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">What type of ticket is this?</h3>
                  <p className="text-gray-600">This helps us route your request to the right team</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ticketTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setSelectedType(type.value);
                      form.setValue('type', type.value as any);
                    }}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-left transition-all duration-200',
                      'hover:scale-105 hover:shadow-lg',
                      selectedType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-semibold text-gray-900">{type.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Basic Information */}
          <GlassCard intensity="medium" hover="subtle" {...fadeInAnimation(0.2)}>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="h-6 w-6 text-blue-600" />
                Basic Information
              </h3>

              <div className="space-y-4">
                <AppleInput
                  label="Title"
                  placeholder="Brief description of your issue or request..."
                  variant="glass"
                  {...form.register('title')}
                  error={form.formState.errors.title?.message}
                />

                <AppleTextarea
                  label="Description"
                  placeholder="Please provide detailed information about your issue, including any steps you've already taken..."
                  variant="glass"
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                />
              </div>
            </div>
          </GlassCard>

          {/* Priority and Category */}
          <GlassCard intensity="medium" hover="subtle" {...fadeInAnimation(0.3)}>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                Priority & Category
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Priority Level
                  </label>
                  <div className="space-y-2">
                    {priorityLevels.map((priority) => (
                      <label
                        key={priority.value}
                        className={cn(
                          'flex items-center p-3 rounded-xl border cursor-pointer transition-all',
                          'hover:bg-gray-50',
                          form.watch('priority') === priority.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        )}
                      >
                        <input
                          type="radio"
                          value={priority.value}
                          {...form.register('priority')}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <PriorityBadge priority={priority.value} variant="dot" size="sm" />
                            <span className="font-medium">{priority.label}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Category
                  </label>
                  <select
                    {...form.register('category')}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 bg-white/90 backdrop-blur-sm',
                      'border border-gray-200 rounded-xl',
                      'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'transition-all duration-200 ease-out'
                    )}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>

                  {/* Subcategory */}
                  {selectedCategoryData && (
                    <div className="mt-3" {...fadeInAnimation()}>
                      <select
                        {...form.register('subcategory')}
                        className={cn(
                          'w-full px-4 py-3 bg-white/90 backdrop-blur-sm',
                          'border border-gray-200 rounded-xl',
                          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          'transition-all duration-200 ease-out'
                        )}
                      >
                        <option value="">Select subcategory...</option>
                        {selectedCategoryData.subcategories.map((sub) => (
                          <option key={sub} value={sub.toLowerCase()}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6" {...fadeInAnimation(0.4)}>
            <AppleButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/tickets')}
              disabled={isLoading}
            >
              Cancel
            </AppleButton>

            <div className="flex gap-4">
              <AppleButton
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Reset Form
              </AppleButton>

              <AppleButton
                type="submit"
                loading={isLoading}
                leftIcon={<CheckCircleIcon className="h-5 w-5" />}
              >
                Create Ticket
              </AppleButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}