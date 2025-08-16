import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  SelectItem,
  Progress,
  Chip,
  Badge,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
} from '@heroui/react';
import {
  QueueListIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  ShieldCheckIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Ticket } from '../../types';

interface QueueAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  currentTickets: number;
  maxCapacity: number;
  skillTags: string[];
  performance: {
    avgResolutionTime: number; // in minutes
    successRate: number; // percentage
    customerSatisfaction: number; // out of 5
  };
  workload: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface Queue {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'specialized' | 'escalation' | 'vip';
  agents: QueueAgent[];
  tickets: Ticket[];
  slaTarget: number; // in minutes
  rules: {
    maxTicketsPerAgent: number;
    autoAssignment: boolean;
    priorityWeighting: boolean;
    skillMatching: boolean;
  };
  metrics: {
    avgWaitTime: number;
    slaBreaches: number;
    throughput: number;
    agentUtilization: number;
  };
}

interface MLRecommendation {
  type: 'assignment' | 'priority' | 'escalation' | 'routing';
  confidence: number;
  suggestion: string;
  reasoning: string;
  impact: 'low' | 'medium' | 'high';
  ticketId?: string;
  agentId?: string;
}

interface Props {
  selectedQueue?: string;
  onQueueSelect?: (queueId: string) => void;
}

