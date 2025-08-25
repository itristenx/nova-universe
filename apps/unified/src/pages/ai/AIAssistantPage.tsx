import { useState } from 'react';
import { useAuthStore } from '@stores/auth';
import {
  CpuChipIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

export default function AIAssistantPage() {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Cosmo',
      content:
        "Hello! I'm Cosmo, your AI assistant. I can help you with ticket resolution, finding knowledge base articles, asset information, and much more. How can I assist you today?",
      timestamp: new Date(),
      type: 'ai',
    },
  ]);

  const suggestions = [
    'Help me troubleshoot a printer issue',
    'Find articles about VPN setup',
    'What assets are available for checkout?',
    'Show me my recent ticket activity',
    "How do I reset a user's password?",
    'Create a ticket for hardware request',
  ];

  const aiCapabilities = [
    {
      title: 'Intelligent Ticket Routing',
      description: 'Automatically categorize and route tickets to the right teams',
      icon: ChatBubbleLeftIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Solution Recommendations',
      description: 'Get AI-powered suggestions for ticket resolution',
      icon: LightBulbIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Predictive Analytics',
      description: 'Forecast trends and identify potential issues',
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Smart Search',
      description: 'Find relevant information across all platforms',
      icon: SparklesIcon,
      color: 'bg-purple-500',
    },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: user?.firstName || 'You',
      content: message,
      timestamp: new Date(),
      type: 'user',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: 'Cosmo',
        content:
          'I understand you need help with that. Let me search through our knowledge base and find the best solution for you. This might take a moment...',
        timestamp: new Date(),
        type: 'ai',
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            <div className="from-nova-500 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r to-purple-600">
              <CpuChipIcon className="h-5 w-5 text-white" />
            </div>
            Cosmo AI Assistant
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your intelligent companion for IT service management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="card lg:col-span-2">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Chat with Cosmo</h2>
          </div>

          {/* Messages */}
          <div className="h-96 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                    msg.type === 'user'
                      ? 'bg-nova-600 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                  }`}
                >
                  <div className="mb-1 text-sm font-medium">{msg.sender}</div>
                  <div className="text-sm">{msg.content}</div>
                  <div className="mt-1 text-xs opacity-75">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="focus:ring-nova-500 flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                className="bg-nova-600 hover:bg-nova-700 rounded-lg px-4 py-2 text-white transition-colors"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Suggestions */}
          <div className="card p-4">
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Quick Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full rounded-lg p-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* AI Status */}
          <div className="card p-4">
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">AI Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Model Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">0.8s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">94.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          AI Capabilities
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aiCapabilities.map((capability, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div className="mb-2 flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg ${capability.color} flex items-center justify-center`}
                >
                  <capability.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{capability.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
