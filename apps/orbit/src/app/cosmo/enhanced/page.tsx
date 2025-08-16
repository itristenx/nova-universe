'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Sparkles,
  Brain,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'cosmo';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'action' | 'file';
  context?: {
    ticketId?: string;
    knowledgeArticle?: string;
    serviceRequest?: string;
  };
  suggestions?: ActionSuggestion[];
  attachments?: Attachment[];
  reactions?: MessageReaction[];
}

interface ActionSuggestion {
  id: string;
  text: string;
  action: 'create_ticket' | 'search_knowledge' | 'request_service' | 'view_status';
  data?: Record<string, unknown>;
  confidence: number;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface MessageReaction {
  type: 'helpful' | 'not_helpful' | 'accurate' | 'needs_improvement';
  timestamp: Date;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  recentTickets: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  preferences: UserPreferences;
  currentPage?: string;
  knowledge: Array<Record<string, unknown>>;
}

interface UserPreferences {
  language: string;
  responseStyle: 'concise' | 'detailed' | 'technical';
  notifications: boolean;
  proactiveHelp: boolean;
}

interface ProactiveSuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export default function _EnhancedCosmoAI() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMode, setChatMode] = useState<'chat' | 'assistant' | 'expert'>('chat');
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [quickActions, setQuickActions] = useState<ActionSuggestion[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation context
  useEffect(() => {
    const initializeContext = async () => {
      // Mock context initialization
      const mockContext: ConversationContext = {
        userId: 'user-123',
        sessionId: `session-${Date.now()}`,
        recentTickets: [
          { id: 'TK-001', title: 'Password Reset', status: 'resolved' },
          { id: 'TK-002', title: 'VPN Access', status: 'in_progress' }
        ],
        preferences: {
          language: 'en',
          responseStyle: 'detailed',
          notifications: true,
          proactiveHelp: true
        },
        currentPage: window.location.pathname,
        knowledge: []
      };

      setConversationContext(mockContext);

      // Initialize with welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Hi! I'm Cosmo, your AI assistant. I can help you with tickets, find information, request services, and much more. What can I help you with today?`,
        sender: 'cosmo',
        timestamp: new Date(),
        type: 'text',
        suggestions: [
          {
            id: 'create-ticket',
            text: 'Create a new ticket',
            action: 'create_ticket',
            confidence: 0.9
          },
          {
            id: 'track-tickets',
            text: 'Check my ticket status',
            action: 'view_status',
            confidence: 0.85
          },
          {
            id: 'search-kb',
            text: 'Search knowledge base',
            action: 'search_knowledge',
            confidence: 0.8
          }
        ]
      };

      setMessages([welcomeMessage]);

      // Load proactive suggestions
      setProactiveSuggestions([
        {
          id: 'pwd-reset',
          title: 'Password Reset Due Soon',
          description: 'Your password expires in 5 days. Would you like to reset it now?',
          action: 'password_reset',
          priority: 'medium',
          category: 'security'
        },
        {
          id: 'vpn-setup',
          title: 'VPN Setup Available',
          description: 'Based on your role, you might need VPN access. Shall I help you set it up?',
          action: 'vpn_setup',
          priority: 'low',
          category: 'network'
        }
      ]);

      // Set quick actions
      setQuickActions([
        {
          id: 'new-ticket',
          text: '🎫 New Ticket',
          action: 'create_ticket',
          confidence: 1.0
        },
        {
          id: 'track-tickets',
          text: '👀 Track Tickets',
          action: 'view_status',
          confidence: 1.0
        },
        {
          id: 'knowledge',
          text: '📚 Knowledge Base',
          action: 'search_knowledge',
          confidence: 1.0
        },
        {
          id: 'services',
          text: '🛍️ Request Service',
          action: 'request_service',
          confidence: 1.0
        }
      ]);
    };

    initializeContext();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced message processing with AI-powered features
  const processMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: userInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI processing with context awareness
    await new Promise(resolve => setTimeout(resolve, 1500)); // TODO-LINT: move to async function

    // Generate contextual response
    const response = generateAIResponse(userInput, conversationContext);
    
    const cosmoMessage: Message = {
      id: `cosmo-${Date.now()}`,
      content: response.content,
      sender: 'cosmo',
      timestamp: new Date(),
      type: response.type || 'text',
      suggestions: response.suggestions
    };

    setMessages(prev => [...prev, cosmoMessage]);
    setIsLoading(false);
  }, [conversationContext, isLoading]);

  // AI Response Generator with context awareness
  const generateAIResponse = (input: string, context: ConversationContext | null) => {
    const lowerInput = input.toLowerCase();
    
    // Natural language ticket creation
    if (lowerInput.includes('create') && (lowerInput.includes('ticket') || lowerInput.includes('issue') || lowerInput.includes('problem'))) {
      return {
        content: "I'll help you create a ticket! Based on your message, I can see you need assistance. Let me guide you through the enhanced ticket creation process with smart suggestions.",
        type: 'text' as const,
        suggestions: [
          {
            id: 'create-ticket-enhanced',
            text: 'Start Enhanced Ticket Creation',
            action: 'create_ticket' as const,
            data: { prefill: input },
            confidence: 0.95
          }
        ] as ActionSuggestion[]
      };
    }

    // Ticket status inquiries
    if (lowerInput.includes('status') || lowerInput.includes('track') || lowerInput.includes('check')) {
      return {
        content: `I can help you track your tickets. You currently have ${context?.recentTickets.length || 0} recent tickets. Would you like to see their status or track a specific ticket?`,
        type: 'text' as const,
        suggestions: [
          {
            id: 'view-tickets',
            text: 'View All My Tickets',
            action: 'view_status' as const,
            confidence: 0.9
          },
          {
            id: 'track-enhanced',
            text: 'Enhanced Ticket Tracking',
            action: 'view_status' as const,
            data: { enhanced: true },
            confidence: 0.85
          }
        ] as ActionSuggestion[]
      };
    }

    // Knowledge base searches
    if (lowerInput.includes('how') || lowerInput.includes('help') || lowerInput.includes('guide') || lowerInput.includes('know')) {
      return {
        content: "I can help you find information! Our intelligent knowledge base has AI-powered search and personalized recommendations. What specific topic are you looking for?",
        type: 'text' as const,
        suggestions: [
          {
            id: 'search-kb',
            text: 'Search Knowledge Base',
            action: 'search_knowledge' as const,
            data: { query: input },
            confidence: 0.9
          },
          {
            id: 'popular-articles',
            text: 'Show Popular Articles',
            action: 'search_knowledge' as const,
            data: { filter: 'popular' },
            confidence: 0.7
          }
        ] as ActionSuggestion[]
      };
    }

    // Service requests
    if (lowerInput.includes('request') || lowerInput.includes('need') || lowerInput.includes('access')) {
      return {
        content: "I can help you request services! Our enhanced service catalog has everything from software licenses to hardware requests. What do you need?",
        type: 'text' as const,
        suggestions: [
          {
            id: 'browse-catalog',
            text: 'Browse Service Catalog',
            action: 'request_service' as const,
            confidence: 0.9
          },
          {
            id: 'popular-services',
            text: 'Popular Services',
            action: 'request_service' as const,
            data: { filter: 'popular' },
            confidence: 0.8
          }
        ] as ActionSuggestion[]
      };
    }

    // Default helpful response
    return {
      content: "I'm here to help! I can assist you with creating tickets, tracking status, finding information, requesting services, and much more. I have context about your recent activity and can provide personalized suggestions. What would you like to do?",
      type: 'text' as const,
      suggestions: [
        {
          id: 'dashboard',
          text: 'Go to Dashboard',
          action: 'view_status' as const,
          data: { page: 'dashboard' },
          confidence: 0.8
        },
        {
          id: 'help-guide',
          text: 'Show Help Guide',
          action: 'search_knowledge' as const,
          data: { category: 'getting-started' },
          confidence: 0.7
        }
      ] as ActionSuggestion[]
    };
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: ActionSuggestion) => {
    switch (suggestion.action) {
      case 'create_ticket':
        router.push('/tickets/new-enhanced');
        break;
      case 'view_status':
        if (suggestion.data?.enhanced) {
          router.push('/tickets/track');
        } else {
          router.push('/tickets');
        }
        break;
      case 'search_knowledge':
        router.push('/knowledge/enhanced');
        break;
      case 'request_service':
        router.push('/catalog/enhanced');
        break;
      default:
        processMessage(suggestion.text);
    }
  };

  // Voice input handling
  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(!isListening);
      // Voice recognition implementation would go here
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  // Message reactions
  const addReaction = (messageId: string, reactionType: MessageReaction['type']) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newReaction: MessageReaction = {
          type: reactionType,
          timestamp: new Date()
        };
        return {
          ...msg,
          reactions: [...(msg.reactions || []), newReaction]
        };
      }
      return msg;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Cosmo AI Assistant
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100">
                    Enhanced
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Contextual AI with persistent memory and proactive suggestions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={chatMode} onValueChange={(value: string) => setChatMode(value as 'chat' | 'assistant' | 'expert')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat Mode</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="expert">Expert Mode</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Proactive Suggestions */}
      {showSuggestions && proactiveSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Proactive Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proactiveSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  suggestion.priority === 'high' ? 'bg-red-500' :
                  suggestion.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Zap className="w-3 h-3 mr-1" />
                  Act
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => handleSuggestionClick(action)}
              >
                {action.text}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Conversation</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {messages.length} messages
                </Badge>
                <Button variant="ghost" size="sm">
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-muted/20">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border'
                  } rounded-lg p-3 shadow-sm`}>
                    <div className="flex items-start gap-2">
                      {message.sender === 'cosmo' && (
                        <Bot className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {message.suggestions.map((suggestion) => (
                              <Button
                                key={suggestion.id}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion.text}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Message metadata */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-60">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          
                          {/* Reaction buttons for Cosmo messages */}
                          {message.sender === 'cosmo' && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => addReaction(message.id, 'helpful')}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => addReaction(message.id, 'not_helpful')}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask me anything... I have context about your tickets, preferences, and more!"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        processMessage(inputText);
                      }
                    }}
                    disabled={isLoading}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={toggleVoiceInput}
                    >
                      {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Paperclip className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => processMessage(inputText)}
                  disabled={isLoading || !inputText.trim()}
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Context indicators */}
              {conversationContext && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Session active</span>
                  <span>•</span>
                  <span>{conversationContext.recentTickets.length} recent tickets</span>
                  <span>•</span>
                  <span>Proactive help enabled</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