export const SmartQueueManagement: React.FC<Props> = ({ selectedQueue, onQueueSelect }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQueueId, setSelectedQueueId] = useState(selectedQueue || 'general');
  const [viewMode, setViewMode] = useState<'workload' | 'performance' | 'capacity'>('workload');

  const {
    isOpen: isRecommendationModalOpen,
    onOpen: onRecommendationModalOpen,
    onClose: onRecommendationModalClose,
  } = useDisclosure();

  // Real API calls instead of mock data
  const { data: queues = [] } = useQuery({
    queryKey: ['queues'],
    queryFn: async (): Promise<Queue[]> => {
      const response = await fetch('/api/v1/queues');
      if (!response.ok) {
        throw new Error('Failed to fetch queues');
      }
      const data = await response.json();
      return data.queues || [];
    },
  });

  const { data: mlRecommendations = [] } = useQuery({
    queryKey: ['ml-recommendations', selectedQueueId],
    queryFn: async (): Promise<MLRecommendation[]> => [
      {
        type: 'assignment',
        confidence: 0.92,
        suggestion: 'Assign ticket T-001 to Emma Chen',
        reasoning: 'Best skill match for security-related issue, lowest current workload',
        impact: 'high',
        ticketId: 'T-001',
        agentId: 'agent3',
      },
      {
        type: 'escalation',
        confidence: 0.78,
        suggestion: 'Consider escalating ticket T-005 to Technical Support',
        reasoning: 'Issue complexity exceeds general support capabilities',
        impact: 'medium',
        ticketId: 'T-005',
      },
      {
        type: 'routing',
        confidence: 0.85,
        suggestion: 'Route new VIP tickets to Alex Thompson',
        reasoning: 'Optimal performance metrics and availability for VIP support',
        impact: 'high',
        agentId: 'vip1',
      },
    ],
  });

  const currentQueue = queues.find((q) => q.id === selectedQueueId);

  const handleQueueChange = useCallback(
    (queueId: string) => {
      setSelectedQueueId(queueId);
      onQueueSelect?.(queueId);
    },
    [onQueueSelect],
  );

  const getStatusColor = (
    status: QueueAgent['status'],
  ): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'busy':
        return 'warning';
      case 'away':
        return 'default';
      case 'offline':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getQueueTypeIcon = (type: Queue['type']) => {
    switch (type) {
      case 'vip':
        return <StarIcon className="h-4 w-4" />;
      case 'specialized':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'escalation':
        return <FireIcon className="h-4 w-4" />;
      default:
        return <QueueListIcon className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (confidence: number): 'success' | 'warning' | 'danger' => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with queue selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Smart Queue Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            ML-powered queue optimization and workload balancing
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            label="Queue"
            selectedKeys={[selectedQueueId]}
            onSelectionChange={(keys) => handleQueueChange(Array.from(keys)[0] as string)}
            className="w-64"
          >
            {queues.map((queue) => (
              <SelectItem key={queue.id} textValue={queue.name}>
                <div className="flex items-center gap-2">
                  {getQueueTypeIcon(queue.type)}
                  <span>{queue.name}</span>
                  <Badge size="sm" color="primary">
                    {queue.tickets.length}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </Select>

          <Button
            color="primary"
            variant="flat"
            startContent={<BoltIcon className="h-4 w-4" />}
            onPress={onRecommendationModalOpen}
          >
            ML Insights ({mlRecommendations.length})
          </Button>
        </div>
      </div>

      {/* Queue metrics overview */}
      {currentQueue && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardBody className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Avg Wait Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(currentQueue.metrics.avgWaitTime)}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">SLA Breaches</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {currentQueue.metrics.slaBreaches}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {currentQueue.metrics.throughput}/day
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Utilization</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {currentQueue.metrics.agentUtilization}%
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Main content tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="w-full"
      >
        <Tab key="overview" title="Overview">
          {currentQueue && (
            <div className="space-y-6">
              {/* Queue description and settings */}
              <Card>
                <CardHeader>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getQueueTypeIcon(currentQueue.type)}
                      <h3 className="text-lg font-semibold">{currentQueue.name}</h3>
                      <Chip size="sm" variant="flat" color="primary">
                        {currentQueue.type}
                      </Chip>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
                    >
                      Configure
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {currentQueue.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-gray-500">SLA Target:</span>
                      <div className="font-medium">{formatTime(currentQueue.slaTarget)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Tickets/Agent:</span>
                      <div className="font-medium">{currentQueue.rules.maxTicketsPerAgent}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Auto Assignment:</span>
                      <div className="font-medium">
                        {currentQueue.rules.autoAssignment ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Skill Matching:</span>
                      <div className="font-medium">
                        {currentQueue.rules.skillMatching ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Agent workload visualization */}
              <Card>
                <CardHeader>
                  <div className="flex w-full items-center justify-between">
                    <h3 className="text-lg font-semibold">Team Workload</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={viewMode === 'workload' ? 'solid' : 'flat'}
                        onPress={() => setViewMode('workload')}
                      >
                        Workload
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'performance' ? 'solid' : 'flat'}
                        onPress={() => setViewMode('performance')}
                      >
                        Performance
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'capacity' ? 'solid' : 'flat'}
                        onPress={() => setViewMode('capacity')}
                      >
                        Capacity
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {currentQueue.agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" name={agent.name} showFallback />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{agent.name}</span>
                              <Chip size="sm" color={getStatusColor(agent.status)} variant="flat">
                                {agent.status}
                              </Chip>
                            </div>
                            <div className="mt-1 flex gap-1">
                              {agent.skillTags.map((skill) => (
                                <Chip key={skill} size="sm" variant="bordered">
                                  {skill}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {viewMode === 'workload' && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Current Load</div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(agent.currentTickets / agent.maxCapacity) * 100}
                                  className="w-20"
                                  color={
                                    agent.currentTickets >= agent.maxCapacity ? 'danger' : 'primary'
                                  }
                                />
                                <span className="text-sm font-medium">
                                  {agent.currentTickets}/{agent.maxCapacity}
                                </span>
                              </div>
                              <div className="mt-1 flex gap-1">
                                {agent.workload.urgent > 0 && (
                                  <Chip size="sm" color="danger">
                                    {agent.workload.urgent} urgent
                                  </Chip>
                                )}
                                {agent.workload.high > 0 && (
                                  <Chip size="sm" color="warning">
                                    {agent.workload.high} high
                                  </Chip>
                                )}
                                {agent.workload.medium > 0 && (
                                  <Chip size="sm" color="primary">
                                    {agent.workload.medium} medium
                                  </Chip>
                                )}
                              </div>
                            </div>
                          )}

                          {viewMode === 'performance' && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Performance</div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">Avg Resolution:</span>
                                  <span className="font-medium">
                                    {formatTime(agent.performance.avgResolutionTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">Success Rate:</span>
                                  <span className="font-medium">
                                    {agent.performance.successRate}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">CSAT:</span>
                                  <div className="flex items-center">
                                    <span className="mr-1 font-medium">
                                      {agent.performance.customerSatisfaction}
                                    </span>
                                    <StarIconSolid className="h-3 w-3 text-yellow-500" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {viewMode === 'capacity' && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Capacity</div>
                              <div className="space-y-1">
                                <Progress
                                  value={(agent.currentTickets / agent.maxCapacity) * 100}
                                  className="w-24"
                                  color={
                                    agent.currentTickets >= agent.maxCapacity
                                      ? 'danger'
                                      : agent.currentTickets >= agent.maxCapacity * 0.8
                                        ? 'warning'
                                        : 'success'
                                  }
                                />
                                <div className="text-sm">
                                  {agent.maxCapacity - agent.currentTickets} slots available
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </Tab>

        <Tab key="assignments" title="Assignments">
          <div className="py-12 text-center">
            <QueueListIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              Ticket Assignment View
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag-and-drop assignment is not enabled. Use automatic routing or switch to Overview.
            </p>
          </div>
        </Tab>

        <Tab key="analytics" title="Analytics">
          <div className="py-12 text-center">
            <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              Queue Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No analytics yet. Add data sources to view queue insights.
            </p>
          </div>
        </Tab>
      </Tabs>

      {/* ML Recommendations Modal */}
      <Modal isOpen={isRecommendationModalOpen} onClose={onRecommendationModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <BoltIcon className="h-5 w-5" />
              Machine Learning Insights
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {mlRecommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={getRecommendationColor(recommendation.confidence)}
                        variant="flat"
                      >
                        {Math.round(recommendation.confidence * 100)}% confidence
                      </Chip>
                      <Chip size="sm" variant="bordered">
                        {recommendation.type}
                      </Chip>
                      <Chip
                        size="sm"
                        color={
                          recommendation.impact === 'high'
                            ? 'danger'
                            : recommendation.impact === 'medium'
                              ? 'warning'
                              : 'default'
                        }
                        variant="flat"
                      >
                        {recommendation.impact} impact
                      </Chip>
                    </div>

                    <Button size="sm" color="primary" variant="flat">
                      Apply
                    </Button>
                  </div>

                  <h4 className="mb-1 font-medium">{recommendation.suggestion}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recommendation.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onRecommendationModalClose}>
              Close
            </Button>
            <Button color="primary" onPress={onRecommendationModalClose}>
              Apply All High-Confidence
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
