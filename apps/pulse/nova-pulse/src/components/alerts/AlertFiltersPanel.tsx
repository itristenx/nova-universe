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
  onClose,
}) => {
  const updateFilter = (key: keyof AlertFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof AlertFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
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
      source: [],
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
      className="rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-lg backdrop-blur-xl"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-blue-100 p-2">
            <FunnelIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Alerts</h3>
            <p className="text-sm text-gray-600">{getActiveFilterCount()} filters active</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllFilters}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Clear All
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Status Filter */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">Status</label>
          <div className="space-y-2">
            {[
              { value: 'triggered', label: 'Triggered', color: 'red' },
              { value: 'acknowledged', label: 'Acknowledged', color: 'orange' },
              { value: 'resolved', label: 'Resolved', color: 'green' },
              { value: 'closed', label: 'Closed', color: 'gray' },
            ].map((status) => (
              <motion.label
                key={status.value}
                whileHover={{ scale: 1.02 }}
                className="flex cursor-pointer items-center space-x-3"
              >
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status.value) || false}
                  onChange={() => toggleArrayFilter('status', status.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{status.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">Priority</label>
          <div className="space-y-2">
            {[
              { value: 'critical', label: 'Critical', color: 'red' },
              { value: 'high', label: 'High', color: 'orange' },
              { value: 'medium', label: 'Medium', color: 'yellow' },
              { value: 'low', label: 'Low', color: 'blue' },
            ].map((priority) => (
              <motion.label
                key={priority.value}
                whileHover={{ scale: 1.02 }}
                className="flex cursor-pointer items-center space-x-3"
              >
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(priority.value) || false}
                  onChange={() => toggleArrayFilter('priority', priority.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{priority.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">Source</label>
          <div className="space-y-2">
            {[
              { value: 'workflow', label: 'Workflow' },
              { value: 'manual', label: 'Manual' },
              { value: 'ticket', label: 'Ticket' },
              { value: 'cosmo', label: 'Cosmo AI' },
              { value: 'integration', label: 'Integration' },
            ].map((source) => (
              <motion.label
                key={source.value}
                whileHover={{ scale: 1.02 }}
                className="flex cursor-pointer items-center space-x-3"
              >
                <input
                  type="checkbox"
                  checked={filters.source?.includes(source.value) || false}
                  onChange={() => toggleArrayFilter('source', source.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{source.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">Date Range</label>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">From</label>
              <input
                type="datetime-local"
                value={
                  filters.createdAfter
                    ? new Date(filters.createdAfter).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  updateFilter(
                    'createdAfter',
                    e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">To</label>
              <input
                type="datetime-local"
                value={
                  filters.createdBefore
                    ? new Date(filters.createdBefore).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  updateFilter(
                    'createdBefore',
                    e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">Quick Filters</label>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('status', ['triggered']);
              updateFilter('priority', ['critical', 'high']);
            }}
            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-200"
          >
            High Priority Active
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('status', ['triggered', 'acknowledged']);
              updateFilter(
                'createdAfter',
                new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              );
            }}
            className="rounded-lg bg-orange-100 px-3 py-2 text-sm font-medium text-orange-700 transition-colors duration-200 hover:bg-orange-200"
          >
            Last 24 Hours
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('source', ['cosmo']);
            }}
            className="rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 transition-colors duration-200 hover:bg-purple-200"
          >
            Cosmo Generated
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateFilter('status', ['resolved', 'closed']);
              updateFilter(
                'createdAfter',
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              );
            }}
            className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors duration-200 hover:bg-green-200"
          >
            Resolved This Week
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertFiltersPanel;
