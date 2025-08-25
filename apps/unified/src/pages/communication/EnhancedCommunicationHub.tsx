import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from '@heroicons/react/24/solid';
import { cn, formatRelativeTime } from '@utils/index';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { userService } from '@services/users';
import toast from 'react-hot-toast';

// Types
interface CommunicationChannel {
  id: string;
  name: string;
  type: 'chat' | 'voice' | 'video' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  channelId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: Attachment[];
  replyTo?: string;
  reactions?: MessageReaction[];
  isEdited: boolean;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: string;
  department: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

interface EscalationRequest {
  id: string;
  ticketId: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

// Enhanced communication service with real API integration
const communicationService = {
  getChannels: async (): Promise<CommunicationChannel[]> => {
    // For now, simulate team channels based on real user data
    // In a real app, this would be a dedicated chat/communication API
    try {
      const usersResponse = await userService.getUsers(1, 20, {});
      const activeUsers = usersResponse.data.filter((user) => user.isActive);

      // Create mock team channels based on departments
      const departments = [...new Set(activeUsers.map((user) => user.department).filter(Boolean))];

      return departments.map((dept, index) => ({
        id: `dept-${dept?.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${dept} Team`,
        type: 'group' as const,
        participants: activeUsers
          .filter((user) => user.department === dept)
          .map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            status: 'online' as const, // In real app, this would come from presence API
            role: user.roles[0]?.name || 'Agent',
            department: user.department || 'General',
          })),
        lastMessage: {
          id: `msg-${index}`,
          channelId: `dept-${dept?.toLowerCase().replace(/\s+/g, '-')}`,
          senderId: activeUsers[0]?.id || '1',
          sender: {
            id: activeUsers[0]?.id || '1',
            name: `${activeUsers[0]?.firstName} ${activeUsers[0]?.lastName}`,
            email: activeUsers[0]?.email || 'user@company.com',
            status: 'online' as const,
            role: activeUsers[0]?.roles[0]?.name || 'Agent',
            department: activeUsers[0]?.department || 'General',
          },
          content: 'Welcome to the team channel!',
          type: 'text' as const,
          isEdited: false,
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        unreadCount: Math.floor(Math.random() * 3),
        isActive: true,
        priority: 'medium' as const,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 300000).toISOString(),
      }));
    } catch (_error) {
      console.error('Error fetching communication channels:', error);
      toast.error('Failed to load team channels');
      return [];
    }
  },

  getMessages: async (channelId: string): Promise<Message[]> => {
    // In a real app, this would fetch from a chat/message API
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock messages for demo purposes
    return [
      {
        id: '1',
        channelId,
        senderId: '1',
        sender: {
          id: '1',
          name: 'Team Member',
          email: 'team@company.com',
          status: 'online',
          role: 'Agent',
          department: 'IT',
        },
        content: 'Welcome to the team channel! Feel free to ask questions or share updates here.',
        type: 'text',
        isEdited: false,
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        channelId,
        senderId: '2',
        sender: {
          id: '2',
          name: 'Supervisor',
          email: 'supervisor@company.com',
          status: 'online',
          role: 'Supervisor',
          department: 'IT',
        },
        content: 'Remember to escalate any critical issues immediately. Team huddle at 3 PM.',
        type: 'text',
        isEdited: false,
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
    ];
  },

  sendMessage: async (channelId: string, content: string): Promise<Message> => {
    // In a real app, this would send to a chat/message API
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      id: Date.now().toString(),
      channelId,
      senderId: 'current-user',
      sender: {
        id: 'current-user',
        name: 'You',
        email: 'current@company.com',
        status: 'online',
        role: 'Agent',
        department: 'IT',
      },
      content,
      type: 'text',
      isEdited: false,
      timestamp: new Date().toISOString(),
    };
  },

  createEscalation: async (
    ticketId: string,
    toUserId: string,
    reason: string,
  ): Promise<EscalationRequest> => {
    // In a real app, this would create an escalation ticket or notification
    try {
      // For now, we'll simulate by creating a ticket comment or update
      // In production, this would trigger notifications via the notification system
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        id: Date.now().toString(),
        ticketId,
        fromUserId: 'current-user',
        toUserId,
        reason,
        priority: 'medium',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    } catch (_error) {
      console.error('Error creating escalation:', error);
      throw error;
    }
  },
};

