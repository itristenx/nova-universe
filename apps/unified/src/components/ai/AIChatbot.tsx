/**
 * AI Chatbot Interface - Phase 2 Implementation
 * Intelligent conversational AI for ITSM support
 * Inspired by ServiceNow Now Assist and modern AI assistants
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { chatService, type ChatMessage, type ChatAction } from '@/services/chat';
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
} from '@heroicons/react/24/outline';

interface ChatSuggestion {
  id: string;
  text: string;
  category: 'common' | 'help' | 'action';
}

export function AIChatbot() {
  const { t } = useTranslation(['chatbot', 'common']);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions] = useState<ChatSuggestion[]>([
    { id: '1', text: t('chatbot:suggestions.passwordReset'), category: 'common' },
    { id: '2', text: t('chatbot:suggestions.softwareInstall'), category: 'common' },
    { id: '3', text: t('chatbot:suggestions.networkIssue'), category: 'common' },
    { id: '4', text: t('chatbot:suggestions.createTicket'), category: 'action' },
    { id: '5', text: t('chatbot:suggestions.checkStatus'), category: 'action' },
    { id: '6', text: t('chatbot:suggestions.viewKnowledge'), category: 'help' },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation and welcome message
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const newConversationId = await chatService.startConversation();
        setConversationId(newConversationId);

        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          type: 'ai',
          content: t('chatbot:welcome.message'),
          timestamp: new Date(),
          suggestions: [
            t('chatbot:welcome.suggestions.help'),
            t('chatbot:welcome.suggestions.ticket'),
            t('chatbot:welcome.suggestions.status'),
          ],
        };
        setMessages([welcomeMessage]);
      } catch (_error) {
        console.error('Failed to initialize chat:', error);
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
          ],
        };
        setMessages([welcomeMessage]);
      }
    };

    initializeChat();
  }, [t]);

  const sendMessageToAI = useCallback(
    async (userMessage: string): Promise<ChatMessage> => {
      try {
        const response = await chatService.sendMessage({
          message: userMessage,
          context: {
            conversationId: conversationId,
            previousMessages: messages.slice(-5), // Send last 5 messages for context
          },
        });

        return response.message;
      } catch (_error) {
        console.error('Failed to get AI response:', error);

        // Fallback response in case of API failure
        return {
          id: Date.now().toString(),
          type: 'ai',
          content: t('chatbot:responses.error.content'),
          timestamp: new Date(),
          suggestions: [
            t('chatbot:responses.error.suggestions.retry'),
            t('chatbot:responses.error.suggestions.agent'),
          ],
        };
      }
    },
    [conversationId, messages, t],
  );

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await sendMessageToAI(input.trim());
      setMessages((prev) => [...prev, aiResponse]);
    } catch (_error) {
      console.error('AI response failed:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: t('chatbot:errors.responseError'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleActionClick = (action: ChatAction) => {
    switch (action.type) {
      case 'link':
        window.open(action.data.url, '_blank');
        break;
      case 'action':
        // Handle specific actions
        console.log('Executing action:', action.data.action);
        break;
      case 'form':
        // Open form modal
        console.log('Opening form:', action.data.form);
        break;
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    }
  };

  const handleMessageFeedback = async (messageId: string, isHelpful: boolean) => {
    try {
      await chatService.rateResponse(messageId, isHelpful ? 'positive' : 'negative');
      console.log(`Message ${messageId} rated as ${isHelpful ? 'positive' : 'negative'}`);
    } catch (_error) {
      console.error('Failed to rate message:', error);
    }
  };

  return (
    <div className="flex h-full max-h-[600px] flex-col rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('chatbot:title')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('chatbot:subtitle')}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('chatbot:status.online')}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type !== 'user' && (
              <div className="flex-shrink-0">
                {message.type === 'ai' ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <SparklesIcon className="h-4 w-4 text-purple-600" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <ComputerDesktopIcon className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            )}

            <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'order-first' : ''}`}>
              <div
                className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'ml-auto bg-purple-600 text-white'
                    : message.type === 'ai'
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
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
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="mb-2 text-xs opacity-75">{t('chatbot:suggestedResponses')}:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full rounded border border-white/30 bg-white/20 px-2 py-1 text-left text-xs transition-colors hover:bg-white/30"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-1 flex items-center justify-between px-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {message.type === 'ai' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMessageFeedback(message.id, true)}
                      className="p-1 text-gray-400 transition-colors hover:text-green-600"
                      title={t('chatbot:feedback.helpful')}
                    >
                      <HandThumbUpIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleMessageFeedback(message.id, false)}
                      className="p-1 text-gray-400 transition-colors hover:text-red-600"
                      title={t('chatbot:feedback.notHelpful')}
                    >
                      <HandThumbDownIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <UserCircleIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <SparklesIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:100ms]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:200ms]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
            {t('chatbot:quickStart')}:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('chatbot:inputPlaceholder')}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isTyping}
            />
            <button
              onClick={handleVoiceInput}
              className={`absolute top-1/2 right-2 -translate-y-1/2 transform rounded p-1 transition-colors ${
                isListening ? 'animate-pulse text-red-600' : 'text-gray-400 hover:text-purple-600'
              }`}
              title={t('chatbot:voiceInput')}
            >
              {isListening ? (
                <StopIcon className="h-4 w-4" />
              ) : (
                <MicrophoneIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={t('chatbot:sendMessage')}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
