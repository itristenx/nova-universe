import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BeakerIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TagIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { helixABTestingService } from '@services/helixABTesting';
import { ABTest, ABVariation } from '@components/ABTestingFramework';

interface User360ABTestsProps {
  userId: string;
  className?: string;
}

interface UserTestAssignment {
  test: ABTest;
  variation: ABVariation;
  assignedAt: Date;
  isActive: boolean;
  metrics: {
    exposures: number;
    conversions: number;
    lastExposure?: Date;
  };
}

export function User360ABTests({ userId, className = '' }: User360ABTestsProps) {
  const [assignments, setAssignments] = useState<UserTestAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<UserTestAssignment | null>(null);

  useEffect(() => {
    loadUserAssignments();
  }, [userId]);

  const loadUserAssignments = async () => {
    try {
      setLoading(true);
      const data = await helixABTestingService.getUserTestAssignments(userId);
      setAssignments(data);
    } catch (_error) {
      console.error('Failed to load user A/B test assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'running':
        return CheckCircleIcon;
      case 'paused':
        return ClockIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'cancelled':
        return XCircleIcon;
      default:
        return BeakerIcon;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="mb-6 flex items-center space-x-3">
          <BeakerIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            A/B Test Assignments
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BeakerIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            A/B Test Assignments
          </h3>
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            {assignments.length}
          </span>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="py-12 text-center">
          <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No A/B Test Assignments
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This user is not currently participating in any A/B tests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => {
            const StatusIcon = getStatusIcon(assignment.test.status);

            return (
              <div
                key={assignment.test.id}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                onClick={() => setSelectedAssignment(assignment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {assignment.test.name}
                      </h4>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(assignment.test.status)}`}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {assignment.test.status}
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {assignment.test.description}
                    </p>

                    <div className="mb-3 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Variation</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.variation.name}
                          {assignment.variation.is_control && (
                            <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Control
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Assigned</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(assignment.assignedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {assignment.metrics.exposures} exposures
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {assignment.metrics.conversions} conversions
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {assignment.metrics.lastExposure
                            ? `Last: ${formatDate(assignment.metrics.lastExposure)}`
                            : 'No exposures'}
                        </span>
                      </div>
                    </div>

                    {assignment.test.tags.length > 0 && (
                      <div className="mt-3 flex items-center space-x-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {assignment.test.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Traffic</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {assignment.variation.traffic_percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  A/B Test Assignment Details
                </h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  title="Close modal"
                  aria-label="Close assignment details modal"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Test Information */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Test Information
                  </h4>
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Name</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedAssignment.test.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Description</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedAssignment.test.description}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Hypothesis</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedAssignment.test.hypothesis}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variation Details */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Assigned Variation
                  </h4>
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedAssignment.variation.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedAssignment.variation.description}
                        </div>
                      </div>
                      {selectedAssignment.variation.is_control && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          Control Group
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Traffic Allocation
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedAssignment.variation.traffic_percentage}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Configuration
                        </div>
                        <div className="font-mono text-sm text-gray-900 dark:text-white">
                          {JSON.stringify(selectedAssignment.variation.configuration, null, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Metrics */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    User Engagement Metrics
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedAssignment.metrics.exposures}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Total Exposures
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedAssignment.metrics.conversions}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">Conversions</div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-900/20">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedAssignment.metrics.exposures > 0
                          ? (
                              (selectedAssignment.metrics.conversions /
                                selectedAssignment.metrics.exposures) *
                              100
                            ).toFixed(1)
                          : '0.0'}
                        %
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Conversion Rate
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-600">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Assignment Date
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedAssignment.assignedAt)}
                      </span>
                    </div>
                    {selectedAssignment.metrics.lastExposure && (
                      <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-600">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Last Exposure
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(selectedAssignment.metrics.lastExposure)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <span
                        className={`text-sm font-medium ${selectedAssignment.isActive ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {selectedAssignment.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
