import { useState, useEffect, useRef } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { useCosmo, CosmoMessage, CosmoAction, ConversationContext } from '@services/synth'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn } from '@utils/index'
import toast from 'react-hot-toast'

interface CosmoWidgetProps {
  initialContext?: Partial<ConversationContext>
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
  showWelcomeMessage?: boolean
  enableSuggestions?: boolean
}

export function CosmoWidget({ 
  initialContext,
  position = 'bottom-right',
  theme = 'auto',
  showWelcomeMessage = true,
  enableSuggestions = true
}: CosmoWidgetProps) {
  const { 
    isOpen, 
    setIsOpen, 
    conversation, 
    isLoading, 
    startConversation, 
    sendMessage, 
    endConversation 
  } = useCosmo()
  
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation?.messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load suggestions based on context
  useEffect(() => {
    if (enableSuggestions && isOpen && !conversation) {
      loadSuggestions()
    }
  }, [isOpen, enableSuggestions])

  const loadSuggestions = () => {
    const contextSuggestions = [
      "How can I create a ticket?",
      "What's my current SLA status?",
      "Find knowledge articles about...",
      "Show me my recent activities",
      "Help me with password reset"
    ]
    
    // Customize suggestions based on context
    if (initialContext?.currentModule === 'ticket_creation') {
      setSuggestions([
        "Create an incident ticket",
        "Submit a service request",
        "Report a problem",
        "Request hardware",
        "Get IT support"
      ])
    } else if (initialContext?.currentModule === 'knowledge_base') {
      setSuggestions([
        "Search for solutions",
        "Find troubleshooting guides",
        "Browse FAQ articles",
        "Get help with applications",
        "Find contact information"
      ])
    } else {
      setSuggestions(contextSuggestions)
    }
  }

  const handleOpen = async () => {
    if (!conversation) {
      await startConversation(initialContext)
    } else {
      setIsOpen(true)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    
    try {
      await sendMessage(message)
    } catch (error) {
      toast.error('Failed to send message to Cosmo')
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    setInput(suggestion)
    if (!conversation) {
      await startConversation(initialContext)
    }
    
    try {
      await sendMessage(suggestion)
      setInput('')
    } catch (error) {
      toast.error('Failed to send message to Cosmo')
    }
  }

  const handleActionClick = async (action: CosmoAction) => {
    if (action.type === 'create_ticket' && action.result) {
      toast.success(`Ticket ${action.result} created successfully!`)
    } else if (action.type === 'grant_xp' && action.data?.amount) {
      toast.success(`You earned ${action.data.amount} XP! ⭐`)
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  const renderMessage = (message: CosmoMessage) => {
    const isUser = message.role === 'user'
    
    return (
      <div key={message.id} className={cn(
        'flex gap-3 mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}>
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nova-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        
        <div className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser 
            ? 'bg-nova-500 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        )}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {message.content}
          </div>
          
          {/* Render actions if present */}
          {message.metadata?.actions && message.metadata.actions.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.metadata.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    'block w-full text-left p-2 rounded-lg text-sm transition-colors',
                    action.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : action.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200'
                  )}
                >
                  {action.type === 'create_ticket' && '🎫 Ticket Created'}
                  {action.type === 'search_kb' && '📚 Knowledge Search'}
                  {action.type === 'grant_xp' && '⭐ XP Awarded'}
                  {action.type === 'trigger_workflow' && '⚡ Workflow Triggered'}
                  {action.type === 'send_notification' && '📧 Notification Sent'}
                </button>
              ))}
            </div>
          )}
          
          {/* Show XP awarded */}
          {message.metadata?.xpAwarded && (
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" />
              +{message.metadata.xpAwarded} XP
            </div>
          )}
        </div>

        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                You
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('fixed z-50', getPositionClasses())}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[32rem] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-nova-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Cosmo</h3>
                  <p className="text-xs opacity-90">Your AI Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            {showWelcomeMessage && !conversation?.messages.length && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-nova-500 to-purple-600 flex items-center justify-center mb-4">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Hi! I'm Cosmo 👋
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  I'm here to help you with tickets, knowledge searches, and navigating Nova Universe.
                </p>
                
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Try asking:
                    </p>
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                      >
                        <LightBulbIcon className="w-4 h-4 inline mr-2 text-yellow-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conversation Messages */}
            {conversation?.messages.map(renderMessage)}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Cosmo anything..."
                className="flex-1 input text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="btn btn-primary p-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center',
          'bg-gradient-to-br from-nova-500 to-purple-600 hover:from-nova-600 hover:to-purple-700',
          'text-white hover:scale-110 active:scale-95',
          isOpen && 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>
    </div>
  )
}

// Quick action variants for specific contexts
export function CosmoTicketAssistant() {
  return (
    <CosmoWidget
      initialContext={{
        currentModule: 'ticket_creation',
        sessionData: { intent: 'create_ticket' }
      }}
      enableSuggestions={true}
    />
  )
}

export function CosmoKnowledgeAssistant() {
  return (
    <CosmoWidget
      initialContext={{
        currentModule: 'knowledge_base',
        sessionData: { intent: 'find_information' }
      }}
      enableSuggestions={true}
    />
  )
}

export function CosmoTechSupport() {
  return (
    <CosmoWidget
      initialContext={{
        currentModule: 'technical_support',
        sessionData: { intent: 'get_help' }
      }}
      enableSuggestions={true}
    />
  )
}