import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  Avatar
} from '@heroui/react'
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
  FireIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import type { Ticket } from '../../types'

interface QueueAgent {
  id: string
  name: string
  avatar?: string
  status: 'available' | 'busy' | 'away' | 'offline'
  currentTickets: number
  maxCapacity: number
  skillTags: string[]
  performance: {
    avgResolutionTime: number // in minutes
    successRate: number // percentage
    customerSatisfaction: number // out of 5
  }
  workload: {
    urgent: number
    high: number
    medium: number
    low: number
  }
}

interface Queue {
  id: string
  name: string
  description: string
  type: 'general' | 'specialized' | 'escalation' | 'vip'
  agents: QueueAgent[]
  tickets: Ticket[]
  slaTarget: number // in minutes
  rules: {
    maxTicketsPerAgent: number
    autoAssignment: boolean
    priorityWeighting: boolean
    skillMatching: boolean
  }
  metrics: {
    avgWaitTime: number
    slaBreaches: number
    throughput: number
    agentUtilization: number
  }
}

interface MLRecommendation {
  type: 'assignment' | 'priority' | 'escalation' | 'routing'
  confidence: number
  suggestion: string
  reasoning: string
  impact: 'low' | 'medium' | 'high'
  ticketId?: string
  agentId?: string
}

interface Props {
  selectedQueue?: string
  onQueueSelect?: (queueId: string) => void
}