export default function EnhancedCommunicationHub() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [selectedTicketForEscalation, setSelectedTicketForEscalation] = useState<string | null>(
    null,
  );
  const [escalationReason, setEscalationReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['communication-channels'],
    queryFn: communicationService.getChannels,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['channel-messages', selectedChannel],
    queryFn: () =>
      selectedChannel ? communicationService.getMessages(selectedChannel) : Promise.resolve([]),
    enabled: !!selectedChannel,
  });

  // Load available users for escalation (for future escalation dialog enhancement)
  useQuery({
    queryKey: ['escalation-users'],
    queryFn: async () => {
      try {
        const response = await userService.getUsers(1, 50, { isActive: true });
        return response.data.filter((user) => user.isActive);
      } catch (_error) {
        console.error('Error loading users for escalation:', error);
        return [];
      }
    },
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({ channelId, content }: { channelId: string; content: string }) =>
      communicationService.sendMessage(channelId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages'] });
      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      setMessageInput('');
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const createEscalationMutation = useMutation({
    mutationFn: ({
      ticketId,
      toUserId,
      reason,
    }: {
      ticketId: string;
      toUserId: string;
      reason: string;
    }) => communicationService.createEscalation(ticketId, toUserId, reason),
    onSuccess: () => {
      toast.success('Escalation request sent successfully');
      setShowEscalationDialog(false);
      setEscalationReason('');
      setSelectedUser(null);
      setSelectedTicketForEscalation(null);
    },
    onError: () => {
      toast.error('Failed to create escalation request');
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!selectedChannel || !messageInput.trim()) return;

    sendMessageMutation.mutate({
      channelId: selectedChannel,
      content: messageInput.trim(),
    });
  };

  const handleEscalate = () => {
    if (!selectedTicketForEscalation || !selectedUser || !escalationReason.trim()) return;

    createEscalationMutation.mutate({
      ticketId: selectedTicketForEscalation,
      toUserId: selectedUser,
      reason: escalationReason.trim(),
    });
  };

  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const getChannelTypeIcon = (type: CommunicationChannel['type']) => {
    switch (type) {
      case 'chat':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'voice':
        return <PhoneIcon className="h-5 w-5" />;
      case 'video':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'group':
        return <UserGroupIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (channelsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Communication Hub
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Collaborate with team members and manage escalations
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowEscalationDialog(true)}
                className="flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-orange-700"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Create Escalation</span>
              </button>

              <div className="flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {channels.reduce((total, channel) => total + channel.unreadCount, 0)} unread
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid h-[calc(100vh-200px)] grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Channels List */}
          <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-1 dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Channels</h2>

              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
                {filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={cn(
                      'w-full rounded-lg p-3 text-left transition-colors duration-200',
                      selectedChannel === channel.id
                        ? 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700',
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getChannelTypeIcon(channel.type)}
                        <span className="truncate font-medium text-gray-900 dark:text-white">
                          {channel.name}
                        </span>
                      </div>

                      {channel.unreadCount > 0 && (
                        <span className="min-w-[20px] rounded-full bg-blue-500 px-2 py-1 text-center text-xs text-white">
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        'inline-block rounded border px-2 py-1 text-xs',
                        getPriorityColor(channel.priority),
                      )}
                    >
                      {channel.priority.toUpperCase()}
                    </div>

                    {channel.lastMessage && (
                      <div className="mt-2">
                        <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                          {channel.lastMessage.content}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          {formatRelativeTime(channel.lastMessage.timestamp)}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 flex items-center space-x-1">
                      {channel.participants.slice(0, 3).map((participant) => (
                        <div key={participant.id} className="relative">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {participant.name.charAt(0)}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800',
                              getStatusColor(participant.status),
                            )}
                          />
                        </div>
                      ))}
                      {channel.participants.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          +{channel.participants.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-3 dark:border-gray-700 dark:bg-gray-800">
            {selectedChannel ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getChannelTypeIcon(
                        channels.find((c) => c.id === selectedChannel)?.type || 'chat',
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {channels.find((c) => c.id === selectedChannel)?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {channels.find((c) => c.id === selectedChannel)?.participants.length}{' '}
                          participants
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        title="Start voice call"
                        aria-label="Start voice call"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </button>
                      <button
                        title="Start video call"
                        aria-label="Start video call"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      >
                        <VideoCameraIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {message.sender.name.charAt(0)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {message.sender.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(message.timestamp)}
                            </span>
                          </div>

                          <div className="max-w-2xl rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
                            <p className="text-gray-900 dark:text-white">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <button
                      title="Attach file"
                      aria-label="Attach file"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                      <PaperClipIcon className="h-5 w-5" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        disabled={sendMessageMutation.isPending}
                      />
                    </div>

                    <button
                      title="Add emoji"
                      aria-label="Add emoji"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                      <FaceSmileIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="rounded-lg bg-blue-600 p-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {sendMessageMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <PaperAirplaneIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIconSolid className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No channel selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Choose a channel from the sidebar to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Escalation Dialog */}
        {showEscalationDialog && (
          <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-gray-500 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  Create Escalation Request
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ticket ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., #12345"
                      value={selectedTicketForEscalation || ''}
                      onChange={(e) => setSelectedTicketForEscalation(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Escalate to
                    </label>
                    <select
                      title="Select supervisor"
                      aria-label="Select supervisor to escalate to"
                      value={selectedUser || ''}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a supervisor...</option>
                      <option value="supervisor1">Jane Smith (Supervisor)</option>
                      <option value="supervisor2">Mike Johnson (Team Lead)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reason for escalation
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe why this ticket needs escalation..."
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEscalationDialog(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEscalate}
                    disabled={
                      !selectedTicketForEscalation ||
                      !selectedUser ||
                      !escalationReason.trim() ||
                      createEscalationMutation.isPending
                    }
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {createEscalationMutation.isPending ? 'Creating...' : 'Create Escalation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
