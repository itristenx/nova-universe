import { useState } from 'react'
import { useAuthStore } from '@stores/auth'
import { 
  CpuChipIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

export default function AIAssistantPage() {
  const { user } = useAuthStore()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Cosmo',
      content: 'Hello! I\'m Cosmo, your AI assistant. I can help you with ticket resolution, finding knowledge base articles, asset information, and much more. How can I assist you today?',
      timestamp: new Date(),
      type: 'ai'
    }
  ])

  const suggestions = [
    'Help me troubleshoot a printer issue',
    'Find articles about VPN setup',
    'What assets are available for checkout?',
    'Show me my recent ticket activity',
    'How do I reset a user\'s password?',
    'Create a ticket for hardware request'
  ]

  const aiCapabilities = [
    {
      title: 'Intelligent Ticket Routing',
      description: 'Automatically categorize and route tickets to the right teams',
      icon: ChatBubbleLeftIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Solution Recommendations',
      description: 'Get AI-powered suggestions for ticket resolution',
      icon: LightBulbIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Predictive Analytics',
      description: 'Forecast trends and identify potential issues',
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Smart Search',
      description: 'Find relevant information across all platforms',
      icon: SparklesIcon,
      color: 'bg-purple-500'
    }
  ]

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: user?.firstName || 'You',
      content: message,
      timestamp: new Date(),
      type: 'user'
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: 'Cosmo',
        content: 'I understand you need help with that. Let me search through our knowledge base and find the best solution for you. This might take a moment...',
        timestamp: new Date(),
        type: 'ai'
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-nova-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="h-5 w-5 text-white" />
            </div>
            Cosmo AI Assistant
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your intelligent companion for IT service management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Chat with Cosmo</h2>
          </div>
          
          {/* Messages */}
          <div className="p-4 h-96 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-nova-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {msg.sender}
                  </div>
                  <div className="text-sm">
                    {msg.content}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-nova-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-nova-600 text-white rounded-lg hover:bg-nova-700 transition-colors"
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Quick Suggestions
            </h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* AI Status */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              AI Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Model Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Capabilities
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aiCapabilities.map((capability, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg ${capability.color} flex items-center justify-center`}>
                  <capability.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {capability.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {capability.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