export const SmartQueueManagement: React.FC<Props> = ({
  selectedQueue,
  onQueueSelect
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedQueueId, setSelectedQueueId] = useState(selectedQueue || 'general')
  const [viewMode, setViewMode] = useState<'workload' | 'performance' | 'capacity'>('workload')
  
  const { isOpen: isRecommendationModalOpen, onOpen: onRecommendationModalOpen, onClose: onRecommendationModalClose } = useDisclosure()

  // Mock data - replace with actual API calls
  const { data: queues = [] } = useQuery({
    queryKey: ['queues'],
    queryFn: async (): Promise<Queue[]> => [
      {
        id: 'general',
        name: 'General Support',
        description: 'General customer support and technical questions',
        type: 'general',
        slaTarget: 240, // 4 hours
        rules: {
          maxTicketsPerAgent: 8,
          autoAssignment: true,
          priorityWeighting: true,
          skillMatching: false
        },
        agents: [
          {
            id: 'agent1',
            name: 'Sarah Wilson',
            status: 'available',
            currentTickets: 5,
            maxCapacity: 8,
            skillTags: ['windows', 'networking', 'email'],
            performance: {
              avgResolutionTime: 180,
              successRate: 94,
              customerSatisfaction: 4.6
            },
            workload: { urgent: 1, high: 2, medium: 2, low: 0 }
          },
          {
            id: 'agent2',
            name: 'Mike Rodriguez',
            status: 'busy',
            currentTickets: 7,
            maxCapacity: 8,
            skillTags: ['linux', 'database', 'api'],
            performance: {
              avgResolutionTime: 165,
              successRate: 97,
              customerSatisfaction: 4.8
            },
            workload: { urgent: 0, high: 3, medium: 3, low: 1 }
          },
          {
            id: 'agent3',
            name: 'Emma Chen',
            status: 'available',
            currentTickets: 3,
            maxCapacity: 8,
            skillTags: ['security', 'compliance', 'audit'],
            performance: {
              avgResolutionTime: 145,
              successRate: 99,
              customerSatisfaction: 4.9
            },
            workload: { urgent: 0, high: 1, medium: 2, low: 0 }
          }
        ],
        tickets: [], // Mock tickets
        metrics: {
          avgWaitTime: 15,
          slaBreaches: 2,
          throughput: 45,
          agentUtilization: 72
        }
      },
      {
        id: 'technical',
        name: 'Technical Support',
        description: 'Advanced technical issues and system problems',
        type: 'specialized',
        slaTarget: 120, // 2 hours
        rules: {
          maxTicketsPerAgent: 5,
          autoAssignment: true,
          priorityWeighting: true,
          skillMatching: true
        },
        agents: [
          {
            id: 'tech1',
            name: 'David Kumar',
            status: 'available',
            currentTickets: 3,
            maxCapacity: 5,
            skillTags: ['server', 'cloud', 'devops'],
            performance: {
              avgResolutionTime: 95,
              successRate: 96,
              customerSatisfaction: 4.7
            },
            workload: { urgent: 1, high: 2, medium: 0, low: 0 }
          }
        ],
        tickets: [],
        metrics: {
          avgWaitTime: 8,
          slaBreaches: 0,
          throughput: 28,
          agentUtilization: 85
        }
      },
      {
        id: 'vip',
        name: 'VIP Support',
        description: 'Priority support for VIP customers',
        type: 'vip',
        slaTarget: 60, // 1 hour
        rules: {
          maxTicketsPerAgent: 3,
          autoAssignment: true,
          priorityWeighting: true,
          skillMatching: true
        },
        agents: [
          {
            id: 'vip1',
            name: 'Alex Thompson',
            status: 'available',
            currentTickets: 2,
            maxCapacity: 3,
            skillTags: ['vip', 'escalation', 'senior'],
            performance: {
              avgResolutionTime: 45,
              successRate: 100,
              customerSatisfaction: 5.0
            },
            workload: { urgent: 2, high: 0, medium: 0, low: 0 }
          }
        ],
        tickets: [],
        metrics: {
          avgWaitTime: 2,
          slaBreaches: 0,
          throughput: 12,
          agentUtilization: 67
        }
      }
    ]
  })

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
        agentId: 'agent3'
      },
      {
        type: 'escalation',
        confidence: 0.78,
        suggestion: 'Consider escalating ticket T-005 to Technical Support',
        reasoning: 'Issue complexity exceeds general support capabilities',
        impact: 'medium',
        ticketId: 'T-005'
      },
      {
        type: 'routing',
        confidence: 0.85,
        suggestion: 'Route new VIP tickets to Alex Thompson',
        reasoning: 'Optimal performance metrics and availability for VIP support',
        impact: 'high',
        agentId: 'vip1'
      }
    ]
  })

  const currentQueue = queues.find(q => q.id === selectedQueueId)

  const handleQueueChange = useCallback((queueId: string) => {
    setSelectedQueueId(queueId)
    onQueueSelect?.(queueId)
  }, [onQueueSelect])

  const getStatusColor = (status: QueueAgent['status']): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case 'available': return 'success'
      case 'busy': return 'warning'
      case 'away': return 'default'
      case 'offline': return 'danger'
      default: return 'default'
    }
  }

  const getQueueTypeIcon = (type: Queue['type']) => {
    switch (type) {
      case 'vip': return <StarIcon className="w-4 h-4" />
      case 'specialized': return <ShieldCheckIcon className="w-4 h-4" />
      case 'escalation': return <FireIcon className="w-4 h-4" />
      default: return <QueueListIcon className="w-4 h-4" />
    }
  }

  const getRecommendationColor = (confidence: number): "success" | "warning" | "danger" => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'
    return 'danger'
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header with queue selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Smart Queue Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
            startContent={<BoltIcon className="w-4 h-4" />}
            onPress={onRecommendationModalOpen}
          >
            ML Insights ({mlRecommendations.length})
          </Button>
        </div>
      </div>

      {/* Queue metrics overview */}
      {currentQueue && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Avg Wait Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(currentQueue.metrics.avgWaitTime)}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">SLA Breaches</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {currentQueue.metrics.slaBreaches}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {currentQueue.metrics.throughput}/day
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
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
                  <div className="flex justify-between items-center w-full">
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
                      startContent={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
                    >
                      Configure
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {currentQueue.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                  <div className="flex justify-between items-center w-full">
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
                      <div key={agent.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="sm"
                            name={agent.name}
                            showFallback
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{agent.name}</span>
                              <Chip
                                size="sm"
                                color={getStatusColor(agent.status)}
                                variant="flat"
                              >
                                {agent.status}
                              </Chip>
                            </div>
                            <div className="flex gap-1 mt-1">
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
                                  color={agent.currentTickets >= agent.maxCapacity ? 'danger' : 'primary'}
                                />
                                <span className="text-sm font-medium">
                                  {agent.currentTickets}/{agent.maxCapacity}
                                </span>
                              </div>
                              <div className="flex gap-1 mt-1">
                                {agent.workload.urgent > 0 && (
                                  <Chip size="sm" color="danger">{agent.workload.urgent} urgent</Chip>
                                )}
                                {agent.workload.high > 0 && (
                                  <Chip size="sm" color="warning">{agent.workload.high} high</Chip>
                                )}
                                {agent.workload.medium > 0 && (
                                  <Chip size="sm" color="primary">{agent.workload.medium} medium</Chip>
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
                                  <span className="font-medium">{formatTime(agent.performance.avgResolutionTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">Success Rate:</span>
                                  <span className="font-medium">{agent.performance.successRate}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">CSAT:</span>
                                  <div className="flex items-center">
                                    <span className="font-medium mr-1">{agent.performance.customerSatisfaction}</span>
                                    <StarIconSolid className="w-3 h-3 text-yellow-500" />
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
                                    agent.currentTickets >= agent.maxCapacity ? 'danger' :
                                    agent.currentTickets >= agent.maxCapacity * 0.8 ? 'warning' : 'success'
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
          <div className="text-center py-12">
            <QueueListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ticket Assignment View
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop interface for manual ticket assignment coming soon
            </p>
          </div>
        </Tab>

        <Tab key="analytics" title="Analytics">
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Queue Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced analytics and reporting dashboard coming soon
            </p>
          </div>
        </Tab>
      </Tabs>

      {/* ML Recommendations Modal */}
      <Modal isOpen={isRecommendationModalOpen} onClose={onRecommendationModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              Machine Learning Insights
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {mlRecommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
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
                          recommendation.impact === 'high' ? 'danger' :
                          recommendation.impact === 'medium' ? 'warning' : 'default'
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
                  
                  <h4 className="font-medium mb-1">{recommendation.suggestion}</h4>
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
  )
}
