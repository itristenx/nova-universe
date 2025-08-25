import React, { useState, useEffect, useRef } from 'react';
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  PhoneIcon,
  ShareIcon,
  DocumentIcon,
  PencilIcon,
  EyeIcon,
  UserGroupIcon,
  BellIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  LinkIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'agent' | 'supervisor' | 'specialist' | 'customer';
  status: 'online' | 'away' | 'busy' | 'offline';
  isTyping?: boolean;
  lastSeen?: Date;
  cursor?: {
    x: number;
    y: number;
    color: string;
  };
}

interface CollaborationMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'system' | 'file' | 'link' | 'code';
  timestamp: Date;
  reactions?: {
    emoji: string;
    userIds: string[];
  }[];
  mentions?: string[];
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface CollaborationSession {
  id: string;
  ticketId: string;
  ticketTitle: string;
  participants: CollaborationUser[];
  messages: CollaborationMessage[];
  isActive: boolean;
  startedAt: Date;
  lastActivity: Date;
  sharedScreen?: {
    userId: string;
    userName: string;
    screenId: string;
  };
  whiteboard?: {
    enabled: boolean;
    data: any[];
  };
}

interface RealTimeCollaborationProps {
  className?: string;
  ticketId?: string;
  currentUser: CollaborationUser;
  onStartVideoCall?: () => void;
  onStartScreenShare?: () => void;
  onInviteUser?: (userId: string) => void;
  onMessageSend?: (message: string, mentions?: string[]) => void;
  enableWhiteboard?: boolean;
  enableScreenShare?: boolean;
  enableVideoCall?: boolean;
}

// Mock data for demonstration
const mockUsers: CollaborationUser[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    role: 'agent',
    status: 'online',
  },
  {
    id: 'user-2',
    name: 'Mike Chen',
    avatar: '/avatars/mike.jpg',
    role: 'supervisor',
    status: 'online',
    isTyping: true,
  },
  {
    id: 'user-3',
    name: 'Alex Rodriguez',
    avatar: '/avatars/alex.jpg',
    role: 'specialist',
    status: 'away',
  },
  {
    id: 'user-4',
    name: 'Customer User',
    role: 'customer',
    status: 'online',
  },
];

const mockMessages: CollaborationMessage[] = [
  {
    id: 'msg-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    content:
      "I've reviewed the initial ticket details. This looks like it might be related to the recent network updates.",
    type: 'text',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    reactions: [{ emoji: '👍', userIds: ['user-2'] }],
  },
  {
    id: 'msg-2',
    userId: 'user-2',
    userName: 'Mike Chen',
    content:
      'Good catch! @Alex Rodriguez can you take a look at the network configuration? I think we might need your expertise here.',
    type: 'text',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    mentions: ['user-3'],
  },
  {
    id: 'msg-3',
    userId: 'user-3',
    userName: 'Alex Rodriguez',
    content:
      'Sure thing! Let me pull up the network logs. Can someone share their screen so I can walk through the configuration?',
    type: 'text',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'msg-4',
    userId: 'system',
    userName: 'System',
    content: 'Sarah Johnson started screen sharing',
    type: 'system',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
  },
  {
    id: 'msg-5',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    content:
      "Here's the current network configuration file. The issue seems to be in the routing table.",
    type: 'text',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    attachments: [
      {
        name: 'network-config.json',
        url: '/files/network-config.json',
        type: 'application/json',
        size: 2048,
      },
    ],
  },
];

