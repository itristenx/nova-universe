import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { AlertFilters } from '../../types/alerts';

interface AlertFiltersPanelProps {
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
  onClose: () => void;
}

const AlertFiltersPanel: React.FC<AlertFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const updateFilter = (key: keyof AlertFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof AlertFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, updatedArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      serviceId: [],
      assignedTo: [],
      tags: [],
      source: []
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      if (value && typeof value === 'string') {
        return count + 1;
      }
      return count;
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FunnelIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Alerts</h3>
            <p className="text-sm text-gray-600">
              {getActiveFilterCount()} filters active
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Clear All
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status
          </label>
          <div className="space-y-2">
            {[
              { value: 'triggered', label: 'Triggered', color: 'red' },
              { value: 'acknowledged', label: 'Acknowledged', color: 'orange' },
              { value: 'resolved', label: 'Resolved', color: 'green' },
              { value: 'closed', label: 'Closed', color: 'gray' }
            ].map((status) => (
              <motion.label
                key={status.value}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status.value) || false}
                  onChange={() => toggleArrayFilter('status', status.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{status.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority
          </label>
          <div className="space-y-2">
            {[
              { value: 'critical', label: 'Critical', color: 'red' },
              { value: 'high', label: 'High', color: 'orange' },
              { value: 'medium', label: 'Medium', color: 'yellow' },
              { value: 'low', label: 'Low', color: 'blue' }
            ].map((priority) => (
              <motion.label
                key={priority.value}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(priority.value) || false}
                  onChange={() => toggleArrayFilter('priority', priority.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{priority.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Source
          </label>
          <div className="space-y-2">
            {[
              { value: 'workflow', label: 'Workflow' },
              { value: 'manual', label: 'Manual' },
              { value: 'ticket', label: 'Ticket' },
              { value: 'cosmo', label: 'Cosmo AI' },
              { value: 'integration', label: 'Integration' }
            ].map((source) => (
              <motion.label
                key={source.value}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.source?.includes(source.value) || false}
                  onChange={() => toggleArrayFilter('source', source.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{source.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Date Range
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <input
                type="datetime-local"
                value={filters.createdAfter ? new Date(filters.createdAfter).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateFilter('createdAfter', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <input
                type="datetime-local"
                value={filters.createdBefore ? new Date(filters.createdBefore).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateFilter('createdBefore', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('status', ['triggered']);
              updateFilter('priority', ['critical', 'high']);
            }}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
          >
            High Priority Active
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('status', ['triggered', 'acknowledged']);
              updateFilter('createdAfter', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            }}
            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors duration-200"
          >
            Last 24 Hours
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('source', ['cosmo']);
            }}
            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors duration-200"
          >
            Cosmo Generated
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('status', ['resolved', 'closed']);
              updateFilter('createdAfter', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
            }}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors duration-200"
          >
            Resolved This Week
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertFiltersPanel;
