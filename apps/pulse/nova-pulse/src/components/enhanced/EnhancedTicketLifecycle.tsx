import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
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
  Link,
} from '@heroui/react';
import {
  ClockIcon,
  DocumentTextIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
  ShareIcon,
  BookOpenIcon,
  TagIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { Ticket } from '../../types';

interface TicketActivity {
  id: string;
  timestamp: Date;
  type:
    | 'status_change'
    | 'assignment'
    | 'comment'
    | 'attachment'
    | 'link_added'
    | 'escalation'
    | 'resolution';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  description?: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    attachmentName?: string;
    linkedTicketId?: string;
    escalationLevel?: string;
  };
}

interface RelatedTicket {
  id: string;
  ticketId: string;
  title: string;
  status: string;
  priority: string;
  relationship: 'duplicate' | 'blocks' | 'blocked_by' | 'related' | 'child' | 'parent';
  similarity: number; // 0-1 score
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  relevanceScore: number;
  tags: string[];
  lastUpdated: Date;
  views: number;
}

interface StatusTransition {
  from: string;
  to: string;
  label: string;
  requiresComment: boolean;
  validations: string[];
  estimatedTime?: number;
}

interface Props {
  ticket: Ticket;
  onStatusChange?: (newStatus: string, comment?: string) => void;
  onCommentAdd?: (comment: string) => void;
}