export function RealTimeCollaboration({
  className,
  ticketId = 'TKT-12345',
  currentUser,
  onStartVideoCall,
  onStartScreenShare,
  onInviteUser,
  onMessageSend,
  enableWhiteboard = true,
  enableScreenShare = true,
  enableVideoCall = true,
}: RealTimeCollaborationProps) {
  const [session, setSession] = useState<CollaborationSession>({
    id: 'session-1',
    ticketId,
    ticketTitle: 'Network connectivity issues affecting multiple users',
    participants: mockUsers,
    messages: mockMessages,
    isActive: true,
    startedAt: new Date(Date.now() - 15 * 60 * 1000),
    lastActivity: new Date(),
    sharedScreen: {
      userId: 'user-1',
      userName: 'Sarah Johnson',
      screenId: 'screen-1',
    },
  });

  const [newMessage, setNewMessage] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<CollaborationUser[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // Handle @ mentions
  useEffect(() => {
    const mentionMatch = newMessage.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const suggestions = session.participants.filter(
        (user) => user.name.toLowerCase().includes(query) && user.id !== currentUser.id,
      );
      setMentionSuggestions(suggestions);
    } else {
      setMentionSuggestions([]);
    }
  }, [newMessage, session.participants, currentUser.id]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate typing indicators
      setSession((prev) => ({
        ...prev,
        participants: prev.participants.map((user) => ({
          ...user,
          isTyping: user.id === 'user-2' && Math.random() > 0.7,
        })),
      }));

      // Simulate new messages occasionally
      if (Math.random() > 0.95) {
        const newMsg: CollaborationMessage = {
          id: `msg-${Date.now()}`,
          userId: 'user-2',
          userName: 'Mike Chen',
          content: 'I found the root cause in the logs. Working on a fix now.',
          type: 'text',
          timestamp: new Date(),
        };
        setSession((prev) => ({
          ...prev,
          messages: [...prev.messages, newMsg],
          lastActivity: new Date(),
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const mentions =
      (newMessage
        .match(/@(\w+)/g)
        ?.map(
          (mention) =>
            session.participants.find((user) =>
              user.name.toLowerCase().includes(mention.slice(1).toLowerCase()),
            )?.id,
        )
        .filter(Boolean) as string[]) || [];

    const message: CollaborationMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      mentions,
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      lastActivity: new Date(),
    }));

    onMessageSend?.(newMessage, mentions);
    setNewMessage('');
    setMentionSuggestions([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMentionSelect = (user: CollaborationUser) => {
    const mentionRegex = /@\w*$/;
    const newText = newMessage.replace(mentionRegex, `@${user.name.replace(/\s+/g, '')} `);
    setNewMessage(newText);
    setMentionSuggestions([]);
    inputRef.current?.focus();
  };

  const addReaction = (messageId: string, emoji: string) => {
    setSession((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find((r) => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      userIds: r.userIds.includes(currentUser.id)
                        ? r.userIds.filter((id) => id !== currentUser.id)
                        : [...r.userIds, currentUser.id],
                    }
                  : r,
              ),
            };
          } else {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, userIds: [currentUser.id] }],
            };
          }
        }
        return msg;
      }),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isMinimized) {
    return (
      <div className={cn('fixed right-4 bottom-4 z-50', className)}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-nova-600 hover:bg-nova-700 flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-lg transition-colors"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span>Collaboration</span>
          {notifications.length > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs text-white">
              {notifications.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="text-nova-600 dark:text-nova-400 h-5 w-5" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Collaboration</h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {session.participants.length} participants
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {enableVideoCall && (
              <button
                onClick={onStartVideoCall}
                className="hover:text-nova-600 dark:hover:text-nova-400 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Start video call"
              >
                <VideoCameraIcon className="h-4 w-4" />
              </button>
            )}

            {enableScreenShare && (
              <button
                onClick={onStartScreenShare}
                className="hover:text-nova-600 dark:hover:text-nova-400 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Share screen"
              >
                <ShareIcon className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="hover:text-nova-600 dark:hover:text-nova-400 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Show participants"
            >
              <UserIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
            title="Minimize"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Screen Share Indicator */}
      {session.sharedScreen && (
        <div className="border-b border-gray-200 bg-blue-50 px-4 py-2 dark:border-gray-700 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-sm">
            <ShareIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-300">
              {session.sharedScreen.userName} is sharing their screen
            </span>
            <button
              className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              title="View shared screen"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Participants Panel */}
      {showParticipants && (
        <div className="dark:bg-gray-750 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Participants</h4>
          <div className="space-y-2">
            {session.participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3">
                <div className="relative">
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                      <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800',
                      getStatusColor(participant.status),
                    )}
                  ></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {participant.name}
                    {participant.id === currentUser.id && ' (You)'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize dark:text-gray-400">
                    {participant.role}
                    {participant.isTyping && ' • typing...'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs',
                    participant.status === 'online' &&
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    participant.status === 'away' &&
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                    participant.status === 'busy' &&
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    participant.status === 'offline' &&
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                  )}
                >
                  {participant.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="h-80 space-y-4 overflow-y-auto p-4">
        {session.messages.map((message) => (
          <div key={message.id} className="group">
            {message.type === 'system' ? (
              <div className="flex items-center justify-center">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {message.userAvatar ? (
                    <img
                      src={message.userAvatar}
                      alt={message.userName}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                      <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {message.userName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300">{message.content}</div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-700"
                        >
                          <DocumentIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                          <button
                            className="text-nova-600 dark:text-nova-400 hover:text-nova-700 dark:hover:text-nova-300"
                            title="Download attachment"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      {message.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => addReaction(message.id, reaction.emoji)}
                          className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors',
                            reaction.userIds.includes(currentUser.id)
                              ? 'bg-nova-100 dark:bg-nova-900/20 text-nova-700 dark:text-nova-300'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600',
                          )}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.userIds.length}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => addReaction(message.id, '👍')}
                        className="rounded p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Add reaction"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Mention Suggestions */}
      {mentionSuggestions.length > 0 && (
        <div className="mx-4 mb-2 max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
          {mentionSuggestions.map((user) => (
            <button
              key={user.id}
              onClick={() => handleMentionSelect(user)}
              className="flex w-full items-center gap-2 p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                  <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                </div>
              )}
              <span className="text-sm text-gray-900 dark:text-white">{user.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{user.role}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (use @ to mention)"
            className="focus:ring-nova-500 focus:border-nova-500 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-nova-600 hover:bg-nova-700 rounded-lg px-3 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            title="Send message"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
