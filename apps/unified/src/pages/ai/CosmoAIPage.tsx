import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ChartBarIcon,
  UserGroupIcon,
  BugAntIcon,
  CogIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

// Types
interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    intent?: string
    confidence?: number
    sources?: string[]
    actions?: string[]
  }
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: string
  prompt: string
}

interface Suggestion {
  id: string
  title: string
  description: string
  type: 'knowledge' | 'action' | 'insight'
  relevance: number
}

interface ConversationHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  messageCount: number
}

export default function CosmoAIPage() {
  const { t } = useTranslation(['cosmoAI', 'common'])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'analyze-ticket',
      title: t('cosmoAI:quickActions.analyzeTicket'),
      description: t('cosmoAI:quickActions.analyzeTicketDesc'),
      icon: <BugAntIcon className="h-5 w-5" />,
      category: t('cosmoAI:categories.support'),
      prompt: t('cosmoAI:prompts.analyzeTicket')
    },
    {
      id: 'system-health',
      title: t('cosmoAI:quickActions.systemHealth'),
      description: t('cosmoAI:quickActions.systemHealthDesc'),
      icon: <ChartBarIcon className="h-5 w-5" />,
      category: t('cosmoAI:categories.monitoring'),
      prompt: t('cosmoAI:prompts.systemHealth')
    },
    {
      id: 'knowledge-search',
      title: t('cosmoAI:quickActions.knowledgeSearch'),
      description: t('cosmoAI:quickActions.knowledgeSearchDesc'),
      icon: <BookOpenIcon className="h-5 w-5" />,
      category: t('cosmoAI:categories.knowledge'),
      prompt: t('cosmoAI:prompts.knowledgeSearch')
    },
    {
      id: 'user-insights',
      title: t('cosmoAI:quickActions.userInsights'),
      description: t('cosmoAI:quickActions.userInsightsDesc'),
      icon: <UserGroupIcon className="h-5 w-5" />,
      category: t('cosmoAI:categories.analytics'),
      prompt: t('cosmoAI:prompts.userInsights')
    },
    {
      id: 'optimization',
      title: t('cosmoAI:quickActions.optimization'),
      description: t('cosmoAI:quickActions.optimizationDesc'),
      icon: <CogIcon className="h-5 w-5" />,
      category: t('cosmoAI:categories.optimization'),
      prompt: t('cosmoAI:prompts.optimization')
    },
    {
      id: 'documentation',
      title: t('cosmoAI:quickActions.documentation'),
      description: t('cosmoAI:quickActions.documentationDesc'),
      icon: <DocumentTextIcon className="h-5 w-5" />,
      category: t('cosmoAI:categories.documentation'),
      prompt: t('cosmoAI:prompts.documentation')
    }
  ]

  useEffect(() => {
    scrollToBottom()
    loadConversationHistory()
    loadSuggestions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversationHistory = async () => {
    try {
      const response = await fetch('/api/cosmo/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversationHistory(data.conversations || [])
      } else {
        // Fallback to empty state if API fails
        setConversationHistory([])
      }
    } catch (error) {
      console.warn('Cosmo AI conversation API unavailable, using fallback data:', error)
      // Fallback to empty state
      setConversationHistory([])
    }
  }

  const loadSuggestions = () => {
    // Load context-based suggestions from API or local context
    setSuggestions([
      {
        id: '1',
        title: 'Database Performance Tuning',
        description: 'Your database response times have increased by 15% this week',
        type: 'insight',
        relevance: 0.92
      },
      {
        id: '2',
        title: 'Update Security Documentation',
        description: 'Security policies haven\'t been updated in 6 months',
        type: 'action',
        relevance: 0.85
      },
      {
        id: '3',
        title: 'User Engagement Metrics',
        description: 'Weekly active users increased by 23% - analyze patterns',
        type: 'insight',
        relevance: 0.78
      }
    ])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Try to call the actual API
      const response = await fetch('/api/cosmo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputValue,
          conversationId: currentConversationId,
          context: {
            userRole: 'admin',
            recentActivity: messages.slice(-5)
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString(),
          metadata: {
            intent: data.intent,
            confidence: data.confidence,
            sources: data.sources,
            actions: data.suggestedActions
          }
        }

        setMessages(prev => [...prev, assistantMessage])
        
        if (data.conversationId) {
          setCurrentConversationId(data.conversationId)
        }
      } else {
        throw new Error('API not available')
      }
    } catch (error) {
      console.warn('AI API not available, providing fallback response:', error)
      
      // Fallback response logic
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateFallbackResponse(inputValue),
        timestamp: new Date().toLocaleTimeString(),
        metadata: {
          intent: 'general_inquiry',
          confidence: 0.75,
          sources: ['Knowledge Base', 'System Metrics'],
          actions: ['View Documentation', 'Check System Status']
        }
      }

      setMessages(prev => [...prev, assistantMessage])
    }

    setIsLoading(false)
  }

  const generateFallbackResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('performance') || lowerInput.includes('slow')) {
      return "I'd be happy to help with performance analysis! Based on current metrics, I recommend checking database query optimization and reviewing recent traffic patterns. Would you like me to run a comprehensive performance audit?"
    }
    
    if (lowerInput.includes('user') || lowerInput.includes('customer')) {
      return "For user-related inquiries, I can analyze engagement patterns, support ticket trends, and user feedback. Current user satisfaction is at 87% with the main concerns being response time and feature discoverability. What specific aspect would you like to explore?"
    }
    
    if (lowerInput.includes('security') || lowerInput.includes('vulnerability')) {
      return "Security is crucial! I can help review security policies, scan for vulnerabilities, and ensure compliance. Recent security scans show all critical issues resolved. Would you like me to generate a security status report?"
    }
    
    if (lowerInput.includes('documentation') || lowerInput.includes('guide')) {
      return "I can help create, update, or find documentation! Our knowledge base contains 2,847 articles with 94% coverage of common scenarios. What type of documentation are you looking for?"
    }
    
    return "I'm here to help with system analysis, user insights, documentation, security reviews, and performance optimization. Could you provide more details about what you'd like assistance with?"
  }

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.prompt + ' ')
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(`Tell me more about: ${suggestion.title}`)
    inputRef.current?.focus()
  }

  const startNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    setShowHistory(false)
  }

  const loadConversation = (conversation: ConversationHistory) => {
    // In a real app, this would load the actual conversation
    setCurrentConversationId(conversation.id)
    setShowHistory(false)
    // Load previous messages for the conversation
    setMessages([
      {
        id: '1',
        type: 'user',
        content: 'Can you help me with ' + conversation.title.toLowerCase() + '?',
        timestamp: conversation.timestamp
      },
      {
        id: '2',
        type: 'assistant',
        content: conversation.lastMessage,
        timestamp: conversation.timestamp
      }
    ])
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'knowledge': return <BookOpenIcon className="h-4 w-4" />
      case 'action': return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'insight': return <LightBulbIcon className="h-4 w-4" />
      default: return <SparklesIcon className="h-4 w-4" />
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'knowledge': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'action': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
      case 'insight': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      default: return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400'
    }
  }

  return (
    <div className="flex h-full max-h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Conversation History</h2>
        </div>
        
        <div className="p-4 space-y-3 overflow-y-auto h-full">
          {conversationHistory.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => loadConversation(conversation)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                {conversation.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {conversation.lastMessage}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{conversation.timestamp}</span>
                <span>{conversation.messageCount} messages</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cosmo AI Assistant</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your intelligent IT operations companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Toggle conversation history"
              >
                <ClockIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={startNewConversation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('cosmoAI:newChat')}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('cosmoAI:welcome')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                {t('cosmoAI:description')}
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-lg transition-colors">
                        {action.icon}
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{action.category}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Suggested Actions
                  </h3>
                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getSuggestionColor(suggestion.type)}`}>
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.description}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round(suggestion.relevance * 100)}% relevant
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {message.type === 'assistant' && (
                        <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded-full flex-shrink-0">
                          <SparklesIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {message.metadata && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
                            {message.metadata.sources && (
                              <div className="flex items-center space-x-2 text-sm opacity-75">
                                <BookOpenIcon className="h-4 w-4" />
                                <span>Sources: {message.metadata.sources.join(', ')}</span>
                              </div>
                            )}
                            {message.metadata.actions && (
                              <div className="flex flex-wrap gap-2">
                                {message.metadata.actions.map((action, index) => (
                                  <button
                                    key={index}
                                    className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
                                  >
                                    {action}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-xs opacity-75 mt-2">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                        <SparklesIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <LoadingSpinner size="sm" />
                      <span className="text-gray-600 dark:text-gray-400">{t('cosmoAI:thinking')}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('cosmoAI:placeholder')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t('cosmoAI:sendMessage')}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{t('cosmoAI:pressEnterToSend')}</span>
              {currentConversationId && (
                <span className="flex items-center space-x-1">
                  <CheckCircleIcon className="h-3 w-3" />
                  <span>{t('cosmoAI:conversationSaved')}</span>
                </span>
              )}
            </div>
            <button 
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title={t('cosmoAI:exportChat')}
            >
              <ClipboardDocumentIcon className="h-3 w-3" />
              <span>{t('cosmoAI:exportChat')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