export const EnhancedTicketLifecycle: React.FC<Props> = ({
  ticket,
  onStatusChange,
  onCommentAdd,
}) => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [newComment, setNewComment] = useState('');
  const [selectedTransition, setSelectedTransition] = useState<StatusTransition | null>(null);
  const [transitionComment, setTransitionComment] = useState('');

  const {
    isOpen: isTransitionModalOpen,
    onOpen: onTransitionModalOpen,
    onClose: onTransitionModalClose,
  } = useDisclosure();
  const {
    isOpen: isLinkModalOpen,
    onOpen: onLinkModalOpen,
    onClose: onLinkModalClose,
  } = useDisclosure();

  // Real API calls instead of mock data
  const { data: activities = [] } = useQuery({
    queryKey: ['ticket-activities', ticket.id],
    queryFn: async (): Promise<TicketActivity[]> => {
      const response = await fetch(`/api/v1/tickets/${ticket.id}/activities`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket activities');
      }
      const data = await response.json();
      return data.activities || [];
    },
  });

  const { data: relatedTickets = [] } = useQuery({
    queryKey: ['related-tickets', ticket.id],
    queryFn: async (): Promise<RelatedTicket[]> => {
      const response = await fetch(`/api/v1/tickets/${ticket.id}/related`);
      if (!response.ok) {
        throw new Error('Failed to fetch related tickets');
      }
      const data = await response.json();
      return data.relatedTickets || [];
    },
  });

  const { data: knowledgeArticles = [] } = useQuery({
    queryKey: ['knowledge-articles', ticket.id],
    queryFn: async (): Promise<KnowledgeBaseArticle[]> => {
      const response = await fetch(`/api/v1/tickets/${ticket.id}/knowledge-suggestions`);
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge articles');
      }
      const data = await response.json();
      return data.articles || [];
    },
  });

  const statusTransitions: StatusTransition[] = [
    {
      from: 'open',
      to: 'in-progress',
      label: 'Start Work',
      requiresComment: false,
      validations: [],
      estimatedTime: 5,
    },
    {
      from: 'in-progress',
      to: 'pending',
      label: 'Wait for Customer',
      requiresComment: true,
      validations: ['Customer response required'],
      estimatedTime: 2,
    },
    {
      from: 'in-progress',
      to: 'resolved',
      label: 'Resolve',
      requiresComment: true,
      validations: ['Resolution documented', 'Customer notified'],
      estimatedTime: 10,
    },
    {
      from: 'pending',
      to: 'in-progress',
      label: 'Resume Work',
      requiresComment: false,
      validations: [],
      estimatedTime: 2,
    },
    {
      from: 'resolved',
      to: 'closed',
      label: 'Close',
      requiresComment: false,
      validations: ['Customer confirmation received'],
      estimatedTime: 1,
    },
  ];

  const availableTransitions = statusTransitions.filter((t) => t.from === ticket.status);

  const handleStatusTransition = useCallback(
    (transition: StatusTransition) => {
      setSelectedTransition(transition);
      if (transition.requiresComment) {
        onTransitionModalOpen();
      } else {
        onStatusChange?.(transition.to);
      }
    },
    [onStatusChange, onTransitionModalOpen],
  );

  const handleTransitionConfirm = useCallback(() => {
    if (selectedTransition) {
      onStatusChange?.(selectedTransition.to, transitionComment);
      setTransitionComment('');
      onTransitionModalClose();
    }
  }, [selectedTransition, transitionComment, onStatusChange, onTransitionModalClose]);

  const handleCommentSubmit = useCallback(() => {
    if (newComment.trim()) {
      onCommentAdd?.(newComment.trim());
      setNewComment('');
    }
  }, [newComment, onCommentAdd]);

  const getActivityIcon = (type: TicketActivity['type']) => {
    switch (type) {
      case 'status_change':
        return <ArrowRightIcon className="h-4 w-4" />;
      case 'assignment':
        return <UserIcon className="h-4 w-4" />;
      case 'comment':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'attachment':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'link_added':
        return <LinkIcon className="h-4 w-4" />;
      case 'escalation':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'resolution':
        return <CheckCircleIconSolid className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (
    type: TicketActivity['type'],
  ): 'primary' | 'success' | 'warning' | 'danger' | 'default' => {
    switch (type) {
      case 'status_change':
        return 'primary';
      case 'assignment':
        return 'default';
      case 'comment':
        return 'default';
      case 'resolution':
        return 'success';
      case 'escalation':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRelationshipColor = (
    relationship: string,
  ): 'primary' | 'success' | 'warning' | 'danger' => {
    switch (relationship) {
      case 'duplicate':
        return 'warning';
      case 'blocks':
        return 'danger';
      case 'blocked_by':
        return 'danger';
      case 'parent':
        return 'primary';
      case 'child':
        return 'primary';
      default:
        return 'success';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Status transition actions */}
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <h3 className="text-lg font-semibold">Ticket Actions</h3>
            <Chip color="primary" variant="flat">
              {ticket.status}
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          {availableTransitions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((transition, index) => (
                <Button
                  key={index}
                  color="primary"
                  variant="flat"
                  onPress={() => handleStatusTransition(transition)}
                  startContent={<ArrowRightIcon className="h-4 w-4" />}
                >
                  {transition.label}
                  {transition.estimatedTime && (
                    <span className="ml-1 text-xs">({transition.estimatedTime}m)</span>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No available status transitions</p>
          )}
        </CardBody>
      </Card>

      {/* Main content tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="w-full"
      >
        <Tab key="timeline" title="Timeline">
          <div className="space-y-6">
            {/* Add comment section */}
            <Card>
              <CardBody>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    minRows={3}
                    maxRows={6}
                  />
                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      onPress={handleCommentSubmit}
                      isDisabled={!newComment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Activity timeline */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Activity Timeline</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`rounded-full p-2 bg-${getActivityColor(activity.type)}-100 dark:bg-${getActivityColor(activity.type)}-900/20`}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                        {index < activities.length - 1 && (
                          <div className="mt-2 h-8 w-px bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium">{activity.title}</span>
                          <Chip size="sm" variant="flat" color={getActivityColor(activity.type)}>
                            {activity.type.replace('_', ' ')}
                          </Chip>
                        </div>

                        {activity.description && (
                          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Avatar size="sm" name={activity.user.name} className="h-4 w-4" />
                          <span>{activity.user.name}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="related" title={`Related (${relatedTickets.length})`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Related Tickets</h3>
              <Button
                size="sm"
                variant="flat"
                startContent={<PlusIcon className="h-4 w-4" />}
                onPress={onLinkModalOpen}
              >
                Link Ticket
              </Button>
            </div>

            <div className="space-y-3">
              {relatedTickets.map((relatedTicket) => (
                <Card key={relatedTicket.id} className="transition-shadow hover:shadow-md">
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Link href={`/tickets/${relatedTicket.ticketId}`} className="font-medium">
                            #{relatedTicket.ticketId}
                          </Link>
                          <Chip
                            size="sm"
                            color={getRelationshipColor(relatedTicket.relationship)}
                            variant="flat"
                          >
                            {relatedTicket.relationship.replace('_', ' ')}
                          </Chip>
                          <Badge color="primary" variant="flat">
                            {Math.round(relatedTicket.similarity * 100)}% similar
                          </Badge>
                        </div>

                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                          {relatedTicket.title}
                        </p>

                        <div className="flex gap-2">
                          <Chip size="sm" variant="flat">
                            {relatedTicket.status}
                          </Chip>
                          <Chip size="sm" variant="flat">
                            {relatedTicket.priority}
                          </Chip>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        startContent={<ShareIcon className="h-4 w-4" />}
                      />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Tab>

        <Tab key="knowledge" title={`Knowledge (${knowledgeArticles.length})`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Relevant Knowledge Base Articles</h3>
            </div>

            <div className="space-y-3">
              {knowledgeArticles.map((article) => (
                <Card key={article.id} className="transition-shadow hover:shadow-md">
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Link href={article.url} className="font-medium text-blue-600">
                            {article.title}
                          </Link>
                          <Badge color="success" variant="flat">
                            {Math.round(article.relevanceScore * 100)}% relevant
                          </Badge>
                        </div>

                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {article.tags.map((tag) => (
                              <Chip
                                key={tag}
                                size="sm"
                                variant="bordered"
                                startContent={<TagIcon className="h-3 w-3" />}
                              >
                                {tag}
                              </Chip>
                            ))}
                          </div>

                          <div className="text-xs text-gray-500">
                            {article.views} views • Updated {formatTimeAgo(article.lastUpdated)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* Status Transition Modal */}
      <Modal isOpen={isTransitionModalOpen} onClose={onTransitionModalClose}>
        <ModalContent>
          <ModalHeader>
            {selectedTransition && `${selectedTransition.label} - ${ticket.ticketId}`}
          </ModalHeader>
          <ModalBody>
            {selectedTransition && (
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="mb-2 font-medium">Status Change:</p>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="flat">
                      {selectedTransition.from}
                    </Chip>
                    <ArrowRightIcon className="h-4 w-4" />
                    <Chip size="sm" color="primary">
                      {selectedTransition.to}
                    </Chip>
                  </div>
                </div>

                {selectedTransition.validations.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium">Required Validations:</p>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {selectedTransition.validations.map((validation, index) => (
                        <li key={index}>{validation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Textarea
                  label="Comment"
                  placeholder={
                    selectedTransition.requiresComment
                      ? 'Comment is required...'
                      : 'Optional comment...'
                  }
                  value={transitionComment}
                  onChange={(e) => setTransitionComment(e.target.value)}
                  minRows={3}
                  isRequired={selectedTransition.requiresComment}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onTransitionModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleTransitionConfirm}
              isDisabled={selectedTransition?.requiresComment && !transitionComment.trim()}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Link Ticket Modal */}
      <Modal isOpen={isLinkModalOpen} onClose={onLinkModalClose}>
        <ModalContent>
          <ModalHeader>Link Related Ticket</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Ticket ID"
                placeholder="T-001"
                description="Enter the ticket ID to link"
              />
              <Select label="Relationship Type" placeholder="Select relationship">
                <SelectItem key="related">Related</SelectItem>
                <SelectItem key="duplicate">Duplicate</SelectItem>
                <SelectItem key="blocks">Blocks</SelectItem>
                <SelectItem key="blocked_by">Blocked By</SelectItem>
                <SelectItem key="parent">Parent</SelectItem>
                <SelectItem key="child">Child</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onLinkModalClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={onLinkModalClose}>
              Link Ticket
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
