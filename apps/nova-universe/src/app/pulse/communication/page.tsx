'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  UserGroupIcon,
  BellIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  FaceSmileIcon,
  PaperClipIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime, cn } from '@/lib/utils'

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'system'
  channel: string
  isOwn?: boolean
}

interface Channel {
  id: string
  name: string
  type: 'team' | 'project' | 'incident' | 'general'
  unreadCount: number
  lastMessage?: Message
  participants: number
}

const mockChannels: Channel[] = [
  {
    id: 'general',
    name: 'General IT',
    type: 'general',
    unreadCount: 3,
    participants: 24,
    lastMessage: {
      id: '1',
      sender: 'Sarah Kim',
      content: 'Server maintenance completed successfully',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'text',
      channel: 'general'
    }
  },
  {
    id: 'incidents',
    name: 'Active Incidents',
    type: 'incident',
    unreadCount: 7,
    participants: 12,
    lastMessage: {
      id: '2',
      sender: 'Alex Rodriguez',
      content: 'Network issue escalated to Level 2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'text',
      channel: 'incidents'
    }
  },
  {
    id: 'hardware-team',
    name: 'Hardware Team',
    type: 'team',
    unreadCount: 0,
    participants: 8,
    lastMessage: {
      id: '3',
      sender: 'Mike Chen',
      content: 'New inventory arrived - Dell monitors',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'text',
      channel: 'hardware-team'
    }
  },
  {
    id: 'software-deployment',
    name: 'Software Deployment',
    type: 'project',
    unreadCount: 1,
    participants: 15,
    lastMessage: {
      id: '4',
      sender: 'Emily Davis',
      content: 'Office 365 update scheduled for tonight',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'text',
      channel: 'software-deployment'
    }
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'Sarah Kim',
    content: 'Server maintenance completed successfully. All systems are back online.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'text',
    channel: 'general'
  },
  {
    id: '2',
    sender: 'You',
    content: 'Great work! Any issues with the database connections?',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    type: 'text',
    channel: 'general',
    isOwn: true
  },
  {
    id: '3',
    sender: 'Alex Rodriguez',
    content: 'Database connections are stable. Response times improved by 30%.',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    type: 'text',
    channel: 'general'
  },
  {
    id: '4',
    sender: 'System',
    content: 'Automated backup completed at 2:00 AM',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'system',
    channel: 'general'
  }
]

const channelTypeColors = {
  general: 'bg-blue-500',
  team: 'bg-green-500',
  project: 'bg-purple-500',
  incident: 'bg-red-500'
}

export default function CommunicationHubPage() {
  const [selectedChannel, setSelectedChannel] = useState('general')
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredChannels = mockChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const channelMessages = mockMessages.filter(msg => msg.channel === selectedChannel)
  const currentChannel = mockChannels.find(ch => ch.id === selectedChannel)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    // Mock send message logic
    console.log('Sending message:', newMessage)
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar - Channels */}
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Communication Hub</span>
            </CardTitle>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1">
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={cn(
                    "w-full p-3 text-left hover:bg-muted/50 transition-colors border-l-2",
                    selectedChannel === channel.id 
                      ? "bg-primary/10 border-primary" 
                      : "border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-2 h-2 rounded-full", channelTypeColors[channel.type])} />
                      <span className="font-medium text-sm">{channel.name}</span>
                    </div>
                    {channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 min-w-5 px-1.5">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  {channel.lastMessage && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground truncate">
                        <span className="font-medium">{channel.lastMessage.sender}:</span>{' '}
                        {channel.lastMessage.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatRelativeTime(channel.lastMessage.timestamp)}</span>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="w-3 h-3" />
                          <span>{channel.participants}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <PhoneIcon className="w-4 h-4 mr-2" />
            Start Voice Call
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <VideoCameraIcon className="w-4 h-4 mr-2" />
            Start Video Call
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {/* Chat Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("w-4 h-4 rounded-full", channelTypeColors[currentChannel?.type || 'general'])} />
              <div>
                <CardTitle className="text-lg">{currentChannel?.name}</CardTitle>
                <CardDescription>
                  {currentChannel?.participants} participants · {currentChannel?.type} channel
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <PhoneIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <VideoCameraIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <BellIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {channelMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isOwn ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  message.isOwn 
                    ? "bg-primary text-primary-foreground" 
                    : message.type === 'system'
                    ? "bg-muted text-muted-foreground text-center italic"
                    : "bg-muted"
                )}
              >
                {!message.isOwn && message.type !== 'system' && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.sender}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={cn(
                  "text-xs mt-1 opacity-70",
                  message.isOwn ? "text-right" : "text-left"
                )}>
                  {formatRelativeTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <PaperClipIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <FaceSmileIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MicrophoneIcon className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] resize-none"
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
              className="mb-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{newMessage.length}/1000</span>
          </div>
        </div>
      </Card>

      {/* Right Panel - Channel Info */}
      <div className="w-80">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Channel Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {currentChannel?.type === 'general' && "General discussions and announcements for the IT team"}
                {currentChannel?.type === 'incident' && "Active incident coordination and status updates"}
                {currentChannel?.type === 'team' && "Team-specific discussions and collaboration"}
                {currentChannel?.type === 'project' && "Project updates and coordination"}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Online Members</h4>
              <div className="space-y-2">
                {['Sarah Kim', 'Alex Rodriguez', 'Mike Chen', 'Emily Davis'].map((member) => (
                  <div key={member} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">{member}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BellIcon className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                  Search Messages
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}