import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperClipIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ticketService, type CreateTicketData } from '@services/tickets';
import { AppleInspiredLayout } from '@components/layout/AppleInspiredLayout';
import { AppleCard, AppleCardHeader, AppleCardContent } from '@components/design-system/AppleCard';
import { AppleButton, AppleButtonGroup } from '@components/design-system/AppleButton';
import {
  AppleForm,
  AppleFormSection,
  AppleInput,
  AppleTextarea,
  AppleSelect,
} from '@components/design-system/AppleForm';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  contactMethod: 'email' | 'phone' | 'in_person';
  contactInfo: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AppleInspiredCreateTicket() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: 'medium',
    type: 'incident',
    location: '',
    contactMethod: 'email',
    contactInfo: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData: CreateTicketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        priority: formData.priority,
        type: formData.type,
        location: formData.location || undefined,
        contactMethod: formData.contactMethod,
        contactInfo: formData.contactInfo.trim(),
      };

      const ticket = await ticketService.createTicket(ticketData);
      
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'network', label: 'Network' },
    { value: 'access', label: 'Access' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
  ];

  const subcategoryOptions = {
    hardware: [
      { value: 'laptop', label: 'Laptop' },
      { value: 'desktop', label: 'Desktop' },
      { value: 'monitor', label: 'Monitor' },
      { value: 'printer', label: 'Printer' },
      { value: 'mobile', label: 'Mobile Device' },
    ],
    software: [
      { value: 'office', label: 'Office Applications' },
      { value: 'browser', label: 'Web Browser' },
      { value: 'email', label: 'Email' },
      { value: 'custom', label: 'Custom Application' },
    ],
    network: [
      { value: 'wifi', label: 'WiFi' },
      { value: 'vpn', label: 'VPN' },
      { value: 'internet', label: 'Internet Connection' },
    ],
    access: [
      { value: 'account', label: 'Account Access' },
      { value: 'permissions', label: 'Permissions' },
      { value: 'password', label: 'Password Reset' },
    ],
    security: [
      { value: 'incident', label: 'Security Incident' },
      { value: 'phishing', label: 'Phishing' },
      { value: 'malware', label: 'Malware' },
    ],
    other: [
      { value: 'general', label: 'General Support' },
      { value: 'training', label: 'Training Request' },
    ],
  };

  const priorityOptions = [
    { value: 'low', label: 'Low - Can wait' },
    { value: 'medium', label: 'Medium - Standard priority' },
    { value: 'high', label: 'High - Important' },
    { value: 'critical', label: 'Critical - Urgent priority' },
  ];

  const typeOptions = [
    { value: 'incident', label: 'Incident - Something is broken' },
    { value: 'request', label: 'Service Request - I need something' },
    { value: 'change', label: 'Change Request - I need something modified' },
  ];

  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'in_person', label: 'In Person' },
  ];

  const currentSubcategoryOptions = formData.category
    ? (subcategoryOptions as any)[formData.category] || []
    : [];

  return (
    <AppleInspiredLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <AppleButton
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => navigate(-1)}
            >
              Back
            </AppleButton>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-nova-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Ticket
              </h1>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Describe your issue or request in detail to help us provide the best support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AppleCard variant="elevated">
              <AppleCardContent>
                <AppleForm onSubmit={handleSubmit}>
                  <AppleFormSection
                    title="Basic Information"
                    description="Tell us what you need help with"
                  >
                    <AppleInput
                      label="Title"
                      value={formData.title}
                      onChange={(value) => updateField('title', value)}
                      placeholder="Brief description of your issue"
                      required
                      error={errors.title}
                      help="Be specific and concise"
                    />

                    <AppleTextarea
                      label="Description"
                      value={formData.description}
                      onChange={(value) => updateField('description', value)}
                      placeholder="Provide detailed information about your issue or request..."
                      required
                      rows={6}
                      error={errors.description}
                      help="Include steps to reproduce, error messages, or specific requirements"
                    />
                  </AppleFormSection>

                  <AppleFormSection
                    title="Categorization"
                    description="Help us route your ticket to the right team"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AppleSelect
                        label="Category"
                        value={formData.category}
                        onChange={(value) => {
                          updateField('category', value);
                          updateField('subcategory', ''); // Reset subcategory
                        }}
                        options={categoryOptions}
                        placeholder="Select a category"
                        required
                        error={errors.category}
                      />

                      <AppleSelect
                        label="Subcategory"
                        value={formData.subcategory}
                        onChange={(value) => updateField('subcategory', value)}
                        options={currentSubcategoryOptions}
                        placeholder="Select a subcategory"
                        disabled={!formData.category}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AppleSelect
                        label="Type"
                        value={formData.type}
                        onChange={(value) => updateField('type', value)}
                        options={typeOptions}
                        required
                      />

                      <AppleSelect
                        label="Priority"
                        value={formData.priority}
                        onChange={(value) => updateField('priority', value as 'low' | 'medium' | 'high' | 'critical')}
                        options={priorityOptions}
                        required
                      />
                    </div>
                  </AppleFormSection>

                  <AppleFormSection
                    title="Contact & Location"
                    description="How can we reach you and where are you located?"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AppleSelect
                        label="Preferred Contact Method"
                        value={formData.contactMethod}
                        onChange={(value) => updateField('contactMethod', value as 'email' | 'phone' | 'in_person')}
                        options={contactMethodOptions}
                        required
                      />

                      <AppleInput
                        label={`Contact ${formData.contactMethod === 'email' ? 'Email' : formData.contactMethod === 'phone' ? 'Phone' : 'Information'}`}
                        value={formData.contactInfo}
                        onChange={(value) => updateField('contactInfo', value)}
                        type={formData.contactMethod === 'email' ? 'email' : formData.contactMethod === 'phone' ? 'tel' : 'text'}
                        placeholder={
                          formData.contactMethod === 'email' ? 'your.email@company.com' :
                          formData.contactMethod === 'phone' ? '+1 (555) 123-4567' :
                          'Desk location or preferred meeting spot'
                        }
                        required
                        error={errors.contactInfo}
                      />
                    </div>

                    <AppleInput
                      label="Location"
                      value={formData.location}
                      onChange={(value) => updateField('location', value)}
                      placeholder="Building, floor, room number, or remote location"
                      help="Help us locate you if we need to provide on-site support"
                    />
                  </AppleFormSection>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <AppleButton
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      className="flex-1"
                      icon={isSubmitting ? undefined : <SparklesIcon className="w-4 h-4" />}
                    >
                      {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
                    </AppleButton>
                    <AppleButton
                      variant="secondary"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </AppleButton>
                  </div>
                </AppleForm>
              </AppleCardContent>
            </AppleCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <AppleCard variant="filled">
              <AppleCardHeader
                title="💡 Quick Tips"
                subtitle="Get faster support"
              />
              <AppleCardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <ClockIcon className="w-5 h-5 text-nova-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Be specific
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Include error messages, steps to reproduce, and expected behavior
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <PaperClipIcon className="w-5 h-5 text-nova-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Add context
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Screenshots, device info, and browser details help us understand the issue
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <SparklesIcon className="w-5 h-5 text-nova-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Choose the right priority
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Urgent issues prevent work, normal issues are day-to-day problems
                      </p>
                    </div>
                  </div>
                </div>
              </AppleCardContent>
            </AppleCard>

            {/* Emergency Contact */}
            <AppleCard variant="filled" className="border-l-4 border-l-error-500">
              <AppleCardHeader
                title="🚨 Emergency Support"
                subtitle="For critical system outages"
              />
              <AppleCardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    If you're experiencing a critical system outage that affects multiple users:
                  </p>
                  <div className="bg-error-50 dark:bg-error-900/20 p-3 rounded-lg">
                    <p className="font-medium text-error-900 dark:text-error-100">
                      📞 Call: (555) 123-HELP
                    </p>
                    <p className="text-error-700 dark:text-error-300 text-xs mt-1">
                      Available 24/7 for emergencies
                    </p>
                  </div>
                </div>
              </AppleCardContent>
            </AppleCard>
          </div>
        </div>
      </div>
    </AppleInspiredLayout>
  );
}