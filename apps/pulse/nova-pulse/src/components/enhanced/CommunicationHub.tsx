import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider
} from '@heroui/react'
import {
  InboxIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClockIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  ArrowUpIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import type { Ticket } from '../../types'

export interface CommunicationMessage {
  id: string
  type: 'ticket_comment' | 'email' | 'slack' | 'phone' | 'internal_note'
  timestamp: Date
  from: {
    id: string
    name: string
    email?: string
    avatar?: string
    type: 'customer' | 'agent' | 'system'
  }
  to?: {
    id: string
    name: string
    email?: string
  }[]
  subject?: string
  content: string
  attachments?: string[]
  ticketId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'replied' | 'escalated'
  tags: string[]
  isInternal: boolean
}

interface ResponseTemplate {
  id: string
  name: string
  category: 'greeting' | 'resolution' | 'escalation' | 'follow_up' | 'closing'
  subject?: string
  content: string
  variables: string[] // e.g., ['customer_name', 'ticket_id', 'resolution_time']
  isPublic: boolean
}

interface EscalationWorkflow {
  id: string
  name: string
  triggerConditions: {
    priority?: string[]
    timeThreshold?: number // minutes
    keywords?: string[]
    customerType?: string[]
  }
  approvalChain: {
    level: number
    approver: {
      id: string
      name: string
      role: string
    }
    autoApproveAfter?: number // minutes
  }[]
  actions: {
    type: 'assign' | 'notify' | 'status_change' | 'priority_change'
    target?: string
    value?: string
  }[]
}

interface Props {
  selectedTicket?: Ticket
  onMessageSend?: (message: Omit<CommunicationMessage, 'id' | 'timestamp'>) => void
  onEscalationTrigger?: (workflowId: string, messageId: string) => void
}

export const CommunicationHub: React.FC<Props> = ({
  selectedTicket,
  onMessageSend,
  onEscalationTrigger
}) => {
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  const { isOpen: isReplyModalOpen, onOpen: onReplyModalOpen, onClose: onReplyModalClose } = useDisclosure()
  const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure()
  const { isOpen: isEscalationModalOpen, onOpen: onEscalationModalOpen, onClose: onEscalationModalClose } = useDisclosure()

    // Real API calls instead of mock data
  const { data: messages = [] } = useQuery({
    queryKey: ['communication-messages', selectedTicket?.id],
    queryFn: async (): Promise<CommunicationMessage[]> => {
      const response = await fetch(`/api/v1/communication/messages${selectedTicket?.id ? `?ticketId=${selectedTicket.id}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch communication messages');
      }
      const data = await response.json();
      return data.messages || [];
    }
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['response-templates'],
    queryFn: async (): Promise<ResponseTemplate[]> => [
      {
        id: '1',
        name: 'Initial Response',
        category: 'greeting',
        subject: 'Re: {{subject}}',
        content: 'Hi {{customer_name}},\n\nThank you for contacting us regarding {{ticket_id}}. We have received your request and are investigating the issue.\n\nWe will keep you updated on our progress.\n\nBest regards,\n{{agent_name}}',
        variables: ['customer_name', 'ticket_id', 'agent_name', 'subject'],
        isPublic: true
      },
      {
        id: '2',
        name: 'Resolution Confirmation',
        category: 'resolution',
        subject: 'Resolved: {{subject}}',
        content: 'Hi {{customer_name}},\n\nI\'m pleased to inform you that we have resolved the issue reported in {{ticket_id}}.\n\nResolution: {{resolution_details}}\n\nPlease let us know if you experience any further issues.\n\nBest regards,\n{{agent_name}}',
        variables: ['customer_name', 'ticket_id', 'resolution_details', 'agent_name', 'subject'],
        isPublic: true
      },
      {
        id: '3',
        name: 'Escalation Notice',
        category: 'escalation',
        content: 'This issue has been escalated to {{escalation_team}} for specialized attention. Priority: {{priority}}',
        variables: ['escalation_team', 'priority'],
        isPublic: false
      }
    ]
  })

  const { data: escalationWorkflows = [] } = useQuery({
    queryKey: ['escalation-workflows'],
    queryFn: async (): Promise<EscalationWorkflow[]> => [
      {
        id: '1',
        name: 'VIP Customer Escalation',
        triggerConditions: {
          priority: ['urgent'],
          customerType: ['vip', 'enterprise'],
          timeThreshold: 30
        },
        approvalChain: [
          {
            level: 1,
            approver: { id: 'manager1', name: 'Alex Thompson', role: 'Team Lead' },
            autoApproveAfter: 15
          },
          {
            level: 2,
            approver: { id: 'director1', name: 'Lisa Chen', role: 'Director' },
            autoApproveAfter: 30
          }
        ],
        actions: [
          { type: 'assign', target: 'vip_queue' },
          { type: 'priority_change', value: 'critical' },
          { type: 'notify', target: 'management_team' }
        ]
      }
    ]
  })

  const filteredMessages = messages.filter(message => {
    if (filterType !== 'all' && message.type !== filterType) return false
    if (filterStatus !== 'all' && message.status !== filterStatus) return false
    if (selectedTicket && message.ticketId && message.ticketId !== selectedTicket.ticketId) return false
    return true
  })

  const unreadCount = messages.filter(m => m.status === 'unread').length

  const handleMessageSelect = useCallback((message: CommunicationMessage) => {
    setSelectedMessage(message)
    // Mark as read if unread
    if (message.status === 'unread') {
      // Would update via API in real implementation
    }
  }, [])

  const handleReplyClick = useCallback((message: CommunicationMessage) => {
    setSelectedMessage(message)
    onReplyModalOpen()
  }, [onReplyModalOpen])

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template && selectedMessage) {
      // Replace template variables with actual values
      let content = template.content
      content = content.replace('{{customer_name}}', selectedMessage.from.name)
      content = content.replace('{{ticket_id}}', selectedMessage.ticketId || 'N/A')
      content = content.replace('{{agent_name}}', 'Current Agent') // Would get from auth context
      content = content.replace('{{subject}}', selectedMessage.subject || '')
      
      setReplyContent(content)
      onTemplateModalClose()
    }
  }, [templates, selectedMessage, onTemplateModalClose])

  const handleSendReply = useCallback(() => {
    if (selectedMessage && replyContent.trim()) {
      const newMessage: Omit<CommunicationMessage, 'id' | 'timestamp'> = {
        type: selectedMessage.type,
        from: {
          id: 'current-agent',
          name: 'Current Agent',
          type: 'agent'
        },
        to: [selectedMessage.from],
        content: replyContent.trim(),
        ticketId: selectedMessage.ticketId,
        priority: selectedMessage.priority,
        status: 'read',
        tags: ['response'],
        isInternal: false
      }
      
      onMessageSend?.(newMessage)
      setReplyContent('')
      onReplyModalClose()
    }
  }, [selectedMessage, replyContent, onMessageSend, onReplyModalClose])

  const handleEscalate = useCallback((workflowId: string) => {
    if (selectedMessage) {
      onEscalationTrigger?.(workflowId, selectedMessage.id)
      onEscalationModalClose()
    }
  }, [selectedMessage, onEscalationTrigger, onEscalationModalClose])

  const getMessageTypeIcon = (type: CommunicationMessage['type']) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="w-4 h-4" />
      case 'slack': return <ChatBubbleLeftRightIcon className="w-4 h-4" />
      case 'phone': return <PhoneIcon className="w-4 h-4" />
      case 'ticket_comment': return <InboxIcon className="w-4 h-4" />
      default: return <InboxIcon className="w-4 h-4" />
    }
  }

  const getMessageTypeColor = (type: CommunicationMessage['type']): "primary" | "success" | "warning" | "danger" | "default" => {
    switch (type) {
      case 'email': return 'primary'
      case 'slack': return 'success'
      case 'phone': return 'warning'
      case 'ticket_comment': return 'default'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string): "success" | "warning" | "danger" | "default" => {
    switch (priority) {
      case 'urgent': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string): "primary" | "success" | "warning" | "default" => {
    switch (status) {
      case 'unread': return 'primary'
      case 'read': return 'default'
      case 'replied': return 'success'
      case 'escalated': return 'warning'
      default: return 'default'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMinutes > 0) return `${diffMinutes}m ago`
    return 'Just now'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Communication Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Unified inbox for tickets, emails, and team communications
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge color="primary" variant="flat">
            {unreadCount} unread
          </Badge>
          
          <div className="flex gap-2">
            <Select
              label="Type"
              selectedKeys={[filterType]}
              onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as string)}
              className="w-32"
              size="sm"
            >
              <SelectItem key="all">All</SelectItem>
              <SelectItem key="email">Email</SelectItem>
              <SelectItem key="slack">Slack</SelectItem>
              <SelectItem key="ticket_comment">Tickets</SelectItem>
              <SelectItem key="phone">Phone</SelectItem>
            </Select>

            <Select
              label="Status"
              selectedKeys={[filterStatus]}
              onSelectionChange={(keys) => setFilterStatus(Array.from(keys)[0] as string)}
              className="w-32"
              size="sm"
            >
              <SelectItem key="all">All</SelectItem>
              <SelectItem key="unread">Unread</SelectItem>
              <SelectItem key="read">Read</SelectItem>
              <SelectItem key="replied">Replied</SelectItem>
              <SelectItem key="escalated">Escalated</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Messages ({filteredMessages.length})</h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${message.status === 'unread' ? 'font-medium' : ''}`}
                    onClick={() => handleMessageSelect(message)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        size="sm"
                        name={message.from.name}
                        className="flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {message.from.name}
                          </span>
                          <Chip
                            size="sm"
                            color={getMessageTypeColor(message.type)}
                            variant="flat"
                            startContent={getMessageTypeIcon(message.type)}
                          >
                            {message.type.replace('_', ' ')}
                          </Chip>
                        </div>
                        
                        {message.subject && (
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                            {message.subject}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Chip size="sm" color={getPriorityColor(message.priority)} variant="flat">
                              {message.priority}
                            </Chip>
                            <Chip size="sm" color={getStatusColor(message.status)} variant="flat">
                              {message.status}
                            </Chip>
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-start gap-3">
                    <Avatar
                      size="md"
                      name={selectedMessage.from.name}
                    />
                    <div>
                      <h3 className="font-semibold">{selectedMessage.from.name}</h3>
                      {selectedMessage.from.email && (
                        <p className="text-sm text-gray-600">{selectedMessage.from.email}</p>
                      )}
                      {selectedMessage.subject && (
                        <p className="text-sm font-medium mt-1">{selectedMessage.subject}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => handleReplyClick(selectedMessage)}
                      startContent={<PaperAirplaneIcon className="w-4 h-4" />}
                    >
                      Reply
                    </Button>
                    
                    <Dropdown>
                      <DropdownTrigger>
                        <Button size="sm" variant="flat" isIconOnly>
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="escalate"
                          startContent={<ArrowUpIcon className="w-4 h-4" />}
                          onPress={onEscalationModalOpen}
                        >
                          Escalate
                        </DropdownItem>
                        <DropdownItem
                          key="tags"
                          startContent={<TagIcon className="w-4 h-4" />}
                        >
                          Add Tags
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </CardHeader>
              
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>{selectedMessage.timestamp.toLocaleString()}</span>
                    {selectedMessage.ticketId && (
                      <>
                        <span>•</span>
                        <span>Ticket: {selectedMessage.ticketId}</span>
                      </>
                    )}
                  </div>
                  
                  <Divider />
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                  
                  {selectedMessage.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedMessage.tags.map((tag) => (
                        <Chip key={tag} size="sm" variant="bordered">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <InboxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Message
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a message from the list to view details and respond
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      <Modal isOpen={isReplyModalOpen} onClose={onReplyModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            Reply to {selectedMessage?.from.name}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Quick Templates:</span>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={onTemplateModalOpen}
                  startContent={<DocumentDuplicateIcon className="w-4 h-4" />}
                >
                  Use Template
                </Button>
              </div>
              
              <Textarea
                label="Message"
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                minRows={6}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onReplyModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSendReply}
              isDisabled={!replyContent.trim()}
              startContent={<PaperAirplaneIcon className="w-4 h-4" />}
            >
              Send Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Template Selection Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={onTemplateModalClose}>
        <ModalContent>
          <ModalHeader>
            Select Response Template
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Chip size="sm" variant="flat">
                      {template.category}
                    </Chip>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onTemplateModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Escalation Modal */}
      <Modal isOpen={isEscalationModalOpen} onClose={onEscalationModalClose}>
        <ModalContent>
          <ModalHeader>
            Escalate Message
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select an escalation workflow for this message:
              </p>
              
              {escalationWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <Button
                      size="sm"
                      color="warning"
                      variant="flat"
                      onPress={() => handleEscalate(workflow.id)}
                    >
                      Escalate
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Approval chain: {workflow.approvalChain.length} levels</p>
                    <p>Auto-approve after: {workflow.approvalChain[0]?.autoApproveAfter || 'N/A'} minutes</p>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onEscalationModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
