import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TagIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { CreateAlertRequest, Service } from '../../types/alerts';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated: () => void;
  ticketId?: string;
}

const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  onAlertCreated,
  ticketId
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateAlertRequest>({
    summary: '',
    description: '',
    source: 'manual',
    serviceId: '',
    priority: 'medium',
    ticketId: ticketId || '',
    metadata: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch available services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['alert-services'],
    queryFn: async (): Promise<Service[]> => {
      const response = await fetch('/api/v2/alerts/services', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }); // TODO-LINT: move to async function

      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json(); // TODO-LINT: move to async function
      return data.services;
    },
    enabled: isOpen
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: CreateAlertRequest) => {
      const response = await fetch('/api/v2/alerts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        const errorData = await response.json(); // TODO-LINT: move to async function
        throw new Error(errorData.error || 'Failed to create alert');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      onAlertCreated();
      setFormData({
        summary: '',
        description: '',
        source: 'manual',
        serviceId: '',
        priority: 'medium',
        ticketId: '',
        metadata: {}
      });
      setErrors({});
    },
    onError: (error: Error) => {
      console.error('Alert creation failed:', error);
      setErrors({ submit: error.message });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    } else if (formData.summary.length > 200) {
      newErrors.summary = 'Summary must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Service is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      createAlertMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof CreateAlertRequest, value: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white border-red-500';
      case 'high': return 'bg-orange-500 text-white border-orange-500';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-500';
      case 'low': return 'bg-blue-500 text-white border-blue-500';
      default: return 'bg-gray-200 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create New Alert
                  </h2>
                  <p className="text-sm text-gray-600">
                    Trigger an alert to notify the on-call team
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Summary *
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Brief description of the alert"
                  className={`
                    w-full px-4 py-3 bg-white/80 backdrop-blur-xl
                    border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.summary ? 'border-red-300' : 'border-gray-200/50'}
                  `}
                  maxLength={200}
                />
                {errors.summary && (
                  <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.summary.length}/200 characters
                </p>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Service *
                </label>
                <div className="relative">
                  <ServerIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.serviceId}
                    onChange={(e) => handleInputChange('serviceId', e.target.value)}
                    className={`
                      w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-xl
                      border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200 appearance-none
                      ${errors.serviceId ? 'border-red-300' : 'border-gray-200/50'}
                    `}
                    disabled={servicesLoading}
                  >
                    <option value="">Select a service...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.description}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.serviceId && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceId}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['low', 'medium', 'high', 'critical'].map((priority) => (
                    <motion.button
                      key={priority}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInputChange('priority', priority)}
                      className={`
                        px-4 py-3 border-2 rounded-xl font-medium text-sm
                        transition-all duration-200
                        ${formData.priority === priority 
                          ? getPriorityColor(priority)
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide additional context about the alert..."
                  rows={4}
                  className={`
                    w-full px-4 py-3 bg-white/80 backdrop-blur-xl
                    border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200 resize-none
                    ${errors.description ? 'border-red-300' : 'border-gray-200/50'}
                  `}
                  maxLength={2000}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description?.length || 0}/2000 characters
                </p>
              </div>

              {/* Ticket ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Ticket ID
                </label>
                <div className="relative">
                  <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.ticketId}
                    onChange={(e) => handleInputChange('ticketId', e.target.value)}
                    placeholder="Optional ticket reference"
                    className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="mt-2 flex items-start space-x-2">
                  <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    Link this alert to an existing ticket for better tracking and context.
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      Failed to create alert
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200/50">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={createAlertMutation.isPending}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors duration-200 flex items-center space-x-2"
                >
                  {createAlertMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span>Create Alert</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CreateAlertModal;
