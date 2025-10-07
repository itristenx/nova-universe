import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { useDynamicIsland } from '@components/design-system';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface CosmoChatProps {
  onClose?: () => void;
  initialMessage?: string;
  context?: Record<string, unknown>;
}

/**
 * Cosmo AI Chat Integration
 * Floating chat bubble with streaming AI responses
 */
export const CosmoChat: React.FC<CosmoChatProps> = ({
  onClose,
  initialMessage,
  context,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hi! I\'m Cosmo, your AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dynamicIsland = useDynamicIsland();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send initial message
  useEffect(() => {
    if (initialMessage) {
      handleSend(initialMessage);
    }
  }, [initialMessage]);

  // Focus input on mount
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  // Send message
  const handleSend = async (message?: string) => {
    const text = message || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate AI response with streaming
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Simulate streaming response
      const fullResponse = `I understand you're asking about "${text}". Based on the context, here are my recommendations:\n\n1. Check the related tickets for similar issues\n2. Review the knowledge base articles\n3. Consider reaching out to the IT support team if the issue persists\n\nWould you like me to create a ticket for this issue?`;

      let currentText = '';
      for (let i = 0; i < fullResponse.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        currentText += fullResponse[i];

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id
              ? { ...msg, content: currentText }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      dynamicIsland.error('Error', 'Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'create-ticket',
      label: 'Create a ticket',
      icon: <Sparkles className="w-3 h-3" />,
      action: () => handleSend('Help me create a new ticket'),
    },
    {
      id: 'search-kb',
      label: 'Search knowledge base',
      icon: <Sparkles className="w-3 h-3" />,
      action: () => handleSend('Search the knowledge base for solutions'),
    },
    {
      id: 'check-status',
      label: 'Check ticket status',
      icon: <Sparkles className="w-3 h-3" />,
      action: () => handleSend('What\'s the status of my tickets?'),
    },
  ];

  // Copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    dynamicIsland.success('Copied', 'Message copied to clipboard');
  };

  // Regenerate response
  const regenerateResponse = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex > 0) {
      const previousMessage = messages[messageIndex - 1];
      if (previousMessage.role === 'user') {
        // Remove the AI response and regenerate
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        handleSend(previousMessage.content);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        height: isMinimized ? 'auto' : '600px',
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-6 right-6 w-96 glass-heavy rounded-apple-lg shadow-2xl overflow-hidden flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/20 dark:border-gray-700/20 bg-gradient-to-r from-purple-500 to-blue-500">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-sf-display font-semibold text-white">
              Cosmo
            </h3>
            <p className="text-xs font-sf-text text-white/80">AI Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            type="button"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              type="button"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-apple-md p-3 ${
                    message.role === 'user'
                      ? 'bg-apple-blue dark:bg-apple-blue-dark text-white'
                      : message.role === 'system'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'glass text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm font-sf-text whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Message Actions (for AI messages) */}
                  {message.role === 'assistant' && !message.isStreaming && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/20 dark:border-gray-700/20">
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        type="button"
                        aria-label="Copy"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => regenerateResponse(message.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        type="button"
                        aria-label="Regenerate"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        type="button"
                        aria-label="Thumbs up"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        type="button"
                        aria-label="Thumbs down"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-sf-text text-gray-400">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass rounded-apple-md p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-200/20 dark:border-gray-700/20">
              <p className="text-xs font-sf-text text-gray-600 dark:text-gray-400 mb-2">
                Quick actions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="px-3 py-1.5 rounded-full glass text-xs font-sf-text text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-1"
                    type="button"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200/20 dark:border-gray-700/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Cosmo anything..."
                className="flex-1 px-4 py-2 rounded-full glass border border-gray-200/20 dark:border-gray-700/20 text-sm font-sf-text text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
};

/**
 * Cosmo Chat Button
 * Floating button to open Cosmo chat
 */
export const CosmoChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && <CosmoChat onClose={() => setIsOpen(false)} />}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-2xl text-white hover:shadow-purple-500/50 transition-shadow z-50"
          type="button"
          aria-label="Open Cosmo AI"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
};

export default CosmoChat;
