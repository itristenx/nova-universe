'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Video, 
  Share2, 
  Eye, 
  UserPlus,
  Send,
  Smile,
  ArrowRight,
  Circle,
  Phone,
  Monitor
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Simple Avatar component since we don't have the UI library one
const Avatar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-gray-600 font-medium ${className}`}>{children}</span>
);

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  cursor?: { x: number; y: number };
}

interface Comment {
  id: string;
  content: string;
  author: User;
  timestamp: Date;
  ticketId?: string;
  elementId?: string;
  position?: { x: number; y: number };
  replies?: Comment[];
  reactions?: Reaction[];
  attachments?: Attachment[];
}

interface Reaction {
  emoji: string;
  users: User[];
  count: number;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface CollaborationSession {
  id: string;
  title: string;
  participants: User[];
  ticketId?: string;
  startTime: Date;
  isActive: boolean;
  type: 'ticket_review' | 'problem_solving' | 'knowledge_sharing';
}

interface Activity {
  id: string;
  type: 'comment' | 'edit' | 'join' | 'leave' | 'share';
  user: User;
  timestamp: Date;
  description: string;
  ticketId?: string;
}

export default function _RealTimeCollaboration() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [showCursors, setShowCursors] = useState(true);
  const [selectedTab, setSelectedTab] = useState('presence');
  
  const currentUser: User = {
    id: 'current-user',
    name: 'Current User',
    email: 'user@example.com',
    status: 'online',
    lastSeen: new Date()
  };

  // Initialize mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@company.com',
        status: 'online',
        lastSeen: new Date(),
        currentPage: '/tickets/TK-001',
        cursor: { x: 250, y: 180 }
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@company.com',
        status: 'busy',
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        currentPage: '/tickets/TK-002'
      },
      {
        id: '3',
        name: 'Carol Davis',
        email: 'carol@company.com',
        status: 'away',
        lastSeen: new Date(Date.now() - 900000), // 15 minutes ago
      }
    ];

    const mockComments: Comment[] = [
      {
        id: '1',
        content: 'This issue seems related to the network configuration we discussed yesterday.',
        author: mockUsers[0],
        timestamp: new Date(Date.now() - 600000),
        ticketId: 'TK-001',
        reactions: [
          { emoji: '👍', users: [mockUsers[1]], count: 1 }
        ]
      },
      {
        id: '2',
        content: 'I can help with the server setup if needed. I have experience with similar configurations.',
        author: mockUsers[1],
        timestamp: new Date(Date.now() - 300000),
        ticketId: 'TK-001',
        replies: [
          {
            id: '2-1',
            content: 'That would be great! Can you take a look at the logs?',
            author: mockUsers[0],
            timestamp: new Date(Date.now() - 180000),
          }
        ]
      }
    ];

    const mockSessions: CollaborationSession[] = [
      {
        id: 'session-1',
        title: 'Network Issue Investigation',
        participants: [mockUsers[0], mockUsers[1]],
        ticketId: 'TK-001',
        startTime: new Date(Date.now() - 1800000), // 30 minutes ago
        isActive: true,
        type: 'problem_solving'
      }
    ];

    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'comment',
        user: mockUsers[0],
        timestamp: new Date(Date.now() - 300000),
        description: 'Added comment to TK-001',
        ticketId: 'TK-001'
      },
      {
        id: '2',
        type: 'join',
        user: mockUsers[1],
        timestamp: new Date(Date.now() - 600000),
        description: 'Joined collaboration session'
      }
    ];

    setActiveUsers(mockUsers);
    setComments(mockComments);
    setSessions(mockSessions);
    setActivities(mockActivities);
  }, []);

  // Simulate real-time cursor tracking
  useEffect(() => {
    if (!showCursors) return;

    const handleMouseMove = (e: MouseEvent) => {
      // In a real app, this would broadcast cursor position to other users
      const currentUserCursor = { x: e.clientX, y: e.clientY };
      setActiveUsers(prev => prev.map(user => 
        user.id === currentUser.id 
          ? { ...user, cursor: currentUserCursor }
          : user
      ));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [showCursors, currentUser.id]);

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: currentUser,
      timestamp: new Date(),
      ticketId: selectedTicket || 'TK-001'
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

    // Add activity
    const activity: Activity = {
      id: Date.now().toString(),
      type: 'comment',
      user: currentUser,
      timestamp: new Date(),
      description: `Added comment to ${comment.ticketId}`,
      ticketId: comment.ticketId
    };

    setActivities(prev => [activity, ...prev]);
  };

  const addReaction = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Toggle reaction
          const hasUserReacted = existingReaction.users.some(u => u.id === currentUser.id);
          if (hasUserReacted) {
            existingReaction.users = existingReaction.users.filter(u => u.id !== currentUser.id);
            existingReaction.count--;
          } else {
            existingReaction.users.push(currentUser);
            existingReaction.count++;
          }
        } else {
          // Add new reaction
          const newReaction: Reaction = {
            emoji,
            users: [currentUser],
            count: 1
          };
          comment.reactions = [...(comment.reactions || []), newReaction];
        }
      }
      return comment;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-600 rounded-lg text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Real-Time Collaboration
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-green-100">
                    Live
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Collaborate in real-time with team presence, live cursors, and instant messaging
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Start Video Call
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share Screen
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Cursors Overlay - Removed for simplicity */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Team Presence */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Team Presence</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCursors(!showCursors)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.status === 'online' ? 'Active now' : formatTimeAgo(user.lastSeen)}
                  </p>
                  {user.currentPage && (
                    <p className="text-xs text-blue-600 truncate">
                      {user.currentPage}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Sessions */}
          {sessions.filter(s => s.isActive).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Circle className="w-3 h-3 text-green-500 fill-current" />
                  Active Collaboration Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.filter(s => s.isActive).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {session.participants.slice(0, 3).map((participant) => (
                            <Avatar key={participant.id} className="w-6 h-6 border-2 border-white">
                              <AvatarFallback className="text-xs">
                                {participant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {session.participants.length > 3 && (
                            <div className="w-6 h-6 bg-muted rounded-full border-2 border-white flex items-center justify-center text-xs">
                              +{session.participants.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{session.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(session.startTime)} • {session.participants.length} participants
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Join
                        </Button>
                        <Button size="sm">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collaboration Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presence">Live Activity</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="presence" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user.name}</span>{' '}
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                        {activity.ticketId && (
                          <Badge variant="outline" className="text-xs">
                            {activity.ticketId}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              {/* Comment Input */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select ticket" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TK-001">TK-001</SelectItem>
                        <SelectItem value="TK-002">TK-002</SelectItem>
                        <SelectItem value="TK-003">TK-003</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addComment()}
                    />
                    <Button size="sm" onClick={addComment}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {comment.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(comment.timestamp)}
                            </span>
                            {comment.ticketId && (
                              <Badge variant="outline" className="text-xs">
                                {comment.ticketId}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{comment.content}</p>
                          
                          {/* Reactions */}
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {comment.reactions?.map((reaction, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => addReaction(comment.id, reaction.emoji)}
                                >
                                  {reaction.emoji} {reaction.count}
                                </Button>
                              ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => addReaction(comment.id, '👍')}
                            >
                              <Smile className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 space-y-2 pl-4 border-l-2 border-muted">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      {reply.author.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-xs">{reply.author.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(reply.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-xs">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Collaboration Sessions</CardTitle>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{session.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {session.participants.length} participants • {formatTimeAgo(session.startTime)}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant={session.isActive ? 'default' : 'secondary'}>
                              {session.isActive ? 'Active' : 'Ended'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {session.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {session.isActive ? (
                            <>
                              <Button size="sm" variant="outline">
                                <Phone className="w-3 h-3" />
                              </Button>
                              <Button size="sm">
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Monitor className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
