/**
 * AI Chatbot Interface - Phase 2 Implementation
 * Intelligent conversational AI for ITSM support
 * Inspired by ServiceNow Now Assist and modern AI assistants
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { chatService, type ChatMessage, type ChatAction } from '@/services/chat'
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  ComputerDesktopIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ClockIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowPathIcon,
  MicrophoneIcon,
  StopIcon,
} from '@heroicons/react/24/outline'

interface ChatSuggestion {
  id: string
  text: string
  category: 'common' | 'help' | 'action'
}

export function AIChatbot() {
  const { t } = useTranslation(['chatbot', 'common'])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [suggestions] = useState<ChatSuggestion[]>([
    { id: '1', text: t('chatbot:suggestions.passwordReset'), category: 'common' },
    { id: '2', text: t('chatbot:suggestions.softwareInstall'), category: 'common' },
    { id: '3', text: t('chatbot:suggestions.networkIssue'), category: 'common' },
    { id: '4', text: t('chatbot:suggestions.createTicket'), category: 'action' },
    { id: '5', text: t('chatbot:suggestions.checkStatus'), category: 'action' },
    { id: '6', text: t('chatbot:suggestions.viewKnowledge'), category: 'help' },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize conversation and welcome message
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const newConversationId = await chatService.startConversation()
        setConversationId(newConversationId)
        
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          type: 'ai',
          content: t('chatbot:welcome.message'),
          timestamp: new Date(),
          suggestions: [
            t('chatbot:welcome.suggestions.help'),
            t('chatbot:welcome.suggestions.ticket'),
            t('chatbot:welcome.suggestions.status'),
          ]
        }
        setMessages([welcomeMessage])
      } catch (error) {
        console.error('Failed to initialize chat:', error)
        // Fallback without conversation ID
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          type: 'ai',
          content: t('chatbot:welcome.message'),
          timestamp: new Date(),
          suggestions: [
            t('chatbot:welcome.suggestions.help'),
            t('chatbot:welcome.suggestions.ticket'),
            t('chatbot:welcome.suggestions.status'),
          ]
        }
        setMessages([welcomeMessage])
      }
    }
    
    initializeChat()
  }, [t])

  const sendMessageToAI = useCallback(async (userMessage: string): Promise<ChatMessage> => {
    try {
      const response = await chatService.sendMessage({
        message: userMessage,
        context: {
          conversationId: conversationId,
          previousMessages: messages.slice(-5) // Send last 5 messages for context
        }
      })

      return response.message
    } catch (error) {
      console.error('Failed to get AI response:', error)
      
      // Fallback response in case of API failure
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: t('chatbot:responses.error.content'),
        timestamp: new Date(),
        suggestions: [
          t('chatbot:responses.error.suggestions.retry'),
          t('chatbot:responses.error.suggestions.agent'),
        ]
      }
    }
  }, [conversationId, messages, t])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const aiResponse = await sendMessageToAI(input.trim())
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('AI response failed:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: t('chatbot:errors.responseError'),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const handleActionClick = (action: ChatAction) => {
    switch (action.type) {
      case 'link':
        window.open(action.data.url, '_blank')
        break
      case 'action':
        // Handle specific actions
        console.log('Executing action:', action.data.action)
        break
      case 'form':
        // Open form modal
        console.log('Opening form:', action.data.form)
        break
    }
  }

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      if (isListening) {
        recognition.stop()
      } else {
        recognition.start()
      }
    }
  }

  const handleMessageFeedback = async (messageId: string, isHelpful: boolean) => {
    try {
      await chatService.rateResponse(messageId, isHelpful ? 'positive' : 'negative')
      console.log(`Message ${messageId} rated as ${isHelpful ? 'positive' : 'negative'}`)
    } catch (error) {
      console.error('Failed to rate message:', error)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <SparklesIcon className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {t('chatbot:title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('chatbot:subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('chatbot:status.online')}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type !== 'user' && (
              <div className="flex-shrink-0">
                {message.type === 'ai' ? (
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <ComputerDesktopIcon className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            )}
            
            <div className={`max-w-xs lg:max-w-md ${
              message.type === 'user' ? 'order-first' : ''
            }`}>
              <div
                className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white ml-auto'
                    : message.type === 'ai'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className="block w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs opacity-75 mb-2">
                      {t('chatbot:suggestedResponses')}:
                    </p>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {message.type === 'ai' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMessageFeedback(message.id, true)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title={t('chatbot:feedback.helpful')}
                    >
                      <HandThumbUpIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMessageFeedback(message.id, false)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title={t('chatbot:feedback.notHelpful')}
                    >
                      <HandThumbDownIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:100ms]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {t('chatbot:quickStart')}:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('chatbot:inputPlaceholder')}
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isTyping}
            />
            <button
              onClick={handleVoiceInput}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                isListening
                  ? 'text-red-600 animate-pulse'
                  : 'text-gray-400 hover:text-purple-600'
              }`}
              title={t('chatbot:voiceInput')}
            >
              {isListening ? <StopIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('chatbot:sendMessage')}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
